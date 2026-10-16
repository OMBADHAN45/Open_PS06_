# Task ID 5 — tpo-portal-builder

## Task
Build the TPO/Admin Portal for the DRISHTI platform: multi-source ingestion & dedup, 1-click batch ranker, master placement pipeline, audit log & violations, drive analytics.

## Files created / edited
- `src/components/tpo/TpoPortal.tsx` — rewritten as the named-export shell (`TpoPortal`) wiring `PortalShell` + `PortalHeader` + 5 sidebar `NavItem` tabs.
- `src/components/tpo/IngestionTab.tsx` — multi-source job feed ingestion + two-stage dedup visualization (Stage 1 blocking, Stage 2 ≥90% cosine similarity merged cards with source-channel tags + emerald highlight).
- `src/components/tpo/BatchRankerTab.tsx` — JD parser + whole-batch ranker with ranked table + CSV-export verified shortlist.
- `src/components/tpo/MasterPipelineTab.tsx` — consolidated Kanban across all jobs + KPI strip + advance/back controls.
- `src/components/tpo/AuditLogTab.tsx` — proctoring violations / failed assessments / resume claim blocks / low verification scores with severity colors + filter chips.
- `src/components/tpo/DriveAnalyticsTab.tsx` — 4 recharts visualizations (offer conversions, pipeline distribution, skill coverage, verification health donut).

## Consumed from foundation
- Store: `useAppStore` (rawSources, addRawSource, clearRawSources, parseJobDescription, moveApplication, openInspector, weights, students, jobs, applications), re-exported `PIPELINE_STAGES`, `computeFit`.
- Libs: `dedupeJobs` (+ `RawJobSource`/`MergedJob`) from `src/lib/dedup.ts`; `computeFit`, `fitTier`, `DEFAULT_WEIGHTS` from `src/lib/fit-score.ts`; types from `src/lib/mock-data.ts`.
- UI primitives: `AvatarCircle`, `FitScoreBadge`, `VerifiedPill`, `GapPill` from `src/components/shared/primitives.tsx`.
- Shell: `PortalShell`, `PortalHeader`, `NavItem` from `src/components/shell/PortalShell.tsx`.
- shadcn/ui: button, card, badge, textarea, input, label, select, table.

## Verification
- `bun run lint` — clean (no errors, no warnings).
- Dev server on port 3000 — no compile errors in `dev.log` (page loads with HTTP 200, recompiles are fast).
- All `"use client"`, TypeScript strict, no `any`, DRISHTI dark palette only (no indigo/blue as brand primary — electric-blue `#9fe0ff` is the allowed accent).
- `useMemo` for all derived datasets (dedup, ranking, kanban bucketing, audit events, chart data).
- Responsive: stacks on mobile; Kanban/table/analytics grid horizontally scroll on narrow viewports.

## Notes for downstream agents
- The TPO portal is loaded via `dynamic(() => import("@/components/tpo/TpoPortal").then((m) => m.TpoPortal), { ssr: false })` in `src/app/page.tsx`. The chunk compiles on first navigation to the `tpo` view (no SSR).
- All audit events are derived deterministically from the `students` mock data, so adding more students will automatically produce more audit rows.
- The "Export Verified Shortlist" CSV is generated client-side via `Blob` + anchor download — no backend round-trip.
- The Kanban "Advance →" button color is computed inline via `style` (not dynamic Tailwind class) so Tailwind's JIT doesn't need to see runtime-computed class names.
