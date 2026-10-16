"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { computeFit, fitTier, DEFAULT_WEIGHTS, type FitResult } from "@/lib/fit-score";
import { AvatarCircle, FitScoreBadge } from "@/components/shared/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Github,
  Award,
  GraduationCap,
  ArrowRight,
  GitCompareArrows,
  X,
  Check,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Database,
  Filter,
} from "lucide-react";
import type { StudentProfile, JobOpening, GitHubEvidence, AssessmentEvidence, ProjectEvidence } from "@/lib/mock-data";

interface FilterState {
  redisGithub: boolean;
  sqlScore85: boolean;
  zeroWarnings: boolean;
  verifiedDocker: boolean;
}

const FILTERS: { key: keyof FilterState; label: string; icon: React.ReactNode }[] = [
  { key: "redisGithub", label: "Has Verified GitHub Code in Redis", icon: <Github className="h-3 w-3" /> },
  { key: "sqlScore85", label: "Proctored SQL Score > 85%", icon: <Award className="h-3 w-3" /> },
  { key: "zeroWarnings", label: "Zero Proctoring Warnings", icon: <ShieldCheck className="h-3 w-3" /> },
  { key: "verifiedDocker", label: "Verified Docker", icon: <Database className="h-3 w-3" /> },
];

interface RankedRow {
  student: StudentProfile;
  fit: FitResult;
}

