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
      ? "pill-verified"
      : status === "failed"
      ? "pill-flagged"
      : "pill-unverified";
  const icon =
    status === "verified" ? <CheckCircle2 className="h-3 w-3" /> : status === "failed" ? <XCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />;
  return (
    <button
      disabled={status === "unverified"}
      onClick={() => status !== "unverified" && openProof(activeStudentId, skill)}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${cls} ${status !== "unverified" ? "hover:brightness-125" : "cursor-not-allowed opacity-70"}`}
      title={status === "verified" ? "Verified — click to see proof" : status === "failed" ? "Failed assessment — removed" : "Unverified (pending assessment)"}
    >
      {icon}
      {skill}
      {status === "verified" && <span className="opacity-70">✓</span>}
    </button>
  );
}

/* ---------------- Fit Score Badge ---------------- */
export function FitScoreBadge({ score }: { score: number }) {
  const tier = fitTier(score);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-bold"
      style={{ color: tier.text, borderColor: `${tier.text}55`, background: `${tier.text}14` }}
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
      className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
    >
      <ShieldCheck className="h-2.5 w-2.5" />
      {label}
    </button>
  );
}

/* ---------------- Proof Drawer (slide-out, shared) ---------------- */
export function ProofDrawer() {
  const { open, studentId, skill } = useAppStore((s) => s.proofDrawer);
  const students = useAppStore((s) => s.students);
  const closeProof = useAppStore((s) => s.closeProof);
  const student = students.find((s) => s.id === studentId);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && closeProof()}>
      <SheetContent
        side="right"
        className="drishti-card w-full overflow-y-auto border-l p-0 sm:max-w-md"
        style={{ background: "rgba(8,12,22,0.95)" }}
      >
        <SheetHeader className="border-b border-white/10 px-6 py-5">
          <SheetTitle className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Proof Inspector — {skill}
          </SheetTitle>
          <SheetDescription className="text-[var(--drishti-sub)]">
            Evidence ledger for{" "}
            <span className="font-semibold text-white">{student?.name}</span>
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
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">{categoryOf(skill)}</div>
          <div className="text-base font-bold text-white">{skill}</div>
        </div>
        <StatusChip status={skillEntry?.status ?? "unverified"} />
      </div>

      {/* GitHub Proof */}
      <Section icon={<Github className="h-4 w-4 text-[var(--drishti-blue)]" />} title="GitHub Code Proof" count={github.length}>
        {github.length === 0 ? (
          <Empty text="No GitHub code proof found for this skill." />
        ) : (
          github.map((g) => (
            <div key={g.id} className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-mono text-[var(--drishti-blue)]">{g.repo}</span>
                <a href={g.commitUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[var(--drishti-sub)] hover:text-white">
                  <ExternalLink className="h-3 w-3" /> {g.commitSha}
                </a>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--drishti-sub)]">
                <Code2 className="h-3 w-3" />
                <span className="font-mono">
                  {g.filePath}
                  {g.line ? `#L${g.line}` : ""}
                </span>
              </div>
              <pre className="mt-2 overflow-x-auto rounded bg-black/50 p-2 text-[11px] leading-relaxed text-emerald-300">
                {g.snippet}
              </pre>
            </div>
          ))
        )}
      </Section>

      {/* Assessment Proof */}
      <Section icon={<Award className="h-4 w-4 text-[var(--drishti-gold)]" />} title="Proctored Assessment" count={assessments.length}>
        {assessments.length === 0 ? (
          <Empty text="No proctored assessment taken yet." />
        ) : (
          assessments.map((a) => (
            <div key={a.id} className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold" style={{ color: a.passed ? "#10b981" : "#ef4444" }}>
                  {a.score}/100
                </div>
                <Badge variant="outline" className={a.passed ? "border-emerald-500/40 text-emerald-400" : "border-red-500/40 text-red-400"}>
                  {a.passed ? "PASSED" : "FAILED"}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--drishti-sub)]">
                <span>⏱ {Math.round(a.durationSec / 60)} min</span>
                <span>⚠ {a.warnings} warning(s)</span>
                <span>{new Date(a.takenAt).toLocaleString()}</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <ShieldCheck className="h-2.5 w-2.5" /> Proctor Integrity: {a.warnings === 0 ? "Clean" : "Flagged"}
              </div>
            </div>
          ))
        )}
      </Section>

      {/* Project Proof */}
      <Section icon={<GraduationCap className="h-4 w-4 text-[var(--drishti-emerald)]" />} title="Faculty-Evaluated Project" count={projects.length}>
        {projects.length === 0 ? (
          <Empty text="No evaluated project for this skill." />
        ) : (
          projects.map((p) => (
            <div key={p.id} className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">{p.title}</div>
                <Badge variant="outline" className="border-amber-500/40 text-amber-400">Grade {p.grade}</Badge>
              </div>
              <div className="mt-1 text-[11px] text-[var(--drishti-sub)]">
                {p.repo} · {p.faculty} · Complexity {p.complexity}/5
              </div>
              <div className="mt-2 space-y-1">
                {p.rubric.map((r) => (
                  <div key={r.criterion} className="flex items-center gap-2">
                    <span className="w-24 text-[11px] text-[var(--drishti-sub)]">{r.criterion}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(r.score / r.max) * 100}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-white">{r.score}/{r.max}</span>
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
        <h4 className="text-[13px] font-semibold text-white">{title}</h4>
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-[var(--drishti-sub)]">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-white/10 p-3 text-center text-[11px] text-[var(--drishti-sub)]">{text}</div>;
}

function StatusChip({ status }: { status: "verified" | "unverified" | "failed" }) {
  if (status === "verified")
    return <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400">✓ Verified</Badge>;
  if (status === "failed")
    return <Badge className="border-red-500/40 bg-red-500/10 text-red-400">✗ Failed</Badge>;
  return <Badge className="border-amber-500/40 bg-amber-500/10 text-amber-400">⚠ Unverified</Badge>;
}

/* ---------------- Generic Verified/Gap pills ---------------- */
export function VerifiedPill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400"><CheckCircle2 className="h-3 w-3" />{children}</span>;
}
export function GapPill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400"><AlertTriangle className="h-3 w-3" />{children}</span>;
}
export function FlaggedPill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-400"><XCircle className="h-3 w-3" />{children}</span>;
}

/* ---------------- Avatar circle (initials) ---------------- */
export function AvatarCircle({ name, color }: { name: string; color: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      {initials}
    </div>
  );
}
