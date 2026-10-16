"use client";

import { useState } from "react";
import { useAppStore, type View } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, GraduationCap, Building2, Landmark, ShieldCheck, FileText, Eye, Workflow, Sparkles, Search } from "lucide-react";
import { PlatformTourModal } from "@/components/shared/PlatformTourModal";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104303_0c6d60b2-9353-408e-9449-585108a22fb5.mp4";
const POSTER =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/130837c4-0244-4f37-9c61-8d801d93fd29.jpg";

const FEATS = ["Verified Evidence", "AI Resume Studio", "Proctored Exams", "Shared Pipeline"];

const NAV_LINKS: { label: string; view: View }[] = [
  { label: "Student Portal", view: "student" },
  { label: "Industry Portal", view: "industry" },
  { label: "TPO Admin", view: "tpo" },
];

export function LandingPage() {
  const setView = useAppStore((s) => s.setView);
  const [roleModal, setRoleModal] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  const go = (v: View) => {
    setRoleModal(false);
    setView(v);
  };

  return (
    <div className="landing-root relative min-h-screen w-full overflow-hidden" style={{ background: "#02060f" }}>
      <video
        className="art absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(2,6,15,0.45) 0%, rgba(2,6,15,0.86) 60%, rgba(2,6,15,0.97) 100%)",
        }}
      />
      <div className="drishti-grid-bg absolute inset-0 opacity-30" />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(2,6,15,0) 0%, rgba(2,6,15,0) 70%, rgba(2,6,15,1) 100%)" }}
      />

      {/* NAV */}
      <header className="relative z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <button onClick={() => setView("landing")} className="group flex items-center gap-2" aria-label="DRISHTI home">
            <BrandMark />
            <span id="word" className="text-[15px] font-bold tracking-[0.22em] text-white">DRISHTI</span>
          </button>
          <div className="nav-pill hidden items-center gap-1 rounded-full p-1 md:flex">
            {NAV_LINKS.map((l) => (
              <button
                key={l.label}
                onClick={() => go(l.view)}
                className="rounded-full px-4 py-2 text-[13px] font-medium text-[var(--drishti-sub)] transition hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => go("student")}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-[var(--drishti-sub)] transition hover:bg-white/5 hover:text-white"
            >
              Log in / Portal Access
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              className="hidden lg:flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[var(--drishti-sub)] hover:text-white hover:bg-white/10 transition"
              title="Search commands, jobs, candidates (Ctrl+K)"
            >
              <Search className="h-3 w-3 text-white/50" />
              <span>Search</span>
              <kbd className="rounded border border-white/15 px-1 py-0.2 text-[9px] font-mono">Ctrl+K</kbd>
            </button>
            <button
              onClick={() => setTourOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[var(--drishti-gold)]/30 bg-[var(--drishti-gold)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--drishti-gold)] hover:bg-[var(--drishti-gold)]/20 transition"
            >
              <Sparkles className="h-3 w-3" />
              Quick Tour
            </button>
            <button onClick={() => setRoleModal(true)} className="cta-glass text-sm">
              Enter Platform
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col justify-center px-5 pb-28 pt-6 md:px-8">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-[var(--drishti-blue)] backdrop-blur"
          >
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Evidence-Backed Hiring OS
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="text-[40px] font-bold leading-[1.05] text-white md:text-[68px]"
          >
            <span id="h1a">Evidence-Backed Campus Placements</span>
            <br />
            <span id="h1b" className="text-gradient-gold">Proof Over Claims, Zero Inflation.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--drishti-sub)]"
          >
            <span id="sub1">Connecting verified student talent</span>{" "}
            <span className="text-white">with trusted hiring partners.</span>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <button onClick={() => setRoleModal(true)} className="cta-glass text-[15px]">
              Explore Platform Portals
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => go("student")}
              className="nav-pill rounded-full px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Live Demo → Student Portal
            </button>
          </motion.div>
          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-9 flex flex-wrap gap-2"
          >
            {FEATS.map((f) => (
              <li key={f} className="feat-chip">
                <FeatChevron />
                {f}
              </li>
            ))}
          </motion.ul>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 border-t border-white/5 px-5 py-4 text-center text-[12px] text-[var(--drishti-sub)] md:flex-row md:px-8">
          <span>Trusted by leading universities and hiring partners worldwide.</span>
          <span className="opacity-70">2026</span>
        </div>
      </footer>

      {/* ROLE SELECTOR MODAL */}
      <AnimatePresence>
        {roleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(2,6,15,0.78)", backdropFilter: "blur(8px)" }}
            onClick={() => setRoleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="drishti-glass relative w-full max-w-3xl rounded-2xl p-7"
            >
              <button
                onClick={() => setRoleModal(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="text-xl font-bold text-white">Choose your portal</h3>
              <p className="mt-1 text-sm text-[var(--drishti-sub)]">
                Switch instantly between roles — a live demo of the three-sided evidence-backed placement ecosystem.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <RoleCard icon={<GraduationCap className="h-5 w-5" />} title="🎓 Student Portal" desc="Build a truth-enforced ATS resume from verified GitHub proof & proctored assessments." onClick={() => go("student")} accent="var(--drishti-blue)" />
                <RoleCard icon={<Building2 className="h-5 w-5" />} title="🏢 Industry Portal" desc="Rank pre-vetted candidates by Fit Score, inspect proof, and compare side-by-side." onClick={() => go("industry")} accent="var(--drishti-gold)" />
                <RoleCard icon={<Landmark className="h-5 w-5" />} title="🏛️ TPO Admin" desc="Deduplicate multi-source job feeds, batch-rank the graduating cohort, audit pipeline." onClick={() => go("tpo")} accent="var(--drishti-emerald)" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-[var(--drishti-sub)] sm:grid-cols-4">
                <Mini icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Verified Evidence" />
                <Mini icon={<FileText className="h-3.5 w-3.5" />} label="AI Resume Studio" />
                <Mini icon={<Eye className="h-3.5 w-3.5" />} label="Proctored Exams" />
                <Mini icon={<Workflow className="h-3.5 w-3.5" />} label="Shared Pipeline" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <PlatformTourModal open={tourOpen} onOpenChange={setTourOpen} />
    </div>
  );
}

function BrandMark() {
  return (
    <svg viewBox="0 0 23 17" className="h-[17px] w-[23px]" fill="none" aria-hidden>
      <path d="M2 1 L9 16" stroke="url(#g1)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8 1 L15 16" stroke="url(#g2)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M14 1 L21 16" stroke="url(#g1)" strokeWidth="2.2" strokeLinecap="round" />
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe2b2" />
          <stop offset="1" stopColor="#9fe0ff" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff5e0" />
          <stop offset="1" stopColor="#9fe0ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FeatChevron() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden>
      <path d="M4 2 L8 6 L4 10" stroke="rgba(214,232,250,.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RoleCard({ icon, title, desc, onClick, accent }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void; accent: string }) {
  return (
    <button onClick={onClick} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-white/25 hover:bg-white/[0.06]">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${accent}1a`, color: accent, border: `1px solid ${accent}40` }}>
        {icon}
      </div>
      <h4 className="text-[15px] font-semibold text-white">{title}</h4>
      <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--drishti-sub)]">{desc}</p>
      <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: accent }}>
        Enter <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

function Mini({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-2">
      <span className="text-[var(--drishti-blue)]">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
