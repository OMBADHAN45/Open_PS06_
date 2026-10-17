"use client";

import { useMemo, useState } from "react";
import { useAppStore, type JobParseResult } from "@/lib/store";
import { SKILL_TAXONOMY } from "@/lib/taxonomy";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, Sparkles, Building2, MapPin, IndianRupee, GraduationCap, Layers, Merge, ArrowRight, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { JobOpening } from "@/lib/mock-data";

const SAMPLE_RAW_JD = `Company: Finnable Credit
Role: Backend Engineer
Location: Pune, India
CTC: 12 LPA
Eligibility: BE/BTech 2026, CGPA >= 7.5

Required Skills: NodeJS, Postgres, Redis, react.js
Preferred Skills: Docker, AWS, ReactJS

We're hiring a backend engineer to scale our Node.js microservices that power our digital lending platform. You will own PostgreSQL schema design, build Redis-backed caching layers, and ship React admin dashboards. Docker & AWS exposure is a bonus.`;

interface NormalizedRow {
  raw: string;
  canonical: string;
  mergedWith: string[];
  changed: boolean;
}

/** Scan raw text for ALL variants per canonical (so we can visualize merging). */
function scanAllVariants(raw: string): NormalizedRow[] {
  const lower = raw.toLowerCase();
  const byCanonical = new Map<string, { raw: string; mergedWith: string[]; changed: boolean }>();

  for (const def of SKILL_TAXONOMY) {
    const matchedRaws: string[] = [];
    for (const variant of def.variants) {
      const escaped = variant.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
      try {
        const re = new RegExp("(^|[^a-z0-9+#])" + escaped + "([^a-z0-9+#]|$)", "i");
        if (re.test(lower)) {
          // find actual case-preserved raw
          const m = raw.match(new RegExp(escaped, "i"));
          const rawMatch = m ? m[0] : variant;
          if (!matchedRaws.some((r) => r.toLowerCase() === rawMatch.toLowerCase())) {
            matchedRaws.push(rawMatch);
          }
        }
      } catch {
        if (lower.includes(variant.toLowerCase())) {
          if (!matchedRaws.some((r) => r.toLowerCase() === variant.toLowerCase())) {
            matchedRaws.push(variant);
          }
        }
      }
    }
    if (matchedRaws.length === 0) continue;

    // Primary raw = first; the rest go into mergedWith
    const [primary, ...rest] = matchedRaws;
    const changed = primary.trim().toLowerCase() !== def.canonical.toLowerCase();
    byCanonical.set(def.canonical, { raw: primary, mergedWith: rest, changed });
  }

  return Array.from(byCanonical.entries()).map(([canonical, v]) => ({
    raw: v.raw,
    canonical,
    mergedWith: v.mergedWith,
    changed: v.changed,
  }));
}

