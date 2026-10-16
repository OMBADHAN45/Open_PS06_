"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { PortalHeader, PortalShell, NavItem } from "@/components/shell/PortalShell";
import { ProfileSkillTab } from "./ProfileSkillTab";
import { ProctoringTab } from "./ProctoringTab";
import { SmartJobFeedTab } from "./SmartJobFeedTab";
import { ResumeStudioTab } from "./ResumeStudioTab";
import { ApplicationTrackerTab } from "./ApplicationTrackerTab";
import { Badge } from "@/components/ui/badge";
import { AvatarCircle } from "@/components/shared/primitives";
import { FolderGit2, ShieldCheck, Briefcase, FileText, KanbanSquare, Github, GraduationCap, ChevronsUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

type Tab = "profile" | "assess" | "jobs" | "resume" | "tracker";

export function StudentPortal() {
  const [tab, setTab] = useState<Tab>("profile");
  const activeStudentId = useAppStore((s) => s.activeStudentId);
  const setActiveStudent = useAppStore((s) => s.setActiveStudent);
  const students = useAppStore((s) => s.students);
  const student = students.find((s) => s.id === activeStudentId) ?? students[0];

  // listen for goto-tab events from other tabs
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Tab;
      if (detail) setTab(detail);
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
                    <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[12px] text-white hover:bg-white/10">
                      <AvatarCircle name={student.name} color={student.avatarColor} />
                      <div className="hidden text-left sm:block">
                        <div className="text-[12px] font-semibold leading-tight">{student.name}</div>
                        <div className="text-[10px] text-[var(--drishti-sub)]">{student.branch} · {student.batch}</div>
                      </div>
                      <ChevronsUpDown className="h-3 w-3 text-[var(--drishti-sub)]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#0a0f1c] text-white">
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Demo: Switch Student</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {students.map((st) => (
                      <DropdownMenuItem key={st.id} onClick={() => setActiveStudent(st.id)} className="cursor-pointer gap-2 focus:bg-white/10">
                        <AvatarCircle name={st.name} color={st.avatarColor} />
                        <div className="flex-1">
                          <div className="text-[12px] font-medium">{st.name}</div>
                          <div className="text-[10px] text-[var(--drishti-sub)]">{st.branch} · {st.verificationScore}%</div>
                        </div>
                        {st.id === activeStudentId && <span className="text-[10px] text-[var(--drishti-blue)]">●</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Badge className="hidden border-emerald-500/40 bg-emerald-500/10 text-emerald-400 sm:inline-flex"><Github className="mr-1 h-3 w-3" /> GitHub Connected ✓</Badge>
                <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[11px] text-[var(--drishti-sub)]">Verification</span>
                  <span className="text-[13px] font-bold" style={{ color: student.verificationScore >= 85 ? "#10b981" : student.verificationScore >= 70 ? "#f59e0b" : "#ef4444" }}>{student.verificationScore}%</span>
                </div>
              </div>
            )
          }
        />
      }
      sidebar={
        <nav className="space-y-1">
          <div className="mb-2 px-2 text-[10px] uppercase tracking-wider text-[var(--drishti-sub)]">Student</div>
          {tabs.map((t) => (
            <NavItem key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} icon={t.icon} label={t.label} />
          ))}
          <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-white"><GraduationCap className="h-3.5 w-3.5 text-[var(--drishti-blue)]" /> Hackathon Demo Tip</div>
            <p className="text-[10.5px] leading-relaxed text-[var(--drishti-sub)]">Switch to Mayur or Viraj to see different verification scores & skill gaps.</p>
          </div>
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
