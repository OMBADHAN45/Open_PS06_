"use client";

import { useMemo } from "react";
import { useAppStore, PIPELINE_STAGES } from "@/lib/store";
import type { ApplicationStage } from "@/lib/mock-data";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  PieChart as PieIcon,
  Layers3,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const C = {
  gold: "#ffe2b2",
  blue: "#9fe0ff",
  emerald: "#10b981",
  crimson: "#ef4444",
  amber: "#f59e0b",
  violet: "#a78bfa",
  cyan: "#22d3ee",
};

const PIPELINE_COLORS: Record<ApplicationStage, string> = {
  Applied: C.blue,
  Shortlisted: C.gold,
  Assessment: C.amber,
  "Technical Interview": C.violet,
  "HR Interview": C.cyan,
  Offer: C.emerald,
};

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(8,12,22,0.96)",
  border: "1px solid rgba(196,214,232,0.18)",
  borderRadius: "10px",
  color: "#fff",
  fontSize: 12,
  padding: "8px 10px",
};

function ChartCard({
  title,
  subtitle,
  icon,
  accent,
  children,
  height = 260,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <div className="drishti-card flex flex-col rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `${accent}1a`, color: accent }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-[11px] text-[var(--drishti-sub)]">{subtitle}</p>}
        </div>
      </div>
      <div style={{ width: "100%", height }} className="min-w-0">
        {children}
      </div>
    </div>
  );
}

export function DriveAnalyticsTab() {
  const jobs = useAppStore((s) => s.jobs);
  const applications = useAppStore((s) => s.applications);
  const students = useAppStore((s) => s.students);

  /* ---------- Chart 1: Offer Conversions by Company ---------- */
  const offerData = useMemo(() => {
    return jobs.map((j) => {
      const apps = applications.filter((a) => a.jobId === j.id);
      const offers = apps.filter((a) => a.stage === "Offer").length;
      return {
        company: j.company,
        applications: apps.length,
        offers,
      };
    });
  }, [jobs, applications]);

  /* ---------- Chart 2: Pipeline Distribution ---------- */
  const pipelineData = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => ({
      name: stage,
      value: applications.filter((a) => a.stage === stage).length,
      color: PIPELINE_COLORS[stage],
    }));
  }, [applications]);

  /* ---------- Chart 3: Institution Skill Coverage ---------- */
  const skillCoverage = useMemo(() => {
    const map = new Map<string, { verified: number; claimed: number }>();
    for (const st of students) {
      for (const sk of st.skills) {
        const entry = map.get(sk.canonical) ?? { verified: 0, claimed: 0 };
        entry.claimed += 1;
        if (sk.status === "verified") entry.verified += 1;
        map.set(sk.canonical, entry);
      }
    }
    return Array.from(map.entries())
      .map(([skill, v]) => ({
        skill,
        verified: v.verified,
        unverified: v.claimed - v.verified,
        total: v.claimed,
      }))
      .sort((a, b) => b.total - a.total);
  }, [students]);

  /* ---------- Chart 4: Verification Health (donut) ---------- */
  const verificationHealth = useMemo(() => {
    let verified = 0;
    let unverified = 0;
    let failed = 0;
    for (const st of students) {
      for (const sk of st.skills) {
        if (sk.status === "verified") verified++;
        else if (sk.status === "failed") failed++;
        else unverified++;
      }
    }
    const total = verified + unverified + failed || 1;
    return {
      verified,
      unverified,
      failed,
      total,
      pct: Math.round((verified / total) * 100),
      // Simulated blocked claims count (consistent with AuditLogTab's simulated blocks)
      blockedClaims: 4,
    };
  }, [students]);

  const healthDonutData = [
    { name: "Verified", value: verificationHealth.verified, color: C.emerald },
    { name: "Unverified", value: verificationHealth.unverified, color: C.amber },
    { name: "Failed / Stripped", value: verificationHealth.failed, color: C.crimson },
  ];

  return (
    <div className="space-y-5">
      {/* Top KPI strip for analytics */}
      <div className="drishti-card flex flex-col gap-4 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9fe0ff]/10 text-[#9fe0ff]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-white">Drive Analytics</div>
            <div className="text-[11px] text-[var(--drishti-sub)]">
              Institution-wide placement intelligence across {jobs.length} active drives
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-[12px]">
          <Stat label="Verified Skills" value={verificationHealth.verified} color={C.emerald} />
          <Stat label="Unverified" value={verificationHealth.unverified} color={C.amber} />
          <Stat label="Stripped (failed)" value={verificationHealth.failed} color={C.crimson} />
          <Stat label="Blocked Claims" value={verificationHealth.blockedClaims} color={C.gold} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Chart 1 — Offer Conversions by Company */}
        <ChartCard
          title="Offer Conversions by Company"
          subtitle="Applications vs offers per drive"
          icon={<BarChart3 className="h-4 w-4" />}
          accent={C.blue}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={offerData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="company"
                tick={{ fill: "#a2a9b8", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                interval={0}
                angle={-12}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: "#a2a9b8", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                allowDecimals={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#a2a9b8" }} />
              <Bar dataKey="applications" name="Applications" fill={C.blue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="offers" name="Offers" fill={C.emerald} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2 — Pipeline Distribution */}
        <ChartCard
          title="Pipeline Distribution"
          subtitle="Applications across placement stages"
          icon={<PieIcon className="h-4 w-4" />}
          accent={C.gold}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pipelineData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={48}
                paddingAngle={2}
                stroke="rgba(2,6,15,0.6)"
              >
                {pipelineData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 10, color: "#a2a9b8" }} iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3 — Institution Skill Coverage */}
        <ChartCard
          title="Institution Skill Coverage"
          subtitle="Verified students vs unverified claims per skill"
          icon={<Layers3 className="h-4 w-4" />}
          accent={C.emerald}
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={skillCoverage}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "#a2a9b8", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="skill"
                tick={{ fill: "#a2a9b8", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                width={90}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#a2a9b8" }} />
              <Bar dataKey="verified" name="Verified" stackId="a" fill={C.emerald} radius={[0, 0, 0, 0]} />
              <Bar dataKey="unverified" name="Unverified" stackId="a" fill={C.amber} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4 — Verification Health donut */}
        <ChartCard
          title="Verification Health"
          subtitle="Institution-wide verified vs blocked claims"
          icon={<ShieldCheck className="h-4 w-4" />}
          accent={C.crimson}
        >
          <div className="flex h-full flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
            <div className="relative h-[180px] w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthDonutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={84}
                    paddingAngle={3}
                    stroke="rgba(2,6,15,0.7)"
                  >
                    {healthDonutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[22px] font-bold text-white">{verificationHealth.pct}%</div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--drishti-sub)]">Verified</div>
              </div>
            </div>
            <div className="flex w-full flex-col gap-1.5 text-[12px] sm:w-auto">
              <Legend2 color={C.emerald} label="Verified" value={verificationHealth.verified} />
              <Legend2 color={C.amber} label="Unverified" value={verificationHealth.unverified} />
              <Legend2 color={C.crimson} label="Failed / Stripped" value={verificationHealth.failed} />
              <Legend2 color={C.gold} label="Blocked Resume Claims" value={verificationHealth.blockedClaims} />
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="text-[11px] text-[var(--drishti-sub)]">{label}</span>
      <span className="text-[13px] font-bold text-white">{value}</span>
    </div>
  );
}

function Legend2({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
        <span className="text-[11px] text-white/80">{label}</span>
      </div>
      <span className="text-[12px] font-bold text-white">{value}</span>
    </div>
  );
}
