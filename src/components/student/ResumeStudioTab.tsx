"use client";

import { useMemo, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import {
  type VerifiedProofItem,
  type ScrubbedSkillItem,
} from "@/lib/onboarding-types";
import {
  VerifiedPill,
  FlaggedPill,
} from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ShieldAlert,
  Wand2,
  CheckCircle2,
  XCircle,
  FileWarning,
  Lock,
  User,
  Loader2,
  ShieldCheck,
  GraduationCap,
  Copy,
  Printer,
} from "lucide-react";
import {
  SAMPLE_INFLATED_RESUME,
  SAMPLE_INFLATED_RESUME_DEV_OPS,
  SAMPLE_INFLATED_RESUME_AI_ML,
} from "@/lib/mock-data";
import { normalizeSkill } from "@/lib/taxonomy";

export function ResumeStudioTab() {
  return (
    <Tabs defaultValue="ats" className="space-y-4">
      <TabsList className="bg-slate-100/80 h-10 border border-indigo-100 p-1">
        <TabsTrigger
          value="ats"
          className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm text-slate-600 gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <Wand2 className="h-3.5 w-3.5 text-indigo-600" />
          Truth-Enforced Resume Studio (ATS)
        </TabsTrigger>
        <TabsTrigger
          value="audit"
          className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm text-slate-600 gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <FileWarning className="h-3.5 w-3.5 text-amber-500" />
          Resume BS Detector
        </TabsTrigger>
      </TabsList>
      <TabsContent value="ats">
        <AtsResumeStudio />
      </TabsContent>
      <TabsContent value="audit">
        <BsDetector />
      </TabsContent>
    </Tabs>
  );
}

/* =========================================================================
 * PART 2: The Truth-Enforced Resume Studio (Split-Screen Workspace)
 * Left Panel: Evidence Audit (Core ID, Academic Ledger, Verified & Scrubbed Lists)
 * Right Panel: Live RenderCV ATS Preview with Inline [🔗 Proof Verified] Badges
 * ========================================================================= */
