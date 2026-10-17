"use client";

import { useState } from "react";
import { useAppStore, type View } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Building2,
  Landmark,
  ShieldCheck,
  FileText,
  Eye,
  Workflow,
  Sparkles,
  Search,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Lock,
  QrCode,
  Trophy,
  Code2,
  ExternalLink,
  Layers,
  GitBranch,
  Terminal,
  ShieldAlert,
  Zap,
  Check,
  ArrowUpRight,
  Filter,
  Users,
  Database,
  Flame,
} from "lucide-react";
import { PlatformTourModal } from "@/components/shared/PlatformTourModal";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104303_0c6d60b2-9353-408e-9449-585108a22fb5.mp4";
const POSTER =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/130837c4-0244-4f37-9c61-8d801d93fd29.jpg";

const FEATS = ["Verified Evidence", "AI Resume Studio", "Proctored Exams", "Shared Pipeline"];

type PortalTab = "student" | "industry" | "tpo";

interface PortalData {
  id: PortalTab;
  name: string;
  emoji: string;
  icon: typeof GraduationCap;
  roleBadge: string;
  tagline: string;
  description: string;
  accent: string;
  accentGradient: string;
  buttonGradient: string;
  highlights: string[];
  metrics: { label: string; value: string }[];
}

const PORTALS: PortalData[] = [
  {
    id: "student",
    name: "Student Portal",
    emoji: "🎓",
    icon: GraduationCap,
    roleBadge: "For Candidates & Students",
    tagline: "Truth-Enforced ATS Resume & Verified Proof Locker",
    description:
      "Bypass resume inflation. Generate automated, truth-enforced 1-page ATS resumes backed by your actual GitHub commits and AI-proctored test scores.",
    accent: "#4f46e5",
    accentGradient: "from-indigo-600 to-sky-500",
    buttonGradient: "from-indigo-600 via-indigo-500 to-sky-500",
    highlights: [
      "RenderCV automated 1-page ATS PDF generation",
      "AI-proctored browser-locked skill assessments",
      "GitHub commit & repository proof ledger",
      "Smart job matching with transparent fit scores",
    ],
    metrics: [
      { label: "Verified Resumes", value: "1,240+" },
      { label: "Proctor Pass Rate", value: "88.4%" },
    ],
  },
  {
    id: "industry",
    name: "Industry Portal",
    emoji: "🏢",
    icon: Building2,
    roleBadge: "For Recruiters & Hiring Partners",
    tagline: "Live Candidate Leaderboards & Code Proof Inspector",
    description:
      "Hire the best-proven skills, not the best-looking resume. Access live, pre-vetted candidate leaderboards with an X-Ray Proof Inspector to verify code firsthand.",
    accent: "#0ea5e9",
    accentGradient: "from-sky-600 to-indigo-600",
    buttonGradient: "from-sky-600 via-blue-600 to-indigo-600",
    highlights: [
      "Multi-factor verifiable fit scores (85%+ Strong Match)",
      "X-Ray Proof Inspector for raw GitHub commit diffs",
      "Side-by-side candidate comparison matrix",
      "Streamlined Kanban pipeline with 1-click status transitions",
    ],
    metrics: [
      { label: "Hiring Partners", value: "64+" },
      { label: "Time-to-Hire", value: "-62%" },
    ],
  },
  {
    id: "tpo",
    name: "Placement Team Portal",
    emoji: "🏛️",
    icon: Landmark,
    roleBadge: "For Campus TPO & Administrators",
    tagline: "Unified Ingestion, Deduplication & Cohort Batch Ranker",
    description:
      "Eliminate chaotic WhatsApp job forwarding. Utilize a unified ingestion engine, multi-source job deduplication, and 1-click evidence-backed batch ranking.",
    accent: "#10b981",
    accentGradient: "from-emerald-600 to-teal-600",
    buttonGradient: "from-emerald-600 via-teal-600 to-sky-600",
    highlights: [
      "Multi-source job ingestion (WhatsApp, Email, Portals)",
      "Levenshtein fuzzy deduplication of campus drives",
      "1-click batch cohort fit score ranking",
      "Real-time drive analytics and auditable compliance logs",
    ],
    metrics: [
      { label: "Drives Ingested", value: "185+" },
      { label: "Deduplication Rate", value: "99.2%" },
    ],
  },
];

