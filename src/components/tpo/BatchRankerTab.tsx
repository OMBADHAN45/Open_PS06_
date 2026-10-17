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
} from "lucide-react";

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

export function BatchRankerTab() {
  const students = useAppStore((s) => s.students);
  const weights = useAppStore((s) => s.weights);
  const parseJobDescription = useAppStore((s) => s.parseJobDescription);
  const openInspector = useAppStore((s) => s.openInspector);

  const [jd, setJd] = useState<string>(SAMPLE_JD);
  const [ranAt, setRanAt] = useState<number | null>(null);

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
    if (!tempJob || ranAt === null) return [];
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
  }, [students, tempJob, weights, ranAt]);

  const shortlistCount = useMemo(() => {
    if (!tempJob) return 0;
    return ranked.filter((r) => r.missingRequired.length === 0 && r.score >= 70).length;
  }, [ranked, tempJob]);

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
      {/* JD input */}
      <div className="drishti-card rounded-2xl p-5 border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-slate-900">Paste raw Job Description</h3>
              <p className="text-[11px] text-slate-500">
                DRISHTI auto-extracts role, company, location, CTC and required vs preferred skills.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-2xs"
            onClick={() => setJd(SAMPLE_JD)}
          >
            <ClipboardPaste className="h-3.5 w-3.5" /> Paste Sample Raw JD
          </Button>
        </div>

        <Textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the raw JD here…"
          className="min-h-[140px] resize-y border-slate-200 bg-white text-[12px] text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 shadow-2xs"
        />

        {parsePreview && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
            <span className="text-[11px] font-medium text-slate-500">Parsed:</span>
            <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold shadow-2xs">
              {parsePreview.company} — {parsePreview.role}
            </Badge>
            <Badge variant="outline" className="border-slate-200 bg-white text-slate-700 shadow-2xs">
              {parsePreview.location}
            </Badge>
            <Badge variant="outline" className="border-slate-200 bg-white text-slate-700 shadow-2xs">
              {parsePreview.ctc}
            </Badge>
            <span className="text-[11px] font-medium text-slate-500">Required:</span>
            {parsePreview.requiredSkills.map((s) => (
              <span key={s} className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-2xs">
                {s}
              </span>
            ))}
            {parsePreview.preferredSkills.length > 0 && (
              <>
                <span className="text-[11px] font-medium text-slate-500">Preferred:</span>
                {parsePreview.preferredSkills.map((s) => (
                  <span key={s} className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 shadow-2xs">
                    {s}
                  </span>
                ))}
              </>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            onClick={handleRank}
            disabled={!tempJob}
            className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Calculator className="h-4 w-4" /> Rank Graduating Batch
          </Button>
          {ranAt && (
            <span className="text-[11px] text-slate-500">
              Last ranked at {new Date(ranAt).toLocaleTimeString()} ·{" "}
              <span className="font-semibold text-indigo-600">{ranked.length} students</span> ranked ·{" "}
              <span className="font-semibold text-emerald-600">{shortlistCount} verified shortlist</span>
            </span>
          )}
        </div>
      </div>

      {/* Ranked table */}
      {ranked.length === 0 ? (
        <div className="drishti-card rounded-2xl p-10 text-center border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <div className="text-[14px] font-bold text-slate-900">No ranking yet</div>
          <div className="mt-1 text-[12px] text-slate-500">
            Paste a JD and click &quot;Rank Graduating Batch&quot; to shortlist verified candidates.
          </div>
        </div>
      ) : (
        <div className="drishti-card rounded-2xl p-4 border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <h3 className="text-[14px] font-bold text-slate-900">
                Ranked batch — {ranked.length} students
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              className="border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-2xs font-semibold"
            >
              <Download className="h-3.5 w-3.5" /> Export Verified Shortlist (CSV)
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="w-[40px] text-[11px] uppercase font-bold tracking-wider text-slate-500">Rank</TableHead>
                <TableHead className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Student</TableHead>
                <TableHead className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Fit</TableHead>
                <TableHead className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Verified Required</TableHead>
                <TableHead className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Skill Gaps</TableHead>
                <TableHead className="text-[11px] uppercase font-bold tracking-wider text-slate-500">Explanation</TableHead>
                <TableHead className="text-right text-[11px] uppercase font-bold tracking-wider text-slate-500">Proof</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranked.map((r, i) => (
                <TableRow key={r.student.id} className="border-slate-100 align-top hover:bg-slate-50/70">
                  <TableCell>
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                        i === 0
                          ? "bg-amber-500 text-white shadow-xs"
                          : i === 1
                          ? "bg-sky-500 text-white shadow-xs"
                          : i === 2
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {i + 1}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AvatarCircle name={r.student.name} color={r.student.avatarColor} />
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-bold text-slate-900">{r.student.name}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <GraduationCap className="h-3 w-3" />
                          {r.student.branch} · {r.student.batch}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Roll {r.student.roll} · CGPA {r.student.cgpa.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <FitScoreBadge score={r.score} />
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-[200px] flex-wrap gap-1">
                      {r.verifiedRequired.length === 0 ? (
                        <span className="text-[10px] text-rose-500">— none —</span>
                      ) : (
                        r.verifiedRequired.map((s) => <VerifiedPill key={s}>{s}</VerifiedPill>)
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-[180px] flex-wrap gap-1">
                      {r.missingRequired.length === 0 ? (
                        <span className="text-[10px] font-medium text-emerald-600">no gaps</span>
                      ) : (
                        r.missingRequired.map((s) => <GapPill key={s}>{s}</GapPill>)
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <span className="text-[11px] leading-relaxed text-slate-700">{r.explanation}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-2xs font-semibold"
                      onClick={() => openInspector(r.student.id)}
                    >
                      <Search className="h-3 w-3" /> Inspect Proof
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
