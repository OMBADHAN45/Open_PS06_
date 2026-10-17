"use client";

import { useEffect, useState } from "react";
import { useAppStore, type View } from "@/lib/store";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  GraduationCap,
  Building2,
  Landmark,
  Home,
  FileText,
  ShieldCheck,
  Search,
  Briefcase,
  FolderGit2,
  GitCompareArrows,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const students = useAppStore((s) => s.students);
  const jobs = useAppStore((s) => s.jobs);
  const setActiveStudent = useAppStore((s) => s.setActiveStudent);
  const openInspector = useAppStore((s) => s.openInspector);
  const openProof = useAppStore((s) => s.openProof);
  const setCompanyOnboardingOpen = useAppStore((s) => s.setCompanyOnboardingOpen);
  const setStudentOnboardingModalOpen = useAppStore((s) => s.setStudentOnboardingModalOpen);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigateTo = (v: View, tab?: string) => {
    setView(v);
    setOpen(false);
    if (tab) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("drishti:goto-tab", { detail: tab }));
      }, 50);
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="DRISHTI Command & Search Palette"
      description="Navigate portals, inspect candidates, or run actions instantly"
      className="border-slate-200 bg-white/95 text-slate-900 shadow-2xl backdrop-blur-xl sm:max-w-xl"
    >
      <CommandInput
        placeholder="Type a command, candidate name, skill, or job..."
        className="text-slate-900 placeholder:text-slate-400"
      />
      <CommandList className="max-h-[360px] overflow-y-auto text-slate-900">
        <CommandEmpty className="py-6 text-center text-xs text-slate-400">
          No matching commands, candidates, or jobs found.
        </CommandEmpty>

        {/* Portals & Navigation */}
        <CommandGroup heading="Portals & Roles">
          <CommandItem
            onSelect={() => navigateTo("landing")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900"
          >
            <Home className="h-4 w-4 text-slate-400" />
            <span>Landing Page</span>
            <span className="ml-auto text-[10px] text-slate-400">Home</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("student")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900"
          >
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            <span>Student Portal (Evidence Ledger, ATS Resume, Proctoring)</span>
            <span className="ml-auto text-[10px] font-semibold text-indigo-600">Student</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("industry")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900"
          >
            <Building2 className="h-4 w-4 text-amber-600" />
            <span>Industry Portal (Ranked Candidates, Pipeline, Inspector)</span>
            <span className="ml-auto text-[10px] font-semibold text-amber-600">Recruiter</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("tpo")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900"
          >
            <Landmark className="h-4 w-4 text-emerald-600" />
            <span>TPO Admin (Batch Ranker, JD Ingestion, Drive Analytics)</span>
            <span className="ml-auto text-[10px] font-semibold text-emerald-600">TPO</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="bg-slate-200" />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => {
              setView("student");
              setOpen(false);
              useAppStore.getState().setOnboardingModalOpen(true);
            }}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Open Student Onboarding Pipeline (4-Step Ingestion)</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("student", "resume")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900"
          >
            <FileText className="h-4 w-4 text-indigo-600" />
            <span>Generate Truth-Enforced ATS Resume (RenderCV)</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("student", "assess")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Take Proctored Skill Assessment</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("student", "profile")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900"
          >
            <RefreshCw className="h-4 w-4 text-amber-500" />
            <span>Sync Latest GitHub Commits</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("industry", "candidates")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900"
          >
            <GitCompareArrows className="h-4 w-4 text-amber-600" />
            <span>Compare Candidates on Fit Sliders</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              navigateTo("industry");
              setCompanyOnboardingOpen(true);
            }}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900"
          >
            <Building2 className="h-4 w-4 text-amber-600" />
            <span>Company / Recruiter Registration &amp; Onboarding Pipeline</span>
            <span className="ml-auto text-[10px] text-amber-700 font-mono font-medium">CIN Verification</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              setStudentOnboardingModalOpen(true);
            }}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900"
          >
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            <span>Student Login / Signup (Onboarding Pipeline)</span>
            <span className="ml-auto text-[10px] text-indigo-700 font-mono font-medium">Student Onboarding</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="bg-slate-200" />

        {/* Candidates */}
        <CommandGroup heading="Student Candidates">
          {students.map((st) => (
            <CommandItem
              key={st.id}
              onSelect={() => {
                setActiveStudent(st.id);
                setOpen(false);
                if (view === "industry") {
                  openInspector(st.id);
                } else {
                  navigateTo("student", "profile");
                }
              }}
              className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900"
            >
              <Users className="h-4 w-4 text-slate-400" />
              <div className="flex-1">
                <span className="font-semibold text-slate-900">{st.name}</span>
                <span className="ml-2 text-[10px] text-slate-500">{st.branch} · CGPA {st.cgpa}</span>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow-2xs">
                {st.verificationScore}% Verified
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator className="bg-slate-200" />

        {/* Jobs */}
        <CommandGroup heading="Active Job Openings">
          {jobs.map((jb) => (
            <CommandItem
              key={jb.id}
              onSelect={() => {
                navigateTo("industry", "jobs");
              }}
              className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900"
            >
              <Briefcase className="h-4 w-4 text-amber-600" />
              <div className="flex-1">
                <span className="font-semibold text-slate-900">{jb.role}</span>
                <span className="ml-1.5 text-[11px] text-slate-500">@ {jb.company}</span>
              </div>
              <span className="text-[10px] font-medium text-indigo-600">{jb.ctc}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
