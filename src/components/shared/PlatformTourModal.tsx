"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  FileText,
  Video,
  SlidersHorizontal,
  Workflow,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface Step {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  accent: string;
  points: string[];
  demoTip: string;
}

const STEPS: Step[] = [
  {
    title: "Proof Over Claims, Zero Inflation",
    subtitle: "The Core DRISHTI Philosophy",
    badge: "Core Architecture",
    icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
    accent: "text-emerald-600",
    points: [
      "Traditional resumes allow students to claim any skill without consequence.",
      "DRISHTI binds every bullet point to cryptographic evidence: GitHub commit SHAs, proctored test logs, and faculty rubrics.",
      "Unverified skills are explicitly flagged as unverified and cannot be added to an ATS-verified resume.",
    ],
    demoTip: "Check the 'Evidence Ledger' in the Student Portal to see live GitHub permalinks.",
  },
  {
    title: "Truth-Enforced Resume Studio",
    subtitle: "RenderCV-Quality ATS Pipeline + BS Detector",
    badge: "Student Feature",
    icon: <FileText className="h-6 w-6 text-sky-600" />,
    accent: "text-sky-600",
    points: [
      "Immutable Student Profile: Full Name, Roll No., Department, and CGPA are locked directly from university records.",
      "Interactive Skill Checklist: Only verified skills can be toggled on for resume bullets.",
      "Mode 2 (Resume BS Detector): Paste any unformatted resume to instantly detect and strip unverified buzzwords.",
      "Live PDF Preview & 1-Click ATS export with verified QR verification badges.",
    ],
    demoTip: "Visit Student Portal > Resume Studio to test both the 1-Click ATS Generator and the BS Detector.",
  },
  {
    title: "Anti-Cheating AI Proctoring",
    subtitle: "Browser-Level Integrity Safeguards",
    badge: "Verification Engine",
    icon: <Video className="h-6 w-6 text-amber-600" />,
    accent: "text-amber-600",
    points: [
      "Real-time tab-switching and window-blur interception.",
      "Audio level anomaly tracking for background conversation detection.",
      "Multi-face and absence detection using computer vision.",
      "Tamper-proof event logs permanently attached to the student's skill ledger.",
    ],
    demoTip: "Visit Student Portal > Assessment & Proctoring to run a live test and trigger warnings.",
  },
  {
    title: "Industry Portal & Dynamic Ranking",
    subtitle: "Evidence-Backed Recruiter OS",
    badge: "Recruiter Feature",
    icon: <SlidersHorizontal className="h-6 w-6 text-indigo-600" />,
    accent: "text-indigo-600",
    points: [
      "Interactive Fit Weight Sliders: Adjust Required vs Preferred vs Project weights in real-time.",
      "Zero-Fluff Evidence Filters: Filter candidates with verified Redis GitHub code, >85% proctored scores, or 0 proctor warnings.",
      "Side-by-Side Candidate Comparison Matrix for rapid hiring decisions.",
      "Instant Proof Inspector Drawer with full source code previews.",
    ],
    demoTip: "Switch to Industry Portal to slide weights and click 'Inspect' on candidates.",
  },
  {
    title: "TPO Master Pipeline & JD Ingestion",
    subtitle: "Automating Campus Placement Drives",
    badge: "TPO Admin",
    icon: <Workflow className="h-6 w-6 text-purple-600" />,
    accent: "text-purple-600",
    points: [
      "WhatsApp & Forwarded Email JD Parser: Paste messy text to extract role, CTC, and required skills.",
      "Smart Job Deduplication: Merges identical drives from multiple recruiter sources.",
      "Batch Ranker & Eligibility Engine: Auto-screens batches against CGPA and skill requirements.",
      "Audit Trail & Live Drive Analytics across companies.",
    ],
    demoTip: "Switch to TPO Admin > JD Ingestion to test the WhatsApp raw source deduplicator.",
  },
];

export function PlatformTourModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];

  const next = () => setCurrentStep((c) => Math.min(STEPS.length - 1, c + 1));
  const prev = () => setCurrentStep((c) => Math.max(0, c - 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-slate-200 bg-white/95 p-0 text-slate-900 shadow-2xl backdrop-blur-2xl">
        <DialogHeader className="border-b border-slate-200/80 bg-slate-50/50 p-5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-slate-500 shadow-2xs">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              DRISHTI Platform Walkthrough ({currentStep + 1} of {STEPS.length})
            </div>
            <span className="text-[11px] font-mono font-semibold text-indigo-600">{step.badge}</span>
          </div>
          <DialogTitle className="mt-2 flex items-center gap-2.5 text-lg font-bold text-slate-900">
            {step.icon}
            {step.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {step.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          <div className="space-y-2.5">
            {step.points.map((p, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-600">
                <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${step.accent}`} />
                <span>{p}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-800">
              💡 Live Demo Tip
            </div>
            <p className="mt-1 text-[12px] leading-normal text-slate-700">
              {step.demoTip}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep
                    ? "w-6 bg-indigo-600"
                    : "w-2 bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={prev}
                className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                Previous
              </Button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <Button
                size="sm"
                onClick={next}
                className="bg-gradient-to-r from-indigo-500 to-sky-500 font-semibold text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
              >
                Next
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onOpenChange(false)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all"
              >
                Explore Platform
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
