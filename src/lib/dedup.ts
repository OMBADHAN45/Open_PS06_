// Two-stage Job Deduplication Engine
// Stage 1: Blocking by normalized (Company + Role + Location)
// Stage 2: >90% semantic cosine similarity (token-based) within block

export interface RawJobSource {
  id: string;
  company: string;
  role: string;
  location: string;
  ctc?: string;
  source: string; // e.g. "WhatsApp Forward", "Alumni Referral", "Partner Portal"
  rawText?: string;
  postedAt: number;
}

export interface MergedJob {
  id: string;
  company: string;
  role: string;
  location: string;
  ctc?: string;
  sources: string[]; // merged source tags
  memberIds: string[]; // raw source ids merged
  similarity: number; // 0..1
}

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(s: string): Set<string> {
  return new Set(normalizeText(s).split(" ").filter(Boolean));
}

function cosine(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / Math.sqrt(a.size * b.size);
}

export function dedupeJobs(raw: RawJobSource[]): { merged: MergedJob[]; blocks: RawJobSource[][] } {
  // Stage 1: blocking by normalized company+role+location
  const blocks: RawJobSource[][] = [];
  const used = new Set<string>();
  for (const r of raw) {
    if (used.has(r.id)) continue;
    const block: RawJobSource[] = [r];
    used.add(r.id);
    const bKey =
      normalizeText(r.company) + "|" + normalizeText(r.role) + "|" + normalizeText(r.location);
    for (const r2 of raw) {
      if (used.has(r2.id)) continue;
      const bKey2 =
        normalizeText(r2.company) + "|" + normalizeText(r2.role) + "|" + normalizeText(r2.location);
      if (bKey === bKey2) {
        block.push(r2);
        used.add(r2.id);
      }
    }
    blocks.push(block);
  }

  // Stage 2: within each block, run cosine similarity and group >=0.9
  const merged: MergedJob[] = [];
  for (const block of blocks) {
    if (block.length === 1) {
      merged.push(toMerged(block[0], 1));
      continue;
    }
    // Union-find lite: group by similarity threshold
    const groups: RawJobSource[][] = [];
    const taken = new Set<string>();
    for (let i = 0; i < block.length; i++) {
      if (taken.has(block[i].id)) continue;
      const g: RawJobSource[] = [block[i]];
      taken.add(block[i].id);
      const ti = tokens(
        `${block[i].company} ${block[i].role} ${block[i].location} ${block[i].rawText ?? ""}`
      );
      for (let j = i + 1; j < block.length; j++) {
        if (taken.has(block[j].id)) continue;
        const tj = tokens(
          `${block[j].company} ${block[j].role} ${block[j].location} ${block[j].rawText ?? ""}`
        );
        const sim = cosine(ti, tj);
        if (sim >= 0.9) {
          g.push(block[j]);
          taken.add(block[j].id);
        }
      }
      groups.push(g);
    }
    let maxSim = 0;
    for (const g of groups) {
      const memberSources = g.map((x) => x.source);
      const sim = g.length > 1 ? computeBlockSim(g) : 1;
      if (sim > maxSim) maxSim = sim;
      merged.push({
        id: g[0].id,
        company: g[0].company,
        role: g[0].role,
        location: g[0].location,
        ctc: g[0].ctc,
        sources: memberSources,
        memberIds: g.map((x) => x.id),
        similarity: sim,
      });
    }
    void maxSim;
  }

  return { merged, blocks };
}

function computeBlockSim(g: RawJobSource[]): number {
  // average pairwise cosine
  const tk = g.map((x) =>
    tokens(`${x.company} ${x.role} ${x.location} ${x.rawText ?? ""}`)
  );
  let total = 0;
  let count = 0;
  for (let i = 0; i < tk.length; i++)
    for (let j = i + 1; j < tk.length; j++) {
      total += cosine(tk[i], tk[j]);
      count++;
    }
  return count ? total / count : 1;
}

function toMerged(r: RawJobSource, sim: number): MergedJob {
  return {
    id: r.id,
    company: r.company,
    role: r.role,
    location: r.location,
    ctc: r.ctc,
    sources: [r.source],
    memberIds: [r.id],
    similarity: sim,
  };
}

export function similarity(a: string, b: string): number {
  return cosine(tokens(a), tokens(b));
}
