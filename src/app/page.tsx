"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { LandingPage } from "@/components/landing/LandingPage";
import dynamic from "next/dynamic";

const StudentPortal = dynamic(() => import("@/components/student/StudentPortal").then((m) => m.StudentPortal), { ssr: false });
const IndustryPortal = dynamic(() => import("@/components/industry/IndustryPortal").then((m) => m.IndustryPortal), { ssr: false });
const TpoPortal = dynamic(() => import("@/components/tpo/TpoPortal").then((m) => m.TpoPortal), { ssr: false });
const ProofDrawer = dynamic(() => import("@/components/shared/primitives").then((m) => m.ProofDrawer), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/shared/CommandPalette").then((m) => m.CommandPalette), { ssr: false });
const StudentOnboardingModal = dynamic(() => import("@/components/student/StudentOnboardingModal").then((m) => m.StudentOnboardingModal), { ssr: false });

export default function Home() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const { toast } = useToast();

  // Synchronize browser forward and backward buttons across the entire website
  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p === "/student") setView("student");
      else if (p === "/industry") setView("industry");
      else if (p === "/tpo") setView("tpo");
      else if (p === "/") setView("landing");
    }

    const handlePopState = (e: PopStateEvent) => {
      const path = typeof window !== "undefined" ? window.location.pathname : "/";
      if (e.state?.view) {
        setView(e.state.view);
      } else if (path === "/student") {
        setView("student");
      } else if (path === "/industry") {
        setView("industry");
      } else if (path === "/tpo") {
        setView("tpo");
      } else {
        setView("landing");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setView]);

  // global toast bridge for cross-component custom events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { title?: string; description?: string };
      if (detail) toast({ title: detail.title ?? "Done", description: detail.description });
    };
    window.addEventListener("drishti:toast", handler as EventListener);
    return () => window.removeEventListener("drishti:toast", handler as EventListener);
  }, [toast]);

  return (
    <>
      {view === "landing" && <LandingPage />}
      {view === "student" && <StudentPortal />}
      {view === "industry" && <IndustryPortal />}
      {view === "tpo" && <TpoPortal />}
      <ProofDrawer />
      <CommandPalette />
      <StudentOnboardingModal />
    </>
  );
}
