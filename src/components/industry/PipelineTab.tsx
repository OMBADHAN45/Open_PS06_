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
          <h1 className="text-xl font-bold text-white sm:text-2xl">Hiring Pipeline — Live Kanban</h1>
          <p className="text-[13px] text-[var(--drishti-sub)]">
            Move candidates through the funnel. Every change syncs back to the Student Portal and
            TPO Admin in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[var(--drishti-emerald)]/30 bg-[var(--drishti-emerald)]/10 px-3 py-1.5 text-[11px] font-semibold text-[var(--drishti-emerald)]">
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
                  className="mb-2 rounded-lg border p-3"
                  style={{ borderColor: `${meta.color}44`, background: `${meta.color}12` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
                      <span className="text-[13px] font-bold text-white">{meta.label}</span>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                      style={{ background: `${meta.color}22`, color: meta.color }}
                    >
                      {cards.length}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px] text-[var(--drishti-sub)]">{meta.description}</div>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2 rounded-lg border border-dashed border-white/10 bg-white/[0.01] p-2">
                  {cards.length === 0 ? (
                    <div className="rounded-md border border-dashed border-white/10 p-4 text-center text-[10px] text-[var(--drishti-sub)]/60">
                      <Users className="mx-auto mb-1 h-4 w-4 opacity-50" />
                      empty
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
    <Card className="drishti-card border-white/10 bg-white/[0.03] transition hover:border-white/20">
      <CardContent className="space-y-2 p-3">
        <div className="flex items-center gap-2">
          <AvatarCircle name={student.name} color={student.avatarColor} />
          <div className="min-w-0">
            <div className="truncate text-[12px] font-semibold text-white">{student.name}</div>
            <div className="truncate text-[10px] text-[var(--drishti-sub)]">{student.branch}</div>
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-black/20 p-2">
          <div className="flex items-center gap-1 text-[10px] text-[var(--drishti-sub)]">
            <Building2 className="h-2.5 w-2.5" />
            {job.company}
          </div>
          <div className="truncate text-[12px] font-medium text-white">{job.role}</div>
        </div>

        {typeof app.fitScore === "number" && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[var(--drishti-sub)]">
              Fit
            </span>
            <FitScoreBadge score={app.fitScore} />
          </div>
        )}

        <div className="flex items-center justify-between gap-1 border-t border-white/5 pt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={onBack}
                disabled={isFirst}
                className="h-7 px-2 text-[var(--drishti-sub)] hover:text-white disabled:opacity-30"
              >
                <ArrowLeft className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0a0f1c] text-[11px] text-white">
              Move back to {PIPELINE_STAGES[Math.max(0, PIPELINE_STAGES.indexOf(app.stage) - 1)]}
            </TooltipContent>
          </Tooltip>

          <span className="text-[10px] text-[var(--drishti-sub)]">
            {new Date(app.appliedAt).toLocaleDateString()}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={onAdvance}
                disabled={isLast}
                className="h-7 px-2 text-[var(--drishti-emerald)] hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-30"
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0a0f1c] text-[11px] text-white">
              Advance to {PIPELINE_STAGES[Math.min(PIPELINE_STAGES.length - 1, PIPELINE_STAGES.indexOf(app.stage) + 1)]}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}
