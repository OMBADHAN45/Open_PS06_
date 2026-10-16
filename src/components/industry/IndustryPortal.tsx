"use client";

import { useState } from "react";
import { PortalShell, PortalHeader, NavItem } from "@/components/shell/PortalShell";
import { Button } from "@/components/ui/button";
import { BarChart3, Briefcase, Users, Search, RefreshCw, TrendingUp, Wand2 } from "lucide-react";
import { DashboardTab } from "./DashboardTab";
import { JobsTab } from "./JobsTab";
import { CandidatesTab } from "./CandidatesTab";
import { ProofInspectorTab } from "./ProofInspectorTab";
import { PipelineTab } from "./PipelineTab";
import { AnalyticsTab } from "./AnalyticsTab";

export type IndustryTab =
  | "dashboard"
  | "jobs"
  | "candidates"
  | "inspector"
  | "pipeline"
  | "analytics";

const TABS: { id: IndustryTab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "jobs", label: "Jobs", icon: <Briefcase className="h-4 w-4" /> },
  { id: "candidates", label: "Candidates", icon: <Users className="h-4 w-4" /> },
  { id: "inspector", label: "Proof Inspector", icon: <Search className="h-4 w-4" /> },
  { id: "pipeline", label: "Hiring Pipeline", icon: <RefreshCw className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <TrendingUp className="h-4 w-4" /> },
];

export function IndustryPortal() {
  const [tab, setTab] = useState<IndustryTab>("dashboard");

  return (
    <PortalShell
      header={
        <PortalHeader
          title="Industry Portal"
          subtitle="Don't hire the best-looking resume. Hire the best-proven skills."
          right={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTab("jobs")}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <Wand2 className="h-3.5 w-3.5 text-[var(--drishti-gold)]" />
              <span className="hidden sm:inline">Demo: Load Sample JD</span>
              <span className="sm:hidden">Sample JD</span>
            </Button>
          }
        />
      }
      sidebar={
        <nav className="space-y-1">
          <div className="mb-3 px-3 text-[10px] uppercase tracking-[0.18em] text-[var(--drishti-sub)]">
            Recruiter Console
          </div>
          {TABS.map((t) => (
            <NavItem
              key={t.id}
              active={tab === t.id}
              onClick={() => setTab(t.id)}
              icon={t.icon}
              label={t.label}
            />
          ))}
          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-[11px] leading-relaxed text-[var(--drishti-sub)]">
            <span className="font-semibold text-[var(--drishti-gold)]">●</span> All scores are
            computed from verified GitHub commits, proctored assessments & faculty rubrics — never
            self-reported.
          </div>
        </nav>
      }
    >
      <div className="mx-auto max-w-7xl">
        {tab === "dashboard" && <DashboardTab onGoInspector={() => setTab("inspector")} />}
        {tab === "jobs" && <JobsTab onGoCandidates={() => setTab("candidates")} />}
        {tab === "candidates" && <CandidatesTab />}
        {tab === "inspector" && <ProofInspectorTab onPickFromCandidates={() => setTab("candidates")} />}
        {tab === "pipeline" && <PipelineTab />}
        {tab === "analytics" && <AnalyticsTab />}
      </div>
    </PortalShell>
  );
}