export function CandidatesTab() {
  const students = useAppStore((s) => s.students);
  const jobs = useAppStore((s) => s.jobs);
  const weights = useAppStore((s) => s.weights);
  const setWeights = useAppStore((s) => s.setWeights);
  const compareIds = useAppStore((s) => s.compareIds);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const openInspector = useAppStore((s) => s.openInspector);

  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id ?? "");
  const [filters, setFilters] = useState<FilterState>({
    redisGithub: false,
    sqlScore85: false,
    zeroWarnings: false,
    verifiedDocker: false,
  });
  const [compareOpen, setCompareOpen] = useState(false);

  const selectedJob: JobOpening | undefined = jobs.find((j) => j.id === selectedJobId) ?? jobs[0];

  // sliders display as 0..100 percentages of weight (raw, un-normalized)
  const reqPct = Math.round(weights.requiredWeight * 100);
  const prefPct = Math.round(weights.preferredWeight * 100);
  const projPct = Math.round(weights.projectWeight * 100);

  const handleSlider = (key: keyof typeof weights, val: number) => {
    setWeights({ ...weights, [key]: val / 100 });
  };

  const resetWeights = () => setWeights({ ...DEFAULT_WEIGHTS });

  // Rank all students against the selected job
  const ranked: RankedRow[] = useMemo(() => {
    if (!selectedJob) return [];
    const rows = students.map((student) => ({
      student,
      fit: computeFit(student, selectedJob, weights),
    }));
    rows.sort((a, b) => b.fit.score - a.fit.score);
    return rows;
  }, [students, selectedJob, weights]);

  // Apply evidence filters
  const filtered = useMemo(() => {
    return ranked.filter(({ student }) => {
      if (filters.redisGithub && !hasGithubForSkill(student, "Redis")) return false;
      if (filters.sqlScore85 && !hasProctoredScoreAbove(student, "SQL", 85)) return false;
      if (filters.zeroWarnings && !hasZeroWarnings(student)) return false;
      if (filters.verifiedDocker && !hasVerifiedSkill(student, "Docker")) return false;
      return true;
    });
  }, [ranked, filters]);

  const compareRows = useMemo(() => {
    return compareIds
      .map((id) => students.find((s) => s.id === id))
      .filter((s): s is StudentProfile => Boolean(s));
  }, [compareIds, students]);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-xl font-bold text-white sm:text-2xl">
          Candidates — Ranked Leaderboard
        </h1>
        <p className="text-[13px] text-[var(--drishti-sub)]">
          Evidence-backed ranking. Adjust weights to see real fit shift — every score is backed by
          GitHub commits, proctored tests, and faculty rubrics.
        </p>
      </div>

      {/* Weight sliders */}
      <Card className="drishti-card border-white/10 bg-white/[0.03]">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-white">Interactive Fit Weight Sliders</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetWeights}
              className="text-[var(--drishti-sub)] hover:text-white"
            >
              ↺ Reset to default
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <WeightSlider
              label="Required Skills Weight"
              value={reqPct}
              accent="var(--drishti-blue)"
              onChange={(v) => handleSlider("requiredWeight", v)}
            />
            <WeightSlider
              label="Preferred Skills Weight"
              value={prefPct}
              accent="var(--drishti-amber)"
              onChange={(v) => handleSlider("preferredWeight", v)}
            />
            <WeightSlider
              label="Project Complexity Weight"
              value={projPct}
              accent="var(--drishti-gold)"
              onChange={(v) => handleSlider("projectWeight", v)}
            />
          </div>

          <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-[12px] text-[var(--drishti-sub)]">
            <span className="text-[var(--drishti-gold)]">Fit</span> ={" "}
            <span className="text-[var(--drishti-blue)]">{(weights.requiredWeight).toFixed(2)}</span>·reqRatio +{" "}
            <span className="text-[var(--drishti-amber)]">{(weights.preferredWeight).toFixed(2)}</span>·prefRatio +{" "}
            <span className="text-[var(--drishti-gold)]">{(weights.projectWeight).toFixed(2)}</span>·projectFactor
            <span className="ml-2 text-white/40">
              (normalized internally so sliders don't need to sum to 1)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Job picker + evidence filters */}
      <Card className="drishti-card border-white/10 bg-white/[0.03]">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12px] font-semibold text-[var(--drishti-sub)]">Rank candidates against:</span>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="h-9 w-[280px] border-white/15 bg-black/40 text-white">
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#0a0f1c] text-white">
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.role} @ {j.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="ml-auto text-[11px] text-[var(--drishti-sub)]">
              Showing <span className="font-semibold text-white">{filtered.length}</span> of {students.length} students
            </span>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">
              <Filter className="h-3 w-3" />
              Zero-Fluff Evidence Filters
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const active = filters[f.key];
                return (
                  <button
                    type="button"
                    key={f.key}
                    onClick={() => setFilters((p) => ({ ...p, [f.key]: !p[f.key] }))}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition cursor-pointer ${
                      active
                        ? "border-[var(--drishti-blue)]/50 bg-[var(--drishti-blue)]/15 text-[var(--drishti-blue)]"
                        : "border-white/10 bg-white/[0.02] text-[var(--drishti-sub)] hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border transition-colors ${
                        active
                          ? "border-[var(--drishti-blue)] bg-[var(--drishti-blue)] text-[#06101f]"
                          : "border-white/30 bg-black/40"
                      }`}
                    >
                      {active && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </span>
                    {f.icon}
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card className="drishti-card border-white/10 bg-white/[0.03]">
        <CardContent className="p-0">
          <div className="max-h-[640px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-[#0a0f1c]">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="w-[60px] text-[var(--drishti-sub)]">#</TableHead>
                  <TableHead className="text-[var(--drishti-sub)]">Student</TableHead>
                  <TableHead className="text-[var(--drishti-sub)]">Fit</TableHead>
                  <TableHead className="text-[var(--drishti-sub)]">Verified Required</TableHead>
                  <TableHead className="text-[var(--drishti-sub)]">Skill Gaps</TableHead>
                  <TableHead className="text-[var(--drishti-sub)]">Proof</TableHead>
                  <TableHead className="min-w-[260px] text-[var(--drishti-sub)]">AI Explanation</TableHead>
                  <TableHead className="text-[var(--drishti-sub)]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row, idx) => {
                  const tier = fitTier(row.fit.score);
                  const isCompared = compareIds.includes(row.student.id);
                  return (
                    <TableRow key={row.student.id} className="border-white/5 align-top hover:bg-white/[0.02]">
                      <TableCell>
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold"
                          style={{
                            color: idx === 0 ? "#06101f" : tier.text,
                            background: idx === 0 ? "var(--drishti-gold)" : `${tier.text}1a`,
                            border: `1px solid ${tier.text}44`,
                          }}
                        >
                          {idx + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AvatarCircle name={row.student.name} color={row.student.avatarColor} />
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold text-white">
                              {row.student.name}
                            </div>
                            <div className="truncate text-[10px] text-[var(--drishti-sub)]">
                              {row.student.branch} · CGPA {row.student.cgpa}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <FitScoreBadge score={row.fit.score} />
                      </TableCell>
                      <TableCell>
                        {row.fit.verifiedRequired.length === 0 ? (
                          <span className="text-[11px] text-[var(--drishti-sub)]">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {row.fit.verifiedRequired.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400"
                              >
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.fit.missingRequired.length === 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-[var(--drishti-emerald)]">
                            <CheckCircle2 className="h-3 w-3" /> none
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {row.fit.missingRequired.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-0.5 rounded-full border border-red-500/40 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400"
                              >
                                <XCircle className="h-2.5 w-2.5" />
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <ProofIcons student={row.student} />
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="line-clamp-2 max-w-[260px] cursor-help text-[11px] leading-snug text-[var(--drishti-sub)]">
                              {row.fit.explanation}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-[360px] border-white/10 bg-[#0a0f1c] text-[12px] text-white"
                          >
                            {row.fit.explanation}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => openInspector(row.student.id, selectedJob?.id)}
                            className="bg-[var(--drishti-gold)] text-[#06101f] hover:bg-[var(--drishti-gold)]/90"
                          >
                            Inspect
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                          <button
                            type="button"
                            onClick={() => toggleCompare(row.student.id)}
                            aria-pressed={isCompared}
                            className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2 text-[11px] font-medium transition select-none ${
                              isCompared
                                ? "border-[var(--drishti-blue)]/50 bg-[var(--drishti-blue)]/15 text-[var(--drishti-blue)]"
                                : "border-white/15 bg-white/[0.02] text-[var(--drishti-sub)] hover:text-white"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border transition-colors ${
                                isCompared
                                  ? "border-[var(--drishti-blue)] bg-[var(--drishti-blue)] text-[#06101f]"
                                  : "border-white/30 bg-black/40"
                              }`}
                            >
                              {isCompared && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </span>
                            Compare
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-[12px] text-[var(--drishti-sub)]">
                      No candidates match the current filters. Try loosening the evidence filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Compare bar */}
      {compareIds.length >= 2 && (
        <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[var(--drishti-blue)]/40 bg-[#0a0f1c]/95 px-4 py-2 shadow-2xl backdrop-blur">
          <GitCompareArrows className="h-4 w-4 text-[var(--drishti-blue)]" />
          <span className="text-[12px] text-white">
            Comparing <span className="font-bold text-[var(--drishti-blue)]">{compareIds.length}</span> candidates
          </span>
          <Button
            size="sm"
            onClick={() => setCompareOpen(true)}
            className="bg-[var(--drishti-blue)] text-[#06101f] hover:bg-[var(--drishti-blue)]/90"
          >
            View Matrix
            <ArrowRight className="h-3 w-3" />
          </Button>
          <button onClick={clearCompare} className="text-[var(--drishti-sub)] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Comparison Matrix Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-5xl border-white/10 bg-[#0a0f1c] p-0 text-white sm:max-w-5xl">
          <DialogHeader className="border-b border-white/10 p-5">
            <DialogTitle className="flex items-center gap-2 text-base">
              <GitCompareArrows className="h-4 w-4 text-[var(--drishti-blue)]" />
              Side-by-Side Candidate Comparison
            </DialogTitle>
            <DialogDescription className="text-[var(--drishti-sub)]">
              Comparing {compareRows.length} candidates against {selectedJob?.role} @ {selectedJob?.company}.
            </DialogDescription>
          </DialogHeader>
          <ComparisonMatrix students={compareRows} job={selectedJob} weights={weights} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WeightSlider({
  label,
  value,
  accent,
  onChange,
}: {
  label: string;
  value: number;
  accent: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[12px] font-medium text-[var(--drishti-sub)]">{label}</label>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-bold"
          style={{ background: `${accent}1a`, color: accent, border: `1px solid ${accent}44` }}
        >
          {value}%
        </span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={100}
        step={5}
        onValueChange={(v) => onChange(v[0])}
        className="[&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-[var(--drishti-gold)] [&_[data-slot=slider-thumb]]:border-[var(--drishti-gold)]"
      />
    </div>
  );
}

function ProofIcons({ student }: { student: StudentProfile }) {
  const github = student.evidence.filter((e) => e.kind === "github").length;
  const assess = student.assessments.length;
  const proj = student.projects.length;
  return (
    <div className="flex items-center gap-1.5">
      {github > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-0.5 rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-[var(--drishti-blue)]">
              <Github className="h-2.5 w-2.5" /> {github}
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-[#0a0f1c] text-[11px] text-white">{github} GitHub proofs</TooltipContent>
        </Tooltip>
      )}
      {assess > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-0.5 rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-[var(--drishti-gold)]">
              <Award className="h-2.5 w-2.5" /> {assess}
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-[#0a0f1c] text-[11px] text-white">{assess} proctored assessments</TooltipContent>
        </Tooltip>
      )}
      {proj > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-0.5 rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-[var(--drishti-emerald)]">
              <GraduationCap className="h-2.5 w-2.5" /> {proj}
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-[#0a0f1c] text-[11px] text-white">{proj} faculty-evaluated projects</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function ComparisonMatrix({
  students,
  job,
  weights,
}: {
  students: StudentProfile[];
  job?: JobOpening;
  weights: ReturnType<typeof useAppStore.getState>["weights"];
}) {
  if (!job || students.length === 0) {
    return (
      <div className="p-8 text-center text-[12px] text-[var(--drishti-sub)]">
        Select at least 2 candidates to compare.
      </div>
    );
  }
  return (
    <div className="max-h-[70vh] overflow-auto p-4">
      <table className="w-full text-[12px]">
        <thead className="sticky top-0 bg-[#0a0f1c]">
          <tr>
            <th className="w-[140px] px-3 py-2 text-left text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">
              Metric
            </th>
            {students.map((s) => (
              <th key={s.id} className="px-3 py-2 text-left">
                <div className="flex items-center gap-2">
                  <AvatarCircle name={s.name} color={s.avatarColor} />
                  <div>
                    <div className="text-[13px] font-semibold text-white">{s.name}</div>
                    <div className="text-[10px] text-[var(--drishti-sub)]">{s.branch}</div>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <CompareRow label="Overall Fit Score">
            {students.map((s) => {
              const fit = computeFit(s, job, weights);
              return (
                <td key={s.id} className="px-3 py-2">
                  <FitScoreBadge score={fit.score} />
                </td>
              );
            })}
          </CompareRow>
          <CompareRow label="Verified Required">
            {students.map((s) => {
              const fit = computeFit(s, job, weights);
              return (
                <td key={s.id} className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {fit.verifiedRequired.length === 0 ? (
                      <span className="text-[11px] text-[var(--drishti-sub)]">none</span>
                    ) : (
                      fit.verifiedRequired.map((sk) => (
                        <span key={sk} className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400">
                          {sk}
                        </span>
                      ))
                    )}
                  </div>
                </td>
              );
            })}
          </CompareRow>
          <CompareRow label="Skill Gaps">
            {students.map((s) => {
              const fit = computeFit(s, job, weights);
              return (
                <td key={s.id} className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {fit.missingRequired.length === 0 ? (
                      <span className="text-[10px] text-[var(--drishti-emerald)]">no gaps</span>
                    ) : (
                      fit.missingRequired.map((sk) => (
                        <span key={sk} className="rounded-full border border-red-500/40 bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-400">
                          {sk}
                        </span>
                      ))
                    )}
                  </div>
                </td>
              );
            })}
          </CompareRow>
          <CompareRow label="Top SQL / Coding Score">
            {students.map((s) => {
              const assess = s.assessments;
              const sqlA = assess.find((a) => a.skill === "SQL");
              const top = assess.length ? [...assess].sort((a, b) => b.score - a.score)[0] : null;
              return (
                <td key={s.id} className="px-3 py-2 text-white">
                  {sqlA ? (
                    <span>
                      <span className="font-bold">{sqlA.score}/100</span> SQL
                      {top && top.skill !== "SQL" && (
                        <span className="ml-1 text-[10px] text-[var(--drishti-sub)]">
                          (top: {top.score} {top.skill})
                        </span>
                      )}
                    </span>
                  ) : top ? (
                    <span>
                      <span className="font-bold">{top.score}/100</span> {top.skill}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--drishti-sub)]">no assessments</span>
                  )}
                </td>
              );
            })}
          </CompareRow>
          <CompareRow label="Verified Projects">
            {students.map((s) => (
              <td key={s.id} className="px-3 py-2 text-white">
                {s.projects.length} <span className="text-[10px] text-[var(--drishti-sub)]">(faculty-graded)</span>
              </td>
            ))}
          </CompareRow>
          <CompareRow label="Proctor Integrity">
            {students.map((s) => {
              const total = s.assessments.reduce((acc, a) => acc + a.warnings, 0);
              return (
                <td key={s.id} className="px-3 py-2">
                  {s.assessments.length === 0 ? (
                    <span className="text-[11px] text-[var(--drishti-sub)]">no tests</span>
                  ) : total === 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                      <ShieldCheck className="h-2.5 w-2.5" /> 0 warnings
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] text-[var(--drishti-amber)]">
                      ⚠ {total} warning(s)
                    </span>
                  )}
                </td>
              );
            })}
          </CompareRow>
          <CompareRow label="CGPA">
            {students.map((s) => (
              <td key={s.id} className="px-3 py-2 text-white">{s.cgpa}</td>
            ))}
          </CompareRow>
        </tbody>
      </table>
    </div>
  );
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-white/5">
      <td className="px-3 py-2 text-[11px] font-medium text-[var(--drishti-sub)]">{label}</td>
      {children}
    </tr>
  );
}

/* ---------------- Filter helpers ---------------- */

function hasGithubForSkill(student: StudentProfile, skill: string): boolean {
  return student.evidence.some((e) => e.kind === "github" && (e as GitHubEvidence).skill === skill);
}
function hasProctoredScoreAbove(student: StudentProfile, skill: string, threshold: number): boolean {
  return student.assessments.some((a) => a.skill === skill && a.score > threshold);
}
function hasZeroWarnings(student: StudentProfile): boolean {
  return student.assessments.length > 0 && student.assessments.every((a) => a.warnings === 0);
}
function hasVerifiedSkill(student: StudentProfile, skill: string): boolean {
  return student.skills.some((s) => s.canonical === skill && s.status === "verified");
}
