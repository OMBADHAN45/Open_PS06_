"use client";

import { useState, useEffect } from "react";
import { PortalHeader, PortalShell, NavItem } from "@/components/shell/PortalShell";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import {
  Inbox,
  Calculator,
  KanbanSquare,
  ScrollText,
  BarChart3,
  Landmark,
} from "lucide-react";
import { IngestionTab } from "./IngestionTab";
import { BatchRankerTab } from "./BatchRankerTab";
import { MasterPipelineTab } from "./MasterPipelineTab";
import { AuditLogTab } from "./AuditLogTab";
import { DriveAnalyticsTab } from "./DriveAnalyticsTab";

type TabId = "ingestion" | "ranker" | "pipeline" | "audit" | "analytics";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "ingestion", label: "Multi-Source Job Ingestion & Deduplication", icon: <Inbox className="h-4 w-4" /> },
  { id: "ranker", label: "1-Click Batch Ranker", icon: <Calculator className="h-4 w-4" /> },
  { id: "pipeline", label: "Master Placement Pipeline", icon: <KanbanSquare className="h-4 w-4" /> },
  { id: "audit", label: "Audit Log & Violations", icon: <ScrollText className="h-4 w-4" /> },
  { id: "analytics", label: "Drive Analytics", icon: <BarChart3 className="h-4 w-4" /> },
];

export function TpoPortal() {
  const [tab, setTab] = useState<TabId>("ingestion");
  const rawSources = useAppStore((s) => s.rawSources);
  const applications = useAppStore((s) => s.applications);
  const offers = applications.filter((a) => a.stage === "Offer").length;

  // Sync tab with browser history for back/forward buttons
  const handleTabChange = (newTab: TabId) => {
    setTab(newTab);
    if (typeof window !== "undefined") {
      window.history.pushState(
        { view: "tpo", tab: newTab },
        "",
        `/tpo?tab=${newTab}`
      );
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") as TabId | null;
      if (urlTab && TABS.some((t) => t.id === urlTab)) {
        setTab(urlTab);
      }
    }

    const onPop = (e: PopStateEvent) => {
      if (e.state?.tab && TABS.some((t) => t.id === e.state.tab)) {
        setTab(e.state.tab);
      } else if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlTab = params.get("tab") as TabId | null;
        if (urlTab && TABS.some((t) => t.id === urlTab)) {
          setTab(urlTab);
        } else {
          setTab("ingestion");
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
          title={
            <span className="inline-flex items-center gap-2">
              <Landmark className="h-4 w-4 text-emerald-600" />
              TPO Admin Portal
            </span>
          }
          subtitle="One source of truth for campus drives — deduplicated, ranked, audited."
          right={
            <Badge className="hidden border-emerald-200 bg-emerald-100 text-emerald-800 shadow-xs sm:inline-flex font-semibold">
              {rawSources.length} sources · {offers} offers
            </Badge>
          }
        />
      }
      sidebar={
        <nav className="space-y-1">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            TPO Controls
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
        </nav>
      }
    >
      {tab === "ingestion" && <IngestionTab />}
      {tab === "ranker" && <BatchRankerTab />}
      {tab === "pipeline" && <MasterPipelineTab />}
      {tab === "audit" && <AuditLogTab />}
      {tab === "analytics" && <DriveAnalyticsTab />}
    </PortalShell>
  );
}
