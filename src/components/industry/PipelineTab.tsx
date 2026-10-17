"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { PIPELINE_STAGES, type Application, type ApplicationStage, type StudentProfile, type JobOpening } from "@/lib/mock-data";
import { AvatarCircle, FitScoreBadge } from "@/components/shared/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, Users, RotateCw, Building2 } from "lucide-react";

const STAGE_META: Record<ApplicationStage, { color: string; label: string; description: string }> = {
  Applied: { color: "#a2a9b8", label: "Applied", description: "Application received" },
  Shortlisted: { color: "#9fe0ff", label: "Shortlisted", description: "Past resume screen" },
  Assessment: { color: "#f59e0b", label: "Assessment", description: "Proctored test scheduled" },
  "Technical Interview": { color: "#ffe2b2", label: "Technical Interview", description: "Live coding round" },
  "HR Interview": { color: "#10b981", label: "HR Interview", description: "Behavioral round" },
  Offer: { color: "#10b981", label: "Offer", description: "Offer extended 🎉" },
};

export function PipelineTab() {
  const applications = useAppStore((s) => s.applications);
  const students = useAppStore((s) => s.students);
  const jobs = useAppStore((s) => s.jobs);
  const moveApplication = useAppStore((s) => s.moveApplication);

  const byStage = useMemo(() => {
    const map: Record<ApplicationStage, (Application & { student?: StudentProfile; job?: JobOpening })[]> = {
      Applied: [],
      Shortlisted: [],
      Assessment: [],
      "Technical Interview": [],
      "HR Interview": [],
      Offer: [],
    };
    for (const a of applications) {
      const student = students.find((s) => s.id === a.studentId);
      const job = jobs.find((j) => j.id === a.jobId);
      map[a.stage].push({ ...a, student, job });
    }
    return map;
  }, [applications, students, jobs]);

  const stageIndex = (stage: ApplicationStage) => PIPELINE_STAGES.indexOf(stage);

  const advance = (a: Application) => {
    const i = stageIndex(a.stage);
    if (i < PIPELINE_STAGES.length - 1) {
      moveApplication(a.id, PIPELINE_STAGES[i + 1]);
    }
  };
  const back = (a: Application) => {
    const i = stageIndex(a.stage);
    if (i > 0) {
      moveApplication(a.id, PIPELINE_STAGES[i - 1]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Hiring Pipeline — Live Kanban</h1>
          <p className="text-[13px] text-slate-500">
            Move candidates through the funnel. Every change syncs back to the Student Portal and
            TPO Admin in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 shadow-2xs">
          <RotateCw className="h-3 w-3" />
          Synced across portals
        </div>
      </div>

      {/* Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-3">
          {PIPELINE_STAGES.map((stage) => {
            const cards = byStage[stage];
            const meta = STAGE_META[stage];
            return (
              <div key={stage} className="flex w-[280px] shrink-0 flex-col">
                {/* Column header */}
                <div
                  className="mb-2 rounded-lg border p-3 shadow-2xs"
                  style={{ borderColor: `${meta.color}55`, background: `${meta.color}15` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
                      <span className="text-[13px] font-bold text-slate-900">{meta.label}</span>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-bold shadow-2xs"
                      style={{ background: "#ffffff", color: meta.color, border: `1px solid ${meta.color}44` }}
                    >
                      {cards.length}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-500">{meta.description}</div>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2 rounded-lg border border-slate-200 bg-slate-100/60 p-2 min-h-[300px]">
                  {cards.length === 0 ? (
                    <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-[11px] text-slate-400">
                      <Users className="mx-auto mb-1 h-4 w-4 opacity-50" />
                      No applicants in this stage
                    </div>
                  ) : (
                    cards.map((a) => (
                      <PipelineCard
                        key={a.id}
                        app={a}
                        onAdvance={() => advance(a)}
                        onBack={() => back(a)}
                        isFirst={stageIndex(a.stage) === 0}
                        isLast={stageIndex(a.stage) === PIPELINE_STAGES.length - 1}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PipelineCard({
  app,
  onAdvance,
  onBack,
  isFirst,
  isLast,
}: {
  app: Application & { student?: StudentProfile; job?: JobOpening };
  onAdvance: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { student, job } = app;
  if (!student || !job) return null;

  return (
    <Card className="group relative drishti-card rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md p-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-150">
      <CardContent className="p-0 space-y-2">
        {/* Top Row: Avatar + Name & Target Role + Fit Score Badge */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <AvatarCircle name={student.name} color={student.avatarColor} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-slate-900">{student.name}</div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
                <Building2 className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                <span className="truncate">{job.role}</span>
              </div>
            </div>
          </div>
          {typeof app.fitScore === "number" && (
            <FitScoreBadge score={app.fitScore} />
          )}
        </div>

        {/* Compact Visual Skill Pills (max 3) */}
        <div className="flex flex-wrap items-center gap-1">
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

        {/* Company & Date Strip */}
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="truncate max-w-[110px]">{job.company}</span>
          <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
        </div>

        {/* Hover-Revealed Navigation Controls */}
        <div className="flex items-center gap-1 max-h-0 overflow-hidden opacity-0 group-hover:max-h-8 group-hover:opacity-100 transition-all duration-200 pt-0.5">
          <Button
            size="sm"
            variant="outline"
            onClick={onBack}
            disabled={isFirst}
            className="h-6.5 flex-1 border-slate-200 bg-slate-50 px-1.5 text-[10px] text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer disabled:opacity-30"
          >
            <ArrowLeft className="h-3 w-3 mr-0.5" /> Back
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onAdvance}
            disabled={isLast}
            className="h-6.5 flex-1 px-1.5 text-[10px] font-semibold border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 cursor-pointer disabled:opacity-30"
          >
            Advance <ArrowRight className="h-3 w-3 ml-0.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
