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
      const re = new RegExp("(^|[^a-z0-9+#])" + variant.replace(/[.\\]/g, (m) => "\\" + m) + "([^a-z0-9+#]|$)", "i");
      if (re.test(lower)) {
        // find actual case-preserved raw
        const m = raw.match(new RegExp(variant.replace(/[.\\]/g, (m) => "\\" + m), "i"));
        const rawMatch = m ? m[0] : variant;
        if (!matchedRaws.some((r) => r.toLowerCase() === rawMatch.toLowerCase())) {
          matchedRaws.push(rawMatch);
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
        <h1 className="text-xl font-bold text-white sm:text-2xl">Jobs — AI JD Parser & Skill Normalizer</h1>
        <p className="text-[13px] text-[var(--drishti-sub)]">
          Paste a raw Job Description (from WhatsApp, email, or any portal). DRISHTI parses it,
          normalizes messy skill variants (NodeJS → Node.js, react.js → React) and unifies
          duplicate applicants from multiple sources.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* LEFT — Post New Job */}
        <Card className="drishti-card border-white/10 bg-white/[0.03]">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-[var(--drishti-gold)]" />
              <h2 className="text-base font-bold text-white">Post New Job</h2>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[12px] font-semibold text-[var(--drishti-sub)]">
                  Raw Job Description
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSample}
                  className="border-[var(--drishti-gold)]/40 bg-[var(--drishti-gold)]/10 text-[var(--drishti-gold)] hover:bg-[var(--drishti-gold)]/20"
                >
                  <FileText className="h-3 w-3" />
                  Paste Sample Raw JD
                </Button>
              </div>
              <Textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder="Paste raw JD here (company, role, CTC, eligibility, required/preferred skills)..."
                className="min-h-[180px] resize-y border-white/10 bg-black/30 font-mono text-[12px] text-white placeholder:text-white/30 focus-visible:ring-[var(--drishti-blue)]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleParse}
                className="bg-gradient-to-r from-[var(--drishti-gold)] to-[var(--drishti-blue)] text-[#06101f] hover:brightness-110"
              >
                <Sparkles className="h-4 w-4" />
                Parse JD with AI
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!parsed}
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40"
              >
                <CheckCircle2 className="h-4 w-4" />
                Publish Job
              </Button>
            </div>

            {/* Parsed result */}
            {parsed && (
              <div className="rounded-lg border border-[var(--drishti-gold)]/30 bg-[var(--drishti-gold)]/[0.04] p-4">
                <div className="mb-3 text-[11px] uppercase tracking-wider text-[var(--drishti-gold)]">
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
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--drishti-sub)]">
                      Required ({parsed.requiredSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {parsed.requiredSkills.map((s) => (
                        <Badge key={s} variant="outline" className="border-[var(--drishti-blue)]/40 bg-[var(--drishti-blue)]/10 text-[var(--drishti-blue)]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--drishti-sub)]">
                      Preferred ({parsed.preferredSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {parsed.preferredSkills.map((s) => (
                        <Badge key={s} variant="outline" className="border-[var(--drishti-amber)]/40 bg-[var(--drishti-amber)]/10 text-[var(--drishti-amber)]">
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
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-white">
                  <Merge className="h-3.5 w-3.5 text-[var(--drishti-blue)]" />
                  Auto Skill Normalization
                  <span className="rounded-full bg-[var(--drishti-blue)]/15 px-2 py-0.5 text-[10px] text-[var(--drishti-blue)]">
                    {normalizedRows.length} canonical
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-[var(--drishti-sub)]">
                        <th className="px-2 py-1.5 font-medium">Raw Variant(s)</th>
                        <th className="px-2 py-1.5 font-medium">Canonical Tag</th>
                        <th className="px-2 py-1.5 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {normalizedRows.map((row) => (
                        <tr key={row.canonical} className="border-b border-white/5">
                          <td className="px-2 py-1.5">
                            <span className="font-mono text-[var(--drishti-sub)]">{row.raw}</span>
                            {row.mergedWith.map((m) => (
                              <span key={m} className="ml-1 font-mono text-[var(--drishti-sub)]/70">
                                + {m}
                              </span>
                            ))}
                          </td>
                          <td className="px-2 py-1.5">
                            <span className="font-semibold text-[var(--drishti-blue)]">{row.canonical}</span>
                          </td>
                          <td className="px-2 py-1.5">
                            {row.mergedWith.length > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                <Merge className="h-2.5 w-2.5" />
                                merged {1 + row.mergedWith.length} → 1
                              </span>
                            ) : row.changed ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--drishti-blue)]/30 bg-[var(--drishti-blue)]/10 px-2 py-0.5 text-[10px] text-[var(--drishti-blue)]">
                                normalized
                              </span>
                            ) : (
                              <span className="text-[10px] text-[var(--drishti-sub)]">as-is</span>
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
            <h2 className="text-base font-bold text-white">
              Posted Jobs
              <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-[var(--drishti-sub)]">
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
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--drishti-sub)]">
        {icon}
        {label}
      </div>
      <div className="text-[13px] font-semibold text-white">{value}</div>
    </div>
  );
}

function JobCard({ job }: { job: JobOpening }) {
  const multiSource = job.sources.length > 1;
  return (
    <Card className="drishti-card border-white/10 bg-white/[0.03]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-[14px] font-bold text-white">{job.role}</span>
              <span className="text-[11px] text-[var(--drishti-sub)]">@</span>
              <span className="truncate text-[12px] font-semibold text-[var(--drishti-gold)]">
                {job.company}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[var(--drishti-sub)]">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
              <span className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" />{job.ctc}</span>
              <span className="inline-flex items-center gap-1"><GraduationCap className="h-3 w-3" />{job.eligibility}</span>
            </div>
          </div>
        </div>

        {/* Multi-source dedup banner */}
        {multiSource && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-[var(--drishti-amber)]/30 bg-[var(--drishti-amber)]/[0.06] p-2.5 text-[11px]">
            <Merge className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--drishti-amber)]" />
            <span className="text-[var(--drishti-sub)]">
              <span className="font-semibold text-[var(--drishti-amber)]">
                ⚠ {job.sources.length} sources merged
              </span>{" "}
              ({job.sources.join(" + ")}) — applicant pool unified
            </span>
          </div>
        )}

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--drishti-sub)]">
              Required
            </div>
            <div className="flex flex-wrap gap-1">
              {job.requiredSkills.map((s) => (
                <Badge key={s} variant="outline" className="border-[var(--drishti-blue)]/40 bg-[var(--drishti-blue)]/10 text-[var(--drishti-blue)]">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--drishti-sub)]">
              Preferred
            </div>
            <div className="flex flex-wrap gap-1">
              {job.preferredSkills.map((s) => (
                <Badge key={s} variant="outline" className="border-[var(--drishti-amber)]/40 bg-[var(--drishti-amber)]/10 text-[var(--drishti-amber)]">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
          <div className="flex flex-wrap gap-1">
            {job.sources.map((src) => (
              <span key={src} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[var(--drishti-sub)]">
                {src}
              </span>
            ))}
            {typeof job.alumniCount === "number" && job.alumniCount > 0 && (
              <span className="rounded-full border border-[var(--drishti-emerald)]/30 bg-[var(--drishti-emerald)]/10 px-2 py-0.5 text-[10px] text-[var(--drishti-emerald)]">
                {job.alumniCount} alumni
              </span>
            )}
          </div>
          <span className="text-[10px] text-[var(--drishti-sub)]/70">
            {new Date(job.postedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
