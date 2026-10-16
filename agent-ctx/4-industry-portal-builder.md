---
Task ID: 4
Agent: industry-portal-builder
Task: Build the Industry/Recruiter Portal with 6 tabs.

Work Log:
- Read `/home/z/my-project/worklog.md` to consume the foundation (store, fit-score, mock-data, primitives, PortalShell, taxonomy).
- Built `src/components/industry/IndustryPortal.tsx` — main shell using `PortalShell` + `PortalHeader` + 6 `NavItem`s (Dashboard, Jobs, Candidates, Proof Inspector, Hiring Pipeline, Analytics). Header title "Industry Portal", subtitle "Don't hire the best-looking resume. Hire the best-proven skills." Right-side button jumps to Jobs tab ("Demo: Load Sample JD").
- Built `src/components/industry/DashboardTab.tsx` — 6 KPI cards (Active Openings, Verified Applicants, Shortlisted, Scheduled Interviews, Offers Extended, Avg Fit Score) in a responsive 2/3/6-col grid; "Top Match Alerts (90%+)" list with Inspect button → `openInspector(studentId, jobId)` + tab switch.
- Built `src/components/industry/JobsTab.tsx` — two-pane layout. Left: Textarea + "Paste Sample Raw JD" button (fills a realistic Finnable JD), "Parse JD with AI" calls `parseJobDescription(raw)` and shows structured result, plus an "Auto Skill Normalization" table that scans ALL variants per canonical (e.g. `NodeJS + Node.js → Node.js` with "merged 2 → 1" badge). "Publish Job" → `addJob`. Right: list of existing job cards with dedup alert banner when `sources.length > 1`.
- Built `src/components/industry/CandidatesTab.tsx` — the hero feature. Interactive weight sliders (Required/Preferred/Project, 0..100) writing back to `setWeights`; live formula display; job `<Select>`; 4 evidence-filter toggles (Redis GitHub, SQL > 85%, zero warnings, verified Docker); ranked leaderboard table (rank, student, fit, verified required ✓, skill gaps ❌, proof icons, truncated AI explanation with tooltip, Inspect button, Compare checkbox); compare bar at bottom when `compareIds.length >= 2`; Side-by-Side Comparison Matrix Dialog showing fit / verified skills / gaps / SQL scores / projects / proctor integrity / CGPA.
- Built `src/components/industry/ProofInspectorTab.tsx` — uses `inspector` slice. If closed: empty state with "Go to Candidates". If open: 4 subtabs (Resume / GitHub / Assessments / Projects) controlled by `inspector.subtab` + `setInspectorSubtab`. Resume subtab generates candidate resume bullets, each with clickable `[Proof Verified]` ProofBadge that highlights supporting evidence. Resume Claim Auditor below: green "Verified Claim" rows (linked to actual github evidence) + red "Blocked / Unsupported Claim" rows (Kubernetes/Cassandra/AWS-EKS claims flagged "No imports found"). Uses VerifiedPill/FlaggedPill.
- Built `src/components/industry/PipelineTab.tsx` — Kanban board with 6 columns = PIPELINE_STAGES. Per-card: avatar+name, role+company, fit badge, ← back / → advance buttons calling `moveApplication(app.id, nextStage)`. Horizontal scroll on mobile. Reads live from shared store so Student Portal & TPO see same state.
- Built `src/components/industry/AnalyticsTab.tsx` — 3 recharts visualizations: (1) Batch Skill Distribution stacked BarChart (verified vs blocked claims per skill, emerald/crimson), (2) Hiring Velocity AreaChart with gold gradient (applications per pipeline stage), (3) Top Missing Skill Gaps horizontal BarChart in amber aggregating `computeFit(...).missingRequired` across all applications. All wrapped in `drishti-card` styled cards.
- Verified `bun run lint` clean (no errors, no warnings). Verified dev server boots and returns HTTP 200.
- Did NOT touch store, libs, primitives, PortalShell, or any other portal — only created files under `src/components/industry/`.

Stage Summary:
- Industry Portal fully wired with all 6 tabs working against the shared store. Recruiters can parse raw JDs (with skill normalization visualization), rank candidates by verified fit score with interactive weight sliders, X-ray a candidate's resume/GitHub/assessments/projects plus an automated Resume Claim Auditor, drag candidates through a shared pipeline Kanban, and view batch-level analytics (skill distribution / hiring velocity / top gaps).
- Lint passes. Dev server returns 200. Files created:
  - `src/components/industry/IndustryPortal.tsx`
  - `src/components/industry/DashboardTab.tsx`
  - `src/components/industry/JobsTab.tsx`
  - `src/components/industry/CandidatesTab.tsx`
  - `src/components/industry/ProofInspectorTab.tsx`
  - `src/components/industry/PipelineTab.tsx`
  - `src/components/industry/AnalyticsTab.tsx`
