"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { computeFit, SAMPLE_INFLATED_RESUME } from "@/lib/store";
import { normalizeSkill } from "@/lib/taxonomy";
import { ProofBadge, VerifiedPill, FlaggedPill, GapPill } from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Download, Send, Upload, Sparkles, ShieldAlert, Wand2, Code2, CheckCircle2, XCircle, FileWarning } from "lucide-react";

export function ResumeStudioTab() {
  return (
    <Tabs defaultValue="ats" className="space-y-4">
      <TabsList className="bg-white/5">
        <TabsTrigger value="ats" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Mode 1: 1-Click ATS Generator</TabsTrigger>
        <TabsTrigger value="audit" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Mode 2: Resume BS Detector</TabsTrigger>
      </TabsList>
      <TabsContent value="ats"><AtsGenerator /></TabsContent>
      <TabsContent value="audit"><BsDetector /></TabsContent>
    </Tabs>
  );
}

/* ============ Mode 1: 1-Click Truth-Constrained ATS Generator ============ */
function AtsGenerator() {
  const activeStudentId = useAppStore((s) => s.activeStudentId);
  const students = useAppStore((s) => s.students);
  const jobs = useAppStore((s) => s.jobs);
  const resumeTargetJobId = useAppStore((s) => s.resumeTargetJobId);
  const openProof = useAppStore((s) => s.openProof);
  const student = students.find((s) => s.id === activeStudentId);
  const [targetId, setTargetId] = useState<string>(resumeTargetJobId ?? jobs[0]?.id ?? "");

  const job = jobs.find((j) => j.id === targetId);

  // Build truth-constrained resume bullets from verified evidence only
  const resume = useMemo(() => {
    if (!student) return null;
    const verifiedSkills = student.skills.filter((s) => s.status === "verified").map((s) => s.canonical);
    const ghEvidence = student.evidence.filter((e) => e.kind === "github");
    const projects = student.projects;
    const assessments = student.assessments.filter((a) => a.passed);

    const bullets: { text: string; skill: string; evId: string }[] = [];
    for (const gh of ghEvidence) {
      const g = gh as any;
      bullets.push({
        text: `Implemented ${g.skill} in ${g.repo} (${g.filePath.split("/").pop()}#${g.line}) — verified via commit ${g.commitSha}.`,
        skill: g.skill,
        evId: g.id,
      });
    }
    for (const p of projects) {
      bullets.push({
        text: `Built "${p.title}" (${p.skill}) — faculty-graded ${p.grade}, complexity ${p.complexity}/5, repo ${p.repo}.`,
        skill: p.skill,
        evId: p.id,
      });
    }
    if (assessments.length) {
      const top = [...assessments].sort((a, b) => b.score - a.score)[0];
      bullets.push({
        text: `Cleared proctored ${top.skill} assessment with ${top.score}% (zero proctoring violations).`,
        skill: top.skill,
        evId: top.id,
      });
    }
    // RenderCV YAML preview
    const yaml = `cv:
  name: ${student.name}
  location: ${student.branch}, Batch ${student.batch}
  email: ${student.githubUser}@students.edu
  sections:
    experience:
${bullets.map((b) => `      - bullet: "${b.text.replace(/"/g, '\\"')}"`).join("\n")}
    skills:
${verifiedSkills.map((s) => `      - ${s}`).join("\n")}`;
    return { bullets, verifiedSkills, yaml };
  }, [student]);

  if (!student || !resume) return null;

  const downloadPdf = () => {
    // Simulate PDF: generate a printable HTML blob
    const html = `<html><head><title>${student.name} - ATS Resume</title><style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#111}h1{margin:0}h2{border-bottom:1px solid #ccc;padding-bottom:2px;font-size:14px;text-transform:uppercase}ul{padding-left:18px}li{margin:4px 0;font-size:12px}</style></head><body><h1>${student.name}</h1><p>${student.branch}, Batch ${student.batch} · CGPA ${student.cgpa} · ${student.roll}</p><h2>Experience & Projects</h2><ul>${resume.bullets.map((b) => `<li>${b.text} [PROOF VERIFIED]</li>`).join("")}</ul><h2>Skills</h2><p>${resume.verifiedSkills.join(", ")}</p></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${student.name.replace(/\s/g, "_")}_ATS_Resume.html`;
    a.click();
    URL.revokeObjectURL(url);
    window.dispatchEvent(new CustomEvent("drishti:toast", { detail: { title: "1-Page ATS Resume downloaded", description: "Truth-constrained — only verified claims included" } }));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      {/* Controls */}
      <div className="space-y-3">
        <div className="drishti-card rounded-xl p-4">
          <div className="mb-2 flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-[var(--drishti-gold)]" />
            <h3 className="text-sm font-semibold text-white">Target Job</h3>
          </div>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-[#0a0f1c] px-3 py-2 text-[13px] text-white outline-none focus:border-[var(--drishti-blue)]"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.company} — {j.role}</option>
            ))}
          </select>
          {job && (
            <div className="mt-3">
              <div className="mb-1 text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Required skills</div>
              <div className="flex flex-wrap gap-1.5">
                {job.requiredSkills.map((s) => {
                  const verified = resume.verifiedSkills.includes(s);
                  return verified ? <VerifiedPill key={s}>{s}</VerifiedPill> : <GapPill key={s}>{s}</GapPill>;
                })}
              </div>
            </div>
          )}
          <p className="mt-3 text-[11.5px] text-[var(--drishti-sub)]">
            Only <span className="text-emerald-400">verified</span> evidence is included. Unverified / failed skills are automatically excluded.
          </p>
        </div>

        {/* RenderCV YAML preview */}
        <div className="drishti-card rounded-xl p-4">
          <div className="mb-2 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-[var(--drishti-blue)]" />
            <h3 className="text-sm font-semibold text-white">RenderCV YAML Schema (live)</h3>
          </div>
          <pre className="max-h-72 overflow-auto rounded-lg bg-black/50 p-3 text-[11px] leading-relaxed text-emerald-300">{resume.yaml}</pre>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={downloadPdf} className="bg-[var(--drishti-gold)] text-[#02060f] hover:bg-[#ffe2b2]">
            <Download className="mr-1 h-4 w-4" /> Download 1-Page ATS PDF
          </Button>
          <Button variant="outline" className="border-white/15 text-white hover:bg-white/10" onClick={() => window.dispatchEvent(new CustomEvent("drishti:toast", { detail: { title: "Resume forwarded", description: `Verified resume sent to ${job?.company}` } }))}>
            <Send className="mr-1 h-4 w-4" /> Forward Verified Resume to Company
          </Button>
        </div>
      </div>

      {/* Resume preview */}
      <div className="drishti-card rounded-xl p-6">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Resume Preview (ATS-Optimized, 1 Page)</h3>
          <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400"><ShieldAlert className="mr-1 h-3 w-3" /> Truth-Constrained</Badge>
        </div>
        <div className="rounded-lg bg-white p-6 text-[#111]">
          <h1 className="text-xl font-bold">{student.name}</h1>
          <p className="text-[11px] text-gray-600">{student.branch}, Batch {student.batch} · CGPA {student.cgpa} · {student.roll} · @{student.githubUser}</p>
          <hr className="my-2" />
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-gray-700">Experience & Projects</h2>
          <ul className="mt-1 space-y-1.5">
            {resume.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11.5px]">
                <span className="mt-0.5">•</span>
                <span className="flex-1">{b.text}</span>
                <button onClick={() => openProof(student.id, b.skill)} className="shrink-0">
                  <ProofBadge label="Proof Verified" />
                </button>
              </li>
            ))}
          </ul>
          <h2 className="mt-3 text-[12px] font-bold uppercase tracking-wider text-gray-700">Verified Skills</h2>
          <p className="mt-1 text-[11.5px]">{resume.verifiedSkills.join(" · ")}</p>
        </div>
      </div>
    </div>
  );
}

