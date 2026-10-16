"use client";

import { useMemo, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { computeFit, SAMPLE_INFLATED_RESUME } from "@/lib/store";
import { normalizeSkill } from "@/lib/taxonomy";
import {
  ProofBadge,
  VerifiedPill,
  FlaggedPill,
  GapPill,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Send,
  Upload,
  Sparkles,
  ShieldAlert,
  Wand2,
  Code2,
  CheckCircle2,
  XCircle,
  FileWarning,
  Lock,
  User,
  Briefcase,
  GitBranch,
  Loader2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RefreshCw,
} from "lucide-react";

/* =========================================================================
 * Root: two modes
 * ========================================================================= */
export function ResumeStudioTab() {
  return (
    <Tabs defaultValue="ats" className="space-y-4">
      <TabsList className="bg-white/5 h-10">
        <TabsTrigger
          value="ats"
          className="data-[state=active]:bg-white/10 data-[state=active]:text-white gap-1.5"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Mode 1: 1-Click ATS Generator
        </TabsTrigger>
        <TabsTrigger
          value="audit"
          className="data-[state=active]:bg-white/10 data-[state=active]:text-white gap-1.5"
        >
          <FileWarning className="h-3.5 w-3.5" />
          Mode 2: Resume BS Detector
        </TabsTrigger>
      </TabsList>
      <TabsContent value="ats">
        <AtsGenerator />
      </TabsContent>
      <TabsContent value="audit">
        <BsDetector />
      </TabsContent>
    </Tabs>
  );
}

/* =========================================================================
 * Mode 1: 1-Click Truth-Constrained ATS Generator
 * Split-screen: Left = controls/checklist, Right = live PDF preview
 * ========================================================================= */
function AtsGenerator() {
  const activeStudentId = useAppStore((s) => s.activeStudentId);
  const students = useAppStore((s) => s.students);
  const jobs = useAppStore((s) => s.jobs);
  const resumeTargetJobId = useAppStore((s) => s.resumeTargetJobId);
  const openProof = useAppStore((s) => s.openProof);

  const student = students.find((s) => s.id === activeStudentId);
  const [targetId, setTargetId] = useState<string>(
    resumeTargetJobId ?? jobs[0]?.id ?? ""
  );
  const [generating, setGenerating] = useState(false);
  const [apiResult, setApiResult] = useState<{
    yaml: string;
    pdfBase64?: string;
    fallback: boolean;
    method: string;
    reason?: string;
    bulletCount?: number;
  } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Toggle-able skill checklist for which verified skills to include
  const [includedSkills, setIncludedSkills] = useState<Set<string>>(
    () => new Set(student?.skills.filter((s) => s.status === "verified").map((s) => s.canonical) ?? [])
  );

  const job = jobs.find((j) => j.id === targetId);

  // Derived resume data — always filtered to only verified + toggled-on skills
  const resume = useMemo(() => {
    if (!student) return null;
    const verifiedSkills = student.skills
      .filter((s) => s.status === "verified" && includedSkills.has(s.canonical))
      .map((s) => s.canonical);

    const ghEvidence = student.evidence.filter(
      (e) => e.kind === "github" && includedSkills.has((e as { skill: string }).skill)
    );
    const projects = student.projects.filter((p) => includedSkills.has(p.skill));
    const assessments = student.assessments.filter(
      (a) => a.passed && includedSkills.has(a.skill)
    );

    const bullets: {
      text: string;
      skill: string;
      evId: string;
      proofUrl?: string;
      kind: "github" | "project" | "assessment";
    }[] = [];

    for (const gh of ghEvidence) {
      const g = gh as {
        id: string; skill: string; repo: string; filePath: string;
        line?: number; commitSha: string; commitUrl: string;
      };
      bullets.push({
        text: `Implemented ${g.skill} in ${g.repo} (${g.filePath.split("/").pop()}${g.line ? `#L${g.line}` : ""}) — verified via commit ${g.commitSha}.`,
        skill: g.skill,
        evId: g.id,
        proofUrl: g.commitUrl,
        kind: "github",
      });
    }

    for (const p of projects) {
      bullets.push({
        text: `Built "${p.title}" (${p.skill}) — Faculty: ${p.faculty}, Grade: ${p.grade}, Complexity: ${p.complexity}/5, Repo: ${p.repo}.`,
        skill: p.skill,
        evId: p.id,
        kind: "project",
      });
    }

    if (assessments.length) {
      const top = [...assessments].sort((a, b) => b.score - a.score)[0];
      bullets.push({
        text: `Cleared proctored ${top.skill} assessment with ${top.score}% — ${top.warnings} proctoring violation(s).`,
        skill: top.skill,
        evId: top.id,
        kind: "assessment",
      });
    }

    // Build YAML locally (for live preview; server builds authoritative version)
    const yaml = `cv:
  name: ${student.name}
  location: ${student.branch}, Batch ${student.batch}
  email: ${student.githubUser}@students.drishti.edu
  social_networks:
    - network: GitHub
      username: ${student.githubUser}
  sections:
    summary:
      - "Verification Score: ${student.verificationScore}% | CGPA: ${student.cgpa} | Roll: ${student.roll}"
    verified_experience_and_projects:
${bullets
        .map(
          (b) =>
            `      - bullet: "${b.text.replace(/"/g, '\\"')} [🔗 Proof Verified]"`
        )
        .join("\n")}
    verified_skills:
      - label: Technical Skills
        details: "${verifiedSkills.join(", ")}"

