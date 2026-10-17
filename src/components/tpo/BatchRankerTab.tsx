"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { computeFit } from "@/lib/fit-score";
import type { JobOpening, StudentProfile } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AvatarCircle, FitScoreBadge, VerifiedPill, GapPill } from "@/components/shared/primitives";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calculator,
  ClipboardPaste,
  Download,
  Search,
  GraduationCap,
  Trophy,
  CheckCircle2,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Building2,
  MapPin,
  Banknote,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SAMPLE_JD = `Company: Novos Labs
Role: Backend Engineer
Location: Bengaluru, India
CTC: 13 LPA
Eligibility: BE/BTech 2026, CGPA >= 8.0

We are hiring a Backend Engineer to design and scale Node.js microservices backed by
PostgreSQL and Redis. You'll own API design, build caching layers, and ship to production
via Docker on AWS. Bonus if you've worked with TypeScript and Kubernetes.

Required: Node.js, PostgreSQL, Redis
Preferred: Docker, AWS, TypeScript`;

interface RankedRow {
  student: StudentProfile;
  score: number;
  verifiedRequired: string[];
  missingRequired: string[];
  verifiedPreferred: string[];
  missingPreferred: string[];
  explanation: string;
}

type FilterMode = "all" | "shortlist" | "gaps";

