"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import {
  type StudentProfilePayload,
  type TenthRecord,
  type TwelfthRecord,
  type EngineeringRecord,
  type CodingEcosystem,
  type VerifiedProofItem,
  type ScrubbedSkillItem,
  ONBOARDING_SKILL_CATEGORIES,
} from "@/lib/onboarding-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  GraduationCap,
  FolderGit2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Github,
  Globe,
  Code2,
  Terminal,
  Database,
  Cloud,
  Cpu,
  Brain,
  Info,
} from "lucide-react";

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Telecommunication (ENTC)",
  "Artificial Intelligence & Data Science",
  "Electrical Engineering",
  "Mechanical Engineering",
];

const GRAD_YEARS = [2025, 2026, 2027, 2028];

export function StudentOnboardingModal() {
  const open = useAppStore((s) => s.onboardingModalOpen);
  const setOpen = useAppStore((s) => s.setOnboardingModalOpen);
  const currentPayload = useAppStore((s) => s.onboardingPayload);
  const setOnboardingPayload = useAppStore((s) => s.setOnboardingPayload);

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitPhase, setSubmitPhase] = useState<string>("");

  // Step 1: Authentication & Core Identity
  const [fullName, setFullName] = useState<string>(currentPayload.fullName || "");
  const [email, setEmail] = useState<string>(currentPayload.email || "");
  const [password, setPassword] = useState<string>("••••••••");
  const [confirmPassword, setConfirmPassword] = useState<string>("••••••••");
  const [rollNumber, setRollNumber] = useState<string>(currentPayload.rollNumber || "");
  const [department, setDepartment] = useState<string>(currentPayload.department || DEPARTMENTS[0]);
  const [gradYear, setGradYear] = useState<number>(currentPayload.gradYear || 2026);

  // Step 2: Academic Ledger
  const [tenth, setTenth] = useState<TenthRecord>(currentPayload.tenth);
  const [twelfth, setTwelfth] = useState<TwelfthRecord>(currentPayload.twelfth);
  const [collegeName, setCollegeName] = useState<string>(
    currentPayload.engineering.collegeName || "COEP Technological University, Pune"
  );
  const [sgpas, setSgpas] = useState<number[]>(
    currentPayload.engineering.sgpas.length === 8
      ? currentPayload.engineering.sgpas
      : [8.9, 9.1, 9.25, 9.3, 9.15, 9.4, 0, 0]
  );
  const [activeBacklogs, setActiveBacklogs] = useState<number>(
    currentPayload.engineering.activeBacklogs || 0
  );

  // Step 3: Coding Ecosystem
  const [githubUrl, setGithubUrl] = useState<string>(
    currentPayload.codingEcosystem.githubUrl || "https://github.com/ombadhan45"
  );
  const [leetcodeUrl, setLeetcodeUrl] = useState<string>(
    currentPayload.codingEcosystem.leetcodeUrl || ""
  );
  const [hackerrankUrl, setHackerrankUrl] = useState<string>(
    currentPayload.codingEcosystem.hackerrankUrl || ""
  );
  const [codechefUrl, setCodechefUrl] = useState<string>(
    currentPayload.codingEcosystem.codechefUrl || ""
  );
  const [portfolioUrl, setPortfolioUrl] = useState<string>(
    currentPayload.codingEcosystem.portfolioUrl || ""
  );

  // Step 4: Initial Skill Assertion
  const [claimedSkills, setClaimedSkills] = useState<Set<string>>(
    () => new Set(currentPayload.claimedSkills)
  );

  // Auto-calculated CGPA from valid entered non-zero SGPAs
  const calculatedCgpa = useMemo(() => {
    const validScores = sgpas.filter((s) => s > 0 && s <= 10);
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((acc, curr) => acc + curr, 0);
    return Number((sum / validScores.length).toFixed(2));
  }, [sgpas]);

  const updateSgpa = (index: number, val: number) => {
    const updated = [...sgpas];
    updated[index] = Math.max(0, Math.min(10, val));
    setSgpas(updated);
  };

  const toggleClaimedSkill = (skill: string) => {
    const next = new Set(claimedSkills);
    if (next.has(skill)) {
      next.delete(skill);
    } else {
      next.add(skill);
    }
    setClaimedSkills(next);
  };

  // Submission handler with realistic mock pipeline
  const handleSubmitOnboarding = () => {
    setIsSubmitting(true);
    setSubmitPhase("Anchoring identity to institutional cryptographic ledger...");

    setTimeout(() => {
      setSubmitPhase("Scanning GitHub repositories for code permalinks...");
    }, 400);

    setTimeout(() => {
      setSubmitPhase("Executing Truth-Gatekeeper: Scrubbing unverified skills...");
    }, 800);

    setTimeout(() => {
      // Build final verified vs scrubbed lists based on current state & known evidence
      const claimedArray = Array.from(claimedSkills);
      const existingVerifiedMap = new Map<string, VerifiedProofItem>();
      currentPayload.evidenceLedger.verifiedSkills.forEach((v) => {
        existingVerifiedMap.set(v.skill, v);
      });

      const finalVerified: VerifiedProofItem[] = [];
      const finalScrubbed: ScrubbedSkillItem[] = [];

      claimedArray.forEach((sk) => {
        if (existingVerifiedMap.has(sk)) {
          finalVerified.push(existingVerifiedMap.get(sk)!);
        } else if (["React", "Node.js", "Redis", "PostgreSQL", "TypeScript", "Python"].includes(sk)) {
          finalVerified.push({
            skill: sk,
            source: "github",
            proofId: `ev_onboard_${sk.toLowerCase()}`,
            proofUrl: `${githubUrl.replace(/\/$/, "")}/commit/a8f3b12`,
            commitSha: "a8f3b12",
            verifiedAt: new Date().toISOString().split("T")[0],
            details: `Automated AST pattern scan verified across repository imports for ${sk}`,
          });
        } else {
          finalScrubbed.push({
            skill: sk,
            status: "unverified",
            reason: `No cryptographic GitHub commits or proctored test logs found for ${sk}. Scrubbed from ATS output.`,
          });
        }
      });

      const finalPayload: StudentProfilePayload = {
        fullName: fullName.trim() || "Student",
        email: email.trim() || "student@university.edu",
        password,
        confirmPassword,
        rollNumber: rollNumber.trim() || "PRN-2022-001",
        department,
        gradYear,
        tenth,
        twelfth,
        engineering: {
          collegeName,
          sgpas,
          cgpa: calculatedCgpa,
          activeBacklogs,
        },
        codingEcosystem: {
          githubUrl: githubUrl.trim(),
          leetcodeUrl: leetcodeUrl.trim(),
          hackerrankUrl: hackerrankUrl.trim(),
          codechefUrl: codechefUrl.trim(),
          portfolioUrl: portfolioUrl.trim(),
        },
        claimedSkills: claimedArray,
        evidenceLedger: {
          verifiedSkills: finalVerified,
          scrubbedSkills: finalScrubbed,
        },
        submittedAt: new Date().toISOString(),
      };

      setOnboardingPayload(finalPayload);
      setIsSubmitting(false);
      setOpen(false);

      // Toast notification
      window.dispatchEvent(
        new CustomEvent("drishti:toast", {
          detail: {
            title: "Onboarding Saved",
            description: `Academic ledger & ${finalVerified.length} verified evidence anchors synchronized.`,
          },
        })
      );

      // Redirect to Resume Studio tab
      window.dispatchEvent(
        new CustomEvent("drishti:goto-tab", {
          detail: "resume",
        })
      );
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl border-slate-200 bg-white/95 p-0 text-slate-900 shadow-2xl backdrop-blur-2xl sm:max-w-3xl">
        {/* Header */}
        <DialogHeader className="border-b border-slate-200/80 bg-slate-50/50 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 shadow-2xs">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              DRISHTI Student Onboarding Pipeline
            </div>
            <span className="text-[12px] font-mono text-slate-500">
              Step {step} of 4
            </span>
          </div>
          <DialogTitle className="mt-2 text-xl font-bold text-slate-900">
            {step === 1 && "Step 1: Authentication & Core Identity"}
            {step === 2 && "Step 2: Academic Ledger (Strict ATS Records)"}
            {step === 3 && "Step 3: Coding Ecosystem (Evidence Anchors)"}
            {step === 4 && "Step 4: Initial Skill Assertion & Truth-Gatekeeper"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {step === 1 && "Institutional identity locked to university records — uneditable in the resume."}
            {step === 2 && "Accurate secondary, higher secondary, and engineering semester scores."}
            {step === 3 && "Profile links queried by DRISHTI's background scanner to extract proof."}
            {step === 4 && "Claim your technical proficiencies. Unverified claims will be automatically scrubbed."}
          </DialogDescription>

          {/* Stepper progress bar */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s < step
                    ? "bg-emerald-500"
                    : s === step
                    ? "bg-indigo-600 shadow-2xs"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        {/* Form Body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Full Legal Name *</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Om Badhan"
                    className="border-slate-200 bg-white text-slate-900 shadow-2xs focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Institutional Email *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@coep.ac.in"
                    className="border-slate-200 bg-white text-slate-900 shadow-2xs focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-slate-200 bg-white text-slate-900 shadow-2xs focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-slate-200 bg-white text-slate-900 shadow-2xs focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">College Roll No. / PRN *</Label>
                  <Input
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="2022BTECS00042"
                    className="border-slate-200 bg-white text-slate-900 font-mono shadow-2xs focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Department / Branch *</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="border-slate-200 bg-white text-slate-900 shadow-2xs">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 bg-white text-slate-900 shadow-lg">
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Graduation Year *</Label>
                  <Select
                    value={String(gradYear)}
                    onValueChange={(v) => setGradYear(Number(v))}
                  >
                    <SelectTrigger className="border-slate-200 bg-white text-slate-900 shadow-2xs">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 bg-white text-slate-900 shadow-lg">
                      {GRAD_YEARS.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          Batch of {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <div className="space-y-5">
              {/* 10th Standard */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
                  <GraduationCap className="h-3.5 w-3.5 text-sky-600" />
                  10th Standard (Secondary Education)
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-[11px] text-slate-500">School Name</Label>
                    <Input
                      value={tenth.schoolName}
                      onChange={(e) => setTenth({ ...tenth, schoolName: e.target.value })}
                      placeholder="St. Vincent High School"
                      className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-500">Board</Label>
                    <Input
                      value={tenth.board}
                      onChange={(e) => setTenth({ ...tenth, board: e.target.value })}
                      placeholder="CBSE / ICSE / State"
                      className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-500">Percentage / CGPA</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tenth.percentageOrCgpa}
                      onChange={(e) =>
                        setTenth({ ...tenth, percentageOrCgpa: parseFloat(e.target.value) || 0 })
                      }
                      className="border-slate-200 bg-white text-slate-900 text-xs font-mono shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* 12th Standard / Diploma */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <GraduationCap className="h-3.5 w-3.5 text-amber-600" />
                  12th Standard / Polytechnic Diploma
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-[11px] text-slate-500">Junior College / Polytechnic Name</Label>
                    <Input
                      value={twelfth.collegeName}
                      onChange={(e) => setTwelfth({ ...twelfth, collegeName: e.target.value })}
                      placeholder="Fergusson Junior College"
                      className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-500">Board / Directorate</Label>
                    <Input
                      value={twelfth.board}
                      onChange={(e) => setTwelfth({ ...twelfth, board: e.target.value })}
                      placeholder="State Board / MSBTE"
                      className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-500">Percentage (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={twelfth.percentage}
                      onChange={(e) =>
                        setTwelfth({ ...twelfth, percentage: parseFloat(e.target.value) || 0 })
                      }
                      className="border-slate-200 bg-white text-slate-900 text-xs font-mono shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Engineering Semester Scores */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                    Engineering Semester Scores (SGPA 1 to 8)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Cumulative CGPA:</span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 font-mono shadow-2xs">
                      {calculatedCgpa} / 10.0
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {sgpas.map((val, idx) => (
                    <div key={idx} className="space-y-1 text-center">
                      <Label className="text-[10px] text-slate-500">Sem {idx + 1}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={val === 0 ? "" : val}
                        onChange={(e) => updateSgpa(idx, parseFloat(e.target.value) || 0)}
                        placeholder="—"
                        className="border-slate-200 bg-white text-center text-slate-900 text-xs font-mono p-1 shadow-2xs"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">Active Backlogs / KT Count</Label>
                    <Input
                      type="number"
                      min="0"
                      value={activeBacklogs}
                      onChange={(e) => setActiveBacklogs(parseInt(e.target.value, 10) || 0)}
                      className="w-28 border-slate-200 bg-white text-slate-900 font-mono shadow-2xs"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-xs text-right">
                    ATS filters automatically check zero active backlogs against institutional eligibility criteria.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-3 flex items-start gap-2.5 text-xs text-slate-700">
                <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  DRISHTI uses these URLs as cryptographic evidence anchors. Commits, solved problems, and repositories will be scanned to prove claimed proficiencies.
                </span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                    <Github className="h-3.5 w-3.5 text-slate-700" />
                    GitHub Profile URL <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                    <Terminal className="h-3.5 w-3.5 text-amber-600" />
                    LeetCode Profile / Username
                  </Label>
                  <Input
                    value={leetcodeUrl}
                    onChange={(e) => setLeetcodeUrl(e.target.value)}
                    placeholder="https://leetcode.com/u/username"
                    className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                    <Code2 className="h-3.5 w-3.5 text-emerald-600" />
                    HackerRank Profile URL
                  </Label>
                  <Input
                    value={hackerrankUrl}
                    onChange={(e) => setHackerrankUrl(e.target.value)}
                    placeholder="https://www.hackerrank.com/profile/username"
                    className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                    <Cpu className="h-3.5 w-3.5 text-purple-600" />
                    CodeChef / Codeforces Handle
                  </Label>
                  <Input
                    value={codechefUrl}
                    onChange={(e) => setCodechefUrl(e.target.value)}
                    placeholder="https://www.codechef.com/users/username"
                    className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                    <Globe className="h-3.5 w-3.5 text-amber-600" />
                    Personal Portfolio / Deployed Project Website
                  </Label>
                  <Input
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourname.dev"
                    className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4 ================= */}
          {step === 4 && (
            <div className="space-y-5">
              {/* CRITICAL AMBER ALERT */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Truth-Enforced Gatekeeper Policy
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-amber-900">
                    All selected skills are initialized as <strong className="text-slate-900">⚠️ Unverified</strong> and will be hidden from your final resume until backed by GitHub code scanning or proctored assessments.
                  </p>
                </div>
              </div>

              {/* Categorized Multi-Select Grid */}
              <div className="space-y-4">
                {Object.entries(ONBOARDING_SKILL_CATEGORIES).map(([category, skills]) => (
                  <div key={category} className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      {category === "Languages" && <Code2 className="h-3 w-3 text-indigo-600" />}
                      {category === "Web Dev" && <Cpu className="h-3 w-3 text-sky-600" />}
                      {category === "Databases" && <Database className="h-3 w-3 text-amber-600" />}
                      {category === "DevOps" && <Cloud className="h-3 w-3 text-purple-600" />}
                      {category === "AI / ML" && <Brain className="h-3 w-3 text-emerald-600" />}
                      {category}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {skills.map((sk) => {
                        const selected = claimedSkills.has(sk);
                        return (
                          <button
                            type="button"
                            key={sk}
                            onClick={() => toggleClaimedSkill(sk)}
                            aria-pressed={selected}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer shadow-2xs ${
                              selected
                                ? "border-indigo-400 bg-indigo-50 text-indigo-700 font-semibold"
                                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                selected ? "bg-indigo-600" : "bg-slate-300"
                              }`}
                            />
                            {sk}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 flex items-center justify-between text-xs text-slate-500">
                <span>Selected Skills: <strong className="text-slate-900">{claimedSkills.size}</strong></span>
                <span>Automatic Gatekeeper will scrub unverified proficiencies</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/80 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 1 || isSubmitting}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                className="bg-gradient-to-r from-indigo-500 to-sky-500 font-semibold text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Continue
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSubmitting || !fullName.trim() || !githubUrl.trim()}
                onClick={handleSubmitOnboarding}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 font-bold text-white shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/45 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {submitPhase || "Securing Ledger..."}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-1.5 h-4 w-4" />
                    Complete Onboarding &amp; Generate Resume
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