design:
  theme: classic
  font_size: 10pt
  page_size: us-letter
  color: "#01579B"`;

    return { bullets, verifiedSkills, yaml, ghEvidence, projects, assessments };
  }, [student, includedSkills]);

  const toggleSkill = useCallback((skill: string) => {
    setIncludedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
    // Reset API result when checklist changes
    setApiResult(null);
  }, []);

  // Call backend to generate resume via RenderCV
  const generateResume = useCallback(async () => {
    if (!student || !resume) return;
    setGenerating(true);
    setApiError(null);
    try {
      const res = await fetch("/api/generate-verified-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: student.name,
          roll: student.roll,
          branch: student.branch,
          batch: student.batch,
          cgpa: student.cgpa,
          githubUser: student.githubUser,
          verificationScore: student.verificationScore,
          verifiedSkills: resume.verifiedSkills,
          evidence: student.evidence,
          projects: student.projects,
          assessments: student.assessments,
          targetJob: job ? { company: job.company, role: job.role } : undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setApiError(data.error);
      } else {
        setApiResult(data);
        window.dispatchEvent(
          new CustomEvent("drishti:toast", {
            detail: {
              title: data.fallback
                ? "YAML compiled — PDF preview active"
                : "✅ ATS PDF generated via RenderCV",
              description: data.fallback
                ? data.reason ?? "Client-side preview rendered."
                : `${data.bulletCount} verified bullet(s) — ${data.verifiedSkillCount} skills`,
            },
          })
        );
      }
    } catch (err) {
      setApiError(String(err));
    } finally {
      setGenerating(false);
    }
  }, [student, resume, job]);

  const downloadPdf = useCallback(() => {
    if (!student || !resume) return;

    if (apiResult?.pdfBase64) {
      // Real PDF from RenderCV
      const binary = atob(apiResult.pdfBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${student.name.replace(/\s/g, "_")}_ATS_Resume.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Fallback: HTML resume
      const html = `<html><head><title>${student.name} - ATS Resume</title><style>
