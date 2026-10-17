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

const GOLD = "#4f46e5";
const BLUE = "#0ea5e9";
const EMERALD = "#10b981";
const CRIMSON = "#ef4444";
const AMBER = "#f59e0b";

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  color: "#0f172a",
  fontSize: "12px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
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
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Analytics — Batch Intelligence</h1>
        <p className="text-[13px] text-slate-500">
          Cross-batch signal: which skills are actually verified vs merely claimed, where candidates
          stall in your funnel, and the recurring skill gaps blocking offers.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill distribution */}
        <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-sky-600" />
              <h2 className="text-[14px] font-bold text-slate-900">Batch Skill Distribution</h2>
              <span className="ml-auto text-[11px] text-slate-400">
                verified vs blocked claims per skill
              </span>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillDist} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="skill"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                  <RTooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(99, 102, 241, 0.05)" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="verified" name="Verified" stackId="a" fill={EMERALD} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="blocked" name="Blocked / unverified" stackId="a" fill={CRIMSON} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="blocked" position="top" fill="#64748b" fontSize={10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              <span className="font-semibold text-emerald-600">{skillDist.reduce((a, b) => a + b.verified, 0)}</span> verified ·{" "}
              <span className="font-semibold text-rose-600">{skillDist.reduce((a, b) => a + b.blocked, 0)}</span> blocked
            </div>
          </CardContent>
        </Card>

        {/* Hiring velocity */}
        <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <h2 className="text-[14px] font-bold text-slate-900">Hiring Velocity</h2>
              <span className="ml-auto text-[11px] text-slate-400">
                applications per pipeline stage
              </span>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocity} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="stage" tick={{ fill: "#64748b", fontSize: 10 }} angle={-15} textAnchor="end" height={50} interval={0} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                  <RTooltip contentStyle={tooltipStyle} cursor={{ stroke: "#4f46e5", strokeOpacity: 0.4 }} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Candidates"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fill="url(#velocityGrad)"
                    dot={{ fill: "#4f46e5", r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Total in pipeline: <span className="font-semibold text-indigo-600">{applications.length}</span> ·{" "}
              Offers: <span className="font-semibold text-emerald-600">{applications.filter((a) => a.stage === "Offer").length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top missing skill gaps — full width */}
      <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-[14px] font-bold text-slate-900">Top Missing Skill Gaps</h2>
            <span className="ml-auto text-[11px] text-slate-400">
              recurring required-skill gaps across all applications
            </span>
          </div>
          {gaps.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-[12px] text-slate-400">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    width={120}
                  />
                  <RTooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(99, 102, 241, 0.05)" }} />
                  <Bar dataKey="count" name="Missing in" radius={[0, 4, 4, 0]} fill={AMBER}>
                    <LabelList dataKey="count" position="right" fill="#64748b" fontSize={11} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-2 text-[11px] text-slate-500">
            💡 Suggest the TPO organize targeted workshops for{" "}
            <span className="font-semibold text-amber-600">
              {gaps.slice(0, 3).map((g) => g.skill).join(", ")}
            </span>{" "}
            to close the biggest gaps.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
