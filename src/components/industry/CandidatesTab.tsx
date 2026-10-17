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
  LayoutGrid,
  List,
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
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

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
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Candidates — Ranked Leaderboard
        </h1>
        <p className="text-[13px] text-slate-500">
          Evidence-backed ranking. Adjust weights to see real fit shift — every score is backed by
          GitHub commits, proctored tests, and faculty rubrics.
        </p>
      </div>

      {/* Weight sliders */}
      <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900">Interactive Fit Weight Sliders</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetWeights}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
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

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/80 p-3 font-mono text-[12px] text-slate-600">
            <span className="font-semibold text-amber-600">Fit</span> ={" "}
            <span className="font-semibold text-sky-600">{(weights.requiredWeight).toFixed(2)}</span>·reqRatio +{" "}
            <span className="font-semibold text-amber-600">{(weights.preferredWeight).toFixed(2)}</span>·prefRatio +{" "}
            <span className="font-semibold text-indigo-600">{(weights.projectWeight).toFixed(2)}</span>·projectFactor
            <span className="ml-2 text-slate-400">
              (normalized internally so sliders don't need to sum to 1)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Job picker + evidence filters */}
      <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12px] font-semibold text-slate-600">Rank candidates against:</span>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="h-9 w-[280px] border-slate-200 bg-white text-slate-900 shadow-2xs">
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white text-slate-900 shadow-lg">
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.role} @ {j.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="ml-auto text-[11px] text-slate-500">
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of {students.length} students
            </span>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-wider text-slate-400">
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
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-xs"
                        : "border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border transition-colors ${
                        active
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300 bg-white"
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

      {/* Pool Header with View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900">Ranked Candidate Pool</h2>
          <p className="text-xs text-slate-500">
            Top matches against <span className="font-semibold text-slate-700">{selectedJob?.role}</span> with verified cryptographic proofs
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              viewMode === "grid"
                ? "bg-indigo-50 text-indigo-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              viewMode === "table"
                ? "bg-indigo-50 text-indigo-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Table View
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <Card className="drishti-card border-slate-200/80 bg-white/90 p-12 text-center text-[13px] text-slate-500">
          No candidates match the current filters. Try loosening the evidence filters.
        </Card>
      )}

      {/* Candidate Grid View */}
      {viewMode === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((row, idx) => {
            const tier = fitTier(row.fit.score);
            const isCompared = compareIds.includes(row.student.id);

            return (
              <div
                key={row.student.id}
                className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
              >
                <div>
                  {/* Top Header: Avatar, Name, Rank & Prominent Top-Right Fit Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <AvatarCircle name={row.student.name} color={row.student.avatarColor} />
                        <span
                          className="absolute -top-1 -left-1 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-bold shadow-2xs"
                          style={{
                            color: idx === 0 ? "#ffffff" : tier.text,
                            background: idx === 0 ? "#f59e0b" : `${tier.text}18`,
                            border: `1px solid ${tier.text}44`,
                          }}
                        >
                          {idx + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold text-slate-900">
                          {row.student.name}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {row.student.branch} · CGPA {row.student.cgpa}
                        </div>
                      </div>
                    </div>

                    {/* Prominent Color-Coded Fit Badge in Top-Right */}
                    <FitScoreBadge score={row.fit.score} />
                  </div>

                  {/* Target Job Pill & Proof Counters */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <span>Target:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                        {selectedJob?.role}
                      </span>
                    </div>
                    <ProofIcons student={row.student} />
                  </div>

                  {/* Verified Required Skills & Gaps */}
                  <div className="mt-3 space-y-2">
                    {row.fit.verifiedRequired.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
                          Verified Required Skills
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {row.fit.verifiedRequired.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-medium text-emerald-700"
                            >
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              {s}
                            </span>
                          ))}
                          {row.fit.verifiedRequired.length > 4 && (
                            <span className="text-[10px] font-medium text-slate-400 self-center">
                              +{row.fit.verifiedRequired.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {row.fit.missingRequired.length > 0 ? (
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-rose-600">
                          Skill Gaps
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {row.fit.missingRequired.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10.5px] font-medium text-rose-700"
                            >
                              <XCircle className="h-2.5 w-2.5" />
                              {s}
                            </span>
                          ))}
                          {row.fit.missingRequired.length > 3 && (
                            <span className="text-[10px] font-medium text-slate-400 self-center">
                              +{row.fit.missingRequired.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Zero required skill gaps
                      </div>
                    )}
                  </div>

                  {/* Truncated AI Match Explanation (2 lines max + Tooltip on Hover) */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mt-3 cursor-help rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-0.5">
                          AI Evidence Rationale
                        </div>
                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
                          {row.fit.explanation}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-[380px] border-slate-200 bg-slate-900 text-xs text-white shadow-xl p-3"
                    >
                      <div className="font-semibold text-indigo-300 mb-1">Full AI Evidence Match Analysis</div>
                      {row.fit.explanation}
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Bottom Action Controls */}
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <Button
                    size="sm"
                    onClick={() => openInspector(row.student.id, selectedJob?.id)}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-medium shadow-sm hover:shadow-md hover:from-indigo-600 hover:to-sky-600 transition cursor-pointer text-xs h-8.5"
                  >
                    Inspect Proof
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                  <button
                    type="button"
                    onClick={() => toggleCompare(row.student.id)}
                    aria-pressed={isCompared}
                    className={`flex h-8.5 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition select-none ${
                      isCompared
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs font-semibold"
                        : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border transition-colors ${
                        isCompared
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isCompared && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </span>
                    Compare
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard Table View */}
      {viewMode === "table" && filtered.length > 0 && (
        <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
          <CardContent className="p-0">
            <div className="max-h-[640px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-slate-50/95 border-b border-slate-200 backdrop-blur">
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="w-[60px] text-slate-600 font-semibold">#</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Student</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Fit</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Verified Required</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Skill Gaps</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Proof</TableHead>
                    <TableHead className="min-w-[260px] text-slate-600 font-semibold">AI Explanation</TableHead>
                    <TableHead className="text-slate-600 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row, idx) => {
                    const tier = fitTier(row.fit.score);
                    const isCompared = compareIds.includes(row.student.id);
                    return (
                      <TableRow key={row.student.id} className="border-slate-100 align-top hover:bg-slate-50/70">
                        <TableCell>
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold"
                            style={{
                              color: idx === 0 ? "#ffffff" : tier.text,
                              background: idx === 0 ? "#f59e0b" : `${tier.text}18`,
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
                              <div className="truncate text-[13px] font-semibold text-slate-900">
                                {row.student.name}
                              </div>
                              <div className="truncate text-[10px] text-slate-500">
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
                            <span className="text-[11px] text-slate-400">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {row.fit.verifiedRequired.map((s) => (
                                <span
                                  key={s}
                                  className="inline-flex items-center gap-0.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-2xs"
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
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
                              <CheckCircle2 className="h-3 w-3" /> none
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {row.fit.missingRequired.map((s) => (
                                <span
                                  key={s}
                                  className="inline-flex items-center gap-0.5 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 shadow-2xs"
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
                              <div className="line-clamp-2 max-w-[260px] cursor-help text-[11px] leading-snug text-slate-600">
                                {row.fit.explanation}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-[360px] border-slate-200 bg-slate-900 text-[12px] text-white shadow-xl"
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
                              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm hover:from-amber-600 hover:to-amber-700 transition"
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
                                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs font-semibold"
                                  : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border transition-colors ${
                                  isCompared
                                    ? "border-indigo-600 bg-indigo-600 text-white"
                                    : "border-slate-300 bg-white"
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
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compare bar */}
      {compareIds.length >= 2 && (
        <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-indigo-200 bg-white/95 px-5 py-2.5 shadow-2xl backdrop-blur">
          <GitCompareArrows className="h-4 w-4 text-indigo-600" />
          <span className="text-[12px] text-slate-700">
            Comparing <span className="font-bold text-indigo-600">{compareIds.length}</span> candidates
          </span>
          <Button
            size="sm"
            onClick={() => setCompareOpen(true)}
            className="bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
          >
            View Matrix
            <ArrowRight className="h-3 w-3" />
          </Button>
          <button onClick={clearCompare} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Comparison Matrix Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-5xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl sm:max-w-5xl">
          <DialogHeader className="border-b border-slate-200 p-5">
            <DialogTitle className="flex items-center gap-2 text-base text-slate-900">
              <GitCompareArrows className="h-4 w-4 text-indigo-600" />
              Side-by-Side Candidate Comparison
            </DialogTitle>
            <DialogDescription className="text-slate-500">
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
        <label className="text-[12px] font-medium text-slate-600">{label}</label>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-bold"
          style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}44` }}
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
        className="[&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-range]]:bg-indigo-600 [&_[data-slot=slider-thumb]]:border-indigo-600"
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
            <span className="inline-flex items-center gap-0.5 rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 shadow-2xs">
              <Github className="h-2.5 w-2.5" /> {github}
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 text-[11px] text-white">{github} GitHub proofs</TooltipContent>
        </Tooltip>
      )}
      {assess > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-0.5 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 shadow-2xs">
              <Award className="h-2.5 w-2.5" /> {assess}
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 text-[11px] text-white">{assess} proctored assessments</TooltipContent>
        </Tooltip>
      )}
      {proj > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-0.5 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 shadow-2xs">
              <GraduationCap className="h-2.5 w-2.5" /> {proj}
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 text-[11px] text-white">{proj} faculty-evaluated projects</TooltipContent>
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
      <div className="p-8 text-center text-[12px] text-slate-500">
        Select at least 2 candidates to compare.
      </div>
    );
  }
  return (
    <div className="max-h-[70vh] overflow-auto p-4">
      <table className="w-full text-[12px]">
        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="w-[140px] px-3 py-2 text-left text-[11px] uppercase font-bold tracking-wider text-slate-500">
              Metric
            </th>
            {students.map((s) => (
              <th key={s.id} className="px-3 py-2 text-left">
                <div className="flex items-center gap-2">
                  <AvatarCircle name={s.name} color={s.avatarColor} />
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">{s.name}</div>
                    <div className="text-[10px] text-slate-500">{s.branch}</div>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
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
                      <span className="text-[11px] text-slate-400">none</span>
                    ) : (
                      fit.verifiedRequired.map((sk) => (
                        <span key={sk} className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
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
                      <span className="text-[10px] font-medium text-emerald-600">no gaps</span>
                    ) : (
                      fit.missingRequired.map((sk) => (
                        <span key={sk} className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
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
                <td key={s.id} className="px-3 py-2 text-slate-900">
                  {sqlA ? (
                    <span>
                      <span className="font-bold text-slate-900">{sqlA.score}/100</span> SQL
                      {top && top.skill !== "SQL" && (
                        <span className="ml-1 text-[10px] text-slate-400">
                          (top: {top.score} {top.skill})
                        </span>
                      )}
                    </span>
                  ) : top ? (
                    <span>
                      <span className="font-bold text-slate-900">{top.score}/100</span> {top.skill}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">no assessments</span>
                  )}
                </td>
              );
            })}
          </CompareRow>
          <CompareRow label="Verified Projects">
            {students.map((s) => (
              <td key={s.id} className="px-3 py-2 text-slate-900">
                {s.projects.length} <span className="text-[10px] text-slate-400">(faculty-graded)</span>
              </td>
            ))}
          </CompareRow>
          <CompareRow label="Proctor Integrity">
            {students.map((s) => {
              const total = s.assessments.reduce((acc, a) => acc + a.warnings, 0);
              return (
                <td key={s.id} className="px-3 py-2">
                  {s.assessments.length === 0 ? (
                    <span className="text-[11px] text-slate-400">no tests</span>
                  ) : total === 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <ShieldCheck className="h-2.5 w-2.5" /> 0 warnings
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      ⚠ {total} warning(s)
                    </span>
                  )}
                </td>
              );
            })}
          </CompareRow>
          <CompareRow label="CGPA">
            {students.map((s) => (
              <td key={s.id} className="px-3 py-2 text-slate-900 font-medium">{s.cgpa}</td>
            ))}
          </CompareRow>
        </tbody>
      </table>
    </div>
  );
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-3 py-2 text-[11px] font-medium text-slate-500">{label}</td>
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