body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#111}
h1{margin:0;font-size:22px}p{margin:2px 0}h2{border-bottom:1px solid #ccc;padding-bottom:2px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;margin-top:16px}
ul{padding-left:18px}li{margin:6px 0;font-size:11.5px;line-height:1.5}
.badge{display:inline-block;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:999px;padding:1px 8px;font-size:9.5px;font-weight:700;margin-left:6px}
</style></head><body>
<h1>${student.name}</h1>
<p style="font-size:11px;color:#555">${student.branch}, Batch ${student.batch} · CGPA ${student.cgpa} · ${student.roll} · @${student.githubUser}</p>
<h2>Experience &amp; Projects</h2><ul>
${resume.bullets.map((b) => `<li>${b.text}<span class="badge">🔗 Proof Verified</span></li>`).join("")}
</ul>
<h2>Verified Skills</h2><p style="font-size:11.5px">${resume.verifiedSkills.join(" · ")}</p>
</body></html>`;
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${student.name.replace(/\s/g, "_")}_ATS_Resume.html`;
      a.click();
      URL.revokeObjectURL(url);
    }

    window.dispatchEvent(
      new CustomEvent("drishti:toast", {
        detail: {
          title: "Resume downloaded",
          description: "Truth-constrained — only verified claims included",
        },
      })
    );
  }, [student, resume, apiResult]);

  if (!student || !resume) return null;

  const verifiedSkillsList = student.skills.filter(
    (s) => s.status === "verified"
  );
  const strippedSkills = student.skills.filter(
    (s) => s.status === "failed" || s.status === "unverified"
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      {/* =================== LEFT PANEL =================== */}
      <div className="space-y-3">
        {/* Immutable Profile Header */}
        <div className="drishti-card rounded-xl p-4 border border-[var(--drishti-blue)]/20">
          <div className="mb-2 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-[var(--drishti-gold)]" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--drishti-gold)]">
              Immutable Profile — Read-Only
            </h3>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/8 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-[var(--drishti-sub)]" />
              <span className="text-sm font-bold text-white">{student.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-[var(--drishti-sub)]">
              <span>🎓 {student.branch}</span>
              <span>📅 Batch {student.batch}</span>
              <span>🆔 {student.roll}</span>
              <span>📊 CGPA {student.cgpa}</span>
              <span className="col-span-2 flex items-center gap-1">
                <GitBranch className="h-2.5 w-2.5" />
                @{student.githubUser} · {student.reposScanned} repos scanned
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-[var(--drishti-sub)]">
              Verification Score
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: student.verificationScore >= 80 ? "#10b981" : student.verificationScore >= 60 ? "#f59e0b" : "#ef4444" }}
            >
              {student.verificationScore}%
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${student.verificationScore}%`,
                background:
                  student.verificationScore >= 80
                    ? "#10b981"
                    : student.verificationScore >= 60
                    ? "#f59e0b"
                    : "#ef4444",
              }}
            />
          </div>
        </div>

        {/* Target Job Selector */}
        <div className="drishti-card rounded-xl p-4">
          <div className="mb-2 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[var(--drishti-gold)]" />
            <h3 className="text-sm font-semibold text-white">Target Job</h3>
          </div>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-[#0a0f1c] px-3 py-2 text-[13px] text-white outline-none focus:border-[var(--drishti-blue)] transition"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.company} — {j.role}
              </option>
            ))}
          </select>
          {job && (
            <div className="mt-3 space-y-2">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--drishti-sub)]">
                  Required
                </div>
                <div className="flex flex-wrap gap-1">
                  {job.requiredSkills.map((s) =>
                    resume.verifiedSkills.includes(s) ? (
                      <VerifiedPill key={s}>{s}</VerifiedPill>
                    ) : (
                      <GapPill key={s}>{s}</GapPill>
                    )
                  )}
                </div>
              </div>
              {job.preferredSkills.length > 0 && (
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--drishti-sub)]">
                    Preferred
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.preferredSkills.map((s) =>
                      resume.verifiedSkills.includes(s) ? (
                        <VerifiedPill key={s}>{s}</VerifiedPill>
                      ) : (
                        <GapPill key={s}>{s}</GapPill>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Verified Skills Checklist */}
        <div className="drishti-card rounded-xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">
                Verified Skills Checklist
              </h3>
            </div>
            <span className="text-[10px] text-[var(--drishti-sub)]">
              {includedSkills.size} / {verifiedSkillsList.length} selected
            </span>
          </div>
          <p className="mb-2 text-[10.5px] text-[var(--drishti-sub)]">
            Toggle which verified skills appear in your resume.
          </p>
          <div className="space-y-1.5">
            {verifiedSkillsList.map((sk) => {
              const on = includedSkills.has(sk.canonical);
              return (
                <label
                  key={sk.canonical}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 transition ${
                    on
                      ? "border-emerald-500/40 bg-emerald-500/8"
                      : "border-white/10 bg-white/[0.02] opacity-60"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleSkill(sk.canonical)}
                    className="accent-emerald-400"
                  />
                  <CheckCircle2
                    className={`h-3 w-3 ${on ? "text-emerald-400" : "text-white/20"}`}
                  />
                  <span className={`text-[12px] font-medium ${on ? "text-white" : "text-[var(--drishti-sub)]"}`}>
                    {sk.canonical}
                  </span>
                  {on && (
                    <ProofBadge
                      label="Proof"
                      onClick={(e) => {
                        (e as React.MouseEvent).stopPropagation();
                        openProof(student.id, sk.canonical);
                      }}
                    />
                  )}
                </label>
              );
            })}
          </div>

          {strippedSkills.length > 0 && (
            <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
                <XCircle className="h-3 w-3" />
                Auto-stripped (not eligible for resume)
              </div>
              <div className="flex flex-wrap gap-1">
                {strippedSkills.map((sk) => (
                  <FlaggedPill key={sk.canonical}>
                    {sk.canonical} ({sk.status})
                  </FlaggedPill>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={generateResume}
            disabled={generating || includedSkills.size === 0}
            className="w-full bg-[var(--drishti-gold)] text-[#02060f] hover:bg-[#ffe2b2] font-semibold"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Compiling via RenderCV…
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Verified Resume
              </>
            )}
          </Button>

          {apiResult && (
            <div className="flex gap-2">
              <Button
                onClick={downloadPdf}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
              >
                <Download className="mr-1.5 h-4 w-4" />
                {apiResult.pdfBase64 ? "Download ATS PDF" : "Download HTML"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-white/15 text-white hover:bg-white/10"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("drishti:toast", {
                      detail: {
                        title: "Resume forwarded",
                        description: `Verified resume sent to ${job?.company}`,
                      },
                    })
                  )
                }
              >
                <Send className="mr-1.5 h-4 w-4" />
                Forward to Company
              </Button>
            </div>
          )}
        </div>

        {/* API Status Banner */}
        {apiResult && (
          <div
            className={`rounded-lg border p-2.5 text-[11px] ${
              apiResult.fallback
                ? "border-amber-500/30 bg-amber-500/8 text-amber-300"
                : "border-emerald-500/30 bg-emerald-500/8 text-emerald-300"
            }`}
          >
            <div className="font-semibold mb-0.5">
              {apiResult.fallback ? "⚠ Fallback Mode" : "✅ RenderCV Success"}
            </div>
            <div className="text-[10.5px] opacity-80">
              {apiResult.fallback
                ? apiResult.reason
                : `Method: ${apiResult.method} · ${apiResult.bulletCount} verified bullet(s)`}
            </div>
            {apiResult.fallback && (
              <div className="mt-1 text-[10px] opacity-70">
                Install RenderCV: <code className="font-mono">pip install rendercv</code>
              </div>
            )}
          </div>
        )}

        {apiError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/8 p-2.5 text-[11px] text-red-300">
            ⨯ {apiError}
          </div>
        )}
      </div>

      {/* =================== RIGHT PANEL: Live Resume Preview =================== */}
      <div className="drishti-card rounded-xl flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--drishti-blue)]" />
            <h3 className="text-sm font-semibold text-white">
              Resume Preview
              <span className="ml-2 text-[10px] font-normal text-[var(--drishti-sub)]">
                ATS-Optimized · 1-Page · Truth-Constrained
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px]">
              <ShieldAlert className="mr-1 h-2.5 w-2.5" />
              Zero Inflation
            </Badge>
            {!apiResult && (
              <Button
                size="sm"
                variant="outline"
                onClick={generateResume}
                disabled={generating}
                className="h-7 border-white/15 text-[11px] text-white hover:bg-white/10"
              >
                {generating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5">
          {/* PDF embed if available */}
          {apiResult?.pdfBase64 ? (
            <iframe
              src={`data:application/pdf;base64,${apiResult.pdfBase64}`}
              className="h-full min-h-[700px] w-full rounded-lg border border-white/10"
              title="ATS Resume PDF"
            />
          ) : (
            /* White-paper HTML preview */
            <div className="mx-auto max-w-[680px] rounded-lg bg-white p-8 text-[#111] shadow-2xl">
              {/* Header */}
              <div className="border-b-2 border-[#01579B] pb-3 mb-4">
                <h1 className="text-[22px] font-bold leading-tight">{student.name}</h1>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {student.branch} · Batch {student.batch} · CGPA {student.cgpa} · {student.roll}
                </p>
                <p className="text-[11px] text-gray-500">
                  github.com/{student.githubUser} · {student.githubUser}@students.drishti.edu
                </p>
                {job && (
                  <p className="mt-1 text-[11px] font-semibold text-[#01579B]">
                    Target: {job.company} — {job.role}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="mb-4">
                <SectionHeader>Summary</SectionHeader>
                <p className="text-[11px] text-gray-700">
                  Verification Score: <strong>{student.verificationScore}%</strong> ·
                  CGPA: <strong>{student.cgpa}</strong> · Roll: {student.roll}
                </p>
                <p className="text-[10.5px] text-gray-500 mt-0.5">
                  All claims below are cryptographically traceable to GitHub commits or proctored assessments.
                </p>
              </div>

              {/* Experience & Projects */}
              {resume.bullets.length > 0 && (
                <div className="mb-4">
                  <SectionHeader>Verified Experience &amp; Projects</SectionHeader>
                  <ul className="space-y-2 mt-1">
                    {resume.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 text-[var(--drishti-blue)] select-none shrink-0">•</span>
                        <div className="flex-1">
                          <span className="text-[11.5px] leading-relaxed">{b.text}</span>
                          <button
                            onClick={() => openProof(student.id, b.skill)}
                            className="ml-1.5 inline-flex items-center gap-0.5 rounded-full border border-emerald-600/50 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 hover:bg-emerald-100 transition shrink-0"
                          >
                            <ShieldCheck className="h-2 w-2" />
                            Proof Verified
                          </button>
                          {b.proofUrl && (
                            <a
                              href={b.proofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-1 inline-flex items-center gap-0.5 text-[9px] text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-2 w-2" />
                              Commit
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verified Skills */}
              {resume.verifiedSkills.length > 0 && (
                <div className="mb-4">
                  <SectionHeader>Verified Skills</SectionHeader>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {resume.verifiedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-800"
                      >
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stripped skills notice */}
              {strippedSkills.length > 0 && (
                <div className="mt-4 rounded border border-red-200 bg-red-50 p-2.5">
                  <p className="text-[10px] font-semibold text-red-700">
                    ⛔ Auto-stripped (not included in resume):
                  </p>
                  <p className="text-[10px] text-red-600 mt-0.5">
                    {strippedSkills.map((s) => `${s.canonical} (${s.status})`).join(", ")}
                  </p>
                </div>
              )}

              {/* Empty state */}
              {resume.bullets.length === 0 && (
                <div className="rounded border border-dashed border-gray-200 p-6 text-center text-[11px] text-gray-400">
                  Select verified skills from the checklist to populate your resume.
                </div>
              )}
            </div>
          )}
        </div>

        {/* YAML Panel (below preview) */}
        <div className="border-t border-white/10">
          <details className="group">
            <summary className="flex cursor-pointer items-center gap-2 px-5 py-3 text-[12px] font-semibold text-[var(--drishti-sub)] hover:text-white transition select-none">
              <Code2 className="h-3.5 w-3.5 text-[var(--drishti-blue)]" />
              RenderCV YAML Schema (live)
              <span className="ml-auto text-[10px] opacity-60 group-open:rotate-90 transition-transform">▶</span>
            </summary>
            <div className="px-5 pb-4">
              <pre className="max-h-64 overflow-auto rounded-lg bg-black/60 p-3 text-[10.5px] leading-relaxed text-emerald-300 border border-white/5">
                {apiResult?.yaml ?? resume.yaml}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#01579B] border-b border-[#01579B]/30 pb-0.5 mb-1">
      {children}
    </h2>
  );
}

/* =========================================================================
 * Mode 2: BS Detector
 * ========================================================================= */
function BsDetector() {
  const activeStudentId = useAppStore((s) => s.activeStudentId);
  const students = useAppStore((s) => s.students);
  const student = students.find((s) => s.id === activeStudentId);
  const [resumeText, setResumeText] = useState("");
  const [audited, setAudited] = useState<null | {
    verified: { claim: string; evId: string; skill: string; proofUrl?: string }[];
    flagged: { claim: string; skill: string; reason: string }[];
  }>(null);

  const audit = () => {
    if (!student) return;
    const lines = resumeText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const verifiedSkills = new Set(
      student.skills
        .filter((s) => s.status === "verified")
        .map((s) => s.canonical)
    );
    const evidenceBySkill: Record<string, { id: string; url?: string }[]> = {};
    for (const e of student.evidence) {
      const sk = (e as { skill: string }).skill;
      if (verifiedSkills.has(sk)) {
        evidenceBySkill[sk] = evidenceBySkill[sk] || [];
        evidenceBySkill[sk].push({
          id: e.id,
          url: e.kind === "github" ? (e as { commitUrl?: string }).commitUrl : undefined,
        });
      }
    }

    const verified: { claim: string; evId: string; skill: string; proofUrl?: string }[] = [];
    const flagged: { claim: string; skill: string; reason: string }[] = [];

    for (const line of lines) {
      const lower = line.toLowerCase();
      const skillsFound: { raw: string; canonical: string }[] = [];

      for (const s of verifiedSkills) {
        const re = new RegExp(s.toLowerCase().replace(/[.*+?^${}()|[\]\\+#]/g, "\\$&"), "i");
        if (re.test(lower)) skillsFound.push({ raw: s, canonical: s });
      }

      const variantMap: Record<string, string> = {
        kubernetes: "Kubernetes",
        redis: "Redis",
        cassandra: "Cassandra",
        kafka: "Kafka",
        graphql: "GraphQL",
        grpc: "gRPC",
        terraform: "Terraform",
        rust: "Rust",
        golang: "Go",
        "go ": "Go",
      };
      for (const [v, canon] of Object.entries(variantMap)) {
        if (lower.includes(v)) {
          skillsFound.push({ raw: v, canonical: normalizeSkill(canon) });
        }
      }

      if (skillsFound.length === 0) continue;

      const allVerified = skillsFound.every((sf) => verifiedSkills.has(sf.canonical));
      if (allVerified) {
        const ev = evidenceBySkill[skillsFound[0].canonical]?.[0];
        verified.push({
          claim: line,
          evId: ev?.id ?? "",
          skill: skillsFound[0].canonical,
          proofUrl: ev?.url,
        });
      } else {
        const missing = skillsFound
          .filter((sf) => !verifiedSkills.has(sf.canonical))
          .map((sf) => sf.canonical);
        flagged.push({
          claim: line,
          skill: missing.join(", "),
          reason: `No ${missing.join(" or ")} imports found in your GitHub repositories or proctored assessments.`,
        });
      }
    }
    setAudited({ verified, flagged });
  };

  const sanitize = () => {
    if (!audited) return;
    const flaggedLines = new Set(audited.flagged.map((f) => f.claim));
    const cleaned = resumeText
      .split("\n")
      .filter((l) => !flaggedLines.has(l.trim()))
      .join("\n");
    setResumeText(cleaned);
    window.dispatchEvent(
      new CustomEvent("drishti:toast", {
        detail: {
          title: "Sanitized",
          description: `${audited.flagged.length} unverified claim(s) stripped`,
        },
      })
    );
    setAudited(null);
  };

  if (!student) return null;

  return (
    <div className="space-y-4">
      <div className="drishti-card rounded-xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-red-400" />
            <h3 className="text-sm font-semibold text-white">
              Resume "BS Detector" &amp; Claim Auditor
            </h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-white/15 text-white hover:bg-white/10"
            onClick={() => setResumeText(SAMPLE_INFLATED_RESUME)}
          >
            <Upload className="mr-1 h-3.5 w-3.5" />
            Load Sample Inflated Resume
          </Button>
        </div>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here, or click 'Load Sample Inflated Resume' to demo the auditor…"
          className="h-56 w-full resize-none rounded-lg border border-white/15 bg-[#0a0f1c] p-3 font-mono text-[12px] text-white outline-none focus:border-[var(--drishti-blue)] transition"
        />
        <div className="mt-2 flex gap-2">
          <Button
            onClick={audit}
            disabled={!resumeText.trim()}
            className="bg-[var(--drishti-blue)] text-[#02060f] hover:bg-[#9fe0ff] font-semibold"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Audit Claims Against Evidence Ledger
          </Button>
          {audited && audited.flagged.length > 0 && (
            <Button
              onClick={sanitize}
              variant="outline"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10"
            >
              <Wand2 className="mr-1.5 h-4 w-4" />
              Sanitize &amp; Remove Unverified Claims
            </Button>
          )}
        </div>
        {audited && audited.flagged.length > 0 && (
          <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[11.5px] text-red-300">
            ⚠{" "}
            <strong>Application submission is BLOCKED</strong> until you remove
            the {audited.flagged.length} unverified claim(s) below or pass the
            verification test.
          </div>
        )}
        {audited && audited.flagged.length === 0 && audited.verified.length > 0 && (
          <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/8 p-3 text-[11.5px] text-emerald-300">
            ✅ <strong>Resume is fully truthful!</strong> All {audited.verified.length} claim(s) verified.
          </div>
        )}
      </div>

      {audited && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Verified Claims */}
          <div className="drishti-card rounded-xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-white">
                🟢 Verified Claims ({audited.verified.length})
              </h4>
            </div>
            {audited.verified.length === 0 ? (
              <p className="text-[12px] text-[var(--drishti-sub)]">
                No verified claims detected.
              </p>
            ) : (
              <div className="space-y-2">
                {audited.verified.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5"
                  >
                    <p className="text-[12px] text-white">{c.claim}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <VerifiedPill>{c.skill} ✓</VerifiedPill>
                      <ProofBadge
                        label={`Linked to ${c.evId}`}
                        onClick={() =>
                          useAppStore.getState().openProof(student.id, c.skill)
                        }
                      />
                      {c.proofUrl && (
                        <a
                          href={c.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-[var(--drishti-blue)] hover:text-white"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          View Commit
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blocked Claims */}
          <div className="drishti-card rounded-xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <h4 className="text-sm font-semibold text-white">
                🔴 Blocked / Unsupported Claims ({audited.flagged.length})
              </h4>
            </div>
            {audited.flagged.length === 0 ? (
              <p className="text-[12px] text-emerald-400">
                No unsupported claims — resume is truthful! 🎉
              </p>
            ) : (
              <div className="space-y-2">
                {audited.flagged.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 p-2.5"
                  >
                    <p className="text-[12px] text-white line-through decoration-red-500/60">
                      {c.claim}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-start gap-2">
                      <FlaggedPill>FLAGGED: {c.skill}</FlaggedPill>
                      <p className="text-[11px] text-red-300">{c.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
