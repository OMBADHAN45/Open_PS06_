"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { AvatarCircle, ProofBadge, VerifiedPill, FlaggedPill } from "@/components/shared/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileText,
  Github,
  Award,
  GraduationCap,
  ExternalLink,
  Code2,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  ArrowLeft,
} from "lucide-react";
import type {
  StudentProfile,
  GitHubEvidence,
  AssessmentEvidence,
  ProjectEvidence,
} from "@/lib/mock-data";

interface ResumeBullet {
  text: string;
  skill: string;
  evidenceId?: string;
  verified: boolean;
}

export function ProofInspectorTab({ onPickFromCandidates }: { onPickFromCandidates: () => void }) {
  const inspector = useAppStore((s) => s.inspector);
  const students = useAppStore((s) => s.students);
  const setInspectorSubtab = useAppStore((s) => s.setInspectorSubtab);
  const closeInspector = useAppStore((s) => s.closeInspector);

  const student = students.find((s) => s.id === inspector.studentId);

  if (!inspector.open || !student) {
    return (
      <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
            <Search className="h-7 w-7 text-slate-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">No candidate selected</h2>
            <p className="mt-1 text-[12px] text-slate-500">
              Select a candidate from the Candidates tab or Dashboard to X-ray their proof ledger.
            </p>
          </div>
          <Button
            onClick={onPickFromCandidates}
            className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Candidates
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <AvatarCircle name={student.name} color={student.avatarColor} />
            <div>
              <div className="text-[15px] font-bold text-slate-900">{student.name}</div>
              <div className="text-[11px] text-slate-500">
                {student.branch} · {student.batch} · Roll {student.roll} · CGPA {student.cgpa}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700 font-semibold shadow-2xs">
              <Github className="mr-1 h-3 w-3" /> @{student.githubUser}
            </Badge>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold shadow-2xs">
              <ShieldCheck className="mr-1 h-3 w-3" /> {student.verificationScore}% verified
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={onPickFromCandidates}
              className="border-slate-200 bg-white text-[11px] text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Candidates
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={closeInspector}
              className="text-slate-400 hover:text-slate-700"
            >
              <XCircle className="h-3.5 w-3.5" /> Close
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={inspector.subtab} onValueChange={setInspectorSubtab}>
        <TabsList className="border border-slate-200 bg-slate-100/90 p-1 shadow-2xs">
          <TabsTrigger value="resume" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xs">
            <FileText className="h-3.5 w-3.5" /> Resume
          </TabsTrigger>
          <TabsTrigger value="github" className="data-[state=active]:bg-white data-[state=active]:text-sky-600 data-[state=active]:shadow-xs">
            <Github className="h-3.5 w-3.5" /> GitHub
          </TabsTrigger>
          <TabsTrigger value="assessments" className="data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-xs">
            <Award className="h-3.5 w-3.5" /> Assessments
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-xs">
            <GraduationCap className="h-3.5 w-3.5" /> Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume">
          <ResumeSubtab student={student} />
        </TabsContent>
        <TabsContent value="github">
          <GithubSubtab student={student} />
        </TabsContent>
        <TabsContent value="assessments">
          <AssessmentsSubtab student={student} />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectsSubtab student={student} />
        </TabsContent>
      </Tabs>

      {/* Resume Claim Auditor (always shown under inspector) */}
      <ResumeClaimAuditor student={student} />
    </div>
  );
}

/* ---------------- Resume subtab ---------------- */

function ResumeSubtab({ student }: { student: StudentProfile }) {
  const [highlightedEvidence, setHighlightedEvidence] = useState<string | null>(null);

  const bullets: ResumeBullet[] = useMemo(() => {
    const out: ResumeBullet[] = [];
    // Bullet per verified skill with github proof
    const verifiedSkills = student.skills.filter((s) => s.status === "verified");
    for (const sk of verifiedSkills.slice(0, 5)) {
      const gh = student.evidence.find(
        (e) => e.kind === "github" && (e as GitHubEvidence).skill === sk.canonical
      ) as GitHubEvidence | undefined;
      const proj = student.projects.find((p) => p.skill === sk.canonical);
      const assess = student.assessments.find((a) => a.skill === sk.canonical);
      if (gh) {
        out.push({
          text: `Implemented ${sk.canonical} in the ${gh.repo} repository (${gh.filePath}).`,
          skill: sk.canonical,
          evidenceId: gh.id,
          verified: true,
        });
      } else if (proj) {
        out.push({
          text: `Built ${proj.title} using ${sk.canonical} — faculty grade ${proj.grade}.`,
          skill: sk.canonical,
          evidenceId: proj.id,
          verified: true,
        });
      } else if (assess) {
        out.push({
          text: `Demonstrated ${sk.canonical} via a proctored assessment (${assess.score}/100).`,
          skill: sk.canonical,
          evidenceId: assess.id,
          verified: true,
        });
      }
    }
    return out;
  }, [student]);

  return (
    <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
      <CardContent className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            <h3 className="text-[14px] font-bold text-slate-900">Candidate Resume (Generated)</h3>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-[16px] font-bold tracking-wide text-slate-900">{student.name.toUpperCase()}</div>
            <div className="text-[11px] text-slate-500">
              {student.branch}, Batch {student.batch} · CGPA {student.cgpa} · @{student.githubUser}
            </div>
            <div className="mt-1 text-[10px] text-amber-700 font-medium">
              ⚠ Auto-generated from verified evidence. Every claim below is auditable.
            </div>
            <div className="mt-4 space-y-2">
              {bullets.map((b, i) => (
                <div
                  key={i}
                  className={`rounded-md border p-2 transition ${
                    highlightedEvidence === b.evidenceId
                      ? "border-emerald-300 bg-emerald-50/80 shadow-2xs"
                      : "border-transparent hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 text-[12px] leading-relaxed text-slate-800">
                      <span className="mr-1 text-amber-500 font-bold">•</span>
                      {b.text}
                    </div>
                    {b.verified && (
                      <ProofBadge
                        label="Proof Verified"
                        onClick={() => setHighlightedEvidence(b.evidenceId ?? null)}
                      />
                    )}
                  </div>
                </div>
              ))}
              {bullets.length === 0 && (
                <div className="text-[11px] text-slate-500">No verified bullets yet.</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="text-[14px] font-bold text-slate-900">Supporting Evidence</h3>
          </div>
          <div className="space-y-2">
            {student.evidence
              .filter((e) => e.kind === "github")
              .map((e) => {
                const gh = e as GitHubEvidence;
                const isHi = highlightedEvidence === gh.id;
                return (
                  <div
                    key={gh.id}
                    className={`rounded-lg border p-2.5 transition ${
                      isHi
                        ? "border-emerald-300 bg-emerald-50/80 shadow-2xs"
                        : "border-slate-200 bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-semibold text-indigo-600">{gh.repo}</span>
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 font-medium">
                        {gh.skill}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-slate-500">
                      {gh.filePath}
                      {gh.line ? `#L${gh.line}` : ""}
                    </div>
                    <pre className="mt-1.5 overflow-x-auto rounded bg-slate-900 p-2 text-[10px] text-emerald-300 shadow-inner">
                      {gh.snippet}
                    </pre>
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- GitHub subtab ---------------- */

function GithubSubtab({ student }: { student: StudentProfile }) {
  const githubs = student.evidence.filter((e) => e.kind === "github") as GitHubEvidence[];
  return (
    <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Github className="h-4 w-4 text-sky-600" />
          <h3 className="text-[14px] font-bold text-slate-900">
            GitHub Code Evidence
            <span className="ml-2 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
              {githubs.length} commits
            </span>
          </h3>
        </div>
        {githubs.length === 0 ? (
          <EmptyState text="No GitHub code evidence scanned yet." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {githubs.map((g) => (
              <div key={g.id} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-mono font-semibold text-sky-600">{g.repo}</span>
                  <a
                    href={g.commitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
                  >
                    <ExternalLink className="h-3 w-3" /> {g.commitSha}
                  </a>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                  <Code2 className="h-3 w-3" />
                  <span className="font-mono">{g.filePath}{g.line ? `#L${g.line}` : ""}</span>
                  <span className="ml-auto rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                    {g.skill}
                  </span>
                </div>
                <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-2.5 text-[11px] leading-relaxed text-emerald-300 shadow-inner">
                  {g.snippet}
                </pre>
                <div className="mt-1.5 text-[10px] text-slate-400">
                  scanned {new Date(g.scannedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- Assessments subtab ---------------- */

function AssessmentsSubtab({ student }: { student: StudentProfile }) {
  const items = student.assessments;
  return (
    <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-500" />
          <h3 className="text-[14px] font-bold text-slate-900">
            Proctored Assessments
            <span className="ml-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              {items.length} taken
            </span>
          </h3>
        </div>
        {items.length === 0 ? (
          <EmptyState text="No proctored assessments taken yet." />
        ) : (
          <div className="space-y-2">
            {items.map((a) => (
              <div key={a.id} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-slate-900">{a.skill}</span>
                    <Badge variant="outline" className={a.passed ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold" : "border-rose-200 bg-rose-50 text-rose-700 font-semibold"}>
                      {a.passed ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: a.passed ? "#10b981" : "#ef4444" }}>
                    {a.score}<span className="text-[12px] text-slate-400">/100</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                  <span>⏱ {Math.round(a.durationSec / 60)} min</span>
                  <span>📅 {new Date(a.takenAt).toLocaleString()}</span>
                  <span>⚠ {a.warnings} warning(s)</span>
                </div>
                <div className="mt-2">
                  {a.warnings === 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <ShieldCheck className="h-2.5 w-2.5" /> Proctor Integrity: Clean
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      <ShieldAlert className="h-2.5 w-2.5" /> Proctor Integrity: Flagged ({a.warnings})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- Projects subtab ---------------- */

function ProjectsSubtab({ student }: { student: StudentProfile }) {
  const items = student.projects as ProjectEvidence[];
  return (
    <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-emerald-600" />
          <h3 className="text-[14px] font-bold text-slate-900">
            Faculty-Evaluated Projects
            <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {items.length} graded
            </span>
          </h3>
        </div>
        {items.length === 0 ? (
          <EmptyState text="No faculty-evaluated projects." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {items.map((p) => (
              <div key={p.id} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-slate-900">{p.title}</div>
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-semibold">
                    Grade {p.grade}
                  </Badge>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  <span className="font-mono">{p.repo}</span> · {p.faculty} · Complexity {p.complexity}/5
                </div>
                <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Skill: {p.skill}
                </div>
                <div className="mt-3 space-y-1.5">
                  {p.rubric.map((r) => (
                    <div key={r.criterion} className="flex items-center gap-2">
                      <span className="w-24 text-[11px] text-slate-500">{r.criterion}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(r.score / r.max) * 100}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-900">{r.score}/{r.max}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- Resume Claim Auditor ---------------- */

interface ClaimRow {
  claim: string;
  status: "verified" | "blocked";
  reason: string;
}

function ResumeClaimAuditor({ student }: { student: StudentProfile }) {
  const claims: ClaimRow[] = useMemo(() => buildClaims(student), [student]);

  return (
    <Card className="drishti-card border-amber-200/80 bg-amber-50/40 shadow-[0_8px_30px_rgb(245,158,11,0.06)]">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h3 className="text-[15px] font-bold text-slate-900">⚠ Resume Claim Auditor</h3>
          <span className="ml-auto text-[11px] text-slate-500">
            Cross-checks every resume sentence against GitHub commits & proctored assessments
          </span>
        </div>
        <div className="space-y-2">
          {claims.map((c, i) => (
            <div
              key={i}
              className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3 ${
                c.status === "verified"
                  ? "border-l-4 border-l-emerald-500 border-slate-200 bg-white shadow-2xs"
                  : "border-l-4 border-l-rose-500 border-slate-200 bg-white shadow-2xs"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-slate-900">{c.claim}</div>
                <div className="mt-1 text-[11px] text-slate-500">{c.reason}</div>
              </div>
              {c.status === "verified" ? (
                <VerifiedPill>Verified Claim</VerifiedPill>
              ) : (
                <FlaggedPill>FLAGGED</FlaggedPill>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-emerald-700 font-semibold">{claims.filter((c) => c.status === "verified").length} verified</span>
          <span>·</span>
          <XCircle className="h-3.5 w-3.5 text-rose-600" />
          <span className="text-rose-700 font-semibold">{claims.filter((c) => c.status === "blocked").length} blocked</span>
        </div>
      </CardContent>
    </Card>
  );
}

function buildClaims(student: StudentProfile): ClaimRow[] {
  const verified = new Set(student.skills.filter((s) => s.status === "verified").map((s) => s.canonical));
  const githubsBySkill = new Map<string, GitHubEvidence>();
  for (const e of student.evidence) {
    if (e.kind === "github") {
      const g = e as GitHubEvidence;
      if (!githubsBySkill.has(g.skill)) githubsBySkill.set(g.skill, g);
    }
  }
  const out: ClaimRow[] = [];

  // Verified claims — based on actual verified skills
  for (const skill of Array.from(verified).slice(0, 3)) {
    const gh = githubsBySkill.get(skill);
    if (gh) {
      out.push({
        claim: `Built ${skill === "Node.js" ? "REST APIs using Node.js" : `${skill} implementations`} in the ${gh.repo} repository.`,
        status: "verified",
        reason: `Linked: ${gh.repo}/${gh.filePath}#L${gh.line ?? ""} (commit ${gh.commitSha}).`,
      });
    } else {
      const assess = student.assessments.find((a) => a.skill === skill);
      if (assess) {
        out.push({
          claim: `Demonstrated ${skill} competency via proctored assessment (${assess.score}/100).`,
          status: "verified",
          reason: `Linked: proctored ${skill} assessment, ${assess.warnings} warnings.`,
        });
      }
    }
  }

  // Add a project-based verified claim if present
  const proj = student.projects[0];
  if (proj) {
    out.push({
      claim: `Built ${proj.title} (complexity ${proj.complexity}/5) — faculty grade ${proj.grade}.`,
      status: "verified",
      reason: `Linked: ${proj.repo}, evaluated by ${proj.faculty}.`,
    });
  }

  // Blocked claims — simulating an inflated resume claim against skills they don't actually have verified
  const blockedPool = [
    {
      claim: "Architected Kubernetes & Redis Microservices for a global payments platform.",
      skill: "Kubernetes",
      reason: "No Kubernetes imports (k8s client-go, @kubernetes/client-node) found in GitHub or assessments.",
    },
    {
      claim: "Designed a Cassandra cluster with multi-region replication.",
      skill: "Cassandra",
      reason: "No Cassandra drivers (cassandra-driver, DataStax) found in any scanned repository.",
    },
    {
      claim: "Led AWS EKS deployment serving 10M requests/sec with zero downtime.",
      skill: "AWS",
      reason: "AWS is listed but unverified (no assessment passed, no aws-sdk imports in GitHub).",
    },
  ];
  for (const b of blockedPool) {
    if (!verified.has(b.skill)) {
      out.push({ claim: b.claim, status: "blocked", reason: b.reason });
    }
  }

  return out.slice(0, 6);
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-[12px] text-[var(--drishti-sub)]">
      {text}
    </div>
  );
}
