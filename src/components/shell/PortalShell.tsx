"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

export function LogoutButton() {
  const setView = useAppStore((s) => s.setView);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setView("landing");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-[12px] font-semibold text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800 cursor-pointer shadow-sm active:scale-95"
      title="Log Out to Main Page"
      aria-label="Log Out"
    >
      <LogOut className="h-3.5 w-3.5 text-rose-600" />
      <span>Log Out</span>
    </button>
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

  const openSearch = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-indigo-100/80 bg-white/85 px-4 py-3 backdrop-blur-xl md:px-6 shadow-[0_2px_12px_rgba(79,70,229,0.03)]">
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            setView("landing");
            if (typeof window !== "undefined") window.location.href = "/";
          }}
          className="flex items-center gap-2 cursor-pointer"
          aria-label="DRISHTI home"
        >
          <svg viewBox="0 0 23 17" className="h-4 w-5" fill="none">
            <path d="M2 1 L9 16" stroke="#4f46e5" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M8 1 L15 16" stroke="#0ea5e9" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M14 1 L21 16" stroke="#4f46e5" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span className="text-[13px] font-bold tracking-[0.2em] text-slate-900">DRISHTI</span>
        </button>

        {/* Forward and Backward Navigation Buttons */}
        <div className="flex items-center gap-1 rounded-full border border-indigo-100 bg-slate-100/70 p-0.5">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") window.history.back();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:text-slate-900 active:scale-95 cursor-pointer shadow-xs"
            title="Go Backward (Back)"
            aria-label="Go Backward"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") window.history.forward();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:text-slate-900 active:scale-95 cursor-pointer shadow-xs"
            title="Go Forward"
            aria-label="Go Forward"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden h-5 w-px bg-slate-200 sm:block" />
        <div>
          <div className="text-[14px] font-bold text-slate-900">{title}</div>
          {subtitle && <div className="text-[11px] text-slate-500">{subtitle}</div>}
        </div>
      </div>

      {/* Center Quick Search Button */}
      <button
        onClick={openSearch}
        className="hidden md:flex items-center gap-2 rounded-full border border-indigo-100 bg-slate-100/70 px-3 py-1.5 text-[11px] text-slate-500 transition hover:border-indigo-200 hover:bg-white hover:text-slate-800 shadow-xs cursor-pointer"
      >
        <Search className="h-3 w-3 text-slate-400" />
        <span>Search candidates, jobs, commands...</span>
        <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-mono text-slate-500 shadow-xs">
          Ctrl+K
        </kbd>
      </button>

      <div className="flex items-center gap-2">
        {right}
        <LogoutButton />
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
    <div className="flex min-h-screen flex-col bg-[#f4f7fe]">
      {header}
      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-60 shrink-0 overflow-y-auto border-r border-indigo-100/80 bg-white p-3 md:block shadow-[2px_0_12px_rgba(79,70,229,0.03)]">
          {sidebar}
        </aside>
        {/* Mobile nav drawer */}
        {mobileNav && (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileNav(false)}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <aside className="absolute left-0 top-0 h-full w-64 overflow-y-auto border-r border-indigo-100 bg-white p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {sidebar}
            </aside>
          </div>
        )}
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
      <button
        onClick={() => setMobileNav(true)}
        className="fixed bottom-4 right-4 z-30 rounded-full border border-indigo-200 bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-500/30 md:hidden cursor-pointer"
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
      className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition cursor-pointer ${
        active
          ? "bg-gradient-to-r from-indigo-500/10 to-sky-500/10 text-indigo-700 font-semibold shadow-xs border border-indigo-100/80"
          : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
      }`}
    >
      <span className={active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge}
    </button>
  );
}

export function BackToLandingButton() {
  const setView = useAppStore((s) => s.setView);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        setView("landing");
        if (typeof window !== "undefined") window.location.href = "/";
      }}
      className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
    >
      ← Landing
    </Button>
  );
}
