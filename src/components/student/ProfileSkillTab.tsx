"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { skillsByCategory, categoryOf } from "@/lib/taxonomy";
import { SkillPill, VerifiedPill, GapPill, FlaggedPill } from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, RefreshCw, ShieldCheck, FolderGit2, Cpu, Database, Cloud, Brain, Code2, Plus, X, ExternalLink } from "lucide-react";

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Programming: <Code2 className="h-4 w-4" />,
  "Web Dev": <Cpu className="h-4 w-4" />,
  Databases: <Database className="h-4 w-4" />,
  DevOps: <Cloud className="h-4 w-4" />,
  "AI/ML": <Brain className="h-4 w-4" />,
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
      <div className="drishti-card flex flex-wrap items-center justify-between gap-4 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold" style={{ background: `${student.avatarColor}22`, color: student.avatarColor, border: `1px solid ${student.avatarColor}55` }}>
            {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{student.name}</h2>
            <div className="text-[12px] text-[var(--drishti-sub)]">{student.branch} · Batch {student.batch} · {student.roll} · CGPA {student.cgpa}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Profile Verification</div>
            <div className="text-2xl font-bold" style={{ color: student.verificationScore >= 85 ? "#10b981" : student.verificationScore >= 70 ? "#f59e0b" : "#ef4444" }}>{student.verificationScore}%</div>
          </div>
          <div className="flex h-14 w-14 items-end justify-center">
            <div className="relative h-14 w-14">
              <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke={student.verificationScore >= 85 ? "#10b981" : student.verificationScore >= 70 ? "#f59e0b" : "#ef4444"} strokeWidth="3" strokeDasharray={`${(student.verificationScore / 100) * 94.2} 94.2`} strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Sync card */}
      <div className="drishti-card rounded-xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5 text-[var(--drishti-blue)]" />
            <h3 className="text-sm font-semibold text-white">GitHub Sync & Code Analyzer</h3>
          </div>
          <Button onClick={handleSync} disabled={syncing} size="sm" className="bg-[var(--drishti-blue)] text-[#02060f] hover:bg-[#9fe0ff]">
            <RefreshCw className={`mr-1 h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} /> Sync Latest Commits
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Connected</div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
              <span className="live-dot inline-block h-2 w-2 rounded-full bg-emerald-400" />
              @{student.githubUser}
              <Badge className="ml-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-400">✓ Synced</Badge>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Repos Scanned</div>
            <div className="text-sm font-semibold text-white">{student.reposScanned} repositories</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Code Proofs</div>
            <div className="text-sm font-semibold text-white">{student.evidence.filter((e) => e.kind === "github").length} verified permalinks</div>
          </div>
        </div>
        {scanLog.length > 0 && (
          <div className="mt-3 rounded-lg border border-emerald-500/20 bg-black/40 p-3 font-mono text-[11px] text-emerald-300">
            {scanLog.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )}
      </div>

      {/* Verified Evidence Ledger */}
      <div className="drishti-card rounded-xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Verified Evidence Ledger</h3>
          <span className="text-[11px] text-[var(--drishti-sub)]">— Proof Over Claims. Click any badge to inspect.</span>
        </div>
        {verifiedSkills.length === 0 ? (
          <p className="text-[12px] text-[var(--drishti-sub)]">No verified skills yet. Take a proctored assessment or sync GitHub to verify.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {verifiedSkills.map((s) => (
              <SkillPill key={s.canonical} skill={s.canonical} status="verified" />
            ))}
          </div>
        )}
      </div>

      {/* Skill Selection & Assertion Module */}
      <div className="drishti-card rounded-xl p-5">
        <div className="mb-1 flex items-center gap-2">
          <FolderGit2 className="h-5 w-5 text-[var(--drishti-gold)]" />
          <h3 className="text-sm font-semibold text-white">Skill Selection & Assertion</h3>
        </div>
        <p className="mb-3 text-[12px] text-[var(--drishti-sub)]">
          Claim a skill to mark it <span className="text-amber-400">⚠ Unverified</span>. It becomes <span className="text-emerald-400">✓ Verified</span> only after GitHub code proof OR passing the proctored assessment (≥75%). Failed skills are auto-removed.
        </p>
        {claimedSkills.length > 0 && (
          <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="mb-1.5 text-[11px] uppercase tracking-wider text-amber-400">Your claimed (pending) skills</div>
            <div className="flex flex-wrap gap-2">
              {claimedSkills.map((s) => (
                <div key={s.canonical} className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-400">
                  ⚠ {s.canonical}
                  {s.status === "failed" && " (failed)"}
                  <button onClick={() => toggleSkill(student.id, s.canonical)} className="ml-0.5 text-amber-300 hover:text-white"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-3">
          {Object.entries(cats).map(([cat, skills]) => (
            <div key={cat}>
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">
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
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition ${
                        verified
                          ? "cursor-not-allowed border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : claimed
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:brightness-110"
                          : "border-white/15 bg-white/[0.03] text-[var(--drishti-sub)] hover:bg-white/10 hover:text-white"
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
      <div className="drishti-card rounded-xl p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">Interactive Skill-to-Proof Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="text-[10.5px] uppercase tracking-wider text-[var(--drishti-sub)]">
              <tr className="border-b border-white/10">
                <th className="py-2 pr-3">Skill</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">GitHub Proof</th>
                <th className="py-2 pr-3">Assessment</th>
                <th className="py-2 pr-3">Project</th>
                <th className="py-2">Category</th>
              </tr>
            </thead>
            <tbody>
              {student.skills.map((s) => {
                const ev = evidenceBySkill[s.canonical] || { github: 0, assessment: 0, project: 0 };
                return (
                  <tr key={s.canonical} className="border-b border-white/5">
                    <td className="py-2 pr-3 font-semibold text-white">{s.canonical}</td>
                    <td className="py-2 pr-3">
                      {s.status === "verified" ? <VerifiedPill>Verified</VerifiedPill> : s.status === "failed" ? <FlaggedPill>Failed</FlaggedPill> : <GapPill>Unverified</GapPill>}
                    </td>
                    <td className="py-2 pr-3">{ev.github ? <span className="text-[var(--drishti-blue)]">{ev.github} file{ev.github > 1 ? "s" : ""} ✓</span> : <span className="text-[var(--drishti-sub)]">—</span>}</td>
                    <td className="py-2 pr-3">{ev.assessment ? <span className="text-[var(--drishti-gold)]">{ev.assessment} test ✓</span> : <span className="text-[var(--drishti-sub)]">—</span>}</td>
                    <td className="py-2 pr-3">{ev.project ? <span className="text-emerald-400">{ev.project} project ✓</span> : <span className="text-[var(--drishti-sub)]">—</span>}</td>
                    <td className="py-2 text-[var(--drishti-sub)]">{categoryOf(s.canonical)}</td>
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
