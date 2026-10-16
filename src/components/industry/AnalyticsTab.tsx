"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { computeFit } from "@/lib/fit-score";
import { PIPELINE_STAGES } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  LabelList,
} from "recharts";
import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react";

const GOLD = "#ffe2b2";
const BLUE = "#9fe0ff";
const EMERALD = "#10b981";
const CRIMSON = "#ef4444";
const AMBER = "#f59e0b";

const tooltipStyle = {
  background: "#0a0f1c",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
};

export function AnalyticsTab() {
  const students = useAppStore((s) => s.students);
  const jobs = useAppStore((s) => s.jobs);
  const applications = useAppStore((s) => s.applications);
  const weights = useAppStore((s) => s.weights);

  /* 1) Skill distribution: verified vs blocked (failed/unverified) claims per skill */
  const skillDist = useMemo(() => {
    const verified = new Map<string, number>();
    const blocked = new Map<string, number>();
    for (const s of students) {
      for (const sk of s.skills) {
        if (sk.status === "verified") {
          verified.set(sk.canonical, (verified.get(sk.canonical) ?? 0) + 1);
        } else {
          blocked.set(sk.canonical, (blocked.get(sk.canonical) ?? 0) + 1);
        }
      }
    }
    const all = new Set<string>([...verified.keys(), ...blocked.keys()]);
    return Array.from(all)
      .map((skill) => ({
        skill,
        verified: verified.get(skill) ?? 0,
        blocked: blocked.get(skill) ?? 0,
      }))
      .sort((a, b) => b.verified + b.blocked - (a.verified + a.blocked))
      .slice(0, 8);
  }, [students]);

  /* 2) Hiring velocity: applications per pipeline stage */
  const velocity = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => ({
      stage: stage.length > 12 ? stage.replace(" Interview", "") : stage,
      count: applications.filter((a) => a.stage === stage).length,
    }));
  }, [applications]);

  /* 3) Top missing skill gaps — across all applications */
  const gaps = useMemo(() => {
    const counts = new Map<string, number>();
    for (const app of applications) {
      const student = students.find((s) => s.id === app.studentId);
      const job = jobs.find((j) => j.id === app.jobId);
      if (!student || !job) continue;
      const fit = computeFit(student, job, weights);
      for (const missing of fit.missingRequired) {
        counts.set(missing, (counts.get(missing) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [applications, students, jobs, weights]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white sm:text-2xl">Analytics — Batch Intelligence</h1>
        <p className="text-[13px] text-[var(--drishti-sub)]">
          Cross-batch signal: which skills are actually verified vs merely claimed, where candidates
          stall in your funnel, and the recurring skill gaps blocking offers.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill distribution */}
        <Card className="drishti-card border-white/10 bg-white/[0.03]">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[var(--drishti-blue)]" />
              <h2 className="text-[14px] font-bold text-white">Batch Skill Distribution</h2>
              <span className="ml-auto text-[11px] text-[var(--drishti-sub)]">
                verified vs blocked claims per skill
              </span>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillDist} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="skill"
                    tick={{ fill: "#a2a9b8", fontSize: 10 }}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis tick={{ fill: "#a2a9b8", fontSize: 11 }} allowDecimals={false} />
                  <RTooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="verified" name="Verified" stackId="a" fill={EMERALD} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="blocked" name="Blocked / unverified" stackId="a" fill={CRIMSON} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="blocked" position="top" fill="#a2a9b8" fontSize={10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[11px] text-[var(--drishti-sub)]">
              <span className="font-semibold text-emerald-400">{skillDist.reduce((a, b) => a + b.verified, 0)}</span> verified ·{" "}
              <span className="font-semibold text-red-400">{skillDist.reduce((a, b) => a + b.blocked, 0)}</span> blocked
            </div>
          </CardContent>
        </Card>

        {/* Hiring velocity */}
        <Card className="drishti-card border-white/10 bg-white/[0.03]">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--drishti-gold)]" />
              <h2 className="text-[14px] font-bold text-white">Hiring Velocity</h2>
              <span className="ml-auto text-[11px] text-[var(--drishti-sub)]">
                applications per pipeline stage
              </span>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocity} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GOLD} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={GOLD} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="stage" tick={{ fill: "#a2a9b8", fontSize: 10 }} angle={-15} textAnchor="end" height={50} interval={0} />
                  <YAxis tick={{ fill: "#a2a9b8", fontSize: 11 }} allowDecimals={false} />
                  <RTooltip contentStyle={tooltipStyle} cursor={{ stroke: GOLD, strokeOpacity: 0.4 }} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Candidates"
                    stroke={GOLD}
                    strokeWidth={2}
                    fill="url(#velocityGrad)"
                    dot={{ fill: GOLD, r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[11px] text-[var(--drishti-sub)]">
              Total in pipeline: <span className="font-semibold text-[var(--drishti-gold)]">{applications.length}</span> ·{" "}
              Offers: <span className="font-semibold text-emerald-400">{applications.filter((a) => a.stage === "Offer").length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top missing skill gaps — full width */}
      <Card className="drishti-card border-white/10 bg-white/[0.03]">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[var(--drishti-amber)]" />
            <h2 className="text-[14px] font-bold text-white">Top Missing Skill Gaps</h2>
            <span className="ml-auto text-[11px] text-[var(--drishti-sub)]">
              recurring required-skill gaps across all applications
            </span>
          </div>
          {gaps.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-[12px] text-[var(--drishti-sub)]">
              No skill gaps detected — every applicant meets every required skill. Try posting more challenging jobs.
            </div>
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={gaps}
                  margin={{ top: 8, right: 24, bottom: 8, left: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#a2a9b8", fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    tick={{ fill: "#a2a9b8", fontSize: 11 }}
                    width={120}
                  />
                  <RTooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="count" name="Missing in" radius={[0, 4, 4, 0]} fill={AMBER}>
                    <LabelList dataKey="count" position="right" fill="#a2a9b8" fontSize={11} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-2 text-[11px] text-[var(--drishti-sub)]">
            💡 Suggest the TPO organize targeted workshops for{" "}
            <span className="font-semibold text-[var(--drishti-amber)]">
              {gaps.slice(0, 3).map((g) => g.skill).join(", ")}
            </span>{" "}
            to close the biggest gaps.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
