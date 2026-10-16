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
  Applied: { dot: "#9fe0ff", ring: "border-[#9fe0ff]/30", head: "text-[#9fe0ff]" },
  Shortlisted: { dot: "#ffe2b2", ring: "border-[#ffe2b2]/30", head: "text-[#ffe2b2]" },
  Assessment: { dot: "#f59e0b", ring: "border-[#f59e0b]/30", head: "text-[#f59e0b]" },
  "Technical Interview": { dot: "#a78bfa", ring: "border-[#a78bfa]/30", head: "text-[#a78bfa]" },
  "HR Interview": { dot: "#22d3ee", ring: "border-[#22d3ee]/30", head: "text-[#22d3ee]" },
  Offer: { dot: "#10b981", ring: "border-[#10b981]/40", head: "text-[#10b981]" },
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
    <div className="drishti-card flex items-center gap-3 rounded-xl p-3">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ background: `${accent}1a`, color: accent }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--drishti-sub)]">{label}</div>
        <div className="text-[16px] font-bold text-white">{value}</div>
        {sub && <div className="text-[10px] text-[var(--drishti-sub)]">{sub}</div>}
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
          accent="#ffe2b2"
        />
        <KpiCard
          label="Total Applications"
          value={stats.total}
          sub="across all drives"
          icon={<Users className="h-4 w-4" />}
          accent="#9fe0ff"
        />
        <KpiCard
          label="Offers Extended"
          value={stats.offers}
          sub="stage = Offer"
          icon={<Award className="h-4 w-4" />}
          accent="#10b981"
        />
        <KpiCard
          label="Conversion Rate"
          value={`${stats.conversion}%`}
          sub="offers / applied"
          icon={<TrendingUp className="h-4 w-4" />}
          accent="#f59e0b"
        />
      </div>

      {/* Kanban */}
      <div className="drishti-card rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-[14px] font-semibold text-white">Master Placement Pipeline</h3>
          <span className="text-[11px] text-[var(--drishti-sub)]">
            — consolidated across all {stats.activeDrives} active drives
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-[1000px] gap-3">
            {PIPELINE_STAGES.map((stage) => {
              const accent = STAGE_ACCENTS[stage];
              const apps = byStage[stage];
              return (
                <div key={stage} className={`flex w-[230px] shrink-0 flex-col rounded-xl border ${accent.ring} bg-black/20`}>
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: accent.dot }}
                      />
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${accent.head}`}>
                        {stage}
                      </span>
                    </div>
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/70">
                      {apps.length}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2 p-2">
                    {apps.length === 0 && (
                      <div className="rounded-lg border border-dashed border-white/10 p-3 text-center text-[10px] text-[var(--drishti-sub)]">
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
                          className="rounded-lg border border-white/10 bg-black/40 p-2.5 transition hover:border-white/25"
                        >
                          <div className="flex items-center gap-2">
                            <AvatarCircle name={student.name} color={student.avatarColor} />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[12px] font-semibold text-white">
                                {student.name}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-[var(--drishti-sub)]">
                                <Building2 className="h-2.5 w-2.5" />
                                <span className="truncate">
                                  {job.company} · {job.role}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <FitScoreBadge score={fit} />
                            <span className="text-[10px] text-[var(--drishti-sub)]">
                              {job.ctc}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!prev}
                              onClick={() => prev && moveApplication(app.id, prev)}
                              className="h-7 flex-1 border-white/10 bg-white/5 px-2 text-[10px] text-white/70 hover:bg-white/10"
                            >
                              <ChevronLeft className="h-3 w-3" /> Back
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!next}
                              onClick={() => next && moveApplication(app.id, next)}
                              className="h-7 flex-1 px-2 text-[10px]"
                              style={
                                next
                                  ? {
                                      borderColor: `${accent.dot}66`,
                                      background: `${accent.dot}14`,
                                      color: accent.dot,
                                    }
                                  : {
                                      borderColor: "rgba(255,255,255,0.1)",
                                      background: "rgba(255,255,255,0.04)",
                                      color: "rgba(255,255,255,0.4)",
                                    }
                              }
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
