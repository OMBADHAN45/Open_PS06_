"use client";

import { useMemo } from "react";
import { useAppStore, PIPELINE_STAGES } from "@/lib/store";
import type { ApplicationStage } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { AvatarCircle, FitScoreBadge } from "@/components/shared/primitives";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";

const STAGE_ACCENTS: Record<ApplicationStage, { dot: string; ring: string; head: string }> = {
  Applied: { dot: "#0284c7", ring: "border-sky-200 bg-sky-50/40", head: "text-sky-700" },
  Shortlisted: { dot: "#d97706", ring: "border-amber-200 bg-amber-50/40", head: "text-amber-800" },
  Assessment: { dot: "#ea580c", ring: "border-orange-200 bg-orange-50/40", head: "text-orange-700" },
  "Technical Interview": { dot: "#7c3aed", ring: "border-purple-200 bg-purple-50/40", head: "text-purple-700" },
  "HR Interview": { dot: "#0891b2", ring: "border-cyan-200 bg-cyan-50/40", head: "text-cyan-700" },
  Offer: { dot: "#059669", ring: "border-emerald-200 bg-emerald-50/40", head: "text-emerald-700" },
};

function KpiCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="drishti-card flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ background: `${accent}1a`, color: accent }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
        <div className="text-[16px] font-bold text-slate-900">{value}</div>
        {sub && <div className="text-[10px] text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}

export function MasterPipelineTab() {
  const applications = useAppStore((s) => s.applications);
  const students = useAppStore((s) => s.students);
  const jobs = useAppStore((s) => s.jobs);
  const moveApplication = useAppStore((s) => s.moveApplication);

  const stats = useMemo(() => {
    const distinctCompanies = new Set(jobs.map((j) => j.company));
    const total = applications.length;
    const offers = applications.filter((a) => a.stage === "Offer").length;
    const conversion = total ? Math.round((offers / total) * 100) : 0;
    return {
      activeDrives: distinctCompanies.size,
      total,
      offers,
      conversion,
    };
  }, [applications, jobs]);

  const byStage = useMemo(() => {
    const map: Record<ApplicationStage, typeof applications> = {
      Applied: [],
      Shortlisted: [],
      Assessment: [],
      "Technical Interview": [],
      "HR Interview": [],
      Offer: [],
    };
    for (const a of applications) map[a.stage].push(a);
    return map;
  }, [applications]);

  function nextStage(stage: ApplicationStage): ApplicationStage | null {
    const i = PIPELINE_STAGES.indexOf(stage);
    if (i < 0 || i >= PIPELINE_STAGES.length - 1) return null;
    return PIPELINE_STAGES[i + 1];
  }
  function prevStage(stage: ApplicationStage): ApplicationStage | null {
    const i = PIPELINE_STAGES.indexOf(stage);
    if (i <= 0) return null;
    return PIPELINE_STAGES[i - 1];
  }

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          label="Active Drives"
          value={stats.activeDrives}
          sub="distinct companies"
          icon={<Briefcase className="h-4 w-4" />}
          accent="#d97706"
        />
        <KpiCard
          label="Total Applications"
          value={stats.total}
          sub="across all drives"
          icon={<Users className="h-4 w-4" />}
          accent="#0284c7"
        />
        <KpiCard
          label="Offers Extended"
          value={stats.offers}
          sub="stage = Offer"
          icon={<Award className="h-4 w-4" />}
          accent="#059669"
        />
        <KpiCard
          label="Conversion Rate"
          value={`${stats.conversion}%`}
          sub="offers / applied"
          icon={<TrendingUp className="h-4 w-4" />}
          accent="#4f46e5"
        />
      </div>

      {/* Kanban */}
      <div className="drishti-card rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-[14px] font-semibold text-slate-900">Master Placement Pipeline</h3>
          <span className="text-[11px] text-slate-500">
            — consolidated across all {stats.activeDrives} active drives
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-[1000px] gap-3">
            {PIPELINE_STAGES.map((stage) => {
              const accent = STAGE_ACCENTS[stage];
              const apps = byStage[stage];
              return (
                <div key={stage} className="flex w-[240px] shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50/50 shadow-2xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 bg-white/80 px-3 py-2.5 rounded-t-xl">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: accent.dot }}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        {stage}
                      </span>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-2xs">
                      {apps.length}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2 p-2">
                    {apps.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-white/50 p-3 text-center text-[10px] text-slate-400">
                        No candidates
                      </div>
                    )}
                    {apps.map((app) => {
                      const student = students.find((s) => s.id === app.studentId);
                      const job = jobs.find((j) => j.id === app.jobId);
                      if (!student || !job) return null;
                      const fit = app.fitScore ?? 0;
                      const next = nextStage(app.stage);
                      const prev = prevStage(app.stage);
                      return (
                        <div
                          key={app.id}
                          className="group relative rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md p-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-150"
                        >
                          {/* Top Row: Avatar + Name & Role + Prominent Fit Score Badge */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <AvatarCircle name={student.name} color={student.avatarColor} />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-[12px] font-semibold text-slate-900">
                                  {student.name}
                                </div>
                                <div className="flex items-center gap-1 text-[10.5px] text-slate-500 truncate">
                                  <Building2 className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{job.role}</span>
                                </div>
                              </div>
                            </div>
                            <FitScoreBadge score={fit} />
                          </div>

                          {/* Compact Visual Skill Pills (3 max) */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-1">
                            {student.skills.slice(0, 3).map((sk) => {
                              const isVerified = sk.status === "verified";
                              const isFailed = sk.status === "failed";
                              return (
                                <span
                                  key={sk.canonical}
                                  className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9.5px] font-medium border ${
                                    isVerified
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : isFailed
                                      ? "border-rose-200 bg-rose-50 text-rose-700"
                                      : "border-amber-200 bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      isVerified
                                        ? "bg-emerald-500"
                                        : isFailed
                                        ? "bg-rose-500"
                                        : "bg-amber-500"
                                    }`}
                                  />
                                  {sk.canonical}
                                </span>
                              );
                            })}
                            {student.skills.length > 3 && (
                              <span className="text-[9.5px] font-medium text-slate-400">
                                +{student.skills.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Company & CTC Strip */}
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="truncate max-w-[110px]">{job.company}</span>
                            <span className="font-semibold text-slate-600">{job.ctc}</span>
                          </div>

                          {/* Hover-Revealed Action Controls */}
                          <div className="mt-2 flex items-center gap-1 max-h-0 overflow-hidden opacity-0 group-hover:max-h-8 group-hover:opacity-100 transition-all duration-200">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!prev}
                              onClick={() => prev && moveApplication(app.id, prev)}
                              className="h-6.5 flex-1 border-slate-200 bg-slate-50 px-1.5 text-[10px] text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer disabled:opacity-30"
                            >
                              <ChevronLeft className="h-3 w-3" /> Back
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!next}
                              onClick={() => next && moveApplication(app.id, next)}
                              className="h-6.5 flex-1 px-1.5 text-[10px] font-semibold border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 cursor-pointer disabled:opacity-30"
                            >
                              Advance <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
