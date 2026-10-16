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
      className="border-white/10 bg-[#0a0f1c]/95 text-white backdrop-blur-xl sm:max-w-xl"
    >
      <CommandInput
        placeholder="Type a command, candidate name, skill, or job..."
        className="text-white placeholder:text-white/40"
      />
      <CommandList className="max-h-[360px] overflow-y-auto text-white">
        <CommandEmpty className="py-6 text-center text-xs text-[var(--drishti-sub)]">
          No matching commands, candidates, or jobs found.
        </CommandEmpty>

        {/* Portals & Navigation */}
        <CommandGroup heading="Portals & Roles">
          <CommandItem
            onSelect={() => navigateTo("landing")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-white hover:bg-white/10 data-[selected=true]:bg-white/10"
          >
            <Home className="h-4 w-4 text-[var(--drishti-sub)]" />
            <span>Landing Page</span>
            <span className="ml-auto text-[10px] text-white/40">Home</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("student")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-white hover:bg-white/10 data-[selected=true]:bg-white/10"
          >
            <GraduationCap className="h-4 w-4 text-[var(--drishti-blue)]" />
            <span>Student Portal (Evidence Ledger, ATS Resume, Proctoring)</span>
            <span className="ml-auto text-[10px] text-[var(--drishti-blue)]">Student</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("industry")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-white hover:bg-white/10 data-[selected=true]:bg-white/10"
          >
            <Building2 className="h-4 w-4 text-[var(--drishti-gold)]" />
            <span>Industry Portal (Ranked Candidates, Pipeline, Inspector)</span>
            <span className="ml-auto text-[10px] text-[var(--drishti-gold)]">Recruiter</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("tpo")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-white hover:bg-white/10 data-[selected=true]:bg-white/10"
          >
            <Landmark className="h-4 w-4 text-[var(--drishti-emerald)]" />
            <span>TPO Admin (Batch Ranker, JD Ingestion, Drive Analytics)</span>
            <span className="ml-auto text-[10px] text-[var(--drishti-emerald)]">TPO</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="bg-white/10" />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => navigateTo("student", "resume")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-white hover:bg-white/10 data-[selected=true]:bg-white/10"
          >
            <FileText className="h-4 w-4 text-[var(--drishti-blue)]" />
            <span>Generate Truth-Enforced ATS Resume (RenderCV)</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("student", "assess")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-white hover:bg-white/10 data-[selected=true]:bg-white/10"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Take Proctored Skill Assessment</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("student", "profile")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-white hover:bg-white/10 data-[selected=true]:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 text-amber-400" />
            <span>Sync Latest GitHub Commits</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("industry", "candidates")}
            className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-white hover:bg-white/10 data-[selected=true]:bg-white/10"
          >
            <GitCompareArrows className="h-4 w-4 text-[var(--drishti-gold)]" />
            <span>Compare Candidates on Fit Sliders</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="bg-white/10" />

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
              className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-white hover:bg-white/10 data-[selected=true]:bg-white/10"
            >
              <Users className="h-4 w-4 text-white/60" />
              <div className="flex-1">
                <span className="font-semibold">{st.name}</span>
                <span className="ml-2 text-[10px] text-white/50">{st.branch} · CGPA {st.cgpa}</span>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                {st.verificationScore}% Verified
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator className="bg-white/10" />

        {/* Jobs */}
        <CommandGroup heading="Active Job Openings">
          {jobs.map((jb) => (
            <CommandItem
              key={jb.id}
              onSelect={() => {
                navigateTo("industry", "jobs");
              }}
              className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-xs text-white hover:bg-white/10 data-[selected=true]:bg-white/10"
            >
              <Briefcase className="h-4 w-4 text-[var(--drishti-gold)]" />
              <div className="flex-1">
                <span className="font-semibold">{jb.role}</span>
                <span className="ml-1.5 text-[11px] text-white/60">@ {jb.company}</span>
              </div>
              <span className="text-[10px] text-[var(--drishti-blue)]">{jb.ctc}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
