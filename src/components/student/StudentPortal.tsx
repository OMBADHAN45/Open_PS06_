"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { PortalHeader, PortalShell, NavItem } from "@/components/shell/PortalShell";
import { ProfileSkillTab } from "./ProfileSkillTab";
import { ProctoringTab } from "./ProctoringTab";
import { SmartJobFeedTab } from "./SmartJobFeedTab";
import { ResumeStudioTab } from "./ResumeStudioTab";
import { ApplicationTrackerTab } from "./ApplicationTrackerTab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarCircle } from "@/components/shared/primitives";
import { FolderGit2, ShieldCheck, Briefcase, FileText, KanbanSquare, Github, ChevronsUpDown, UserPlus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

type Tab = "profile" | "assess" | "jobs" | "resume" | "tracker";

export function StudentPortal() {
  const [tab, setTab] = useState<Tab>("profile");
  const activeStudentId = useAppStore((s) => s.activeStudentId);
  const setActiveStudent = useAppStore((s) => s.setActiveStudent);
  const setStudentOnboardingModalOpen = useAppStore((s) => s.setStudentOnboardingModalOpen);
  const students = useAppStore((s) => s.students);
  const student = students.find((s) => s.id === activeStudentId) ?? students[0];

  // Sync tab with browser history for back/forward buttons
  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    if (typeof window !== "undefined") {
      window.history.pushState(
        { view: "student", tab: newTab },
        "",
        `/student?tab=${newTab}`
      );
    }
  };

  useEffect(() => {
    // Initial sync from URL search params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") as Tab | null;
      if (urlTab && tabs.some((t) => t.id === urlTab)) {
        setTab(urlTab);
      }
    }

    const onPop = (e: PopStateEvent) => {
      if (e.state?.tab && tabs.some((t) => t.id === e.state.tab)) {
        setTab(e.state.tab);
      } else if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlTab = params.get("tab") as Tab | null;
        if (urlTab && tabs.some((t) => t.id === urlTab)) {
          setTab(urlTab);
        } else {
          setTab("profile");
        }
      }
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // listen for goto-tab events from other tabs
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Tab;
      if (detail) handleTabChange(detail);
    };
    window.addEventListener("drishti:goto-tab", handler as EventListener);
    return () => window.removeEventListener("drishti:goto-tab", handler as EventListener);
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile & Skill Selection", icon: <FolderGit2 className="h-4 w-4" /> },
    { id: "assess", label: "Assessment & Proctoring", icon: <ShieldCheck className="h-4 w-4" /> },
    { id: "jobs", label: "Smart Job Feed", icon: <Briefcase className="h-4 w-4" /> },
    { id: "resume", label: "Resume Studio", icon: <FileText className="h-4 w-4" /> },
    { id: "tracker", label: "Application Tracker & Prep", icon: <KanbanSquare className="h-4 w-4" /> },
  ];

  return (
    <PortalShell
      header={
        <PortalHeader
          title="Student Portal"
          subtitle="Proof Over Claims, Zero Inflation."
          right={
            student && (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-2.5 py-1 text-[12px] text-slate-800 hover:bg-slate-50 shadow-xs cursor-pointer">
                      <AvatarCircle name={student.name} color={student.avatarColor} />
                      <div className="hidden text-left sm:block">
                        <div className="text-[12px] font-semibold leading-tight text-slate-900">{student.name}</div>
                        <div className="text-[10px] text-slate-500">{student.branch} · {student.batch}</div>
                      </div>
                      <ChevronsUpDown className="h-3 w-3 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-slate-200 bg-white text-slate-900 shadow-xl">
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-slate-400">Demo: Switch Student</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-100" />
                    {students.map((st) => (
                      <DropdownMenuItem key={st.id} onClick={() => setActiveStudent(st.id)} className="cursor-pointer gap-2 focus:bg-indigo-50/60 focus:text-indigo-900">
                        <AvatarCircle name={st.name} color={st.avatarColor} />
                        <div className="flex-1">
                          <div className="text-[12px] font-semibold text-slate-900">{st.name}</div>
                          <div className="text-[10px] text-slate-500">{st.branch} · {st.verificationScore}%</div>
                        </div>
                        {st.id === activeStudentId && <span className="text-[10px] text-indigo-600 font-bold">●</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStudentOnboardingModalOpen(true)}
                  className="hidden md:inline-flex border-indigo-200 bg-indigo-50/60 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100/70 shadow-xs cursor-pointer"
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5 text-indigo-600" />
                  Onboarding Pipeline
                </Button>
                <Badge className="hidden border-emerald-200 bg-emerald-100 text-emerald-800 shadow-xs sm:inline-flex font-semibold">
                  <Github className="mr-1 h-3 w-3 text-emerald-700" /> GitHub Connected ✓
                </Badge>
                <div className="flex items-center gap-1.5 rounded-full border border-indigo-100 bg-white px-2.5 py-1 shadow-xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[11px] text-slate-500">Verification</span>
                  <span className="text-[13px] font-bold" style={{ color: student.verificationScore >= 85 ? "#059669" : student.verificationScore >= 70 ? "#d97706" : "#dc2626" }}>
                    {student.verificationScore}%
                  </span>
                </div>
              </div>
            )
          }
        />
      }
      sidebar={
        <nav className="space-y-1">
          <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Navigation</div>
          {tabs.map((t) => (
            <NavItem key={t.id} active={tab === t.id} onClick={() => handleTabChange(t.id)} icon={t.icon} label={t.label} />
          ))}
        </nav>
      }
    >
      {tab === "profile" && <ProfileSkillTab />}
      {tab === "assess" && <ProctoringTab />}
      {tab === "jobs" && <SmartJobFeedTab />}
      {tab === "resume" && <ResumeStudioTab />}
      {tab === "tracker" && <ApplicationTrackerTab />}
    </PortalShell>
  );
}
