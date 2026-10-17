"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import {
  type StudentSignupPayload,
  CANONICAL_TECHNICAL_SKILLS,
  countWords,
} from "@/lib/student-signup-types";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Github,
  Linkedin,
  Plus,
  X,
  Search,
  Globe,
  Code2,
  Terminal,
  Cpu,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
  "Electronics & Telecommunication (ENTC)",
  "Electrical Engineering",
  "Mechanical Engineering",
];

const GRAD_YEARS = [2024, 2025, 2026, 2027, 2028];

export function StudentOnboardingModal({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const router = useRouter();
  const storeOpen = useAppStore((s) => s.studentOnboardingModalOpen);
  const setStoreOpen = useAppStore((s) => s.setStudentOnboardingModalOpen);
  const onboardStudent = useAppStore((s) => s.onboardStudent);

  const isOpen = open !== undefined ? open : storeOpen;
  const handleOpenChange = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    setStoreOpen(v);
  };

  useEffect(() => {
    const handler = () => {
      setStoreOpen(true);
      if (onOpenChange) onOpenChange(true);
    };
    window.addEventListener("drishti:open-student-onboarding", handler);
    return () => window.removeEventListener("drishti:open-student-onboarding", handler);
  }, [setStoreOpen, onOpenChange]);

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");

  // ================= STEP 1: Personal, Local & Bio =================
  // CRITICAL: DO NOT ask for PRN or Roll Number
  const [fullName, setFullName] = useState<string>("Aarav Sharma");
  const [personalEmail, setPersonalEmail] = useState<string>("aarav.sharma@gmail.com");
  const [phone, setPhone] = useState<string>("+91 98765 43210");
  const [city, setCity] = useState<string>("Pune");
  const [state, setState] = useState<string>("Maharashtra");
  const [pinCode, setPinCode] = useState<string>("411005");
  const [bio, setBio] = useState<string>(
    "Aspiring full-stack engineer passionate about high-concurrency distributed systems, microservices architecture, and automated CI/CD deployment pipelines."
  );

  // Bio Word Count Calculation & Constraint (Max 150 words)
  const bioWordCount = useMemo(() => countWords(bio), [bio]);
  const isBioValid = bioWordCount > 0 && bioWordCount <= 150;

  // ================= STEP 2: Education & College =================
  const [collegeName, setCollegeName] = useState<string>(
    "COEP Technological University, Pune"
  );
  const [branch, setBranch] = useState<string>(DEPARTMENTS[0]);
  const [gradYear, setGradYear] = useState<number>(2026);
  const [cgpa, setCgpa] = useState<number>(9.18);

  const [tenthSchool, setTenthSchool] = useState<string>("Delhi Public School");
  const [tenthBoard, setTenthBoard] = useState<string>("CBSE");
  const [tenthYear, setTenthYear] = useState<number>(2020);
  const [tenthScore, setTenthScore] = useState<number>(95.2);

  const [twelfthCollege, setTwelfthCollege] = useState<string>(
    "Fergusson Junior College"
  );
  const [twelfthBoard, setTwelfthBoard] = useState<string>("State Board (HSC)");
  const [twelfthStream, setTwelfthStream] = useState<string>("Science (PCM)");
  const [twelfthScore, setTwelfthScore] = useState<number>(93.6);
  const [twelfthYear, setTwelfthYear] = useState<number>(2022);

  // ================= STEP 3: Professional Status & Platform Links =================
  const [professionalStatus, setProfessionalStatus] = useState<"Fresher" | "Employed">("Fresher");
  const [employedCompany, setEmployedCompany] = useState<string>("");
  const [employedRole, setEmployedRole] = useState<string>("");

  // Mandatory Links
  const [linkedin, setLinkedin] = useState<string>(
    "https://linkedin.com/in/aarav-sharma-dev"
  );
  const [github, setGithub] = useState<string>(
    "https://github.com/aaravsharma-dev"
  );

  // Optional Links
  const [showOptionalLinks, setShowOptionalLinks] = useState<boolean>(false);
  const [leetcode, setLeetcode] = useState<string>("https://leetcode.com/u/aaravsharma");
  const [kaggle, setKaggle] = useState<string>("");
  const [hackerrank, setHackerrank] = useState<string>("");
  const [codeforces, setCodeforces] = useState<string>("");
  const [portfolio, setPortfolio] = useState<string>("https://aaravsharma.dev");

  // ================= STEP 4: Skill Selection (Strict Assessment Logic) =================
  const [pendingSkills, setPendingSkills] = useState<string[]>([
    "React",
    "Python",
    "Machine Learning",
    "Docker",
  ]);
  const [skillSearch, setSkillSearch] = useState<string>("");

  // Filter skills based on search
  const filteredSkills = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return CANONICAL_TECHNICAL_SKILLS.slice(0, 16);
    return CANONICAL_TECHNICAL_SKILLS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [skillSearch]);

  const toggleSkill = (skillName: string) => {
    if (pendingSkills.includes(skillName)) {
      setPendingSkills(pendingSkills.filter((s) => s !== skillName));
    } else {
      setPendingSkills([...pendingSkills, skillName]);
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = skillSearch.trim();
    if (trimmed && !pendingSkills.includes(trimmed)) {
      setPendingSkills([...pendingSkills, trimmed]);
      setSkillSearch("");
    }
  };

  // Step Validation Checkers
  const canProceedStep1 =
    fullName.trim().length >= 2 &&
    personalEmail.includes("@") &&
    phone.trim().length >= 8 &&
    city.trim().length >= 2 &&
    state.trim().length >= 2 &&
    pinCode.trim().length >= 4 &&
    isBioValid;

  const canProceedStep2 =
    collegeName.trim().length >= 3 &&
    branch.trim().length >= 2 &&
    cgpa > 0 &&
    cgpa <= 10 &&
    tenthScore > 0 &&
    twelfthScore > 0;

  const canProceedStep3 =
    linkedin.trim().length >= 5 &&
    github.trim().length >= 5 &&
    (professionalStatus === "Fresher" ||
      (employedCompany.trim().length > 0 && employedRole.trim().length > 0));

  const canProceedStep4 = pendingSkills.length > 0;

  // Handle Complete Registration & Enter Dashboard
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    const payload: StudentSignupPayload = {
      profileData: {
        personalEmail: personalEmail.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        location: {
          city: city.trim(),
          state: state.trim(),
          pinCode: pinCode.trim(),
        },
        education: {
          tenth: {
            schoolName: tenthSchool.trim(),
            board: tenthBoard.trim(),
            score: tenthScore,
            year: tenthYear,
          },
          twelfth: {
            collegeName: twelfthCollege.trim(),
            board: twelfthBoard.trim(),
            stream: twelfthStream.trim(),
            score: twelfthScore,
            year: twelfthYear,
          },
          college: {
            name: collegeName.trim(),
            branch: branch.trim(),
            gradYear,
            cgpa,
          },
        },
        professionalStatus,
        employmentDetails:
          professionalStatus === "Employed"
            ? { company: employedCompany.trim(), role: employedRole.trim() }
            : undefined,
        links: {
          linkedin: linkedin.trim(),
          github: github.trim(),
          leetcode: leetcode.trim() || undefined,
          kaggle: kaggle.trim() || undefined,
          hackerrank: hackerrank.trim() || undefined,
          codeforces: codeforces.trim() || undefined,
          portfolio: portfolio.trim() || undefined,
        },
      },
      pendingSkills, // CRITICAL: Isolated to Assessment Queue only!
    };

    try {
      // 1. Submit to API route
      const res = await fetch("/api/student/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to complete student onboarding");
      }

      // 2. Commit to Zustand Store
      onboardStudent(payload);

      // 3. Dispatch global toast
      window.dispatchEvent(
        new CustomEvent("drishti:toast", {
          detail: {
            title: "Student Registered Successfully",
            description: `Welcome, ${payload.profileData.fullName}! ${pendingSkills.length} skills queued for proctored verification.`,
          },
        })
      );

      // 4. Close modal and navigate immediately to /student
      setIsSubmitting(false);
      handleOpenChange(false);
      router.push("/student");
    } catch (err) {
      console.error("Onboarding submission error:", err);
      // Fallback: If network issue, still commit locally to store for resilient offline experience
      onboardStudent(payload);
      handleOpenChange(false);
      router.push("/student");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl border border-white bg-white/95 p-0 text-slate-900 backdrop-blur-2xl sm:max-w-3xl shadow-2xl shadow-indigo-500/10">
        {/* Header */}
        <DialogHeader className="border-b border-indigo-100 bg-slate-50/70 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 shadow-2xs">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              DRISHTI Student Login / Signup Pipeline
            </div>
            <span className="text-[12px] font-mono font-medium text-slate-400">
              Step {step} of 4
            </span>
          </div>

          <DialogTitle className="mt-2 text-xl font-bold text-slate-900 flex items-center gap-2">
            {step === 1 && "Step 1: Personal, Local & Bio Information"}
            {step === 2 && "Step 2: Education & College Information"}
            {step === 3 && "Step 3: Professional Status & Platform Links"}
            {step === 4 && "Step 4: Technical Skill Selection (Verification Queue)"}
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-500">
            {step === 1 &&
              "Register your identity. All data is anchored to your student profile and ATS resume."}
            {step === 2 &&
              "Verified academic ledger records for secondary, higher secondary, and engineering studies."}
            {step === 3 &&
              "Provide career status and repository links for automated cryptographic evidence extraction."}
            {step === 4 &&
              "Choose skills for proctored evaluation. Unverified skills are kept in the assessment queue."}
          </DialogDescription>

          {/* Stepper Progress */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s < step
                    ? "bg-emerald-500"
                    : s === step
                    ? "bg-indigo-600 shadow-xs"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        {/* Wizard Form Content */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {submitError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2 shadow-2xs">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* ================= STEP 1: PERSONAL, LOCAL & BIO ================= */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Personal Details */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1 space-y-1.5">
                  <Label className="text-xs text-slate-700 font-medium flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-indigo-600" />
                    Full Legal Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="border-slate-200 bg-white text-slate-900 shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-1 space-y-1.5">
                  <Label className="text-xs text-slate-700 font-medium flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-indigo-600" />
                    Personal Email <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-1 space-y-1.5">
                  <Label className="text-xs text-slate-700 font-medium flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    Primary Phone Number <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* Local Information */}
              <div className="rounded-xl border border-indigo-100 bg-slate-50/70 p-4 space-y-3 shadow-2xs">
                <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Local Address &amp; Location
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">
                      Current City <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune"
                      className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">
                      State <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">
                      Pin Code <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="e.g. 411005"
                      className="border-slate-200 bg-white text-slate-900 text-xs font-mono shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Short Bio (Max 150 words) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-700 font-medium">
                    Short Bio (Career Goals &amp; Introduction) <span className="text-rose-500">*</span>
                  </Label>
                  <span
                    className={`text-[11px] font-mono ${
                      bioWordCount > 150
                        ? "text-rose-600 font-bold"
                        : "text-slate-400"
                    }`}
                  >
                    {bioWordCount} / 150 words
                  </span>
                </div>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell recruiters about yourself, your core interests in engineering, and your career goals (max 150 words)..."
                  className={`border-slate-200 bg-white text-slate-900 text-xs leading-relaxed shadow-2xs ${
                    bioWordCount > 150 ? "border-rose-500 focus-visible:ring-rose-500" : ""
                  }`}
                />
                {bioWordCount > 150 && (
                  <p className="text-[10px] text-rose-600 font-medium">
                    Bio exceeds the 150-word maximum. Please condense your summary.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 2: EDUCATION & COLLEGE ================= */}
          {step === 2 && (
            <div className="space-y-4">
              {/* College Information */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3 shadow-2xs">
                <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  Undergraduate Engineering Information
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-[11px] text-slate-600 font-medium">College Name *</Label>
                    <Input
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="COEP Technological University, Pune"
                      className="border-slate-200 bg-white text-slate-900 text-xs font-semibold shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">Department / Branch *</Label>
                    <Select value={branch} onValueChange={setBranch}>
                      <SelectTrigger className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-200 bg-white text-slate-900 shadow-xl">
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d} className="text-xs">
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-600 font-medium">Expected Grad Year *</Label>
                      <Select
                        value={String(gradYear)}
                        onValueChange={(v) => setGradYear(Number(v))}
                      >
                        <SelectTrigger className="border-slate-200 bg-white text-slate-900 text-xs font-mono shadow-2xs">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="border-slate-200 bg-white text-slate-900 shadow-xl">
                          {GRAD_YEARS.map((y) => (
                            <SelectItem key={y} value={String(y)} className="text-xs font-mono">
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-600 font-medium">Cumulative CGPA *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={cgpa}
                        onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                        className="border-slate-200 bg-white text-slate-900 text-xs font-mono shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 10th Standard (Secondary) */}
              <div className="rounded-xl border border-indigo-100 bg-slate-50/70 p-4 space-y-3 shadow-2xs">
                <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  10th Standard (Secondary Education)
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">School Name *</Label>
                    <Input
                      value={tenthSchool}
                      onChange={(e) => setTenthSchool(e.target.value)}
                      placeholder="St. Vincent High School"
                      className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">Board *</Label>
                    <Input
                      value={tenthBoard}
                      onChange={(e) => setTenthBoard(e.target.value)}
                      placeholder="CBSE / ICSE / State"
                      className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-600 font-medium">Year *</Label>
                      <Input
                        type="number"
                        value={tenthYear}
                        onChange={(e) => setTenthYear(parseInt(e.target.value, 10) || 2020)}
                        className="border-slate-200 bg-white text-slate-900 text-xs font-mono shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-600 font-medium">% / CGPA *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tenthScore}
                        onChange={(e) => setTenthScore(parseFloat(e.target.value) || 0)}
                        className="border-slate-200 bg-white text-slate-900 text-xs font-mono shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 12th Standard / Diploma */}
              <div className="rounded-xl border border-indigo-100 bg-slate-50/70 p-4 space-y-3 shadow-2xs">
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  12th Standard / Polytechnic Diploma
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">Junior College / Polytechnic *</Label>
                    <Input
                      value={twelfthCollege}
                      onChange={(e) => setTwelfthCollege(e.target.value)}
                      placeholder="Fergusson Junior College"
                      className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">Board *</Label>
                    <Input
                      value={twelfthBoard}
                      onChange={(e) => setTwelfthBoard(e.target.value)}
                      placeholder="State Board / MSBTE"
                      className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-600 font-medium">Stream *</Label>
                    <Input
                      value={twelfthStream}
                      onChange={(e) => setTwelfthStream(e.target.value)}
                      placeholder="Science (PCM)"
                      className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-600 font-medium">Year *</Label>
                      <Input
                        type="number"
                        value={twelfthYear}
                        onChange={(e) => setTwelfthYear(parseInt(e.target.value, 10) || 2022)}
                        className="border-slate-200 bg-white text-slate-900 text-xs font-mono shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-600 font-medium">% Score *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={twelfthScore}
                        onChange={(e) => setTwelfthScore(parseFloat(e.target.value) || 0)}
                        className="border-slate-200 bg-white text-slate-900 text-xs font-mono shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PROFESSIONAL STATUS & PLATFORM LINKS ================= */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Employment Status Toggle / Radio */}
              <div className="rounded-xl border border-indigo-100 bg-slate-50/70 p-4 space-y-3 shadow-2xs">
                <Label className="text-xs text-slate-900 font-bold flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                  Employment Status <span className="text-rose-500">*</span>
                </Label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProfessionalStatus("Fresher")}
                    className={`rounded-xl border p-3 text-left transition cursor-pointer shadow-2xs ${
                      professionalStatus === "Fresher"
                        ? "border-indigo-500 bg-indigo-50/80 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">Fresher</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Full-time student seeking first graduate role or internship.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfessionalStatus("Employed")}
                    className={`rounded-xl border p-3 text-left transition cursor-pointer shadow-2xs ${
                      professionalStatus === "Employed"
                        ? "border-indigo-500 bg-indigo-50/80 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">
                      Already Employed / Interning
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Currently interning or hold prior industrial software experience.
                    </div>
                  </button>
                </div>

                {/* Dynamically Revealed Employment Inputs if Employed */}
                {professionalStatus === "Employed" && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 pt-3 border-t border-slate-200">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-600 font-medium">
                        Company Name <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        value={employedCompany}
                        onChange={(e) => setEmployedCompany(e.target.value)}
                        placeholder="e.g. Google / Microsoft / TCS"
                        className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-600 font-medium">
                        Role / Designation <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        value={employedRole}
                        onChange={(e) => setEmployedRole(e.target.value)}
                        placeholder="e.g. Software Engineer Intern"
                        className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Mandatory Platform Links */}
              <div className="rounded-xl border border-indigo-100 bg-slate-50/70 p-4 space-y-3 shadow-2xs">
                <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Mandatory Evidence Links</span>
                  <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                    Scanned by DRISHTI Engine
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                      <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                      LinkedIn Profile URL <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                      <Github className="h-3.5 w-3.5 text-slate-900" />
                      GitHub Profile URL <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Links Toggle & Inputs */}
              <div className="rounded-xl border border-indigo-100 bg-slate-50/70 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900">
                    Additional Competitive &amp; Portfolio Profiles
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowOptionalLinks(!showOptionalLinks)}
                    className="border-slate-200 bg-white text-[11px] text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold cursor-pointer"
                  >
                    <Plus className="mr-1 h-3 w-3 text-indigo-600" />
                    {showOptionalLinks ? "Hide Additional Links" : "Add More Profiles"}
                  </Button>
                </div>

                {showOptionalLinks && (
                  <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-200">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-700 font-medium flex items-center gap-1">
                        <Terminal className="h-3 w-3 text-amber-500" />
                        LeetCode Profile
                      </Label>
                      <Input
                        value={leetcode}
                        onChange={(e) => setLeetcode(e.target.value)}
                        placeholder="https://leetcode.com/u/username"
                        className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-700 font-medium flex items-center gap-1">
                        <Cpu className="h-3 w-3 text-indigo-600" />
                        Kaggle Profile
                      </Label>
                      <Input
                        value={kaggle}
                        onChange={(e) => setKaggle(e.target.value)}
                        placeholder="https://kaggle.com/username"
                        className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-700 font-medium flex items-center gap-1">
                        <Code2 className="h-3 w-3 text-emerald-600" />
                        HackerRank URL
                      </Label>
                      <Input
                        value={hackerrank}
                        onChange={(e) => setHackerrank(e.target.value)}
                        placeholder="https://hackerrank.com/username"
                        className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-700 font-medium flex items-center gap-1">
                        <Globe className="h-3 w-3 text-amber-500" />
                        Personal Portfolio URL
                      </Label>
                      <Input
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        placeholder="https://yourname.dev"
                        className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 4: SKILL SELECTION & ASSESSMENT QUEUE ================= */}
          {step === 4 && (
            <div className="space-y-5">
              {/* STRICT UI WARNING BANNER (AMBER ALERT) */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3 shadow-2xs">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Truth-Gatekeeper Policy
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-slate-700">
                    <strong>Note:</strong> Selected skills are queued for verification. They will{" "}
                    <span className="underline decoration-amber-500 font-bold text-slate-900">
                      NOT appear on your profile or generated resume
                    </span>{" "}
                    until you pass the platform assessments.
                  </p>
                </div>
              </div>

              {/* Searchable Skill Multi-Select Bar */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-900 font-bold flex items-center justify-between">
                  <span>Search &amp; Select Technical Skills</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {pendingSkills.length} selected for Assessment Queue
                  </span>
                </Label>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      placeholder="Search technical skills (e.g. React, Python, Docker)..."
                      className="border-slate-200 bg-white pl-9 text-xs text-slate-900 shadow-2xs"
                    />
                  </div>
                  {skillSearch && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomSkill}
                      className="bg-indigo-600 text-white hover:bg-indigo-500 font-semibold text-xs shadow-sm cursor-pointer"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add &ldquo;{skillSearch}&rdquo;
                    </Button>
                  )}
                </div>
              </div>

              {/* Selected Skill Chips with Remove Button */}
              {pendingSkills.length > 0 && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 space-y-2 shadow-2xs">
                  <div className="text-[11px] font-bold text-indigo-700">
                    Queued Skills (Awaiting Assessment):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pendingSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-xs"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {sk}
                        <button
                          type="button"
                          onClick={() => toggleSkill(sk)}
                          className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Canonical Skill Tag Suggestions */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Select Suggested Proficiencies
                </div>

                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                  {filteredSkills.map((sk) => {
                    const isSelected = pendingSkills.includes(sk.name);
                    return (
                      <button
                        key={sk.name}
                        type="button"
                        onClick={() => toggleSkill(sk.name)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition cursor-pointer shadow-2xs ${
                          isSelected
                            ? "border-indigo-400 bg-indigo-100/70 text-indigo-900"
                            : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isSelected ? "bg-indigo-600" : "bg-slate-300"
                          }`}
                        />
                        {sk.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-indigo-100 bg-slate-50/70 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 1 || isSubmitting}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {step < 4 ? (
              <Button
                type="button"
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2) ||
                  (step === 3 && !canProceedStep3)
                }
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Continue
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSubmitting || !canProceedStep4}
                onClick={handleSubmit}
                className="bg-emerald-600 text-white hover:bg-emerald-500 font-bold shadow-md shadow-emerald-500/25 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering &amp; Entering Dashboard...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-1.5 h-4 w-4" />
                    Complete Registration &amp; Enter Dashboard
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
