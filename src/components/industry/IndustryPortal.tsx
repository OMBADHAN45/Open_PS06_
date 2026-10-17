"use client";

import { useState, useEffect } from "react";
import { PortalShell, PortalHeader, NavItem } from "@/components/shell/PortalShell";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import {
  BarChart3,
  Briefcase,
  Users,
  Search,
  RefreshCw,
  TrendingUp,
  Wand2,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { DashboardTab } from "./DashboardTab";
import { JobsTab } from "./JobsTab";
import { CandidatesTab } from "./CandidatesTab";
import { ProofInspectorTab } from "./ProofInspectorTab";
import { PipelineTab } from "./PipelineTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { CompanyOnboarding } from "./CompanyOnboarding";

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
  const companyPayload = useAppStore((s) => s.companyPayload);
  const setCompanyOnboardingOpen = useAppStore((s) => s.setCompanyOnboardingOpen);

  // Sync tab with browser history for back/forward buttons
  const handleTabChange = (newTab: IndustryTab) => {
    setTab(newTab);
    if (typeof window !== "undefined") {
      window.history.pushState(
        { view: "industry", tab: newTab },
        "",
        `/industry?tab=${newTab}`
      );
    }
  };

  useEffect(() => {
    // Initial sync from URL search params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") as IndustryTab | null;
      if (urlTab && TABS.some((t) => t.id === urlTab)) {
        setTab(urlTab);
      }
    }

    const onPop = (e: PopStateEvent) => {
      if (e.state?.tab && TABS.some((t) => t.id === e.state.tab)) {
        setTab(e.state.tab);
      } else if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlTab = params.get("tab") as IndustryTab | null;
        if (urlTab && TABS.some((t) => t.id === urlTab)) {
          setTab(urlTab);
        } else {
          setTab("dashboard");
        }
      }
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <PortalShell
      header={
        <PortalHeader
          title="Industry Portal"
          subtitle="Don't hire the best-looking resume. Hire the best-proven skills."
          right={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setCompanyOnboardingOpen(true)}
                className="border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100/80 font-semibold shadow-xs transition cursor-pointer"
              >
                <Building2 className="h-3.5 w-3.5 text-amber-600" />
                <span className="hidden md:inline">
                  {companyPayload.verificationStatus === "Verified"
                    ? `${companyPayload.companyName}`
                    : "Company Verification"}
                </span>
                <span className="md:hidden">Onboarding</span>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setTab("jobs")}
                className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium shadow-xs"
              >
                <Wand2 className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Demo: Load Sample JD</span>
                <span className="sm:hidden">Sample JD</span>
              </Button>
            </div>
          }
        />
      }
      sidebar={
        <nav className="space-y-1">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Recruiter Console
          </div>
          {TABS.map((t) => (
            <NavItem
              key={t.id}
              active={tab === t.id}
              onClick={() => handleTabChange(t.id)}
              icon={t.icon}
              label={t.label}
            />
          ))}

          <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-[11px] leading-relaxed text-slate-600 shadow-xs">
            <span className="font-bold text-indigo-600">●</span> All scores are
            computed from verified GitHub commits, proctored assessments & faculty rubrics — never
            self-reported.
          </div>
        </nav>
      }
    >
      <div className="mx-auto max-w-7xl">
        {tab === "dashboard" && <DashboardTab onGoInspector={() => handleTabChange("inspector")} />}
        {tab === "jobs" && <JobsTab onGoCandidates={() => handleTabChange("candidates")} />}
        {tab === "candidates" && <CandidatesTab />}
        {tab === "inspector" && <ProofInspectorTab onPickFromCandidates={() => handleTabChange("candidates")} />}
        {tab === "pipeline" && <PipelineTab />}
        {tab === "analytics" && <AnalyticsTab />}
      </div>

      {/* 4-Step Company / Recruiter Registration & Onboarding Pipeline */}
      <CompanyOnboarding />
    </PortalShell>
  );
}
