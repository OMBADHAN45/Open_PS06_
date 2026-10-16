"use client";

import { useState } from "react";
import { useAppStore, type View } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GraduationCap, Building2, Landmark, ChevronsUpDown, Home } from "lucide-react";

const ROLES: { view: View; label: string; icon: React.ReactNode; accent: string }[] = [
  { view: "student", label: "Student Portal", icon: <GraduationCap className="h-4 w-4" />, accent: "var(--drishti-blue)" },
  { view: "industry", label: "Industry Portal", icon: <Building2 className="h-4 w-4" />, accent: "var(--drishti-gold)" },
  { view: "tpo", label: "TPO Admin", icon: <Landmark className="h-4 w-4" />, accent: "var(--drishti-emerald)" },
];

export function RoleSwitcher() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const current = ROLES.find((r) => r.view === view) ?? ROLES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-white/10">
          <span style={{ color: current.accent }}>{current.icon}</span>
          <span className="hidden sm:inline">{current.label}</span>
          <ChevronsUpDown className="h-3 w-3 text-[var(--drishti-sub)]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 border-white/10 bg-[#0a0f1c] text-white">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Demo Role Switcher</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {ROLES.map((r) => (
          <DropdownMenuItem
            key={r.view}
            onClick={() => setView(r.view)}
            className="cursor-pointer gap-2 focus:bg-white/10"
          >
            <span style={{ color: r.accent }}>{r.icon}</span>
            {r.label}
            {r.view === view && <span className="ml-auto text-[10px] text-[var(--drishti-sub)]">●</span>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onClick={() => setView("landing")} className="cursor-pointer gap-2 focus:bg-white/10">
          <Home className="h-4 w-4 text-[var(--drishti-sub)]" />
          Back to Landing
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PortalHeader({
  title,
  subtitle,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const setView = useAppStore((s) => s.setView);
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-[#02060f]/85 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setView("landing")} className="flex items-center gap-2" aria-label="DRISHTI home">
          <svg viewBox="0 0 23 17" className="h-4 w-5" fill="none">
            <path d="M2 1 L9 16" stroke="#ffe2b2" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M8 1 L15 16" stroke="#9fe0ff" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M14 1 L21 16" stroke="#ffe2b2" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span className="text-[13px] font-bold tracking-[0.2em] text-white">DRISHTI</span>
        </button>
        <div className="hidden h-5 w-px bg-white/10 sm:block" />
        <div>
          <div className="text-[14px] font-semibold text-white">{title}</div>
          {subtitle && <div className="text-[11px] text-[var(--drishti-sub)]">{subtitle}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {right}
        <RoleSwitcher />
      </div>
    </header>
  );
}

export function PortalShell({
  header,
  sidebar,
  children,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [mobileNav, setMobileNav] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-[#02060f]">
      {header}
      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-60 shrink-0 overflow-y-auto border-r border-white/10 bg-[#070b16] p-3 md:block">
          {sidebar}
        </aside>
        {/* Mobile nav drawer */}
        {mobileNav && (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileNav(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <aside className="absolute left-0 top-0 h-full w-64 overflow-y-auto border-r border-white/10 bg-[#070b16] p-3" onClick={(e) => e.stopPropagation()}>
              {sidebar}
            </aside>
          </div>
        )}
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
      <button
        onClick={() => setMobileNav(true)}
        className="fixed bottom-4 right-4 z-30 rounded-full border border-white/10 bg-white/10 p-3 text-white backdrop-blur md:hidden"
        aria-label="Open navigation"
      >
        ☰
      </button>
    </div>
  );
}

export function NavItem({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition ${
        active ? "bg-white/10 text-white" : "text-[var(--drishti-sub)] hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className={active ? "text-[var(--drishti-gold)]" : ""}>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge}
    </button>
  );
}

export function BackToLandingButton() {
  const setView = useAppStore((s) => s.setView);
  return (
    <Button variant="ghost" size="sm" onClick={() => setView("landing")} className="text-[var(--drishti-sub)] hover:text-white">
      ← Landing
    </Button>
  );
}
