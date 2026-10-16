"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { dedupeJobs, type RawJobSource, type MergedJob } from "@/lib/dedup";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Inbox,
  Sparkles,
  Trash2,
  Layers,
  GitMerge,
  ShieldCheck,
  MessageCircle,
  Users,
  Building2,
} from "lucide-react";

const SOURCE_OPTIONS = [
  "WhatsApp Forward",
  "Alumni Referral",
  "Partner Portal",
  "Email Forward",
];

const SOURCE_STYLES: Record<string, string> = {
  "WhatsApp Forward": "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "Alumni Referral": "border-amber-500/40 bg-amber-500/10 text-amber-300",
  "Partner Portal": "text-[#9fe0ff] border-[#9fe0ff]/40 bg-[#9fe0ff]/10",
  "Email Forward": "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
};

function sourceChip(source: string) {
  const cls = SOURCE_STYLES[source] ?? "border-white/20 bg-white/5 text-white";
  return (
    <span
      key={source}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}
    >
      {source}
    </span>
  );
}

export function IngestionTab() {
  const rawSources = useAppStore((s) => s.rawSources);
  const addRawSource = useAppStore((s) => s.addRawSource);
  const clearRawSources = useAppStore((s) => s.clearRawSources);

  const [rawText, setRawText] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [ctc, setCtc] = useState("");
  const [source, setSource] = useState<string>("WhatsApp Forward");

  const dedupResult = useMemo(() => {
    const mapped: RawJobSource[] = rawSources.map((r) => ({
      id: r.id,
      company: r.company,
      role: r.role,
      location: r.location,
      ctc: r.ctc,
      source: r.source,
      rawText: r.rawText,
      postedAt: r.postedAt,
    }));
    return dedupeJobs(mapped);
  }, [rawSources]);

  const totalRaw = rawSources.length;
  const totalMerged = dedupResult.merged.length;
  const totalDuplicates = totalRaw - totalMerged;

  function handleAdd() {
    if (!company.trim() && !rawText.trim()) return;
    addRawSource({
      company: company.trim() || "Unspecified",
      role: role.trim() || "Software Engineer",
      location: location.trim() || "India",
      ctc: ctc.trim() || undefined,
      source,
      rawText: rawText.trim() || undefined,
    });
    setRawText("");
    setCompany("");
    setRole("");
    setLocation("");
    setCtc("");
  }

  function simulateWhatsAppDuplicates() {
    addRawSource({
      company: "Finnable Credit",
      role: "Backend Engineer",
      location: "Pune, India",
      ctc: "12 LPA",
      source: "WhatsApp Forward",
      rawText: "Urgent hiring Finnable Credit Backend Engineer Pune Nodejs Postgres Redis 12 LPA",
    });
    addRawSource({
      company: "FINNABLE CREDIT",
      role: "Back-end Engineer",
      location: "Pune",
      ctc: "12LPA",
      source: "Alumni Referral",
      rawText: "Finnable Credit hiring backend engineer Pune Node.js PostgreSQL Redis cache 12LPA",
    });
    addRawSource({
      company: "Finnable Credit",
      role: "Backend Engineer",
      location: "Pune, India",
      ctc: "12 LPA",
      source: "Partner Portal",
      rawText: "Backend Engineer at Finnable Credit Pune Node Postgres Redis 12 LPA",
    });
  }

  return (
    <div className="space-y-5">
      {/* Summary banner */}
      <div className="drishti-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9fe0ff]/10 text-[#9fe0ff]">
            <GitMerge className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-white">
              {totalRaw} raw sources → {totalMerged} canonical jobs
            </div>
            <div className="text-[11px] text-[var(--drishti-sub)]">
              {totalDuplicates > 0
                ? `${totalDuplicates} duplicate${totalDuplicates === 1 ? "" : "s"} merged across sources`
                : "No duplicates detected yet"}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#9fe0ff]/40 bg-[#9fe0ff]/10 text-[#9fe0ff] hover:bg-[#9fe0ff]/20"
            onClick={simulateWhatsAppDuplicates}
          >
            <Sparkles className="h-3.5 w-3.5" /> Simulate WhatsApp Duplicate Merge
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
            onClick={clearRawSources}
            disabled={totalRaw === 0}
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear all sources
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left — paste feed */}
        <div className="drishti-card flex flex-col gap-4 rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffe2b2]/10 text-[#ffe2b2]">
              <Inbox className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-white">
                Paste chaotic WhatsApp / Alumni / Partner job feed
              </h3>
              <p className="text-[11px] text-[var(--drishti-sub)]">
                Drop raw forwards as-is — the engine normalizes and dedupes them.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="raw-text" className="mb-1.5 block text-[11px] font-medium text-[var(--drishti-sub)]">
                Raw forwarded text
              </Label>
              <Textarea
                id="raw-text"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Urgent hiring Finnable Credit Backend Engineer Pune Nodejs Postgres Redis 12 LPA..."
                className="min-h-[110px] resize-y border-white/10 bg-black/30 text-[12px] text-white placeholder:text-white/30 focus-visible:border-[#9fe0ff]/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-[11px] font-medium text-[var(--drishti-sub)]">Source channel</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="w-full border-white/10 bg-black/30 text-[12px] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0a0f1c] text-white">
                    {SOURCE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="text-[12px]">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ctc" className="mb-1.5 block text-[11px] font-medium text-[var(--drishti-sub)]">CTC (optional)</Label>
                <Input
                  id="ctc"
                  value={ctc}
                  onChange={(e) => setCtc(e.target.value)}
                  placeholder="12 LPA"
                  className="border-white/10 bg-black/30 text-[12px] text-white placeholder:text-white/30 focus-visible:border-[#9fe0ff]/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="company" className="mb-1.5 block text-[11px] font-medium text-[var(--drishti-sub)]">Company</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Finnable Credit"
                  className="border-white/10 bg-black/30 text-[12px] text-white placeholder:text-white/30 focus-visible:border-[#9fe0ff]/40"
                />
              </div>
              <div>
                <Label htmlFor="role" className="mb-1.5 block text-[11px] font-medium text-[var(--drishti-sub)]">Role</Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Backend Engineer"
                  className="border-white/10 bg-black/30 text-[12px] text-white placeholder:text-white/30 focus-visible:border-[#9fe0ff]/40"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="mb-1.5 block text-[11px] font-medium text-[var(--drishti-sub)]">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Pune, India"
                className="border-white/10 bg-black/30 text-[12px] text-white placeholder:text-white/30 focus-visible:border-[#9fe0ff]/40"
              />
            </div>

            <Button
              onClick={handleAdd}
              className="w-full bg-[#9fe0ff] text-[#06101f] hover:bg-[#9fe0ff]/90"
            >
              <Inbox className="h-4 w-4" /> Add Source
            </Button>
          </div>
        </div>

        {/* Right — Two-stage dedup engine */}
        <div className="drishti-card flex flex-col gap-4 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10b981]/10 text-[#10b981]">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-white">Two-Stage Deduplication Engine</h3>
                <p className="text-[11px] text-[var(--drishti-sub)]">Blocking → cosine similarity (≥ 90%)</p>
              </div>
            </div>
            <Badge className="border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]">
              {dedupResult.blocks.length} blocks · {totalMerged} canonical
            </Badge>
          </div>

          {/* Stage 1 — Blocking */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-[#9fe0ff]/15 px-2 py-0.5 text-[10px] font-bold text-[#9fe0ff]">STAGE 1</span>
              <span className="text-[12px] font-semibold text-white">Blocking</span>
              <span className="text-[10px] text-[var(--drishti-sub)]">— normalized Company + Role + Location</span>
            </div>
            <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
              {dedupResult.blocks.length === 0 && (
                <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-[11px] text-[var(--drishti-sub)]">
                  No raw sources yet. Paste a feed on the left or click "Simulate WhatsApp Duplicate Merge".
                </div>
              )}
              {dedupResult.blocks.map((block, i) => (
                <div key={`blk-${i}`} className="rounded-lg border border-white/10 bg-black/30 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-[12px] font-semibold text-white">
                      {block[0].company} · {block[0].role}
                    </div>
                    <Badge className="border-white/20 bg-white/10 text-[var(--drishti-sub)]">
                      {block.length} member{block.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {block.map((m) => (
                      <div key={m.id} className="flex items-center gap-1">
                        {sourceChip(m.source)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage 2 — Semantic similarity */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-[#10b981]/15 px-2 py-0.5 text-[10px] font-bold text-[#10b981]">STAGE 2</span>
              <span className="text-[12px] font-semibold text-white">Semantic Similarity (≥ 90% cosine)</span>
            </div>
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {dedupResult.merged.length === 0 && (
                <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-[11px] text-[var(--drishti-sub)]">
                  No canonical jobs to merge yet.
                </div>
              )}
              {dedupResult.merged.map((m) => (
                <MergedJobCard key={m.id} job={m} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MergedJobCard({ job }: { job: MergedJob }) {
  const isMulti = job.memberIds.length > 1;
  return (
    <div
      className={`rounded-lg border p-3 transition ${
        isMulti
          ? "border-[#10b981]/50 bg-[#10b981]/[0.06]"
          : "border-white/10 bg-black/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-[#ffe2b2]" />
            <span className="truncate text-[13px] font-semibold text-white">
              {job.company} — {job.role}
            </span>
            {isMulti && (
              <Badge className="shrink-0 border-[#10b981]/40 bg-[#10b981]/15 text-[#10b981]">
                <ShieldCheck className="h-3 w-3" /> MERGED
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--drishti-sub)]">
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" /> {job.location}
            </span>
            {job.ctc && <span className="text-[#ffe2b2]">{job.ctc}</span>}
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" /> {job.memberIds.length} source{job.memberIds.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {isMulti && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#10b981]/40 bg-[#10b981]/15 px-2 py-0.5 text-[10px] font-bold text-[#10b981]">
              {Math.round(job.similarity * 100)}% sim
            </span>
          )}
        </div>
      </div>
      {isMulti && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-2">
          <span className="text-[10px] font-medium text-[var(--drishti-sub)]">Merged from:</span>
          {job.sources.map((s, i) => (
            <span key={`${s}-${i}`} className="inline-flex items-center gap-0.5 text-[10px] text-white/70">
              {i > 0 && <span className="text-[var(--drishti-sub)]">+</span>}
              {sourceChip(s)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
