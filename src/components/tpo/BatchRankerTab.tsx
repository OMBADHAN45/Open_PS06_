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
      <div className="drishti-card rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe2b2]/10 text-[#ffe2b2]">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-white">Paste raw Job Description</h3>
              <p className="text-[11px] text-[var(--drishti-sub)]">
                DRISHTI auto-extracts role, company, location, CTC and required vs preferred skills.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-[#9fe0ff]/40 bg-[#9fe0ff]/10 text-[#9fe0ff] hover:bg-[#9fe0ff]/20"
            onClick={() => setJd(SAMPLE_JD)}
          >
            <ClipboardPaste className="h-3.5 w-3.5" /> Paste Sample Raw JD
          </Button>
        </div>

        <Textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the raw JD here…"
          className="min-h-[140px] resize-y border-white/10 bg-black/30 text-[12px] text-white placeholder:text-white/30 focus-visible:border-[#9fe0ff]/40"
        />

        {parsePreview && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-black/30 p-3">
            <span className="text-[11px] text-[var(--drishti-sub)]">Parsed:</span>
            <Badge className="border-[#ffe2b2]/40 bg-[#ffe2b2]/10 text-[#ffe2b2]">
              {parsePreview.company} — {parsePreview.role}
            </Badge>
            <Badge variant="outline" className="border-white/20 text-white/70">
              {parsePreview.location}
            </Badge>
            <Badge variant="outline" className="border-white/20 text-white/70">
              {parsePreview.ctc}
            </Badge>
            <span className="text-[11px] text-[var(--drishti-sub)]">Required:</span>
            {parsePreview.requiredSkills.map((s) => (
              <span key={s} className="rounded-full border border-[#10b981]/40 bg-[#10b981]/10 px-2 py-0.5 text-[10px] font-semibold text-[#10b981]">
                {s}
              </span>
            ))}
            {parsePreview.preferredSkills.length > 0 && (
              <>
                <span className="text-[11px] text-[var(--drishti-sub)]">Preferred:</span>
                {parsePreview.preferredSkills.map((s) => (
                  <span key={s} className="rounded-full border border-[#9fe0ff]/40 bg-[#9fe0ff]/10 px-2 py-0.5 text-[10px] font-semibold text-[#9fe0ff]">
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
            className="bg-[#10b981] text-[#06101f] hover:bg-[#10b981]/90"
          >
            <Calculator className="h-4 w-4" /> Rank Graduating Batch
          </Button>
          {ranAt && (
            <span className="text-[11px] text-[var(--drishti-sub)]">
              Last ranked at {new Date(ranAt).toLocaleTimeString()} ·{" "}
              <span className="text-[#10b981]">{ranked.length} students</span> ranked ·{" "}
              <span className="text-[#ffe2b2]">{shortlistCount} verified shortlist</span>
            </span>
          )}
        </div>
      </div>

      {/* Ranked table */}
      {ranked.length === 0 ? (
        <div className="drishti-card rounded-2xl p-10 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <div className="text-[14px] font-semibold text-white">No ranking yet</div>
          <div className="mt-1 text-[12px] text-[var(--drishti-sub)]">
            Paste a JD and click "Rank Graduating Batch" to shortlist verified candidates.
          </div>
        </div>
      ) : (
        <div className="drishti-card rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[#ffe2b2]" />
              <h3 className="text-[14px] font-semibold text-white">
                Ranked batch — {ranked.length} students
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              className="border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20"
            >
              <Download className="h-3.5 w-3.5" /> Export Verified Shortlist (CSV)
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="w-[40px] text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Rank</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Student</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Fit</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Verified Required</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Skill Gaps</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Explanation</TableHead>
                <TableHead className="text-right text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Proof</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranked.map((r, i) => (
                <TableRow key={r.student.id} className="border-white/5 align-top">
                  <TableCell>
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                        i === 0
                          ? "bg-[#ffe2b2]/20 text-[#ffe2b2]"
                          : i === 1
                          ? "bg-[#9fe0ff]/20 text-[#9fe0ff]"
                          : i === 2
                          ? "bg-[#10b981]/20 text-[#10b981]"
                          : "bg-white/5 text-white/70"
                      }`}
                    >
                      {i + 1}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AvatarCircle name={r.student.name} color={r.student.avatarColor} />
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-semibold text-white">{r.student.name}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--drishti-sub)]">
                          <GraduationCap className="h-3 w-3" />
                          {r.student.branch} · {r.student.batch}
                        </div>
                        <div className="text-[10px] text-[var(--drishti-sub)]">
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
                        <span className="text-[10px] text-red-400">— none —</span>
                      ) : (
                        r.verifiedRequired.map((s) => <VerifiedPill key={s}>{s}</VerifiedPill>)
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-[180px] flex-wrap gap-1">
                      {r.missingRequired.length === 0 ? (
                        <span className="text-[10px] text-[#10b981]">no gaps</span>
                      ) : (
                        r.missingRequired.map((s) => <GapPill key={s}>{s}</GapPill>)
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <span className="text-[11px] leading-relaxed text-white/80">{r.explanation}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#9fe0ff]/40 bg-[#9fe0ff]/10 text-[#9fe0ff] hover:bg-[#9fe0ff]/20"
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