function AtsResumeStudio() {
  const onboardingPayload = useAppStore((s) => s.onboardingPayload);
  const studentSignupPayload = useAppStore((s) => s.studentSignupPayload);
  const setOnboardingModalOpen = useAppStore((s) => s.setOnboardingModalOpen);
  const openProof = useAppStore((s) => s.openProof);
  const activeStudentId = useAppStore((s) => s.activeStudentId);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationTimestamp, setGenerationTimestamp] = useState<string>(
    () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const verifiedList: VerifiedProofItem[] = useMemo(() => {
    return onboardingPayload.evidenceLedger.verifiedSkills;
  }, [onboardingPayload]);

  const scrubbedList: ScrubbedSkillItem[] = useMemo(() => {
    return onboardingPayload.evidenceLedger.scrubbedSkills;
  }, [onboardingPayload]);

  const handleGenerateResume = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationTimestamp(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      window.dispatchEvent(
        new CustomEvent("drishti:toast", {
          detail: {
            title: "ATS Resume Compiled",
            description: `Truth-Enforced resume built with ${verifiedList.length} verified evidence anchors.`,
          },
        })
      );
    }, 850);
  }, [verifiedList.length]);

  const handleDownloadPdf = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
    window.print();
  };

  const handleCopyYaml = () => {
    const yamlData = `cv:
  name: ${onboardingPayload.fullName}
  location: Pune, India
  email: ${onboardingPayload.email}
  github: ${onboardingPayload.codingEcosystem.githubUrl}
  education:
    - institution: ${onboardingPayload.engineering.collegeName}
      degree: B.Tech in ${onboardingPayload.department}
      cgpa: ${onboardingPayload.engineering.cgpa} / 10.0
      grad_year: ${onboardingPayload.gradYear}
  verified_skills:
${verifiedList.map((v) => `    - name: ${v.skill}\n      evidence_id: ${v.proofId}`).join("\n")}
`;
    navigator.clipboard.writeText(yamlData);
    window.dispatchEvent(
      new CustomEvent("drishti:toast", {
        detail: {
          title: "RenderCV YAML Copied",
          description: "Truth-enforced schema copied to clipboard.",
        },
      })
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Connected Onboarding Pipeline Status */}
      <div className="drishti-card flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white bg-white/85 p-4 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-100 text-emerald-700 shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Onboarding Ledger Ingested: {onboardingPayload.fullName}
              </span>
              <Badge className="border-emerald-200 bg-emerald-100 text-[10px] font-semibold text-emerald-700 shadow-xs">
                Gatekeeper Active
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              PRN: <span className="font-mono font-semibold text-slate-800">{onboardingPayload.rollNumber}</span> · {onboardingPayload.department} · Batch {onboardingPayload.gradYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOnboardingModalOpen(true)}
            className="border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer font-medium"
          >
            <User className="mr-1.5 h-3.5 w-3.5 text-indigo-600" />
            Edit Onboarding Data
          </Button>
          <Button
            size="sm"
            disabled={isGenerating}
            onClick={handleGenerateResume}
            className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all cursor-pointer text-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Compiling ATS Resume...
              </>
            ) : (
              <>
                <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                Generate 1-Click ATS Resume
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Split-Screen Workspace */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* =========================================================
         * LEFT PANEL: EVIDENCE AUDIT (5 Cols on LG)
         * ========================================================= */}
        <div className="space-y-4 lg:col-span-5">
          {/* Core ID & Immutable Identity */}
          <div className="drishti-card rounded-xl border border-white bg-white/85 p-4 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                <Lock className="h-3.5 w-3.5 text-amber-500" />
                Immutable Identity (From Onboarding)
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-mono font-semibold text-emerald-700">
                Verified PRN
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Full Legal Name:</span>
                <span className="font-semibold text-slate-900">{onboardingPayload.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Institutional Email:</span>
                <span className="font-mono text-slate-800">{onboardingPayload.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Roll No. / PRN:</span>
                <span className="font-mono text-slate-800">{onboardingPayload.rollNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="text-right font-medium text-slate-800">{onboardingPayload.department}</span>
              </div>
            </div>
          </div>

          {/* Academic Ledger (ATS Standards) */}
          <div className="drishti-card rounded-xl border border-white bg-white/85 p-4 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                Academic Ledger (Strict ATS Records)
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 font-mono shadow-xs">
                CGPA {onboardingPayload.engineering.cgpa} / 10.0
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>{onboardingPayload.engineering.collegeName}</span>
                  <span className="text-emerald-700 font-bold">{onboardingPayload.engineering.cgpa} CGPA</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Sem SGPAs: {onboardingPayload.engineering.sgpas.filter((s) => s > 0).join(" · ")}</span>
                  <span className="text-emerald-700 font-semibold">
                    {onboardingPayload.engineering.activeBacklogs} Backlogs
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2">
                  <div className="text-slate-500">12th / Diploma:</div>
                  <div className="font-semibold text-slate-900 truncate">{onboardingPayload.twelfth.collegeName}</div>
                  <div className="text-[10px] text-slate-600">
                    {onboardingPayload.twelfth.board} · {onboardingPayload.twelfth.percentage}% ({onboardingPayload.twelfth.passingYear})
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2">
                  <div className="text-slate-500">10th Secondary:</div>
                  <div className="font-semibold text-slate-900 truncate">{onboardingPayload.tenth.schoolName}</div>
                  <div className="text-[10px] text-slate-600">
                    {onboardingPayload.tenth.board} · {onboardingPayload.tenth.percentageOrCgpa}% ({onboardingPayload.tenth.passingYear})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Verified Evidence (Green List) */}
          <div className="drishti-card rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm border-l-4 border-l-emerald-500">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Active Verified Evidence ({verifiedList.length})
              </div>
              <span className="text-[10px] font-semibold text-emerald-700">
                Included in Resume ✓
              </span>
            </div>
            <p className="mb-3 text-[11px] text-slate-600">
              These claims have cryptographic evidence anchors and are compiled into the ATS resume.
            </p>

            <div className="space-y-2">
              {verifiedList.map((v) => (
                <div
                  key={v.skill}
                  className="rounded-lg border border-emerald-200 bg-white p-2.5 transition hover:shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {v.skill}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                      {v.source === "github" ? "GitHub Anchor" : v.source === "assessment" ? `Test: ${v.score}%` : "Faculty Graded"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 leading-snug">{v.details}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-emerald-700 font-semibold">Proof ID: {v.proofId}</span>
                    {v.commitSha && (
                      <span className="font-mono text-slate-400">SHA: {v.commitSha}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-Removed / Scrubbed Skills (Red List) */}
          <div className="drishti-card rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm border-l-4 border-l-rose-500">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
                <XCircle className="h-4 w-4 text-rose-600" />
                Auto-Removed / Scrubbed Skills ({scrubbedList.length})
              </div>
              <span className="rounded-full border border-rose-200 bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                Excluded by Gatekeeper
              </span>
            </div>
            <p className="mb-3 text-[11px] text-slate-600 leading-relaxed">
              The following skills were claimed in onboarding but lack verified GitHub commits or passed proctoring exams. They are <strong>hidden from ATS compilation</strong> to prevent resume inflation.
            </p>

            <div className="space-y-2">
              {scrubbedList.map((s) => (
                <div
                  key={s.skill}
                  className="rounded-lg border border-rose-200 bg-white p-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 line-through decoration-rose-500/80">
                      {s.skill}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-rose-700">
                      {s.status === "failed" ? "Failed Exam" : "Unverified"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">{s.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================
         * RIGHT PANEL: LIVE RENDERCV PREVIEW (7 Cols on LG)
         * ========================================================= */}
        <div className="space-y-3 lg:col-span-7">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-white/80 px-4 py-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-900">
                RenderCV ATS Pipeline · Compiled {generationTimestamp}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyYaml}
                className="border-slate-200 bg-white text-[11px] text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
              >
                <Copy className="mr-1.5 h-3 w-3 text-indigo-600" />
                Copy RenderCV YAML
              </Button>
              <Button
                size="sm"
                onClick={handleDownloadPdf}
                className="bg-emerald-600 text-[11px] font-bold text-white hover:bg-emerald-500 shadow-sm shadow-emerald-500/20 cursor-pointer"
              >
                <Printer className="mr-1.5 h-3 w-3" />
                {downloadSuccess ? "Printing..." : "Print / Save PDF"}
              </Button>
            </div>
          </div>

          {/* Simulated Live RenderCV 1-Page PDF Paper */}
          <div className="overflow-hidden rounded-xl border border-indigo-100 bg-slate-100/70 p-3 shadow-md">
            <div className="mx-auto max-w-[620px] rounded-lg bg-[#ffffff] text-[#0f172a] p-8 shadow-xl font-sans text-left transition-all">
              {/* Header */}
              <div className="border-b border-gray-300 pb-3 text-center">
                <h1 className="text-xl font-bold tracking-tight text-gray-950 uppercase">
                  {onboardingPayload.fullName}
                </h1>
                <div className="mt-1 text-[11px] text-gray-700">
                  {onboardingPayload.department} · {onboardingPayload.engineering.collegeName}
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-[10px] text-gray-600">
                  <span>{onboardingPayload.email}</span>
                  <span>•</span>
                  <span>PRN: {onboardingPayload.rollNumber}</span>
                  <span>•</span>
                  <a
                    href={onboardingPayload.codingEcosystem.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline font-medium"
                  >
                    GitHub
                  </a>
                  {studentSignupPayload?.profileData.links.linkedin && (
                    <>
                      <span>•</span>
                      <a
                        href={studentSignupPayload.profileData.links.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 underline font-medium"
                      >
                        LinkedIn
                      </a>
                    </>
                  )}
                  {studentSignupPayload?.profileData.location && (
                    <>
                      <span>•</span>
                      <span>
                        {studentSignupPayload.profileData.location.city},{" "}
                        {studentSignupPayload.profileData.location.state}
                      </span>
                    </>
                  )}
                  {onboardingPayload.codingEcosystem.leetcodeUrl && (
                    <>
                      <span>•</span>
                      <a
                        href={onboardingPayload.codingEcosystem.leetcodeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 underline font-medium"
                      >
                        LeetCode
                      </a>
                    </>
                  )}
                  {onboardingPayload.codingEcosystem.portfolioUrl && (
                    <>
                      <span>•</span>
                      <a
                        href={onboardingPayload.codingEcosystem.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 underline font-medium"
                      >
                        Portfolio
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Professional Summary (Bio) */}
              {studentSignupPayload?.profileData.bio && (
                <div className="mt-3">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-0.5">
                    Professional Summary
                  </h2>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-gray-700">
                    {studentSignupPayload.profileData.bio}
                  </p>
                </div>
              )}

              {/* Education Section */}
              <div className="mt-4">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-0.5">
                  Education
                </h2>
                <div className="mt-2 space-y-1.5 text-[11px]">
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>
                      {onboardingPayload.engineering.collegeName} — B.Tech in {onboardingPayload.department}
                    </span>
                    <span className="font-mono text-gray-800">
                      CGPA: {onboardingPayload.engineering.cgpa} / 10.0 ({onboardingPayload.gradYear})
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-600 flex justify-between">
                    <span>Semester SGPAs: {onboardingPayload.engineering.sgpas.filter((s) => s > 0).join(", ")}</span>
                    <span className="text-emerald-700 font-medium">Active Backlogs: {onboardingPayload.engineering.activeBacklogs}</span>
                  </div>

                  <div className="flex justify-between pt-1 text-gray-800 text-[10.5px]">
                    <span>12th Standard: {onboardingPayload.twelfth.collegeName} ({onboardingPayload.twelfth.board})</span>
                    <span className="font-mono">{onboardingPayload.twelfth.percentage}% ({onboardingPayload.twelfth.passingYear})</span>
                  </div>

                  <div className="flex justify-between text-gray-800 text-[10.5px]">
                    <span>10th Secondary: {onboardingPayload.tenth.schoolName} ({onboardingPayload.tenth.board})</span>
                    <span className="font-mono">{onboardingPayload.tenth.percentageOrCgpa}% ({onboardingPayload.tenth.passingYear})</span>
                  </div>
                </div>
              </div>

              {/* Technical Skills Section (STRICTLY ONLY VERIFIED SKILLS) */}
              <div className="mt-4">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-0.5">
                  Verified Technical Skills (Truth-Enforced)
                </h2>
                <div className="mt-1.5 text-[11px] leading-relaxed text-gray-800">
                  <span className="font-semibold text-gray-950">Verified Proficiencies: </span>
                  {verifiedList.map((v, i) => (
                    <span key={v.skill}>
                      <span className="font-medium text-emerald-800 bg-emerald-50 px-1 rounded border border-emerald-300/60 inline-flex items-center gap-0.5">
                        {v.skill} ✓
                      </span>
                      {i < verifiedList.length - 1 && <span className="mx-1">•</span>}
                    </span>
                  ))}
                </div>
                <div className="mt-1 text-[9.5px] italic text-gray-500">
                  * All technical proficiencies verified against repository imports and proctored examinations. Unverified claims excluded.
                </div>
              </div>

              {/* Verified Experience & Projects with inline [🔗 Proof Verified] */}
              <div className="mt-4">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-0.5">
                  Verified Technical Projects &amp; Implementations
                </h2>

                <div className="mt-2 space-y-3 text-[11px]">
                  {/* Bullet 1: Redis */}
                  <div>
                    <div className="flex justify-between font-bold text-gray-950">
                      <span>Distributed Multi-Tier Cache Layer</span>
                      <span className="text-[10px] text-gray-600 font-mono">Redis, TypeScript, Node.js</span>
                    </div>
                    <div className="mt-1 text-gray-800 leading-relaxed">
                      • Architected high-throughput caching middleware utilizing Redis TTL eviction, slashing p99 latency by 42%.
                      <button
                        type="button"
                        onClick={() => openProof(activeStudentId, "Redis")}
                        className="ml-1.5 inline-flex items-center gap-0.5 rounded border border-emerald-600/50 bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                        title="Click to inspect cryptographic commit proof"
                      >
                        [🔗 Proof Verified]
                      </button>
                    </div>
                  </div>

                  {/* Bullet 2: PostgreSQL */}
                  <div>
                    <div className="flex justify-between font-bold text-gray-950">
                      <span>Transactional Ledger &amp; Relational Engine</span>
                      <span className="text-[10px] text-gray-600 font-mono">PostgreSQL, SQL Tuning</span>
                    </div>
                    <div className="mt-1 text-gray-800 leading-relaxed">
                      • Engineered composite B-Tree indexes and ACID-compliant transactional guarantees for concurrent audit logging.
                      <button
                        type="button"
                        onClick={() => openProof(activeStudentId, "PostgreSQL")}
                        className="ml-1.5 inline-flex items-center gap-0.5 rounded border border-emerald-600/50 bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                        title="Click to inspect proctored assessment score"
                      >
                        [🔗 Proof Verified]
                      </button>
                    </div>
                  </div>

                  {/* Bullet 3: React & TypeScript */}
                  <div>
                    <div className="flex justify-between font-bold text-gray-950">
                      <span>Enterprise Student Placement OS</span>
                      <span className="text-[10px] text-gray-600 font-mono">React, TypeScript, Tailwind</span>
                    </div>
                    <div className="mt-1 text-gray-800 leading-relaxed">
                      • Developed truth-constrained split-screen resume engine rendering zero-inflation ATS documents.
                      <button
                        type="button"
                        onClick={() => openProof(activeStudentId, "React")}
                        className="ml-1.5 inline-flex items-center gap-0.5 rounded border border-emerald-600/50 bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                      >
                        [🔗 Proof Verified]
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Verifiable Cryptographic Seal */}
              <div className="mt-6 border-t border-gray-300 pt-2.5 flex items-center justify-between text-[9.5px] text-gray-500 font-mono">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <ShieldCheck className="h-3 w-3 text-emerald-700" />
                  DRISHTI Cryptographic Proof Ledger Verified
                </div>
                <span>Hash: sha256:7a9f2c81e...</span>
                <span>Tamper-Proof ATS Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * Mode 2: BS Detector (Audited Claims vs Cryptographic Truth)
 * ========================================================================= */
function BsDetector() {
  const activeStudentId = useAppStore((s) => s.activeStudentId);
  const students = useAppStore((s) => s.students);
  const student = students.find((s) => s.id === activeStudentId) ?? students[0];
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

  return (
    <div className="space-y-4">
      <div className="drishti-card rounded-xl border border-white bg-white/85 p-5 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Resume BS Detector — Audit External CV Text
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 mr-1">Load Demo CV:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setResumeText(SAMPLE_INFLATED_RESUME)}
              className="text-[11px] h-7 border-indigo-100 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/70 font-semibold cursor-pointer"
            >
              1. Backend (Om)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setResumeText(SAMPLE_INFLATED_RESUME_DEV_OPS)}
              className="text-[11px] h-7 border-emerald-100 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100/70 font-semibold cursor-pointer"
            >
              2. DevOps (Mayur)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setResumeText(SAMPLE_INFLATED_RESUME_AI_ML)}
              className="text-[11px] h-7 border-sky-100 bg-sky-50/60 text-sky-700 hover:bg-sky-100/70 font-semibold cursor-pointer"
            >
              3. AI/ML (Prakhar)
            </Button>
          </div>
        </div>
        <p className="mb-3 text-[12px] text-slate-500 leading-relaxed">
          Paste any resume bullet points or project claims. DRISHTI's verification engine checks every skill mentioned against your cryptographic GitHub evidence ledger and proctored assessment logs.
        </p>

        <textarea
          rows={7}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste resume bullet points here (e.g. 'Engineered distributed Kubernetes cluster and Redis caching layer...')"
          className="w-full rounded-lg border border-slate-200 bg-white p-3 font-mono text-[12px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none shadow-xs"
        />

        <div className="mt-3 flex items-center justify-between">
          <Button
            size="sm"
            onClick={audit}
            disabled={!resumeText.trim()}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold hover:brightness-105 shadow-md shadow-amber-500/25 cursor-pointer"
          >
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
            Audit Resume Claims Against Ledger
          </Button>
          {audited && (
            <span className="text-[12px] text-slate-500">
              Audited: <strong className="text-emerald-700">{audited.verified.length} verified</strong> ·{" "}
              <strong className="text-rose-700">{audited.flagged.length} unverified</strong>
            </span>
          )}
        </div>
      </div>

      {audited && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Verified Claims - Red/Green Diff UI */}
          <div className="drishti-card rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm border-l-4 border-l-emerald-500">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Verified Claims ({audited.verified.length})
              </span>
              <span className="text-[10px] font-semibold text-emerald-700">Safe for Recruiter ATS ✓</span>
            </div>
            <div className="space-y-2">
              {audited.verified.map((c, i) => (
                <div key={i} className="rounded-lg border border-emerald-200 bg-white p-3 shadow-2xs">
                  <p className="text-[12px] text-slate-800 font-medium">{c.claim}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <VerifiedPill>{c.skill} ✓</VerifiedPill>
                    <span className="text-[10px] text-slate-400 font-mono">Linked to {c.evId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flagged Claims - Red/Green Diff UI */}
          <div className="drishti-card rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm border-l-4 border-l-rose-500">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Flagged / Unverified Claims ({audited.flagged.length})
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={sanitize}
                className="border-rose-200 bg-white text-[10px] font-semibold text-rose-700 hover:bg-rose-50 h-7 shadow-xs cursor-pointer"
              >
                Auto-Sanitize &amp; Strip
              </Button>
            </div>
            <div className="space-y-2">
              {audited.flagged.map((c, i) => (
                <div key={i} className="rounded-lg border border-rose-200 bg-white p-3 shadow-2xs">
                  <p className="text-[12px] text-slate-700 line-through decoration-rose-400/80 font-medium">{c.claim}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <FlaggedPill>Flagged: {c.skill}</FlaggedPill>
                  </div>
                  <p className="mt-1 text-[11px] text-rose-600 font-medium">{c.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
