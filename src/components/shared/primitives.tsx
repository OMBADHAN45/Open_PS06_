"use client";

import { useAppStore } from "@/lib/store";
import { fitTier } from "@/lib/fit-score";
import { categoryOf } from "@/lib/taxonomy";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Github, ShieldCheck, GraduationCap, ExternalLink, Code2, Award, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { StudentProfile, GitHubEvidence, AssessmentEvidence, ProjectEvidence } from "@/lib/mock-data";

/* ---------------- Skill Pill ---------------- */
export function SkillPill({ skill, status }: { skill: string; status: "verified" | "unverified" | "failed" }) {
  const openProof = useAppStore((s) => s.openProof);
  const activeStudentId = useAppStore((s) => s.activeStudentId);
  const cls =
    status === "verified"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-xs"
      : status === "failed"
      ? "bg-rose-100 text-rose-700 border-rose-200 shadow-xs"
      : "bg-amber-100 text-amber-700 border-amber-200 shadow-xs";
  const icon =
    status === "verified" ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : status === "failed" ? <XCircle className="h-3 w-3 text-rose-600" /> : <AlertTriangle className="h-3 w-3 text-amber-600" />;
  return (
    <button
      disabled={status === "unverified"}
      onClick={() => status !== "unverified" && openProof(activeStudentId, skill)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${cls} ${status !== "unverified" ? "hover:brightness-95 cursor-pointer" : "cursor-not-allowed opacity-80"}`}
      title={status === "verified" ? "Verified — click to see proof" : status === "failed" ? "Failed assessment — removed" : "Unverified (pending assessment)"}
    >
      {icon}
      <span>{skill}</span>
      {status === "verified" && <span className="text-emerald-700">✓</span>}
    </button>
  );
}

/* ---------------- Fit Score Badge ---------------- */
export function FitScoreBadge({ score }: { score: number }) {
  const tier = fitTier(score);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-bold shadow-xs"
      style={{ color: tier.text, borderColor: `${tier.text}40`, background: `${tier.text}12` }}
    >
      {score}% {tier.label}
    </span>
  );
}

/* ---------------- Proof Badge (inline [Proof Verified]) ---------------- */
export function ProofBadge({ label = "Proof Verified", onClick }: { label?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-200/80 shadow-xs cursor-pointer"
    >
      <ShieldCheck className="h-2.5 w-2.5 text-emerald-600" />
      {label}
    </button>
  );
}

/* ---------------- Proof Drawer (slide-out, shared) ---------------- */
export function ProofDrawer() {
  const { open, studentId, skill } = useAppStore((s) => s.proofDrawer);
  const students = useAppStore((s) => s.students);
  const closeProof = useAppStore((s) => s.closeProof);
  const student = students.find((s) => s.id === studentId) ?? students[0];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && closeProof()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l border-indigo-100 bg-white/95 p-0 backdrop-blur-xl sm:max-w-md shadow-2xl"
      >
        <SheetHeader className="border-b border-indigo-100/80 bg-slate-50/70 px-6 py-5">
          <SheetTitle className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Proof Inspector — {skill}
          </SheetTitle>
          <SheetDescription className="text-slate-500">
            Evidence ledger for{" "}
            <span className="font-semibold text-slate-900">{student?.name}</span>
          </SheetDescription>
        </SheetHeader>

        {student && skill && <ProofBody student={student} skill={skill} />}
      </SheetContent>
    </Sheet>
  );
}

function ProofBody({ student, skill }: { student: StudentProfile; skill: string }) {
  const github = student.evidence.filter(
    (e) => e.kind === "github" && e.skill === skill
  ) as GitHubEvidence[];
  const assessments = student.assessments.filter((a) => a.skill === skill);
  const projects = student.projects.filter((p) => p.skill === skill);
  const skillEntry = student.skills.find((s) => s.canonical === skill);

  return (
    <div className="space-y-5 px-6 py-5">
      <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-slate-50/80 p-3 shadow-xs">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">{categoryOf(skill)}</div>
          <div className="text-base font-bold text-slate-900">{skill}</div>
        </div>
        <StatusChip status={skillEntry?.status ?? "unverified"} />
      </div>

      {/* GitHub Proof */}
      <Section icon={<Github className="h-4 w-4 text-indigo-600" />} title="GitHub Code Proof" count={github.length}>
        {github.length === 0 ? (
          <Empty text="No GitHub code proof found for this skill." />
        ) : (
          github.map((g) => (
            <div key={g.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-mono font-semibold text-indigo-600">{g.repo}</span>
                <a href={g.commitUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900">
                  <ExternalLink className="h-3 w-3" /> {g.commitSha}
                </a>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                <Code2 className="h-3 w-3 text-slate-400" />
                <span className="font-mono">
                  {g.filePath}
                  {g.line ? `#L${g.line}` : ""}
                </span>
              </div>
              <pre className="mt-2 overflow-x-auto rounded border border-slate-200 bg-slate-900 p-2.5 text-[11px] leading-relaxed text-emerald-400 font-mono">
                {g.snippet}
              </pre>
            </div>
          ))
        )}
      </Section>

      {/* Assessment Proof */}
      <Section icon={<Award className="h-4 w-4 text-amber-500" />} title="Proctored Assessment" count={assessments.length}>
        {assessments.length === 0 ? (
          <Empty text="No proctored assessment taken yet." />
        ) : (
          assessments.map((a) => (
            <div key={a.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold" style={{ color: a.passed ? "#059669" : "#dc2626" }}>
                  {a.score}/100
                </div>
                <Badge variant="outline" className={a.passed ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold" : "border-rose-200 bg-rose-50 text-rose-700 font-semibold"}>
                  {a.passed ? "PASSED" : "FAILED"}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                <span>⏱ {Math.round(a.durationSec / 60)} min</span>
                <span>⚠ {a.warnings} warning(s)</span>
                <span>{new Date(a.takenAt).toLocaleString()}</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <ShieldCheck className="h-2.5 w-2.5 text-emerald-600" /> Proctor Integrity: {a.warnings === 0 ? "Clean" : "Flagged"}
              </div>
            </div>
          ))
        )}
      </Section>

      {/* Project Proof */}
      <Section icon={<GraduationCap className="h-4 w-4 text-emerald-600" />} title="Faculty-Evaluated Project" count={projects.length}>
        {projects.length === 0 ? (
          <Empty text="No evaluated project for this skill." />
        ) : (
          projects.map((p) => (
            <div key={p.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">{p.title}</div>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-semibold">Grade {p.grade}</Badge>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {p.repo} · {p.faculty} · Complexity {p.complexity}/5
              </div>
              <div className="mt-2 space-y-1">
                {p.rubric.map((r) => (
                  <div key={r.criterion} className="flex items-center gap-2">
                    <span className="w-24 text-[11px] text-slate-500">{r.criterion}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(r.score / r.max) * 100}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-900">{r.score}/{r.max}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </Section>
    </div>
  );
}

function Section({ icon, title, count, children }: { icon: React.ReactNode; title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h4 className="text-[13px] font-semibold text-slate-900">{title}</h4>
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-3 text-center text-[11px] text-slate-500">{text}</div>;
}

function StatusChip({ status }: { status: "verified" | "unverified" | "failed" }) {
  if (status === "verified")
    return <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 shadow-xs">✓ Verified</Badge>;
  if (status === "failed")
    return <Badge className="border-rose-200 bg-rose-100 text-rose-700 shadow-xs">✗ Failed</Badge>;
  return <Badge className="border-amber-200 bg-amber-100 text-amber-700 shadow-xs">⚠ Unverified</Badge>;
}

/* ---------------- Generic Verified/Gap pills ---------------- */
export function VerifiedPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 shadow-sm">
      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
      {children}
    </span>
  );
}
export function GapPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 shadow-sm">
      <AlertTriangle className="h-3 w-3 text-amber-600" />
      {children}
    </span>
  );
}
export function FlaggedPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 shadow-sm">
      <XCircle className="h-3 w-3 text-rose-600" />
      {children}
    </span>
  );
}

/* ---------------- Avatar circle (initials) ---------------- */
export function AvatarCircle({ name, color }: { name: string; color: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold shadow-xs"
      style={{ background: `${color}18`, color, border: `1.5px solid ${color}45` }}
    >
      {initials}
    </div>
  );
}
