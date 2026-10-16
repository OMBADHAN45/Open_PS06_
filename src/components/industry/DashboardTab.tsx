"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { computeFit } from "@/lib/fit-score";
import { AvatarCircle, FitScoreBadge } from "@/components/shared/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, UserCheck, ListChecks, CalendarClock, Award, TrendingUp, ArrowRight, Flame } from "lucide-react";
import type { StudentProfile, JobOpening } from "@/lib/mock-data";

interface Kpi {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}

interface TopMatch {
  student: StudentProfile;
  job: JobOpening;
  score: number;
}

export function DashboardTab({ onGoInspector }: { onGoInspector: () => void }) {
  const students = useAppStore((s) => s.students);
  const jobs = useAppStore((s) => s.jobs);
  const applications = useAppStore((s) => s.applications);
  const weights = useAppStore((s) => s.weights);
  const openInspector = useAppStore((s) => s.openInspector);

  const kpis: Kpi[] = useMemo(() => {
    const scheduledStages = ["Assessment", "Technical Interview", "HR Interview"];
    const scheduled = applications.filter((a) => scheduledStages.includes(a.stage)).length;
    const shortlisted = applications.filter((a) => a.stage === "Shortlisted").length;
    const offers = applications.filter((a) => a.stage === "Offer").length;
    const verifiedApplicants = new Set(applications.map((a) => a.studentId)).size;
    const fits = applications.map((a) => a.fitScore).filter((s): s is number => typeof s === "number");
    const avgFit = fits.length ? Math.round(fits.reduce((x, y) => x + y, 0) / fits.length) : 0;

    return [
      { label: "Active Openings", value: String(jobs.length), sub: "Live partner jobs", icon: <Briefcase className="h-4 w-4" />, accent: "var(--drishti-gold)" },
      { label: "Verified Applicants", value: String(verifiedApplicants), sub: "Unique students applied", icon: <UserCheck className="h-4 w-4" />, accent: "var(--drishti-blue)" },
      { label: "Shortlisted", value: String(shortlisted), sub: "Past resume screen", icon: <ListChecks className="h-4 w-4" />, accent: "var(--drishti-emerald)" },
      { label: "Scheduled Interviews", value: String(scheduled), sub: "Assess+Tech+HR stages", icon: <CalendarClock className="h-4 w-4" />, accent: "var(--drishti-amber)" },
      { label: "Offers Extended", value: String(offers), sub: "In offer stage", icon: <Award className="h-4 w-4" />, accent: "var(--drishti-emerald)" },
      { label: "Avg Fit Score", value: `${avgFit}%`, sub: "Across all applications", icon: <TrendingUp className="h-4 w-4" />, accent: "var(--drishti-blue)" },
    ];
  }, [jobs.length, applications]);

  const topMatches: TopMatch[] = useMemo(() => {
    const matches: TopMatch[] = [];
    for (const student of students) {
      for (const job of jobs) {
        const fit = computeFit(student, job, weights);
        if (fit.score >= 90) matches.push({ student, job, score: fit.score });
      }
    }
    return matches.sort((a, b) => b.score - a.score).slice(0, 8);
  }, [students, jobs, weights]);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">Recruiter Dashboard</h1>
          <p className="text-[13px] text-[var(--drishti-sub)]">
            Live snapshot of your verified applicant pool. Updated every time a candidate moves
            stage or a new proof is verified.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-400">
          <span className="live-dot inline-block h-2 w-2 rounded-full bg-emerald-400" />
          Live · Synced with TPO & Student portals
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label} className="drishti-card overflow-hidden border-white/10 bg-white/[0.03]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${k.accent}1a`, color: k.accent, border: `1px solid ${k.accent}44` }}
                >
                  {k.icon}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[var(--drishti-sub)]">
                  live
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold text-white">{k.value}</div>
              <div className="text-[12px] font-medium text-[var(--drishti-sub)]">{k.label}</div>
              <div className="mt-1 text-[10px] text-[var(--drishti-sub)]/80">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Match Alerts */}
      <Card className="drishti-card border-white/10 bg-white/[0.02]">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-[var(--drishti-gold)]" />
            <h2 className="text-base font-bold text-white">Top Match Alerts (90%+ Fit)</h2>
            <span className="rounded-full bg-[var(--drishti-gold)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--drishti-gold)]">
              {topMatches.length}
            </span>
          </div>

          {topMatches.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-[12px] text-[var(--drishti-sub)]">
              No 90%+ matches yet with current weights. Try adjusting the weight sliders on the Candidates tab.
            </div>
          ) : (
            <div className="space-y-2">
              {topMatches.map((m) => (
                <div
                  key={`${m.student.id}-${m.job.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 transition hover:border-[var(--drishti-gold)]/40 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    <AvatarCircle name={m.student.name} color={m.student.avatarColor} />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-white">
                        {m.student.name}
                      </div>
                      <div className="truncate text-[11px] text-[var(--drishti-sub)]">
                        {m.student.branch} · {m.student.batch} · {m.job.role} @ {m.job.company}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FitScoreBadge score={m.score} />
                    <Button
                      size="sm"
                      onClick={() => {
                        openInspector(m.student.id, m.job.id);
                        onGoInspector();
                      }}
                      className="bg-[var(--drishti-gold)] text-[#06101f] hover:bg-[var(--drishti-gold)]/90"
                    >
                      Inspect
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