export function JobsTab({ onGoCandidates }: { onGoCandidates: () => void }) {
  const jobs = useAppStore((s) => s.jobs);
  const parseJobDescription = useAppStore((s) => s.parseJobDescription);
  const addJob = useAppStore((s) => s.addJob);

  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<JobParseResult | null>(null);

  const normalizedRows = useMemo(() => (raw ? scanAllVariants(raw) : []), [raw]);

  const handleSample = () => {
    setRaw(SAMPLE_RAW_JD);
    setParsed(null);
  };

  const handleParse = () => {
    if (!raw.trim()) {
      toast.error("Paste a raw JD first");
      return;
    }
    const result = parseJobDescription(raw);
    setParsed(result);
    toast.success(`Parsed: ${result.role} @ ${result.company} — ${result.requiredSkills.length} required, ${result.preferredSkills.length} preferred`);
  };

  const handlePublish = () => {
    if (!parsed) {
      toast.error("Parse the JD first");
      return;
    }
    const id = "job_" + Math.random().toString(36).slice(2, 9);
    const job: JobOpening = {
      id,
      company: parsed.company,
      role: parsed.role,
      location: parsed.location,
      ctc: parsed.ctc,
      eligibility: parsed.eligibility,
      requiredSkills: parsed.requiredSkills,
      preferredSkills: parsed.preferredSkills,
      description: raw.slice(0, 280),
      sources: ["Partner Portal"],
      postedAt: Date.now(),
    };
    addJob(job);
    toast.success(`Published: ${parsed.role} @ ${parsed.company}`);
    setParsed(null);
    setRaw("");
    onGoCandidates();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Jobs — AI JD Parser & Skill Normalizer</h1>
        <p className="text-[13px] text-slate-500">
          Paste a raw Job Description (from WhatsApp, email, or any portal). DRISHTI parses it,
          normalizes messy skill variants (NodeJS → Node.js, react.js → React) and unifies
          duplicate applicants from multiple sources.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* LEFT — Post New Job */}
        <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Post New Job</h2>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[12px] font-semibold text-slate-600">
                  Raw Job Description
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSample}
                  className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-2xs"
                >
                  <FileText className="h-3 w-3" />
                  Paste Sample Raw JD
                </Button>
              </div>
              <Textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder="Paste raw JD here (company, role, CTC, eligibility, required/preferred skills)..."
                className="min-h-[180px] resize-y border-slate-200 bg-white font-mono text-[12px] text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500 shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleParse}
                className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Sparkles className="h-4 w-4" />
                Parse JD with AI
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!parsed}
                variant="outline"
                className="border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 shadow-2xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                Publish Job
              </Button>
            </div>

            {/* Parsed result */}
            {parsed && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-4">
                <div className="mb-3 text-[11px] uppercase font-bold tracking-wider text-indigo-600">
                  ✓ Parsed Structured JD
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <Field icon={<Building2 className="h-3 w-3" />} label="Company" value={parsed.company} />
                  <Field icon={<Layers className="h-3 w-3" />} label="Role" value={parsed.role} />
                  <Field icon={<MapPin className="h-3 w-3" />} label="Location" value={parsed.location} />
                  <Field icon={<IndianRupee className="h-3 w-3" />} label="CTC" value={parsed.ctc} />
                  <Field icon={<GraduationCap className="h-3 w-3" />} label="Eligibility" value={parsed.eligibility} />
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <div className="mb-1 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      Required ({parsed.requiredSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {parsed.requiredSkills.map((s) => (
                        <Badge key={s} variant="outline" className="border-sky-200 bg-sky-50 text-sky-700 shadow-2xs font-semibold">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      Preferred ({parsed.preferredSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {parsed.preferredSkills.map((s) => (
                        <Badge key={s} variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 shadow-2xs font-semibold">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Skill Normalization Table */}
            {normalizedRows.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-slate-900">
                  <Merge className="h-3.5 w-3.5 text-indigo-600" />
                  Auto Skill Normalization
                  <span className="rounded-full bg-indigo-100 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                    {normalizedRows.length} canonical
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="px-2 py-1.5 font-medium">Raw Variant(s)</th>
                        <th className="px-2 py-1.5 font-medium">Canonical Tag</th>
                        <th className="px-2 py-1.5 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {normalizedRows.map((row) => (
                        <tr key={row.canonical} className="border-b border-slate-100">
                          <td className="px-2 py-1.5">
                            <span className="font-mono text-slate-600">{row.raw}</span>
                            {row.mergedWith.map((m) => (
                              <span key={m} className="ml-1 font-mono text-slate-400">
                                + {m}
                              </span>
                            ))}
                          </td>
                          <td className="px-2 py-1.5">
                            <span className="font-semibold text-indigo-600">{row.canonical}</span>
                          </td>
                          <td className="px-2 py-1.5">
                            {row.mergedWith.length > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                <Merge className="h-2.5 w-2.5" />
                                merged {1 + row.mergedWith.length} → 1
                              </span>
                            ) : row.changed ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                normalized
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">as-is</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT — Existing jobs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Posted Jobs
              <span className="ml-2 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {jobs.length}
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
        {icon}
        {label}
      </div>
      <div className="text-[13px] font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function JobCard({ job }: { job: JobOpening }) {
  const multiSource = job.sources.length > 1;
  return (
    <Card className="drishti-card border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-[14px] font-bold text-slate-900">{job.role}</span>
              <span className="text-[11px] text-slate-400">@</span>
              <span className="truncate text-[12px] font-semibold text-indigo-600">
                {job.company}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
              <span className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" />{job.ctc}</span>
              <span className="inline-flex items-center gap-1"><GraduationCap className="h-3 w-3" />{job.eligibility}</span>
            </div>
          </div>
        </div>

        {/* Multi-source dedup banner */}
        {multiSource && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px]">
            <Merge className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span className="text-slate-600">
              <span className="font-semibold text-amber-700">
                ⚠ {job.sources.length} sources merged
              </span>{" "}
              ({job.sources.join(" + ")}) — applicant pool unified
            </span>
          </div>
        )}

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Required
            </div>
            <div className="flex flex-wrap gap-1">
              {job.requiredSkills.map((s) => (
                <Badge key={s} variant="outline" className="border-sky-200 bg-sky-50 text-sky-700 shadow-2xs font-semibold">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Preferred
            </div>
            <div className="flex flex-wrap gap-1">
              {job.preferredSkills.map((s) => (
                <Badge key={s} variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 shadow-2xs font-semibold">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap gap-1">
            {job.sources.map((src) => (
              <span key={src} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600 font-medium">
                {src}
              </span>
            ))}
            {typeof job.alumniCount === "number" && job.alumniCount > 0 && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 font-medium">
                {job.alumniCount} alumni
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">
            {new Date(job.postedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