/* ============ Mode 2: BS Detector ============ */
function BsDetector() {
  const activeStudentId = useAppStore((s) => s.activeStudentId);
  const students = useAppStore((s) => s.students);
  const student = students.find((s) => s.id === activeStudentId);
  const [resumeText, setResumeText] = useState("");
  const [audited, setAudited] = useState<null | { verified: { claim: string; evId: string; skill: string }[]; flagged: { claim: string; skill: string; reason: string }[] }>(null);

  const audit = () => {
    if (!student) return;
    const lines = resumeText.split("\n").map((l) => l.trim()).filter(Boolean);
    const verifiedSkills = new Set(student.skills.filter((s) => s.status === "verified").map((s) => s.canonical));
    const verifiedEvidenceBySkill: Record<string, string[]> = {};
    for (const e of student.evidence) {
      const sk = (e as any).skill;
      if (verifiedSkills.has(sk)) {
        verifiedEvidenceBySkill[sk] = verifiedEvidenceBySkill[sk] || [];
        verifiedEvidenceBySkill[sk].push(e.id);
      }
    }
    const verified: { claim: string; evId: string; skill: string }[] = [];
    const flagged: { claim: string; skill: string; reason: string }[] = [];
    for (const line of lines) {
      // extract skill mentions in the line
      const skillsFound: { raw: string; canonical: string }[] = [];
      const lower = line.toLowerCase();
      // crude scan: check each verified skill canonical + variants
      const ALL_SKILLS = Array.from(verifiedSkills);
      for (const s of ALL_SKILLS) {
        const re = new RegExp(s.toLowerCase().replace(/[.*+?^${}()|[\]\\+#]/g, "\\$&"), "i");
        if (re.test(lower)) skillsFound.push({ raw: s, canonical: s });
      }
      // also check common variants from the inflated sample
      const variantMap: Record<string, string> = { kubernetes: "Kubernetes", redis: "Redis", cassandra: "Cassandra", kafka: "Kafka", graphql: "GraphQL", grpc: "gRPC", terraform: "Terraform", rust: "Rust", "golang": "Go", "go ": "Go" };
      for (const [v, canon] of Object.entries(variantMap)) {
        if (lower.includes(v)) skillsFound.push({ raw: v, canonical: normalizeSkill(canon) });
      }
      if (skillsFound.length === 0) continue;
      const allVerified = skillsFound.every((sf) => verifiedSkills.has(sf.canonical));
      if (allVerified) {
        const evId = verifiedEvidenceBySkill[skillsFound[0].canonical]?.[0] ?? "";
        verified.push({ claim: line, evId, skill: skillsFound[0].canonical });
      } else {
        const missing = skillsFound.filter((sf) => !verifiedSkills.has(sf.canonical)).map((sf) => sf.canonical);
        flagged.push({ claim: line, skill: missing.join(", "), reason: `No ${missing.join(" or ")} imports found in your GitHub repositories or proctored assessments.` });
      }
    }
    setAudited({ verified, flagged });
  };

  const sanitize = () => {
    if (!audited) return;
    // remove flagged lines from resume text
    const flaggedLines = new Set(audited.flagged.map((f) => f.claim));
    const cleaned = resumeText.split("\n").filter((l) => !flaggedLines.has(l.trim())).join("\n");
    setResumeText(cleaned);
    window.dispatchEvent(new CustomEvent("drishti:toast", { detail: { title: "Sanitized", description: `${audited.flagged.length} unverified claim(s) stripped` } }));
    setAudited(null);
  };

  if (!student) return null;

  return (
    <div className="space-y-4">
      <div className="drishti-card rounded-xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-red-400" />
            <h3 className="text-sm font-semibold text-white">Resume "BS Detector" & Claim Auditor</h3>
          </div>
          <Button size="sm" variant="outline" className="border-white/15 text-white" onClick={() => setResumeText(SAMPLE_INFLATED_RESUME)}>
            <Upload className="mr-1 h-3.5 w-3.5" /> Load Sample Inflated Resume
          </Button>
        </div>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here, or click 'Load Sample Inflated Resume' to demo the auditor…"
          className="h-56 w-full resize-none rounded-lg border border-white/15 bg-[#0a0f1c] p-3 font-mono text-[12px] text-white outline-none focus:border-[var(--drishti-blue)]"
        />
        <div className="mt-2 flex gap-2">
          <Button onClick={audit} disabled={!resumeText.trim()} className="bg-[var(--drishti-blue)] text-[#02060f] hover:bg-[#9fe0ff]">
            <Sparkles className="mr-1 h-4 w-4" /> Audit Claims Against Evidence Ledger
          </Button>
          {audited && audited.flagged.length > 0 && (
            <Button onClick={sanitize} variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10">
              <Wand2 className="mr-1 h-4 w-4" /> Sanitize & Remove Unverified Claims
            </Button>
          )}
        </div>
        {audited && audited.flagged.length > 0 && (
          <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-[11.5px] text-red-300">
            ⚠ <strong>Application submission is BLOCKED</strong> until you remove the {audited.flagged.length} unverified claim(s) below or pass the verification test.
          </div>
        )}
      </div>

      {audited && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="drishti-card rounded-xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-white">🟢 Verified Claims ({audited.verified.length})</h4>
            </div>
            {audited.verified.length === 0 ? (
              <p className="text-[12px] text-[var(--drishti-sub)]">No verified claims detected.</p>
            ) : (
              <div className="space-y-2">
                {audited.verified.map((c, i) => (
                  <div key={i} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                    <p className="text-[12px] text-white">{c.claim}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <VerifiedPill>{c.skill} ✓</VerifiedPill>
                      <ProofBadge label={`Linked to ${c.evId}`} onClick={() => useAppStore.getState().openProof(student.id, c.skill)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="drishti-card rounded-xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <h4 className="text-sm font-semibold text-white">🔴 Blocked / Unsupported Claims ({audited.flagged.length})</h4>
            </div>
            {audited.flagged.length === 0 ? (
              <p className="text-[12px] text-emerald-400">No unsupported claims — resume is truthful! 🎉</p>
            ) : (
              <div className="space-y-2">
                {audited.flagged.map((c, i) => (
                  <div key={i} className="rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
                    <p className="text-[12px] text-white line-through decoration-red-500/60">{c.claim}</p>
                    <div className="mt-1.5 flex items-start gap-2">
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
