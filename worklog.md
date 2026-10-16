# DRISHTI — Shared Worklog

This file is the single shared worklog for all agents working on the DRISHTI platform.
Each agent MUST append (never overwrite) a new section starting with `---` after finishing its Task ID.

---
Task ID: 1
Agent: orchestrator (main)
Task: Build DRISHTI foundation — design system, core libs, landing page, SPA shell, shared UI primitives.

Work Log:
- Configured `src/app/globals.css` with DRISHTI dark theme tokens (background `#02060f`, gold/blue/emerald/crimson/amber accents), Sora font var, custom scrollbar, `.drishti-glass`, `.drishti-card`, `.drishti-grid-bg`, `.text-gradient-gold`, `.cta-glass` (warm-gold left / cool-blue right gradient recipe), feat-chip & pill styles, proctor-stage canvas overlay, pulse/float animations.
- Updated `src/app/layout.tsx`: Sora font (Google), DRISHTI metadata, `<html className="dark">`.
- Built `src/lib/taxonomy.ts`: canonical skill taxonomy (~45 skills across Programming/Web Dev/Databases/DevOps/AI-ML) with variant normalization (ReactJS/React.js/react→React, NodeJS→Node.js, Postgres→PostgreSQL, etc.).
- Built `src/lib/fit-score.ts`: Fit Score formula `0.65*reqRatio + 0.25*prefRatio + 0.10*projectFactor` with weight-config support, plain-language explanation builder, fit-tier color helper.
- Built `src/lib/dedup.ts`: two-stage dedup (blocking by normalized Company+Role+Location, then >=0.9 cosine similarity token-based), returns merged jobs with source tags + similarity.
- Built `src/lib/proctor-config.ts`: CONFIG (MAX_WARNINGS=3, LOUD_LIMIT=40, FACE_AWAY_SECONDS=3, DETECT_INTERVAL_MS=1000, BAD_OBJECTS, EXAM_MINUTES=10, PASS_THRESHOLD=75), question bank (20 MCQs across Python/SQL/React/Node/Docker/AWS/Redis/PG/Go/TS), pickQuestions().
- Built `src/lib/mock-data.ts`: 4 students (Om, Mayur, Prakhar, Viraj) with rich GitHub evidence (repo/file/line/commitSha/snippet), proctored assessments (pass/fail), faculty-evaluated projects w/ rubric; 4 jobs (Finnable/Novos/Atlas/Helios) with required+preferred skills + multi-source tags + alumni counts; 6 applications across pipeline stages; 4 crowdsourced interview questions; SAMPLE_INFLATED_RESUME text for BS-detector demo.
- Built `src/lib/store.ts`: Zustand store — view switching, active student, weights, compare selection, proof drawer, recruiter inspector, resume target job, proctor sessions, skill toggle, applyAssessmentResult (auto-strips failed skills + recomputes verification score), syncGitHub, moveApplication, applyToJob, addInterviewQuestion, parseJobDescription (rule-based JD parser + skill normalizer), rawSources (sample duplicate WhatsApp+Alumni+Partner entries), addRawSource.
- Built `src/components/landing/LandingPage.tsx`: full-viewport dark hero (#02060f) with background video + poster, BrandMark double-slash SVG, nav (Student/Industry/TPO/Log in + Enter Platform pill), hero h1a/h1b/sub/CTA/4 feats/footer, Role Selector Modal with 3 role cards. Exact copy from spec.
- Built `src/components/shared/primitives.tsx`: SkillPill, FitScoreBadge, ProofBadge, ProofDrawer (slide-out Sheet showing GitHub proof + assessment proof + project proof), VerifiedPill/GapPill/FlaggedPill, AvatarCircle.
- Built `src/components/shell/PortalShell.tsx`: PortalHeader (sticky, brand + title + RoleSwitcher dropdown), PortalShell (responsive sidebar + main, mobile nav), NavItem.
- Wired `src/app/page.tsx` as SPA: switches Landing/Student/Industry/TPO by store `view`, lazy-loaded, ProofDrawer mounted globally.
- Dev server running on port 3000; `bun run lint` clean.

Stage Summary:
- Foundation complete and compiling. Landing page renders the NEURAL dark hero. Shared store + UI primitives ready for portals to consume. Stubs exist for Student/Industry/TPO portals so page.tsx compiles while subagents build the real portal components.
- Next: build Student Portal (incl. proctoring module) + Industry Portal + TPO Portal.

---
Task ID: 4
Agent: industry-portal-builder
Task: Build the Industry/Recruiter Portal with 6 tabs.

Work Log:
- Consumed the foundation (store, fit-score, mock-data, primitives, PortalShell, taxonomy) without modification.
- Built `src/components/industry/IndustryPortal.tsx` — main shell using `PortalShell` + `PortalHeader` + 6 `NavItem`s (Dashboard, Jobs, Candidates, Proof Inspector, Hiring Pipeline, Analytics). Header title "Industry Portal" / subtitle "Don't hire the best-looking resume. Hire the best-proven skills." Right-side "Demo: Load Sample JD" button jumps to Jobs tab.
- Built `src/components/industry/DashboardTab.tsx` — 6 KPI cards (Active Openings, Verified Applicants, Shortlisted, Scheduled Interviews, Offers Extended, Avg Fit Score) in responsive grid; "Top Match Alerts (90%+)" list with Inspect button → `openInspector(studentId, jobId)` + tab switch to inspector.
- Built `src/components/industry/JobsTab.tsx` — two-pane layout. Left: Textarea + "Paste Sample Raw JD" (Finnable JD), "Parse JD with AI" calls `parseJobDescription(raw)` + shows structured result + "Auto Skill Normalization" table that scans ALL variants per canonical (NodeJS+Node.js → Node.js, "merged 2 → 1" badge). "Publish Job" → `addJob`. Right: existing job cards with dedup alert banner when `sources.length > 1`.
- Built `src/components/industry/CandidatesTab.tsx` — hero feature. Interactive weight sliders (Required/Preferred/Project 0..100) writing back to `setWeights`; live formula display; job `<Select>`; 4 evidence-filter toggles (Redis GitHub, SQL > 85%, zero warnings, verified Docker); ranked leaderboard table (rank, student, fit, verified required ✓, skill gaps ❌, proof icons, AI explanation with tooltip, Inspect + Compare checkbox); compare bar at bottom when ≥2 selected; side-by-side Comparison Matrix Dialog (fit/verified/gaps/SQL/projects/proctor integrity/CGPA).
- Built `src/components/industry/ProofInspectorTab.tsx` — uses `inspector` slice. 4 subtabs (Resume / GitHub / Assessments / Projects) controlled by `inspector.subtab` + `setInspectorSubtab`. Resume subtab generates bullet points each with clickable `[Proof Verified]` ProofBadge highlighting supporting evidence below. Resume Claim Auditor: green Verified Claim rows (linked to github evidence) + red Blocked Claim rows (Kubernetes/Cassandra/AWS-EKS flagged "No imports found"). Empty state when inspector closed.
- Built `src/components/industry/PipelineTab.tsx` — Kanban board with 6 columns = PIPELINE_STAGES. Per-card: avatar+name, role+company, fit badge, ← back / → advance buttons calling `moveApplication(app.id, nextStage)`. Horizontal scroll on mobile. Reads live from shared store (Student Portal & TPO see same state).
- Built `src/components/industry/AnalyticsTab.tsx` — 3 recharts: (1) Batch Skill Distribution stacked BarChart (verified vs blocked, emerald/crimson), (2) Hiring Velocity AreaChart with gold gradient (apps per stage), (3) Top Missing Skill Gaps horizontal BarChart in amber aggregating `computeFit().missingRequired` across all applications. All wrapped in `drishti-card`.
- Verified `bun run lint` clean (no errors / warnings). Verified dev server boots and returns HTTP 200. Did NOT touch store, libs, primitives, PortalShell, or any other portal.

Stage Summary:
- Industry Portal fully wired with all 6 tabs working against the shared Zustand store. Recruiters can: parse raw JDs with skill-normalization visualization, rank candidates by verified fit score with interactive weight sliders, X-ray a candidate's resume/GitHub/assessments/projects + automated Resume Claim Auditor, advance candidates through a shared pipeline Kanban (synced with Student Portal & TPO), and view batch analytics.
- Lint passes; dev server returns 200. Files created (all under `src/components/industry/`): `IndustryPortal.tsx`, `DashboardTab.tsx`, `JobsTab.tsx`, `CandidatesTab.tsx`, `ProofInspectorTab.tsx`, `PipelineTab.tsx`, `AnalyticsTab.tsx`.

---
Task ID: 5
Agent: tpo-portal-builder
Task: Build the TPO/Admin Portal (multi-source ingestion, dedup, batch ranker, master pipeline, audit log, drive analytics).

Work Log:
- Read foundation: consumed `useAppStore` slices (rawSources, addRawSource, clearRawSources, parseJobDescription, moveApplication, openInspector, weights, students, jobs, applications), `dedupeJobs` (+ RawJobSource/MergedJob types) from `src/lib/dedup.ts`, `computeFit`/`fitTier`/`DEFAULT_WEIGHTS` from `src/lib/fit-score.ts`, `PIPELINE_STAGES`/`StudentProfile`/`JobOpening`/`Application`/`ApplicationStage` from `src/lib/mock-data.ts`, and shared primitives (`AvatarCircle`, `FitScoreBadge`, `VerifiedPill`, `GapPill`) from `src/components/shared/primitives.tsx`. Header/sidebar come from `src/components/shell/PortalShell.tsx`.
- Created `src/components/tpo/TpoPortal.tsx` — the named export `TpoPortal` (use client). Uses `PortalShell` + `PortalHeader` (title "TPO Admin Portal" / subtitle "One source of truth for campus drives — deduplicated, ranked, audited.") and a 5-item sidebar driven by `NavItem`. State-held active tab; renders the matching subcomponent.
- Created `src/components/tpo/IngestionTab.tsx` — left column: paste chaotic WhatsApp/Alumni/Partner job feed (Textarea + Source Select with 4 channel options + company/role/location/ctc inputs + "Add Source" + "Simulate WhatsApp Duplicate Merge" 1-click demo button + "Clear all sources" button). Right column: two-stage dedup engine visualization — Stage 1 Blocking cards list raw source members per normalized block; Stage 2 Semantic Similarity shows merged job cards with `similarity %` badge, source-channel chips, emerald "MERGED" border highlight when `memberIds.length > 1`, and "Merged from: WhatsApp Forward + Alumni Referral + Partner Portal" tag list. Summary banner: "N raw sources → M canonical jobs (X duplicates merged)". `useMemo` over `dedupeJobs(rawSources)`.
- Created `src/components/tpo/BatchRankerTab.tsx` — JD Textarea pre-filled with a realistic Novos Labs backend JD; "Paste Sample Raw JD" button restores it. Live parsed preview (company / role / location / CTC / required + preferred skill pills) computed via `parseJobDescription` from the store wrapped in `useMemo`. "Rank Graduating Batch" button builds a temporary `JobOpening` and ranks ALL students in store by `computeFit(student, tempJob, weights).score` descending. Ranked table (Table component) columns: Rank (medal-colored chip), Student (avatar + name + branch + batch + CGPA + roll), Fit Score Badge, Verified Required skills (VerifiedPill), Skill Gaps (GapPill, red), plain-language explanation, [Inspect Proof] button → `openInspector(student.id)`. "Export Verified Shortlist" button downloads CSV (Blob + anchor) of all ranked rows with name/roll/branch/batch/CGPA/fit score/verified skills/skill gaps.
- Created `src/components/tpo/MasterPipelineTab.tsx` — consolidated Kanban across ALL jobs (not per-job). 6 columns = `PIPELINE_STAGES`, each color-accented (blue/gold/amber/violet/cyan/emerald). KPI strip above the board: Active Drives (distinct companies in jobs), Total Applications, Offers Extended (stage=Offer), Conversion Rate (offers/applied %). Each card: avatar+name, company·role, fit badge, CTC, "← Back" and "Advance →" buttons calling `moveApplication(app.id, nextOrPrevStage)` (disabled at pipeline endpoints). Horizontal scroll wrapper for mobile.
- Created `src/components/tpo/AuditLogTab.tsx` — derived audit log from `students` data: proctoring violations (any assessment with `warnings > 0`), failed assessments with auto-strip message, low verification scores (verificationScore < 80), plus simulated resume claim blocks ("Student X — blocked unsupported claim 'Kubernetes & Redis Microservices' on resume" etc.). Severity color-coded: red=violation, amber=warning, blue=info badge. Filter chips (All/Violations/Warnings/Info) with live counts. Table: student avatar+name+roll, event-type chip with icon, message, severity badge, timestamp.
- Created `src/components/tpo/DriveAnalyticsTab.tsx` — recharts-driven analytics, 4 `drishti-card` titled cards in a 2-col responsive grid: (1) Offer Conversions by Company — grouped BarChart (applications vs offers per job, blue+emerald bars); (2) Pipeline Distribution — donut PieChart of 6 stages with DRISHTI palette; (3) Institution Skill Coverage — horizontal stacked BarChart per skill (verified emerald + unverified amber); (4) Verification Health — donut PieChart (Verified / Unverified / Failed-Stripped) with center % label + legend, plus a top KPI strip showing verified/unverified/stripped/blocked-claim counts.
- All components `"use client"`, TypeScript strict, no `any`, DRISHTI dark palette (gold #ffe2b2 / electric-blue #9fe0ff / emerald #10b981 / crimson #ef4444 / amber #f59e0b — no indigo). `useMemo` everywhere data is derived (dedup, ranking, kanban bucketing, audit events, chart datasets). Mobile-first responsive (stacks on mobile; horizontal scroll on Kanban + ranked table + audit table).
- `bun run lint` clean. Dev server running on port 3000 (no compile errors in dev.log).

Stage Summary:
- TPO Admin Portal complete with all 5 tabs fully wired: (1) Multi-Source Job Ingestion & Deduplication with the two-stage blocking→cosine-similarity engine visualization; (2) 1-Click Batch Ranker that parses a pasted JD and ranks the whole graduating batch with a CSV-exportable verified shortlist; (3) Master Placement Pipeline Kanban consolidating all drives with KPI strip + stage advance/back controls; (4) Audit Log & Violations with severity color-coding and filtering; (5) Drive Analytics with 4 recharts visualizations (offer conversions, pipeline distribution, skill coverage, verification health donut).
- Files created/edited (all under `src/components/tpo/`): `TpoPortal.tsx` (rewritten), `IngestionTab.tsx`, `BatchRankerTab.tsx`, `MasterPipelineTab.tsx`, `AuditLogTab.tsx`, `DriveAnalyticsTab.tsx`. No other folders touched. Lint passes cleanly. Ready for the TPO Admin role to be selected from the role switcher in the header.

---
Task ID: 3
Agent: orchestrator (main)
Task: Build the Student Portal — 5 tabs including the proctoring module with real browser APIs (TF.js/COCO-SSD/MediaPipe) and 8 anti-cheat monitors; plus landing integration + SPA shell + end-to-end Agent Browser verification.

Work Log:
- Built `src/lib/proctor-engine.ts`: CDN loaders for TensorFlow.js 4.22.0, COCO-SSD 2.2.3 (global scripts), and MediaPipe Tasks Vision FaceDetector (ESM dynamic import from jsdelivr). Helpers: detectObjects, detectFaces, drawBoxes (red boxes for forbidden objects / green for permitted / blue for faces), captureSnapshot (compressed JPEG).
- Built `src/components/student/ProctoringTab.tsx` — full 4-phase proctoring flow:
  - Phase idle: SkillPicker (all taxonomy skills, marks verified/unverified).
  - Phase handshake: rules + 8-monitor list + privacy notice + exam config (EXAM_MINUTES=10, MAX_WARNINGS=3, PASS_THRESHOLD=75, BAD_OBJECTS, LOUD_LIMIT=40).
  - Phase exam: 5 randomized MCQs (pickQuestions), 10-min countdown, live webcam + canvas bounding-box overlay, audio meter (Web Audio API AnalyserNode), warning counter (0/3), live event log with JPEG snapshots.
  - 8 anti-cheat monitors: (1) Fullscreen enforcement via fullscreenchange, (2) Tab/window switch via visibilitychange + window.onblur, (3) Camera stream monitor (track.readyState poll), (4) Microphone audio monitor (LOUD_LIMIT 40, >3s sustained), (5) Face detection (MediaPipe — no/multiple/away face >3s), (6) Object detection (COCO-SSD every 1000ms, red/green boxes), (7) Action & shortcut blocker (contextmenu/copy/paste/cut/F12/Ctrl+C/V/U/P/Ctrl+Shift+I/PrintScreen), (8) Cooldown (5s per warning type) + auto-submit at MAX_WARNINGS with JPEG snapshot capture.
  - Phase report: final score, pass/fail (>=75% unlocks ✓ Verified, <75% auto-strips skill), downloadable JSON log, visual event table with snapshots. Calls applyAssessmentResult → updates store (auto-removes failed skills + recomputes verification score).
  - Graceful degradation: if CDN/models fail to load (offline), basic monitors (fullscreen, tab switch, audio, shortcut blocker, camera) still run; face/object detection shows "offline".
- Built `src/components/student/ProfileSkillTab.tsx`: profile header (verification score ring), GitHub Sync & Code Analyzer card (Sync Latest Commits → animated scan of package.json/requirements.txt/Dockerfile/src files), Verified Evidence Ledger (clickable skill pills), Skill Selection & Assertion module (claim → ⚠ Unverified, only verified after GitHub/assessment proof, failed auto-removed), Interactive Skill-to-Proof Matrix table.
- Built `src/components/student/SmartJobFeedTab.tsx`: deduplicated job cards (left, with merged source tags), Fit Score breakdown (right): weighted formula display, plain-language AI explanation, verified matches (✓) + missing gaps (✗) with "Take Proctored Assessment to Close Gap" CTA, alumni referral widget, "Generate Tailored Truthful Resume & Apply" CTA.
- Built `src/components/student/ResumeStudioTab.tsx`: Mode 1 (1-Click ATS Generator — target job select, truth-constrained bullets from verified evidence only, RenderCV YAML live preview, 1-page resume preview with clickable [Proof Verified] badges, Download ATS PDF / Forward buttons); Mode 2 (BS Detector — paste/load sample inflated resume, audit claims against evidence ledger, red/green diff UI, "Sanitize & Remove Unverified Claims" + submission BLOCKED banner).
- Built `src/components/student/ApplicationTrackerTab.tsx`: synchronized Kanban (6 stages across active applications), crowdsourced interview prep bank (log questions by company/role/category/difficulty, search + filter).
- Built `src/components/student/StudentPortal.tsx` shell: PortalHeader + PortalShell, 5 sidebar tabs, student switcher dropdown (Om/Mayur/Prakhar/Viraj), GitHub Connected badge, verification score chip, listens for drishti:goto-tab custom events (cross-tab navigation).
- Wired `src/app/page.tsx`: SPA view switching + global toast bridge (drishti:toast → useToast) + ProofDrawer mounted globally. Dynamic imports for portals (ssr:false).
- Configured `next.config.ts` allowedDevOrigins to silence cross-origin dev warning.

Agent Browser verification (server bound to 0.0.0.0:3000, gateway :81):
- Landing page: title "DRISHTI — Evidence-Backed Campus Placements", h1 "Evidence-Backed Campus Placements / Proof Over Claims, Zero Inflation.", all nav links present. ✓
- Student Portal: 5 tabs render, Om profile, 6 verified skill pills, GitHub sync button, skill taxonomy matrix. ✓
- Proctoring tab: header + pass threshold + skill picker render. ✓
- Resume Studio: ATS + RenderCV YAML + BS Detector + Proof Verified badges. ✓
- Smart Job Feed: fit scores, merged source tags, gaps, alumni widget. ✓
- Proof Drawer (click Python ✓): opens with GitHub Code Proof + Proctored Assessment + Faculty-Evaluated Project + commit SHA + score. ✓
- Industry Portal: 6 tabs, Candidates leaderboard ranks Prakhar(87% Strong)/Om(72% Good)/Viraj(26% Weak) with weight sliders + AI explanations. ✓
- TPO Portal: 5 tabs, "Simulate WhatsApp Duplicate Merge" → 7 raw sources → 4 canonical jobs → 3 duplicates merged, Stage 1 Blocking + Stage 2 cosine similarity both visualized. ✓
- Role switcher dropdown navigates all portals. ✓
- dev.log: all GET / 200, zero runtime errors. `bun run lint` clean.

Stage Summary:
- DRISHTI is complete and fully interactive end-to-end. All 3 portals (Student 5 tabs, Industry 6 tabs, TPO 5 tabs) + landing page + shared proof drawer + role switcher verified working in-browser. Proctoring module loads CDN AI models with graceful degradation. Mock data pre-populated (4 students, 4 jobs, 6 applications, dedup demo). 1-click hackathon demo actions present (WhatsApp dedup merge, sample inflated resume load, GitHub sync). Lint clean, no runtime errors.
