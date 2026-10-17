"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { skillsByCategory, categoryOf } from "@/lib/taxonomy";
import { SkillPill, VerifiedPill, GapPill, FlaggedPill } from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, RefreshCw, ShieldCheck, FolderGit2, Cpu, Database, Cloud, Brain, Code2, Plus, X } from "lucide-react";

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Programming: <Code2 className="h-4 w-4 text-indigo-600" />,
  "Web Dev": <Cpu className="h-4 w-4 text-sky-600" />,
  Databases: <Database className="h-4 w-4 text-emerald-600" />,
  DevOps: <Cloud className="h-4 w-4 text-amber-600" />,
  "AI/ML": <Brain className="h-4 w-4 text-purple-600" />,
};

const SCAN_FILES = [
  { name: "package.json", found: "React, Node.js, Redis (ioredis)" },
  { name: "requirements.txt", found: "Python, scikit-learn" },
  { name: "Dockerfile", found: "Docker (base image)" },
  { name: "src/middleware/cache.ts", found: "ioredis import @ line 12" },
  { name: "src/db/client.ts", found: "pg import" },
];

export function ProfileSkillTab() {
  const activeStudentId = useAppStore((s) => s.activeStudentId);
  const students = useAppStore((s) => s.students);
  const pendingAssessmentQueue = useAppStore((s) => s.pendingAssessmentQueue);
  const toggleSkill = useAppStore((s) => s.toggleStudentSkill);
  const syncGitHub = useAppStore((s) => s.syncGitHub);
  const student = students.find((s) => s.id === activeStudentId) ?? students[0];
  const [syncing, setSyncing] = useState(false);
  const [scanLog, setScanLog] = useState<string[]>([]);

  const cats = skillsByCategory();

  const evidenceBySkill = useMemo(() => {
    if (!student) return {};
    const map: Record<string, { github: number; assessment: number; project: number }> = {};
    for (const e of student.evidence) {
      const k = (e as any).skill;
      map[k] = map[k] || { github: 0, assessment: 0, project: 0 };
      if (e.kind === "github") map[k].github++;
      if (e.kind === "assessment") map[k].assessment++;
      if (e.kind === "project") map[k].project++;
    }
    return map;
  }, [student]);

  if (!student) return null;

  const handleSync = () => {
    if (syncing) return;
    setSyncing(true);
    setScanLog([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= SCAN_FILES.length) {
        clearInterval(interval);
        syncGitHub(student.id);
        setSyncing(false);
        return;
      }
      const item = SCAN_FILES[i];
      if (item && item.name) {
        const line = `✓ Scanned ${item.name} — detected: ${item.found}`;
        setScanLog((l) => [...l, line]);
      }
      i++;
    }, 450);
  };

  const verifiedSkills = student.skills.filter((s) => s.status === "verified");
  const claimedSkills = student.skills.filter((s) => s.status !== "verified");
  const claimedSet = new Set(student.skills.map((s) => s.canonical));

  return (
    <div className="space-y-5">
      {/* Profile header */}
      <div className="drishti-card flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white bg-white/85 p-5 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold shadow-xs" style={{ background: `${student.avatarColor}20`, color: student.avatarColor, border: `1.5px solid ${student.avatarColor}55` }}>
            {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{student.name}</h2>
            <div className="text-[12px] text-slate-500">{student.branch} · Batch {student.batch} · {student.roll} · CGPA {student.cgpa}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Profile Verification</div>
            <div className="text-2xl font-bold" style={{ color: student.verificationScore >= 85 ? "#059669" : student.verificationScore >= 70 ? "#d97706" : "#dc2626" }}>
              {student.verificationScore}%
            </div>
          </div>
          <div className="flex h-14 w-14 items-end justify-center">
            <div className="relative h-14 w-14">
              <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke={student.verificationScore >= 85 ? "#10b981" : student.verificationScore >= 70 ? "#f59e0b" : "#ef4444"} strokeWidth="3" strokeDasharray={`${(student.verificationScore / 100) * 94.2} 94.2`} strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Assessment Queue (Strict Verification Isolation) */}
      {((pendingAssessmentQueue && pendingAssessmentQueue.length > 0) || (student.pendingAssessmentQueue && student.pendingAssessmentQueue.length > 0)) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 space-y-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-xs">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pending Assessment Queue ({(pendingAssessmentQueue.length || student.pendingAssessmentQueue?.length || 0)} Skills)
                </h3>
                <p className="text-[11px] text-amber-800">
                  CRITICAL: These skills are isolated from your active profile &amp; ATS resume until verified via proctored assessment.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("drishti:goto-tab", { detail: "assess" }));
              }}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:brightness-105 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Take Proctored Exams →
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {(pendingAssessmentQueue.length > 0 ? pendingAssessmentQueue : student.pendingAssessmentQueue || []).map((sk) => (
              <span
                key={sk}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-800 shadow-2xs"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                {sk}
                <span className="text-[9.5px] uppercase font-mono text-amber-600">Awaiting Exam</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* GitHub Sync card */}
      <div className="drishti-card rounded-xl border border-white bg-white/85 p-5 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">GitHub Sync &amp; Code Analyzer</h3>
          </div>
          <Button onClick={handleSync} disabled={syncing} size="sm" className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all cursor-pointer">
            <RefreshCw className={`mr-1 h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} /> Sync Latest Commits
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 shadow-2xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Connected</div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 mt-0.5">
              <span className="live-dot inline-block h-2 w-2 rounded-full bg-emerald-500" />
              @{student.githubUser}
              <Badge className="ml-1 border-emerald-200 bg-emerald-100 text-emerald-800 shadow-2xs font-semibold">✓ Synced</Badge>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 shadow-2xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Repos Scanned</div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">{student.reposScanned} repositories</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 shadow-2xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Code Proofs</div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">{student.evidence.filter((e) => e.kind === "github").length} verified permalinks</div>
          </div>
        </div>
        {scanLog.length > 0 && (
          <div className="mt-3 rounded-lg border border-indigo-100 bg-slate-900 p-3 font-mono text-[11px] text-emerald-400">
            {scanLog.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )}
      </div>

      {/* Verified Evidence Ledger */}
      <div className="drishti-card rounded-xl border border-white bg-white/85 p-5 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Verified Evidence Ledger</h3>
          <span className="text-[11px] text-slate-500">— Proof Over Claims. Click any badge to inspect.</span>
        </div>
        {verifiedSkills.length === 0 ? (
          <p className="text-[12px] text-slate-500">No verified skills yet. Take a proctored assessment or sync GitHub to verify.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {verifiedSkills.map((s) => (
              <SkillPill key={s.canonical} skill={s.canonical} status="verified" />
            ))}
          </div>
        )}
      </div>

      {/* Skill Selection & Assertion Module */}
      <div className="drishti-card rounded-xl border border-white bg-white/85 p-5 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <div className="mb-1 flex items-center gap-2">
          <FolderGit2 className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900">Skill Selection &amp; Assertion</h3>
        </div>
        <p className="mb-3 text-[12px] text-slate-500">
          Claim a skill to mark it <span className="font-semibold text-amber-700">⚠ Unverified</span>. It becomes <span className="font-semibold text-emerald-700">✓ Verified</span> only after GitHub code proof OR passing the proctored assessment (≥75%). Failed skills are auto-removed.
        </p>
        {claimedSkills.length > 0 && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3 shadow-2xs">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-800">Your claimed (pending) skills</div>
            <div className="flex flex-wrap gap-2">
              {claimedSkills.map((s) => (
                <div key={s.canonical} className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-800 shadow-2xs">
                  ⚠ {s.canonical}
                  {s.status === "failed" && " (failed)"}
                  <button onClick={() => toggleSkill(student.id, s.canonical)} className="ml-0.5 text-amber-600 hover:text-slate-900 cursor-pointer"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-3">
          {Object.entries(cats).map(([cat, skills]) => (
            <div key={cat}>
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {CATEGORY_ICON[cat]} {cat}
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => {
                  const claimed = claimedSet.has(s);
                  const verified = verifiedSkills.some((v) => v.canonical === s);
                  return (
                    <button
                      key={s}
                      onClick={() => !verified && toggleSkill(student.id, s)}
                      disabled={verified}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition cursor-pointer shadow-2xs ${
                        verified
                          ? "cursor-not-allowed border-emerald-200 bg-emerald-100 text-emerald-800 font-semibold"
                          : claimed
                          ? "border-amber-200 bg-amber-100 text-amber-800 font-semibold hover:brightness-95"
                          : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-800"
                      }`}
                    >
                      {verified ? "✓" : claimed ? "⚠" : <Plus className="h-3 w-3" />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill-to-Proof Matrix */}
      <div className="drishti-card rounded-xl border border-white bg-white/85 p-5 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Interactive Skill-to-Proof Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              <tr className="border-b border-slate-200">
                <th className="py-2.5 pr-3">Skill</th>
                <th className="py-2.5 pr-3">Status</th>
                <th className="py-2.5 pr-3">GitHub Proof</th>
                <th className="py-2.5 pr-3">Assessment</th>
                <th className="py-2.5 pr-3">Project</th>
                <th className="py-2.5">Category</th>
              </tr>
            </thead>
            <tbody>
              {student.skills.map((s) => {
                const ev = evidenceBySkill[s.canonical] || { github: 0, assessment: 0, project: 0 };
                return (
                  <tr key={s.canonical} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="py-2.5 pr-3 font-semibold text-slate-900">{s.canonical}</td>
                    <td className="py-2.5 pr-3">
                      {s.status === "verified" ? <VerifiedPill>Verified</VerifiedPill> : s.status === "failed" ? <FlaggedPill>Failed</FlaggedPill> : <GapPill>Unverified</GapPill>}
                    </td>
                    <td className="py-2.5 pr-3">{ev.github ? <span className="text-indigo-600 font-semibold">{ev.github} file{ev.github > 1 ? "s" : ""} ✓</span> : <span className="text-slate-400">—</span>}</td>
                    <td className="py-2.5 pr-3">{ev.assessment ? <span className="text-amber-600 font-semibold">{ev.assessment} test ✓</span> : <span className="text-slate-400">—</span>}</td>
                    <td className="py-2.5 pr-3">{ev.project ? <span className="text-emerald-600 font-semibold">{ev.project} project ✓</span> : <span className="text-slate-400">—</span>}</td>
                    <td className="py-2.5 text-slate-500">{categoryOf(s.canonical)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