export function BatchRankerTab() {
  const students = useAppStore((s) => s.students);
  const weights = useAppStore((s) => s.weights);
  const parseJobDescription = useAppStore((s) => s.parseJobDescription);
  const openInspector = useAppStore((s) => s.openInspector);

  const [jd, setJd] = useState<string>(SAMPLE_JD);
  // Default to active timestamp so ranking is immediately ready and visible
  const [ranAt, setRanAt] = useState<number>(() => Date.now());
  const [isJdExpanded, setIsJdExpanded] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { tempJob, parsePreview } = useMemo(() => {
    if (!jd.trim()) return { tempJob: null, parsePreview: null };
    const parsed = parseJobDescription(jd);
    const job: JobOpening = {
      id: "temp_batch_job",
      company: parsed.company,
      role: parsed.role,
      location: parsed.location,
      ctc: parsed.ctc,
      eligibility: parsed.eligibility,
      requiredSkills: parsed.requiredSkills,
      preferredSkills: parsed.preferredSkills,
      description: jd,
      sources: ["Batch Ranker"],
      postedAt: Date.now(),
    };
    return { tempJob: job, parsePreview: parsed };
  }, [jd, parseJobDescription]);

  const ranked: RankedRow[] = useMemo(() => {
    if (!tempJob) return [];
    return students
      .map((student) => {
        const fit = computeFit(student, tempJob, weights);
        return {
          student,
          score: fit.score,
          verifiedRequired: fit.verifiedRequired,
          missingRequired: fit.missingRequired,
          verifiedPreferred: fit.verifiedPreferred,
          missingPreferred: fit.missingPreferred,
          explanation: fit.explanation,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [students, tempJob, weights]);

  const shortlistCount = useMemo(() => {
    return ranked.filter((r) => (r.missingRequired?.length ?? 0) === 0 && r.score >= 70).length;
  }, [ranked]);

  const avgFitScore = useMemo(() => {
    if (ranked.length === 0) return 0;
    return Math.round(ranked.reduce((acc, r) => acc + r.score, 0) / ranked.length);
  }, [ranked]);

  // Filtered rows based on tab mode and search query
  const displayedRows = useMemo(() => {
    return ranked.filter((r) => {
      // Tab filter
      if (filterMode === "shortlist") {
        if (!((r.missingRequired?.length ?? 0) === 0 && r.score >= 70)) return false;
      } else if (filterMode === "gaps") {
        if ((r.missingRequired?.length ?? 0) === 0) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.student.name?.toLowerCase().includes(q) ?? false;
        const matchesRoll = r.student.roll?.toLowerCase().includes(q) ?? false;
        const matchesBranch = r.student.branch?.toLowerCase().includes(q) ?? false;
        const matchesSkills = r.verifiedRequired?.some((s) => s.toLowerCase().includes(q)) ?? false;
        if (!matchesName && !matchesRoll && !matchesBranch && !matchesSkills) return false;
      }

      return true;
    });
  }, [ranked, filterMode, searchQuery]);

  function handleRank() {
    setRanAt(Date.now());
  }

  function exportCsv() {
    const header = ["Rank", "Name", "Roll", "Branch", "Batch", "CGPA", "Fit Score", "Verified Skills", "Skill Gaps"];
    const rows = ranked.map((r, i) => {
      const cells = [
        String(i + 1),
        r.student.name,
        r.student.roll,
        r.student.branch,
        r.student.batch,
        r.student.cgpa.toFixed(2),
        String(r.score),
        r.verifiedRequired.join("; ") || "—",
        r.missingRequired.join("; ") || "—",
      ];
      return cells.map((c) => `"${c.replace(/"/g, '""')}"`).join(",");
    });
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `drishti-shortlist-${tempJob?.company?.replace(/\s+/g, "-").toLowerCase() ?? "batch"}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* =========================================================================
          JOB CRITERIA PANEL (COLLAPSIBLE / SLEEK)
          ========================================================================= */}
      <div className="drishti-card rounded-2xl border border-indigo-100 bg-white/95 p-5 shadow-sm">
        {/* Compact Drive Header Summary */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[16px] font-bold text-slate-900">
                  {parsePreview?.company || "Target Company"}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-[14px] font-semibold text-indigo-700">
                  {parsePreview?.role || "Target Role"}
                </span>
                <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-[11px] font-semibold text-indigo-700 shadow-2xs">
                  {parsePreview?.ctc || "CTC"}
                </Badge>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[11px] text-slate-600">
                  <MapPin className="mr-1 h-3 w-3" />
                  {parsePreview?.location || "Location"}
                </Badge>
              </div>

              {/* Required & Preferred Skills Preview */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Required:</span>
                {(parsePreview?.requiredSkills ?? []).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {s}
                  </span>
                ))}

                {Boolean(parsePreview?.preferredSkills?.length) && (
                  <>
                    <span className="ml-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Preferred:</span>
                    {(parsePreview?.preferredSkills ?? []).map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-800"
                      >
                        {s}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsJdExpanded(!isJdExpanded)}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs text-xs font-semibold cursor-pointer"
            >
              {isJdExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span>Hide Raw JD</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Edit JD & Criteria</span>
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={handleRank}
              className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Re-Rank Cohort</span>
            </Button>
          </div>
        </div>

        {/* Collapsible Full JD Textarea */}
        <AnimatePresence>
          {isJdExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 pt-4 border-t border-slate-100 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Paste Full Raw Job Description</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-indigo-600 hover:bg-indigo-50 font-semibold"
                  onClick={() => setJd(SAMPLE_JD)}
                >
                  <ClipboardPaste className="h-3.5 w-3.5 mr-1" />
                  Reset to Sample JD
                </Button>
              </div>

              <Textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the raw job description here…"
                className="min-h-[120px] resize-y border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 shadow-2xs"
              />

              <div className="mt-3 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsJdExpanded(false)}
                  className="text-xs text-slate-600"
                >
                  Done Editing
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    handleRank();
                    setIsJdExpanded(false);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Apply & Rank Batch
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =========================================================================
          EXECUTIVE KPI SUMMARY METRIC CARDS
          ========================================================================= */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Card 1: Cohort Evaluated */}
        <div className="drishti-card rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Evaluated Cohort</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{ranked.length}</div>
          <div className="text-[11px] text-slate-500">Graduating BE/BTech Students</div>
        </div>

        {/* Card 2: Verified Shortlist */}
        <div className="drishti-card rounded-2xl border border-emerald-100 bg-white/95 p-4 shadow-sm text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Verified Shortlist</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700">{shortlistCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Fit Score ≥ 70% & Zero Gaps</div>
        </div>

        {/* Card 3: Batch Average */}
        <div className="drishti-card rounded-2xl border border-sky-100 bg-white/95 p-4 shadow-sm text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Cohort Average Fit</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Calculator className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-sky-700">{avgFitScore}%</div>
          <div className="text-[11px] text-slate-500">Evidence-Weighted Match</div>
        </div>

        {/* Card 4: Top Match */}
        <div className="drishti-card rounded-2xl border border-amber-100 bg-white/95 p-4 shadow-sm text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Top Candidate</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Trophy className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 truncate text-lg font-extrabold text-slate-900">
            {ranked[0]?.student.name || "—"}
          </div>
          <div className="text-[11px] font-bold text-amber-600">
            {ranked[0] ? `${ranked[0].score}% Strong Match` : "No Candidates"}
          </div>
        </div>
      </div>

      {/* =========================================================================
          FILTER CONTROLS & TABLE HEADER STRIP
          ========================================================================= */}
      <div className="drishti-card rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tab Filter Pills */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 gap-1 text-xs font-semibold">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === "all"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Ranked ({ranked.length})
            </button>
            <button
              onClick={() => setFilterMode("shortlist")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === "shortlist"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50"
              }`}
            >
              Verified Shortlist ({shortlistCount})
            </button>
            <button
              onClick={() => setFilterMode("gaps")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === "gaps"
                  ? "bg-amber-600 text-white shadow-xs font-bold"
                  : "text-amber-700 hover:text-amber-900 hover:bg-amber-50"
              }`}
            >
              Has Skill Gaps ({ranked.length - shortlistCount})
            </button>
          </div>

          {/* Search Input & CSV Export Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate, roll, skill..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              className="border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 font-bold text-xs shadow-2xs shrink-0 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 mr-1 text-emerald-700" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* =======================================================================
            CLEAN, RESPONSIVE, WRAP-SAFE TABLE
            ======================================================================= */}
        <div className="mt-4 rounded-xl border border-slate-200/90 overflow-hidden bg-white">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50/90 hover:bg-slate-50/90">
                <TableHead className="w-[60px] text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Rank
                </TableHead>
                <TableHead className="w-[210px] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Candidate
                </TableHead>
                <TableHead className="w-[120px] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Fit Score
                </TableHead>
                <TableHead className="w-[180px] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Verified Skills
                </TableHead>
                <TableHead className="w-[170px] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Skill Gaps
                </TableHead>
                <TableHead className="min-w-[200px] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Match Insights
                </TableHead>
                <TableHead className="w-[125px] text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No candidates match the current filter or search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                displayedRows.map((r, i) => (
                  <TableRow
                    key={r.student.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Column 1: Rank */}
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-extrabold shadow-xs ${
                          i === 0
                            ? "bg-gradient-to-tr from-amber-500 to-amber-400 text-white ring-2 ring-amber-200"
                            : i === 1
                            ? "bg-gradient-to-tr from-sky-500 to-sky-400 text-white ring-2 ring-sky-200"
                            : i === 2
                            ? "bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white ring-2 ring-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200/80"
                        }`}
                      >
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </span>
                    </TableCell>

                    {/* Column 2: Candidate */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <AvatarCircle name={r.student.name} color={r.student.avatarColor} />
                        <div className="min-w-0">
                          <button
                            onClick={() => openInspector(r.student.id)}
                            className="text-left font-bold text-[13px] text-slate-900 hover:text-indigo-600 transition-colors truncate block cursor-pointer"
                          >
                            {r.student.name}
                          </button>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <GraduationCap className="h-3 w-3 text-slate-400" />
                            <span>{r.student.branch}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">CGPA {r.student.cgpa.toFixed(1)}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Roll {r.student.roll} • {r.student.batch}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 3: Fit Score */}
                    <TableCell>
                      <div className="space-y-1">
                        <FitScoreBadge score={r.score} />
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              r.score >= 80
                                ? "bg-emerald-500"
                                : r.score >= 60
                                ? "bg-sky-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${r.score}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 4: Verified Skills */}
                    <TableCell>
                      <div className="flex max-w-[180px] flex-wrap gap-1">
                        {(r.verifiedRequired?.length ?? 0) === 0 ? (
                          <span className="text-[11px] text-rose-500 italic">None verified</span>
                        ) : (
                          (r.verifiedRequired ?? []).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shadow-2xs"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {s}
                            </span>
                          ))
                        )}
                      </div>
                    </TableCell>

                    {/* Column 5: Skill Gaps */}
                    <TableCell>
                      <div className="flex max-w-[170px] flex-wrap gap-1">
                        {(r.missingRequired?.length ?? 0) === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Zero Gaps
                          </span>
                        ) : (
                          (r.missingRequired ?? []).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 shadow-2xs"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              {s}
                            </span>
                          ))
                        )}
                      </div>
                    </TableCell>

                    {/* Column 6: Match Insights (Clean, truncated with hover tooltip) */}
                    <TableCell className="max-w-[240px]">
                      <div
                        className="text-[11px] leading-snug text-slate-700 line-clamp-2 cursor-help"
                        title={r.explanation}
                      >
                        {r.explanation}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{r.student.reposScanned ?? r.student.evidence?.length ?? 0} repos scanned</span>
                        <span>•</span>
                        <span>{r.student.assessments?.length ?? 0} assessments</span>
                      </div>
                    </TableCell>

                    {/* Column 7: Action */}
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInspector(r.student.id)}
                        className="border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 shadow-2xs font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Search className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                        <span>Inspect Proof</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info note */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-800">{displayedRows.length}</strong> of{" "}
            <strong>{ranked.length}</strong> candidates
          </span>
          <span className="text-slate-400">
            Last ranked at {new Date(ranAt).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
