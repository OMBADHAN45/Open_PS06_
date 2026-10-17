"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  type CompanyOnboardingPayload,
  type OperatingModel,
  OPERATING_MODELS,
  INDUSTRY_SECTORS,
  validateCorporateEmail,
} from "@/lib/company-types";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lock,
  Globe,
  MapPin,
  FileCheck,
  Briefcase,
  Users,
  HelpCircle,
  Sparkles,
  Phone,
  Mail,
  User,
  KeyRound,
  ExternalLink,
} from "lucide-react";

export function CompanyOnboarding({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const storeOpen = useAppStore((s) => s.companyOnboardingOpen);
  const setStoreOpen = useAppStore((s) => s.setCompanyOnboardingOpen);
  const currentPayload = useAppStore((s) => s.companyPayload);
  const setCompanyPayload = useAppStore((s) => s.setCompanyPayload);

  // Controlled or uncontrolled from store
  const isOpen = open !== undefined ? open : storeOpen;
  const handleOpenChange = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    setStoreOpen(v);
  };

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitPhase, setSubmitPhase] = useState<string>("");

  // Step 1: Recruiter Identity & Authentication
  const [recruiterName, setRecruiterName] = useState<string>(
    currentPayload?.recruiterName || ""
  );
  const [corporateEmail, setCorporateEmail] = useState<string>(
    currentPayload?.corporateEmail || ""
  );
  const [password, setPassword] = useState<string>("••••••••");
  const [confirmPassword, setConfirmPassword] = useState<string>("••••••••");
  const [contactNumber, setContactNumber] = useState<string>(
    currentPayload?.contactNumber || ""
  );

  // Step 2: Core Company Profile
  const [companyName, setCompanyName] = useState<string>(
    currentPayload?.companyName || ""
  );
  const [companyPurpose, setCompanyPurpose] = useState<string>(
    currentPayload?.companyPurpose || ""
  );
  const [operatingModel, setOperatingModel] = useState<OperatingModel>(
    currentPayload?.operatingModel || "Product-Based"
  );
  const [establishmentYear, setEstablishmentYear] = useState<string>(
    currentPayload?.establishmentYear || "2018"
  );
  const [industry, setIndustry] = useState<string>(
    currentPayload?.industry || INDUSTRY_SECTORS[0]
  );

  // Step 3: Verification & Compliance Data
  const [cin, setCin] = useState<string>(currentPayload?.cin || "");
  const [website, setWebsite] = useState<string>(
    currentPayload?.website || ""
  );
  const [headquarters, setHeadquarters] = useState<string>(
    currentPayload?.headquarters || ""
  );

  // Step 4: Placement Hub Integration & Preferences
  const [allowAlumniReferrals, setAllowAlumniReferrals] = useState<boolean>(
    currentPayload?.allowAlumniReferrals ?? true
  );
  const [allowInterviewBank, setAllowInterviewBank] = useState<boolean>(
    currentPayload?.allowInterviewBank ?? true
  );

  // Validation feedback
  const emailValidation = validateCorporateEmail(corporateEmail);
  const isPasswordMatch = password.length >= 6 && password === confirmPassword;

  // Step requirement checks
  const canProceedStep1 =
    recruiterName.trim().length >= 2 &&
    emailValidation.isValid &&
    isPasswordMatch &&
    contactNumber.trim().length >= 8;

  const canProceedStep2 =
    companyName.trim().length >= 2 &&
    companyPurpose.trim().length >= 10 &&
    operatingModel !== "" &&
    establishmentYear.trim().length >= 4 &&
    industry.trim().length > 0;

  const canProceedStep3 =
    cin.trim().length >= 6 &&
    website.trim().length >= 4 &&
    headquarters.trim().length >= 2;

  // Handle registration & cryptographic verification simulation
  const handleSubmit = () => {
    setIsSubmitting(true);
    setSubmitPhase("Validating Corporate Domain DNS & MX records...");

    setTimeout(() => {
      setSubmitPhase("Cross-referencing CIN against MCA legal register...");
    }, 450);

    setTimeout(() => {
      setSubmitPhase("Anchoring verified hiring partner credentials...");
    }, 900);

    setTimeout(() => {
      const payload: CompanyOnboardingPayload = {
        recruiterName: recruiterName.trim(),
        corporateEmail: corporateEmail.trim(),
        contactNumber: contactNumber.trim(),
        companyName: companyName.trim(),
        companyPurpose: companyPurpose.trim(),
        operatingModel,
        establishmentYear: establishmentYear.trim(),
        industry: industry.trim(),
        cin: cin.trim().toUpperCase(),
        website: website.trim().startsWith("http")
          ? website.trim()
          : `https://${website.trim()}`,
        headquarters: headquarters.trim(),
        allowAlumniReferrals,
        allowInterviewBank,
        verificationStatus: "Verified",
        submittedAt: new Date().toISOString(),
      };

      setCompanyPayload(payload);
      setIsSubmitting(false);
      handleOpenChange(false);

      // Trigger global toast
      window.dispatchEvent(
        new CustomEvent("drishti:toast", {
          detail: {
            title: "Corporate Identity Verified",
            description: `${payload.companyName} (${payload.cin}) registered. Role-based access to the student evidence ledger is active.`,
          },
        })
      );
    }, 1400);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl rounded-2xl">
        {/* Stepper Header */}
        <DialogHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 shadow-2xs">
              <Building2 className="h-3.5 w-3.5" />
              DRISHTI Recruiter Onboarding &amp; Verification Pipeline
            </div>
            <span className="text-[12px] font-mono font-medium text-slate-500">
              Step {step} of 4
            </span>
          </div>

          <DialogTitle className="mt-2 text-xl font-bold text-slate-900 flex items-center gap-2">
            {step === 1 && "Step 1: Recruiter Identity & Authentication"}
            {step === 2 && "Step 2: Core Company Profile"}
            {step === 3 && "Step 3: Verification & Compliance Data"}
            {step === 4 && "Step 4: Placement Hub Integration & Final Review"}
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-500">
            {step === 1 &&
              "Establish your recruiter credentials. Public domains are rejected to enforce institutional trust."}
            {step === 2 &&
              "Define organization details and operating model displayed to candidate cohorts."}
            {step === 3 &&
              "Provide statutory corporate identification (CIN/LLPIN) to cryptographically anchor hiring legitimacy."}
            {step === 4 &&
              "Configure institutional referral routing, question bank telemetry, and review your profile."}
          </DialogDescription>

          {/* Stepper Indicator */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s < step
                    ? "bg-emerald-500"
                    : s === step
                    ? "bg-indigo-600 shadow-sm"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        {/* Wizard Content Body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {/* ================= STEP 1: RECRUITER IDENTITY & AUTHENTICATION ================= */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Role Gateway Toggle - Locked to Industry Portal */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      Role Gateway
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Authorized hiring partner authentication channel
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-mono text-[11px] font-semibold text-indigo-700">
                  <Lock className="h-3 w-3" />
                  🏢 Industry / Recruiter Portal
                </div>
              </div>

              {/* Recruiter Full Name & Contact Number */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-700 font-medium flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-indigo-600" />
                    Recruiter Full Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    Hiring Manager or Campus Talent Acquisition lead.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-700 font-medium flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    Primary Contact Number <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91 98234 56789"
                    className="border-slate-200 bg-white text-slate-900 font-mono placeholder:text-slate-400 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    Used strictly for placement drive coordination.
                  </p>
                </div>
              </div>

              {/* Official Corporate Email with Strict Frontend Domain Validation */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-sky-600" />
                    Official Corporate Email <span className="text-rose-500">*</span>
                  </span>
                  {corporateEmail && emailValidation.isValid && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-600 font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      Corporate Domain Verified ({emailValidation.domain})
                    </span>
                  )}
                </Label>
                <Input
                  type="email"
                  value={corporateEmail}
                  onChange={(e) => setCorporateEmail(e.target.value)}
                  placeholder="priya.sharma@company.com"
                  className={`border-slate-200 bg-white font-mono text-slate-900 placeholder:text-slate-400 shadow-2xs ${
                    corporateEmail && !emailValidation.isValid
                      ? "border-rose-400 focus-visible:ring-rose-500"
                      : corporateEmail && emailValidation.isValid
                      ? "border-emerald-400"
                      : ""
                  }`}
                />

                {/* Validation Banner if Public Email Domain is Entered */}
                {corporateEmail && !emailValidation.isValid && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 flex items-start gap-2 text-xs text-rose-800">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-rose-700">
                        Public Email Domain Rejected:
                      </span>{" "}
                      {emailValidation.error}
                    </div>
                  </div>
                )}
                {!corporateEmail && (
                  <p className="text-[11px] text-slate-400">
                    Domain must match your registered corporate entity. Consumer domains (@gmail.com, @yahoo.com) are strictly prohibited.
                  </p>
                )}
              </div>

              {/* Secure Password & Confirm Password */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-700 font-medium flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
                    Secure Password <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="border-slate-200 bg-white text-slate-900 shadow-2xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-700 font-medium flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
                    Confirm Password <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`border-slate-200 bg-white text-slate-900 shadow-2xs ${
                      confirmPassword && password !== confirmPassword
                        ? "border-rose-400"
                        : ""
                    }`}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] text-rose-600">
                      Passwords do not match.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: CORE COMPANY PROFILE ================= */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Company Canonical Name */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700 font-medium flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                  Canonical Company Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Finnable Credit / Novos Labs"
                  className="border-slate-200 bg-white text-slate-900 text-sm font-semibold shadow-2xs"
                />
                <p className="text-[10px] text-slate-400">
                  The official legal organization name presented on job descriptions and student offers.
                </p>
              </div>

              {/* Company Purpose / Mission Description */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700 font-medium flex items-center justify-between">
                  <span>
                    Company Purpose / Description <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {companyPurpose.length} characters
                  </span>
                </Label>
                <Textarea
                  value={companyPurpose}
                  onChange={(e) => setCompanyPurpose(e.target.value)}
                  rows={3}
                  placeholder="A brief overview of your organization's mission, products, services, and tech stack to help students understand the employer."
                  className="border-slate-200 bg-white text-slate-900 text-xs leading-relaxed shadow-2xs"
                />
              </div>

              {/* Operating Model (Interactive Cards / Radio) */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-700 font-medium flex items-center justify-between">
                  <span>Operating Model <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] font-semibold text-indigo-600">
                    {operatingModel || "Select Model"}
                  </span>
                </Label>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {OPERATING_MODELS.map((model) => {
                    const isSelected = operatingModel === model.value;
                    return (
                      <button
                        key={model.value}
                        type="button"
                        onClick={() => setOperatingModel(model.value)}
                        className={`text-left rounded-xl border p-3 transition cursor-pointer ${
                          isSelected
                            ? "border-indigo-400 bg-indigo-50/60 shadow-xs"
                            : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900">
                            {model.label}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                              isSelected
                                ? "bg-indigo-100 text-indigo-700 font-bold"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {model.badge}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                          {model.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Establishment Year & Industry Sector */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-700 font-medium">
                    Establishment Date / Year Founded <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={establishmentYear}
                    onChange={(e) => setEstablishmentYear(e.target.value)}
                    placeholder="2018"
                    className="border-slate-200 bg-white text-slate-900 font-mono shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    Indicates company maturity to prospective applicants.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-700 font-medium">
                    Industry / Sector <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs">
                      <SelectValue placeholder="Select Industry" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 bg-white text-slate-900 shadow-xl">
                      {INDUSTRY_SECTORS.map((sec) => (
                        <SelectItem key={sec} value={sec} className="text-xs">
                          {sec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: VERIFICATION & COMPLIANCE DATA ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3.5 flex items-start gap-3 shadow-2xs">
                <ShieldCheck className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-900">
                    Institutional Trust &amp; Legal Legitimacy
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    DRISHTI enforces cryptographic transparency. Your corporate registration details protect campus students against fraudulent offers and predatory placement drives.
                  </p>
                </div>
              </div>

              {/* Corporate Identification Number (CIN) */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
                    Corporate Identification Number (CIN) / Registration ID <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-600">
                    MCA Register Compatible
                  </span>
                </Label>
                <Input
                  value={cin}
                  onChange={(e) => setCin(e.target.value.toUpperCase())}
                  placeholder="e.g. U65999KA2018PTC112345 or LLPIN"
                  className="border-slate-200 bg-white text-slate-900 font-mono uppercase text-xs shadow-2xs"
                />
                <p className="text-[10px] text-slate-400">
                  Issued by Ministry of Corporate Affairs (MCA) / Registrar of Companies.
                </p>
              </div>

              {/* Corporate Website URL */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700 font-medium flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-sky-600" />
                  Corporate Website URL <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.finnable.com"
                  className="border-slate-200 bg-white text-slate-900 font-mono text-xs shadow-2xs"
                />
                <p className="text-[10px] text-slate-400">
                  Official corporate web domain inspected during applicant matching.
                </p>
              </div>

              {/* Headquarters Location */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-700 font-medium flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  Headquarters Location <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                  placeholder="e.g. Pune / Bengaluru, India"
                  className="border-slate-200 bg-white text-slate-900 text-xs shadow-2xs"
                />
                <p className="text-[10px] text-slate-400">
                  Primary corporate operating city or Global Headquarters.
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 4: PLACEMENT HUB INTEGRATION & FINAL REVIEW ================= */}
          {step === 4 && (
            <div className="space-y-5">
              {/* Placement Hub Governance Toggles */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3.5 shadow-2xs">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Placement Hub Integration Governance
                </div>

                {/* Alumni Referral Mapping Opt-In */}
                <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                  <Checkbox
                    id="alumni-referral-opt-in"
                    checked={allowAlumniReferrals}
                    onCheckedChange={(checked) =>
                      setAllowAlumniReferrals(Boolean(checked))
                    }
                    className="mt-1 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white border-slate-300"
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="alumni-referral-opt-in"
                      className="text-xs font-semibold text-slate-900 cursor-pointer"
                    >
                      Alumni Referral Mapping Opt-In
                    </label>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      Allow DRISHTI to map your company domain with our Alumni Directory to enable referral requests directly from eligible students.
                    </p>
                  </div>
                </div>

                {/* Interview Question Bank Opt-In */}
                <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                  <Checkbox
                    id="interview-bank-opt-in"
                    checked={allowInterviewBank}
                    onCheckedChange={(checked) =>
                      setAllowInterviewBank(Boolean(checked))
                    }
                    className="mt-1 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white border-slate-300"
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="interview-bank-opt-in"
                      className="text-xs font-semibold text-slate-900 cursor-pointer"
                    >
                      Interview Question Bank Opt-In
                    </label>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      Allow students to anonymously log interview experiences into the institution&apos;s question bank to enhance preparation telemetry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Comprehensive Read-Only Review Summary Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4 text-emerald-600" />
                    Review Summary &amp; Verification Pre-Check
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-700">
                    Ready for Verification
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  {/* Recruiter Details */}
                  <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Recruiter Identity
                    </div>
                    <div className="font-semibold text-slate-900">
                      {recruiterName || "—"}
                    </div>
                    <div className="font-mono text-[11px] text-indigo-600">
                      {corporateEmail || "—"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {contactNumber || "—"}
                    </div>
                  </div>

                  {/* Company Profile Details */}
                  <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Company Profile
                    </div>
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {companyName || "—"}
                      <span className="rounded-full bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 text-[9px] text-indigo-700 font-semibold">
                        {operatingModel}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {industry} • Est. {establishmentYear}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {headquarters}
                    </div>
                  </div>
                </div>

                {/* Legal & Compliance Summary */}
                <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-2.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Statutory ID (CIN)
                    </span>
                    <span className="font-mono text-[11px] font-bold text-indigo-600">
                      {cin || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Official Portal Website
                    </span>
                    <a
                      href={website.startsWith("http") ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] text-sky-600 hover:underline inline-flex items-center gap-1"
                    >
                      {website || "—"}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-500">
                      Alumni Referral Mapping:
                    </span>
                    <span
                      className={
                        allowAlumniReferrals ? "text-emerald-600 font-semibold" : "text-slate-400"
                      }
                    >
                      {allowAlumniReferrals ? "Opted In" : "Opted Out"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation with ArrowRight / ArrowLeft */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 1 || isSubmitting}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="text-slate-500 hover:text-slate-900"
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
                className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-md hover:from-indigo-600 hover:to-sky-600 font-semibold transition"
              >
                Continue
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSubmitting || !canProceedStep1 || !canProceedStep2 || !canProceedStep3}
                onClick={handleSubmit}
                className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {submitPhase || "Submitting..."}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-1.5 h-4 w-4" />
                    Register &amp; Submit for Verification
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

// Export both default name and modal alias
export { CompanyOnboarding as CompanyOnboardingModal };
