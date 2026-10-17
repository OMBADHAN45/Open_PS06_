"use client";

import { useMemo, useState } from "react";
import { useAppStore, computeFit } from "@/lib/store";
import { FitScoreBadge, VerifiedPill, GapPill, ProofBadge } from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, IndianRupee, Users, Sparkles, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

export function SmartJobFeedTab() {
  const activeStudentId = useAppStore((s) => s.activeStudentId);
  const students = useAppStore((s) => s.students);
  const jobs = useAppStore((s) => s.jobs);
  const applyToJob = useAppStore((s) => s.applyToJob);
  const setView = useAppStore((s) => s.setView);
  const setResumeTarget = useAppStore((s) => s.setResumeTargetJob);
  const student = students.find((s) => s.id === activeStudentId) ?? students[0];
  const [selectedId, setSelectedId] = useState<string>(jobs[0]?.id ?? "");

  const ranked = useMemo(() => {
    if (!student) return [];
    return jobs
      .map((j) => ({ job: j, fit: computeFit(student, j) }))
      .sort((a, b) => b.fit.score - a.fit.score);
  }, [student, jobs]);

  const selected = ranked.find((r) => r.job.id === selectedId) ?? ranked[0];

  if (!student || !selected) return null;

  const goToResume = () => {
    setResumeTarget(selected.job.id);
    setView("student");
    window.dispatchEvent(new CustomEvent("drishti:goto-tab", { detail: "resume" }));
  };

  const apply = () => {
    applyToJob(student.id, selected.job.id);
    window.dispatchEvent(new CustomEvent("drishti:toast", { detail: { title: "Applied!", description: `Applied to ${selected.job.company} — ${selected.job.role}` } }));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
      {/* Left: job cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Briefcase className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-900">Deduplicated Job Feed</h2>
          <Badge className="border-indigo-100 bg-white text-slate-500 font-semibold shadow-2xs">{ranked.length} openings</Badge>
        </div>
        {ranked.map(({ job, fit }) => (
          <button
            key={job.id}
            onClick={() => setSelectedId(job.id)}
            className={`drishti-card w-full rounded-xl p-4 text-left transition cursor-pointer ${
              selected.job.id === job.id
                ? "ring-2 ring-indigo-500 bg-white shadow-md"
                : "border border-white bg-white/80 hover:bg-white hover:shadow-sm"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-slate-900">{job.company}</span>
                  {job.sources.length > 1 && (
                    <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800 font-semibold shadow-2xs">
                      {job.sources.length} sources merged
                    </Badge>
                  )}
                </div>
                <div className="text-[13px] font-medium text-slate-600 mt-0.5">{job.role}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" />{job.location}</span>
                  <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3 text-slate-400" />{job.ctc}</span>
                  {job.alumniCount ? <span className="flex items-center gap-1 text-indigo-600 font-semibold"><Users className="h-3 w-3" />{job.alumniCount} alumni</span> : null}
                </div>
              </div>
              <FitScoreBadge score={fit.score} />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {job.requiredSkills.map((s) => (
                <span key={s} className="rounded-full border border-slate-200 bg-slate-100/70 px-2.5 py-0.5 text-[10.5px] font-medium text-slate-600">{s}</span>
              ))}
            </div>
            {job.sources.length > 1 && (
              <div className="mt-2 text-[10.5px] text-slate-400">
                Merged from: <span className="text-indigo-600 font-semibold">{job.sources.join(" + ")}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Right: match breakdown */}
      <div className="space-y-3">
        <div className="drishti-card rounded-xl border border-white bg-white/85 p-5 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Match Breakdown</div>
              <div className="text-base font-bold text-slate-900">{selected.job.role} · {selected.job.company}</div>
            </div>
            <FitScoreBadge score={selected.fit.score} />
          </div>

          {/* Weighted fit formula */}
          <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-[11.5px] text-slate-600 shadow-2xs">
            <div className="mb-1 font-bold text-slate-900">Weighted Fit Formula</div>
            <div className="font-mono text-[11px]">Fit = 0.65·({selected.fit.verifiedRequired.length}/{selected.job.requiredSkills.length} req) + 0.25·({selected.fit.verifiedPreferred.length}/{selected.job.preferredSkills.length} pref) + 0.10·({selected.fit.projectComplexity.toFixed(2)} project)</div>
          </div>

          {/* AI explanation */}
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 shadow-2xs">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <p className="text-[12.5px] text-slate-800 leading-relaxed">{selected.fit.explanation}</p>
          </div>

          {/* Verified matches */}
          <div className="mb-3">
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">✅ Verified Matches</div>
            {selected.fit.verifiedRequired.length || selected.fit.verifiedPreferred.length ? (
              <div className="flex flex-wrap gap-1.5">
                {[...selected.fit.verifiedRequired, ...selected.fit.verifiedPreferred].map((s) => (
                  <VerifiedPill key={s}>{s} ✓</VerifiedPill>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-slate-400">No verified matches yet.</p>
            )}
          </div>

          {/* Missing gaps */}
          <div className="mb-3">
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700">⚠ Missing Skill Gaps</div>
            {selected.fit.missingRequired.length || selected.fit.missingPreferred.length ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {selected.fit.missingRequired.map((s) => (
                    <GapPill key={s}>{s} ✗</GapPill>
                  ))}
                  {selected.fit.missingPreferred.map((s) => (
                    <GapPill key={s}>{s} (preferred)</GapPill>
                  ))}
                </div>
                <p className="text-[11.5px] text-slate-500">No evidence found in your GitHub or assessments for these skills.</p>
                <Button size="sm" variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100/80 font-semibold shadow-2xs cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent("drishti:goto-tab", { detail: "assess" }))}>
                  <AlertTriangle className="mr-1 h-3.5 w-3.5 text-amber-600" /> Take Proctored Assessment to Close Gap
                </Button>
              </div>
            ) : (
              <p className="text-[12px] font-semibold text-emerald-700">No gaps — you meet all requirements! 🎉</p>
            )}
          </div>

          {/* Alumni referral */}
          {selected.job.alumniCount ? (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50/60 p-3 text-[12.5px] text-slate-800 shadow-2xs">
              <Users className="h-4 w-4 text-sky-600 shrink-0" />
              <span><strong>{selected.job.alumniCount}</strong> alumni from your college work at {selected.job.company}.</span>
              <Button size="sm" variant="ghost" className="ml-auto text-sky-700 hover:text-sky-900 font-semibold cursor-pointer">Request Referral</Button>
            </div>
          ) : null}

          {/* CTA */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={goToResume} className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200 font-semibold cursor-pointer">
              Generate Tailored Truthful Resume &amp; Apply <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button onClick={apply} variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold shadow-xs cursor-pointer">
              <CheckCircle2 className="mr-1 h-4 w-4 text-emerald-600" /> Quick Apply
            </Button>
          </div>
        </div>

        {/* Requirement detail with proof links */}
        <div className="drishti-card rounded-xl border border-white bg-white/85 p-4 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
          <div className="mb-2 text-[12px] font-bold text-slate-900">Required Skills — Proof Status</div>
          <div className="space-y-1.5">
            {selected.job.requiredSkills.map((s) => {
              const has = selected.fit.verifiedRequired.includes(s);
              const ev = student.evidence.filter((e) => (e as any).skill === s);
              return (
                <div key={s} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    {has ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    <span className="text-[12.5px] font-medium text-slate-800">{s}</span>
                  </div>
                  {has && ev.length > 0 ? (
                    <div className="flex items-center gap-1.5">
                      {ev.filter((e) => e.kind === "github").map((e) => (
                        <ProofBadge key={e.id} label="GitHub" onClick={() => useAppStore.getState().openProof(student.id, s)} />
                      ))}
                      {ev.filter((e) => e.kind === "assessment").map((e) => (
                        <ProofBadge key={e.id} label={`${(e as any).score}%`} onClick={() => useAppStore.getState().openProof(student.id, s)} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700">no proof</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