export function LandingPage() {
  const setView = useAppStore((s) => s.setView);
  const setStudentOnboardingModalOpen = useAppStore((s) => s.setStudentOnboardingModalOpen);
  const [activeTab, setActiveTab] = useState<PortalTab>("student");
  const [tourOpen, setTourOpen] = useState(false);

  const activePortal = PORTALS.find((p) => p.id === activeTab) || PORTALS[0];

  return (
    <div className="landing-root relative min-h-screen w-full overflow-x-hidden" style={{ background: "#f4f7fe" }}>
      {/* Background Video & Subtle Grid */}
      <video
        className="art fixed inset-0 h-full w-full object-cover pointer-events-none opacity-40"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Luminous Vibrant Overlays */}
      <div className="fixed inset-0 bg-gradient-to-br from-white/90 via-white/75 to-indigo-50/80 backdrop-blur-[2px] pointer-events-none z-0" />
      <div className="drishti-grid-bg fixed inset-0 opacity-40 pointer-events-none z-0" />

      {/* =========================================================================
          HEADER NAVIGATION
          ========================================================================= */}
      <header className="relative z-30 border-b border-indigo-100/60 bg-white/70 backdrop-blur-xl sticky top-0">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          {/* Brand Logo */}
          <button
            onClick={() => setView("landing")}
            className="group flex items-center gap-2 cursor-pointer focus:outline-none"
            aria-label="DRISHTI home"
          >
            <BrandMark />
            <div className="flex flex-col text-left">
              <span className="text-[16px] font-bold tracking-[0.24em] text-slate-900 leading-none">DRISHTI</span>
              <span className="text-[9px] font-semibold tracking-wider text-indigo-600 uppercase mt-0.5">Truth-Enforced OS</span>
            </div>
          </button>

          {/* Quick Portal Switcher Pills & Utilities */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Direct Portal Quick Jump Pills */}
            <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-slate-100/80 border border-slate-200/80">
              <button
                onClick={() => setView("student")}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-white shadow-2xs transition cursor-pointer"
                title="Open Student Portal"
              >
                <span>🎓</span>
                <span>Student</span>
              </button>
              <button
                onClick={() => setView("industry")}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-white shadow-2xs transition cursor-pointer"
                title="Open Industry Portal"
              >
                <span>🏢</span>
                <span>Industry</span>
              </button>
              <button
                onClick={() => setView("tpo")}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-slate-700 hover:text-emerald-600 hover:bg-white shadow-2xs transition cursor-pointer"
                title="Open Placement Team Portal"
              >
                <span>🏛️</span>
                <span>Placement</span>
              </button>
            </div>

            {/* Ctrl+K Search */}
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              className="hidden lg:flex items-center gap-1.5 rounded-full border border-indigo-100 bg-white/90 px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-white shadow-xs transition cursor-pointer"
              title="Search commands, jobs, candidates (Ctrl+K)"
            >
              <Search className="h-3 w-3 text-slate-400" />
              <span>Search</span>
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.2 text-[9px] font-mono text-slate-500">Ctrl+K</kbd>
            </button>

            {/* Quick Tour Button */}
            <button
              onClick={() => setTourOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/90 px-3.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100/90 shadow-xs transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden sm:inline">Platform</span> Tour
            </button>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          HERO SECTION WITH 3-TAB PORTALS & TARGETED STUDENT LOGIN
          ========================================================================= */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pt-8 pb-16 md:px-8 lg:pt-14 lg:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Top Live Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/90 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] font-bold text-indigo-700 backdrop-blur shadow-xs"
          >
            <span className="live-dot inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Evidence-Backed Placement Operating System
          </motion.div>

          {/* Hero H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-[36px] font-bold leading-[1.08] text-slate-900 sm:text-[50px] md:text-[64px]"
          >
            <span>Evidence-Backed Campus Placements</span>
            <br />
            <span className="text-gradient-gold">Proof Over Claims, Zero Inflation.</span>
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-5 mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600"
          >
            Connecting verified student talent with trusted hiring partners through cryptographic proof,
            AI-proctored verification, and automated 1-page ATS resumes.
          </motion.p>
        </div>

        {/* =======================================================================
            DIRECT TABS COMPONENT (STUDENT, INDUSTRY, PLACEMENT TEAM)
            ======================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 max-w-5xl mx-auto"
        >
          {/* Tab Selection Bar */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-white/80 backdrop-blur-2xl border border-slate-200/90 shadow-lg shadow-indigo-500/5 gap-1.5 max-w-full overflow-x-auto">
              {PORTALS.map((portal) => {
                const isSelected = activeTab === portal.id;
                const IconComponent = portal.icon;
                return (
                  <button
                    key={portal.id}
                    onClick={() => setActiveTab(portal.id)}
                    className={`relative px-4 sm:px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? "bg-white text-slate-900 shadow-md shadow-indigo-500/10 border border-indigo-100"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base">{portal.emoji}</span>
                    <span className="font-bold">{portal.name}</span>
                    {isSelected && (
                      <motion.div
                        layoutId="activeTabGlow"
                        className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full bg-gradient-to-r from-indigo-500 to-sky-500"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Showcase Card */}
          <div className="mt-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePortal.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="drishti-card rounded-3xl p-6 sm:p-8 md:p-10 bg-white/90 backdrop-blur-2xl border border-slate-200 shadow-xl shadow-indigo-500/5 relative overflow-hidden"
              >
                {/* Accent ambient blur */}
                <div
                  className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
                  style={{ background: activePortal.accent }}
                />

                <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                  {/* Left Column: Details & Key Actions */}
                  <div className="lg:col-span-7 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80 mb-3">
                      <span>{activePortal.emoji}</span>
                      <span>{activePortal.roleBadge}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
                      {activePortal.tagline}
                    </h2>

                    <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                      {activePortal.description}
                    </p>

                    {/* Feature Checkpoints */}
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activePortal.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-700">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* =============================================================
                        PORTAL ACTIONS & TARGETED STUDENT LOGIN BUTTON
                        ============================================================= */}
                    <div className="mt-8 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                      {activePortal.id === "student" ? (
                        <>
                          {/* CRITICAL: Prominent Student Login / Signup Button triggering StudentOnboardingModal */}
                          <button
                            onClick={() => setStudentOnboardingModalOpen(true)}
                            className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200 px-7 py-3.5 rounded-full flex items-center gap-2.5 cursor-pointer text-sm sm:text-[15px]"
                          >
                            <GraduationCap className="h-4 w-4 text-white" />
                            <span>Student Login / Signup</span>
                          </button>

                          {/* Secondary Live Demo Button */}
                          <button
                            onClick={() => setView("student")}
                            className="rounded-full border border-slate-200 bg-white px-5 py-3.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-slate-50 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Live Demo → Student Portal</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : activePortal.id === "industry" ? (
                        <>
                          <button
                            onClick={() => setView("industry")}
                            className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:-translate-y-0.5 transition-all duration-200 px-7 py-3.5 rounded-full flex items-center gap-2.5 cursor-pointer text-sm sm:text-[15px]"
                          >
                            <Building2 className="h-4 w-4 text-white" />
                            <span>Enter Industry Portal</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setView("industry")}
                            className="rounded-full border border-slate-200 bg-white px-5 py-3.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-sky-600 hover:border-sky-200 hover:bg-slate-50 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Inspect Candidate Ledger</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setView("tpo")}
                            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all duration-200 px-7 py-3.5 rounded-full flex items-center gap-2.5 cursor-pointer text-sm sm:text-[15px]"
                          >
                            <Landmark className="h-4 w-4 text-white" />
                            <span>Enter Placement Team Portal</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setView("tpo")}
                            className="rounded-full border border-slate-200 bg-white px-5 py-3.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:border-emerald-200 hover:bg-slate-50 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Open Ingestion & Batch Ranker</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Visual Demonstration Widget */}
                  <div className="lg:col-span-5">
                    {activePortal.id === "student" && (
                      <div className="rounded-2xl border border-indigo-100 bg-slate-50/80 p-5 shadow-inner">
                        <div className="flex items-center justify-between pb-3 border-b border-indigo-100/60">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-800">RenderCV ATS Compiler</span>
                          </div>
                          <span className="text-[10px] font-mono text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            VERIFIED_PDF
                          </span>
                        </div>
                        <div className="mt-3.5 space-y-2 text-left">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-4 w-4 text-slate-700" />
                              <span className="text-xs font-semibold text-slate-800">GitHub Proof Synced</span>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              342 Commits
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-indigo-600" />
                              <span className="text-xs font-semibold text-slate-800">React + TS Assessment</span>
                            </div>
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                              Score: 94% Verified
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <QrCode className="h-4 w-4 text-slate-600" />
                              <span className="text-xs font-semibold text-slate-800">Proof Verification QR</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">sha256:4f8e...</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-indigo-100/60 flex items-center justify-between text-xs text-slate-500">
                          <span>ATS Compatibility</span>
                          <span className="font-bold text-emerald-600">100% Guaranteed</span>
                        </div>
                      </div>
                    )}

                    {activePortal.id === "industry" && (
                      <div className="rounded-2xl border border-sky-100 bg-slate-50/80 p-5 shadow-inner">
                        <div className="flex items-center justify-between pb-3 border-b border-sky-100/60">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-800">Live Fit Score Ranker</span>
                          </div>
                          <span className="text-[10px] font-mono text-sky-600 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            PRE_VETTED
                          </span>
                        </div>
                        <div className="mt-3.5 space-y-2 text-left">
                          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">Om Badhan (CS '26)</span>
                              <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                94% Strong
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                🟢 React
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                🟢 TypeScript
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                🟢 Next.js
                              </span>
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px]">
                            <div className="text-slate-400 text-[10px]">X-Ray Proof Inspector diff:</div>
                            <div className="text-emerald-400 truncate">+ commit 4a9f1b: Proctored Auth Middleware</div>
                            <div className="text-sky-300 truncate">✓ 18 unit tests verified in sandbox</div>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-sky-100/60 flex items-center justify-between text-xs text-slate-500">
                          <span>Proof Integrity</span>
                          <span className="font-bold text-sky-600">Zero Resume Fluff</span>
                        </div>
                      </div>
                    )}

                    {activePortal.id === "tpo" && (
                      <div className="rounded-2xl border border-emerald-100 bg-slate-50/80 p-5 shadow-inner">
                        <div className="flex items-center justify-between pb-3 border-b border-emerald-100/60">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-800">Unified Ingestion Engine</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            AUTO_DEDUPED
                          </span>
                        </div>
                        <div className="mt-3.5 space-y-2 text-left">
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">Source: WhatsApp Broadcast</span>
                              <span className="font-bold text-slate-800">PhonePe SWE Drive</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">Source: HR Email Portal</span>
                              <span className="font-bold text-slate-800">PhonePe Grad '26</span>
                            </div>
                            <div className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
                              <Check className="h-3 w-3" />
                              <span>Levenshtein 98% Match → Auto-Consolidated</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <span className="text-xs font-semibold text-slate-800">Cohort Batch Ranker</span>
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                              524 Students Ranked
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-emerald-100/60 flex items-center justify-between text-xs text-slate-500">
                          <span>Campus Operations</span>
                          <span className="font-bold text-emerald-600">Zero WhatsApp Chaos</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Side-by-Side Ecosystem Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {PORTALS.map((portal) => (
              <div
                key={portal.id}
                onClick={() => setActiveTab(portal.id)}
                className={`group relative rounded-2xl border p-5 text-left transition-all duration-200 cursor-pointer ${
                  activeTab === portal.id
                    ? "bg-white border-indigo-300 shadow-md ring-2 ring-indigo-500/20"
                    : "bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{portal.emoji}</span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {portal.id.toUpperCase()}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {portal.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {portal.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600">
                  <span>{activeTab === portal.id ? "Currently Active" : "View Details"}</span>
                  <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Feature Chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {FEATS.map((f) => (
              <div key={f} className="feat-chip bg-white/90 border-slate-200/80 text-slate-700 shadow-2xs">
                <FeatChevron />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          SECTION 2: ENRICHED WORKFLOW SECTION (4-STEP VISUAL PIPELINE)
          ========================================================================= */}
      <section className="relative z-10 border-t border-indigo-100/70 bg-white/70 backdrop-blur-xl py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 mb-3">
              <Workflow className="h-3.5 w-3.5 text-indigo-600" />
              <span>Verification Pipeline Mechanics</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
              From Raw Code Commits to Verified Offers
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              How DRISHTI enforces truth at every stage of the campus placement lifecycle,
              replacing unverified claims with cryptographic proof.
            </p>
          </div>

          {/* 4-Step Connected Visual Pipeline */}
          <div className="mt-14 relative">
            {/* Horizontal Connector Line for Desktop */}
            <div className="hidden lg:block absolute top-14 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 z-0" />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
              {/* STEP 1 */}
              <div className="drishti-card rounded-2xl p-6 bg-white/95 border border-slate-200/90 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-mono font-bold text-sm shadow-md shadow-indigo-600/30">
                      01
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Ingestion
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    Step 1: Identity & Evidence Onboarding
                  </h3>

                  <p className="mt-2 text-xs font-medium text-indigo-600">
                    Connecting GitHub, claiming unverified skills.
                  </p>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Candidates connect their GitHub identity, syncing repositories, commits, and AST history. Claimed skills are initially flagged as unverified and isolated into the Pending Assessment Queue.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-2 rounded border border-slate-200/60">
                    <span>🐙 GitHub Synced</span>
                    <span className="font-semibold text-emerald-600">18 Repos</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 bg-amber-50/80 p-2 rounded border border-amber-200/60 text-amber-800">
                    <span>⚠️ Claimed Skills</span>
                    <span className="font-semibold">Pending Queue</span>
                  </div>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="drishti-card rounded-2xl p-6 bg-white/95 border border-slate-200/90 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white font-mono font-bold text-sm shadow-md shadow-sky-600/30">
                      02
                    </span>
                    <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      Validation
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    Step 2: AI-Proctored Verification
                  </h3>

                  <p className="mt-2 text-xs font-medium text-sky-600">
                    Taking browser-locked assessments; passing verifies skills, failing scrubs them.
                  </p>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Students undergo timed assessments in a secure, full-screen lockdown environment with continuous camera gaze tracking. Successful scores earn immutable verification; failures purge exaggerated claims instantly.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-700 bg-emerald-50 p-2 rounded border border-emerald-200/60 text-emerald-800">
                    <span>🟢 React Passed</span>
                    <span className="font-bold">94% Verified</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 bg-rose-50 p-2 rounded border border-rose-200/60 text-rose-800">
                    <span>❌ Docker Failed</span>
                    <span className="font-bold">Claim Scrubbed</span>
                  </div>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="drishti-card rounded-2xl p-6 bg-white/95 border border-slate-200/90 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-700 text-white font-mono font-bold text-sm shadow-md shadow-indigo-700/30">
                      03
                    </span>
                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Synthesis
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    Step 3: Truth-Enforced Resume Generation
                  </h3>

                  <p className="mt-2 text-xs font-medium text-indigo-700">
                    RenderCV compiles only verified evidence into a 1-page ATS PDF.
                  </p>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    The automated RenderCV engine compiles strictly verified claims, commit hashes, and assessment badges into a concise 1-page ATS resume featuring an instant verification QR code.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-2 rounded border border-slate-200/60">
                    <span>📄 RenderCV Format</span>
                    <span className="font-semibold text-slate-900">1-Page ATS</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 bg-indigo-50/80 p-2 rounded border border-indigo-200/60 text-indigo-800">
                    <span>🔐 Proof QR Code</span>
                    <span className="font-semibold">sha256 Hash</span>
                  </div>
                </div>
              </div>

              {/* STEP 4 */}
              <div className="drishti-card rounded-2xl p-6 bg-white/95 border border-slate-200/90 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-mono font-bold text-sm shadow-md shadow-emerald-600/30">
                      04
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      Selection
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    Step 4: Evidence-Backed Hiring Leaderboards
                  </h3>

                  <p className="mt-2 text-xs font-medium text-emerald-600">
                    Recruiters rank candidates by verifiable fit scores and inspect code proofs.
                  </p>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Employers view live cohort leaderboards ranked by objective fit scores. Recruiters drill into the X-Ray Proof Inspector to review candidate source code diffs and proctored assessment logs directly.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-700 bg-indigo-50 p-2 rounded border border-indigo-200/60 text-indigo-800">
                    <span>🏆 Fit Score</span>
                    <span className="font-bold">94% Strong</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 bg-emerald-50 p-2 rounded border border-emerald-200/60 text-emerald-800">
                    <span>🔍 X-Ray Inspector</span>
                    <span className="font-bold">Code Validated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: SCROLL-DOWN PORTAL INFORMATION (THREE DISTINCT CONTENT BLOCKS)
          ========================================================================= */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-[#f4f7fe] via-white to-[#f4f7fe]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 space-y-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Three-Sided Ecosystem Architecture</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
              Dedicated Portals Built for Total Clarity
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Each portal solves the specific bottleneck of traditional campus recruitment.
            </p>
          </div>

          {/* ---------------------------------------------------------------------
              PORTAL 1: STUDENT PORTAL BLOCK
              --------------------------------------------------------------------- */}
          <div className="drishti-card rounded-3xl p-8 sm:p-10 md:p-12 bg-white/90 backdrop-blur-2xl border border-indigo-100 shadow-xl shadow-indigo-500/5">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7 text-left space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <span>🎓</span>
                  <span>Student Portal</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Proof Over Claims for Graduating Engineers
                </h3>

                {/* EXACT REQUIRED VALUE PROP */}
                <blockquote className="rounded-2xl border-l-4 border-indigo-600 bg-indigo-50/70 p-4 text-base sm:text-lg font-medium text-indigo-950 italic">
                  "Bypass resume inflation. Generate automated, truth-enforced 1-page ATS resumes backed by your actual GitHub commits and AI-proctored test scores."
                </blockquote>

                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      <strong>RenderCV ATS Engine:</strong> Automated typst/LaTeX compilation yielding clean, parseable 1-page PDFs.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      <strong>AI Proctoring Sandbox:</strong> Camera gaze tracking and tab-switch prevention confirm genuine proficiency.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      <strong>Evidence Proof Locker:</strong> Directly link commit diffs, repo milestones, and live deployed demos.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      <strong>Smart Job Matching:</strong> Automatic algorithmic matching with transparent skill-fit breakdown.
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setStudentOnboardingModalOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition px-6 py-3 rounded-full flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span>Student Login / Signup</span>
                  </button>
                  <button
                    onClick={() => setView("student")}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Launch Student Portal</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Visual preview card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-indigo-200 bg-slate-50/90 p-5 shadow-sm text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
                        OB
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Om Badhan</div>
                        <div className="text-[10px] text-slate-500">CS Grad '26 • CGPA 9.12</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      VERIFIED_ATS
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-700">Verified Evidence Ledger</div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs flex justify-between items-center">
                      <span className="font-mono text-slate-700">github.com/om-badhan/drishti-core</span>
                      <span className="text-[10px] font-bold text-indigo-600">342 Commits</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs flex justify-between items-center">
                      <span className="text-slate-700">React + Next.js Proctored Challenge</span>
                      <span className="text-[10px] font-bold text-emerald-600">94% Passed</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <QrCode className="h-4 w-4 text-indigo-700" />
                        <span>Cryptographic QR Verification</span>
                      </div>
                      <span className="font-mono text-[9px] text-indigo-700">AUTHENTIC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              PORTAL 2: INDUSTRY PORTAL BLOCK
              --------------------------------------------------------------------- */}
          <div className="drishti-card rounded-3xl p-8 sm:p-10 md:p-12 bg-white/90 backdrop-blur-2xl border border-sky-100 shadow-xl shadow-sky-500/5">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7 text-left space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                  <span>🏢</span>
                  <span>Industry Portal</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Zero-Inflated Hiring for High-Bar Teams
                </h3>

                {/* EXACT REQUIRED VALUE PROP */}
                <blockquote className="rounded-2xl border-l-4 border-sky-600 bg-sky-50/70 p-4 text-base sm:text-lg font-medium text-sky-950 italic">
                  "Hire the best-proven skills, not the best-looking resume. Access live, pre-vetted candidate leaderboards with an X-Ray Proof Inspector to verify code firsthand."
                </blockquote>

                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      <strong>Multi-Factor Fit Scores:</strong> Algorithmic scoring of skills, proctor percentiles, and code contributions.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      <strong>X-Ray Proof Inspector:</strong> Drill into actual pull requests, commit diffs, and proctored test screen logs.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      <strong>Side-by-Side Comparison:</strong> Compare candidate code metrics, test scores, and match breakdowns.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      <strong>Fast-Track Pipeline:</strong> Move pre-vetted engineers directly to interviews with 1 click.
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setView("industry")}
                    className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition px-6 py-3 rounded-full flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Launch Industry Portal</span>
                  </button>
                  <button
                    onClick={() => setView("industry")}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:text-sky-600 hover:bg-slate-50 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View Candidate Leaderboard</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Visual preview card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-sky-200 bg-slate-50/90 p-5 shadow-sm text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-sky-600" />
                      <span className="text-xs font-bold text-slate-900">X-Ray Proof Inspector</span>
                    </div>
                    <span className="text-[10px] font-mono text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      FIT: 94% STRONG
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs">
                      <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800">
                        Candidate Proof: Om Badhan / commit-4f81a
                      </div>
                      <div className="mt-2 text-emerald-400 text-[11px]">+ async function verifyAssessmentProof()</div>
                      <div className="text-emerald-400 text-[11px]">+ &nbsp;&nbsp;await crypto.subtle.digest('SHA-256')</div>
                      <div className="text-slate-400 text-[11px]">&nbsp;&nbsp;return {`{ verified: true, score: 94 }`}</div>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-600">Proctor Gaze Invariance</span>
                      <span className="font-bold text-emerald-600">99.8% (0 Anomaly)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              PORTAL 3: PLACEMENT TEAM PORTAL BLOCK
              --------------------------------------------------------------------- */}
          <div className="drishti-card rounded-3xl p-8 sm:p-10 md:p-12 bg-white/90 backdrop-blur-2xl border border-emerald-100 shadow-xl shadow-emerald-500/5">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7 text-left space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span>🏛️</span>
                  <span>Placement Team Portal</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Autonomous Campus Ingestion & Cohort Analytics
                </h3>

                {/* EXACT REQUIRED VALUE PROP */}
                <blockquote className="rounded-2xl border-l-4 border-emerald-600 bg-emerald-50/70 p-4 text-base sm:text-lg font-medium text-emerald-950 italic">
                  "Eliminate chaotic WhatsApp job forwarding. Utilize a unified ingestion engine, multi-source job deduplication, and 1-click evidence-backed batch ranking."
                </blockquote>

                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      <strong>Multi-Source Ingestion:</strong> Capture job drives from WhatsApp groups, HR emails, and web feeds into a unified ledger.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      <strong>Levenshtein Deduplication:</strong> Automatically detects identical or overlapping job drives to eliminate clutter.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      <strong>1-Click Batch Ranker:</strong> Match and rank 500+ candidates for newly announced drives instantly without bias.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">
                      <strong>Audit Transparency Trail:</strong> Maintain immutable records of shortlists, test results, and final offers.
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setView("tpo")}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition px-6 py-3 rounded-full flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Landmark className="h-4 w-4" />
                    <span>Launch Placement Team Portal</span>
                  </button>
                  <button
                    onClick={() => setView("tpo")}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-50 transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Inspect Cohort Batch Ranker</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Visual preview card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-emerald-200 bg-slate-50/90 p-5 shadow-sm text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Ingestion & Deduplication Engine</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ACTIVE
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                      <div className="text-[11px] text-slate-500">Incoming Drive 1 (WhatsApp)</div>
                      <div className="font-semibold text-slate-800">Razorpay - Software Development Engineer 1</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                      <div className="text-[11px] text-slate-500">Incoming Drive 2 (HR Email)</div>
                      <div className="font-semibold text-slate-800">Razorpay Software Engineer (Campus '26)</div>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold">Levenshtein 98.4% Match → Merged into Single Drive</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-100/70 rounded-lg text-[11px] text-slate-600">
                      <span>Batch Cohort Matched</span>
                      <span className="font-bold text-indigo-700">142 Eligible Candidates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer className="relative z-10 border-t border-indigo-100/80 bg-white/90 backdrop-blur-md py-10">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <div className="text-left">
                <span className="text-base font-bold tracking-[0.2em] text-slate-900">DRISHTI</span>
                <p className="text-xs text-slate-500">Evidence-Backed Placement Operating System</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
              <button onClick={() => setView("student")} className="hover:text-indigo-600 transition cursor-pointer">
                🎓 Student Portal
              </button>
              <button onClick={() => setView("industry")} className="hover:text-sky-600 transition cursor-pointer">
                🏢 Industry Portal
              </button>
              <button onClick={() => setView("tpo")} className="hover:text-emerald-600 transition cursor-pointer">
                🏛️ Placement Team Portal
              </button>
              <button onClick={() => setTourOpen(true)} className="hover:text-amber-600 transition cursor-pointer">
                ✨ Interactive Tour
              </button>
            </div>

            <div className="text-center md:text-right text-xs text-slate-400">
              <span>Trusted by leading universities & hiring partners.</span>
              <div className="font-semibold text-slate-500 mt-0.5">© 2026 DRISHTI. All rights reserved.</div>
            </div>
          </div>
        </div>
      </footer>

      {/* Platform Tour Modal */}
      <PlatformTourModal open={tourOpen} onOpenChange={setTourOpen} />
    </div>
  );
}

function BrandMark() {
  return (
    <svg viewBox="0 0 23 17" className="h-[19px] w-[25px]" fill="none" aria-hidden>
      <path d="M2 1 L9 16" stroke="url(#g1)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M8 1 L15 16" stroke="url(#g2)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M14 1 L21 16" stroke="url(#g1)" strokeWidth="2.4" strokeLinecap="round" />
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FeatChevron() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden>
      <path d="M4 2 L8 6 L4 10" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
