# 👁️ DRISHTI (दृष्टि) — Evidence-Backed Campus Placements Operating System

<div align="center">

![DRISHTI Banner](https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/130837c4-0244-4f37-9c61-8d801d93fd29.jpg)

### **Proof Over Claims, Zero Inflation.**
*Connecting verified student talent with trusted hiring partners through cryptographic proof, proctored assessments, and automated 1-page ATS resumes.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-4f46e5?style=for-the-badge&logo=vercel&logoColor=white)](https://drishti-platform-tan.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-OMBADHAN45%2Fhackethon--projects-0ea5e9?style=for-the-badge&logo=github&logoColor=white)](https://github.com/OMBADHAN45/hackethon-projects)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.3%20Turbopack-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4%20Vibrant%20Light-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Table of Contents
- [Executive Overview](#-executive-overview)
- [The Problem We Solve](#-the-problem-we-solve)
- [The 4-Step Truth-Enforced Pipeline](#-the-4-step-truth-enforced-pipeline)
- [Three-Sided Ecosystem Architecture](#-three-sided-ecosystem-architecture)
  - [🎓 Student Portal](#-1-student-portal)
  - [🏢 Industry & Recruiter Portal](#-2-industry--recruiter-portal)
  - [🏛️ Placement Team (TPO) Portal](#-3-placement-team-tpo-portal)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Deployment](#-deployment)
- [Authors & Acknowledgments](#-authors--acknowledgments)

---

## 🚀 Executive Overview

**DRISHTI** is a next-generation campus placement platform built to eliminate resume fraud, candidate embellishment, and the operational chaos of university recruitment cells.

Instead of relying on self-reported, ChatGPT-inflated bullet points, DRISHTI establishes a **Zero-Trust Talent Ledger**:
1. **Every skill must be proven:** Linked directly to GitHub commit history, pull request diffs, or verified browser-locked proctor tests.
2. **Resumes are compiled automatically:** Using a programmatic **RenderCV ATS compiler**, producing clean, deterministic 1-page PDFs embedded with cryptographic verification QR codes.
3. **Recruiters inspect proof:** With an **X-Ray Proof Inspector** that audits actual code contributions, repository AST changes, and assessment logs.
4. **TPOs eliminate chaos:** Multi-source ingestion (WhatsApp, Email, HR portals) unified with **Levenshtein fuzzy deduplication** and instant 1-click batch cohort ranking.

---

## ⚠️ The Problem We Solve

| Traditional Campus Placement Chaos | The DRISHTI Standard |
| :--- | :--- |
| **Resume Inflation:** Candidates copy-paste buzzwords (Kubernetes, Microservices, PyTorch) with zero hands-on experience. | **Zero-Trust Verification:** Unverified claims are quarantined into a Pending Assessment Queue until validated by browser-locked tests or code commits. |
| **Recruiter Fatigue:** Reviewing 500+ identical-looking PDF resumes with untrustworthy project descriptions. | **X-Ray Proof Inspector:** 1-click audit of raw GitHub diffs, line additions, and camera proctored exam invariance. |
| **WhatsApp Forwarding Chaos:** Placement teams paste job drives across dozens of unorganized WhatsApp groups. | **Unified Ingestion Engine:** Aggregates posts from WhatsApp, email, and portals, merging duplicates using Levenshtein fuzzy algorithms. |
| **Manual Shortlisting:** TPO officers spend days filtering Excel spreadsheets with human bias. | **1-Click Batch Ranker:** Instantly evaluates graduating cohorts against raw JDs using objective multi-factor fit scoring. |

---

## 🔄 The 4-Step Truth-Enforced Pipeline

```
  ┌─────────────────────────┐       ┌─────────────────────────┐
  │         STEP 01         │       │         STEP 02         │
  │  Identity & Evidence    │ ────> │  AI-Proctored Browser-  │
  │       Onboarding        │       │   Locked Verification   │
  └─────────────────────────┘       └─────────────────────────┘
               │                                 │
               ▼                                 ▼
   Connect GitHub, scan repos &        Anti-cheat timed assessment;
   quarantine unverified skills.       Passing certifies; failing purges.
               │                                 │
               ▼                                 ▼
  ┌─────────────────────────┐       ┌─────────────────────────┐
  │         STEP 03         │       │         STEP 04         │
  │   Truth-Enforced ATS    │ ────> │ Evidence-Backed Hiring  │
  │    Resume Studio        │       │      Leaderboards       │
  └─────────────────────────┘       └─────────────────────────┘
               │                                 │
               ▼                                 ▼
   RenderCV compiles verified data     Recruiters rank by fit scores
   into a 1-page QR-hashed PDF.        and inspect raw code diffs.
```

1. **Step 1: Identity & Evidence Onboarding**
   - Candidates authenticate and sync their GitHub profile, repositories, commit history, and education details.
   - Declared skills are immediately segregated into a **Pending Assessment Queue**—never added to the active resume or profile until proven.
2. **Step 2: AI-Proctored Verification**
   - Browser-locked assessment environment with camera gaze tracking, tab-switch penalties, and full-screen enforcement.
   - Passing an assessment earns an immutable **Verified Skill Badge** (`🟢 React`, `🟢 Node.js`).
   - Failing automatically purges the unverified claim from the candidate's record.
3. **Step 3: Truth-Enforced Resume Generation**
   - Programmatic **RenderCV engine** compiles strictly verified milestones into a standardized 1-page ATS resume.
   - Features a tamper-evident cryptographic hash (`sha256:...`) and verification QR code.
4. **Step 4: Evidence-Backed Hiring Leaderboards**
   - Recruiters filter cohorts by verifiable fit scores (e.g. `94% Strong Match`).
   - The **X-Ray Proof Inspector** allows instant review of actual code diffs and proctored exam recordings before scheduling interviews.

---

## 🏛️ Three-Sided Ecosystem Architecture

DRISHTI provides dedicated, role-tailored portals unified by a shared evidence ledger:

### 🎓 1. Student Portal
> *"Bypass resume inflation. Generate automated, truth-enforced 1-page ATS resumes backed by your actual GitHub commits and AI-proctored test scores."*
- **Interactive Multi-Step Onboarding:** Personal, educational, professional links, and pending skills ingestion.
- **RenderCV Resume Studio:** Instant live preview and PDF generation of 1-page ATS resumes with customizable theme accents.
- **Evidence Locker:** Live sync with GitHub repositories, commit logs, and faculty-graded capstone projects.
- **Proctoring Sandbox:** Browser-locked challenge suite with real-time anomaly detection.
- **Smart Job Feed:** Algorithmic job recommendations with transparent fit breakdowns.
- **Application Tracker:** Real-time visibility into hiring pipeline stages (Applied → Review → Interview → Offer).

### 🏢 2. Industry & Recruiter Portal
> *"Hire the best-proven skills, not the best-looking resume. Access live, pre-vetted candidate leaderboards with an X-Ray Proof Inspector to verify code firsthand."*
- **Live Candidate Leaderboard:** High-hierarchy grid and table views ranked by objective fit scores (`94% Strong`, `82% Good`).
- **X-Ray Proof Inspector:** Interactive drawer displaying git commit diffs, repo lines changed, and proctor camera logs.
- **Side-by-Side Candidate Compare:** Benchmark up to 3 candidates simultaneously across verified dimensions.
- **Micro-Card Kanban Pipeline:** Clutter-free recruitment board with drag-and-drop / 1-click stage progression.
- **Company Onboarding Wizard:** Verified employer registration with CIN verification, hiring tier badges, and role publishing.

### 🏛️ 3. Placement Team (TPO) Portal
> *"Eliminate chaotic WhatsApp job forwarding. Utilize a unified ingestion engine, multi-source job deduplication, and 1-click evidence-backed batch ranking."*
- **Multi-Source Job Ingestion:** Ingest raw text drives from WhatsApp broadcasts, alumni emails, and partner portals.
- **Levenshtein Fuzzy Deduplication:** Automatically merges redundant drives with match confidence scores (e.g., `98.4% Match → Consolidated`).
- **1-Click Batch Ranker:** Paste any raw JD; DRISHTI extracts criteria, ranks the entire graduating cohort, displays executive KPI cards, and exports verified shortlists to CSV.
- **Audit Log & Transparency Trail:** Immutable records tracking proctoring violations, failed assessments, and scrubbed claims.
- **Drive Analytics:** Visual charts tracking placed percentages, average CTC distributions, and departmental performance.

---

## 💻 Tech Stack & Architecture

| Layer | Technologies & Tools |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict type-safety, zero `any` policy) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/), `@tailwindcss/postcss`, Radix UI primitives, [Lucide Icons](https://lucide.dev/) |
| **Theme System** | **Vibrant Light Theme** (`#f4f7fe` base, luminous white glassmorphism, gold/indigo accents, Sora typography) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) with browser history pushState synchronization |
| **Motion & Micro-interactions** | [Framer Motion](https://www.framer.com/motion/) |
| **Algorithms** | Levenshtein Distance (Job Deduplication), Multi-Factor Weighted Fit Score Engine |
| **Data Layer & ORM** | [Prisma ORM](https://www.prisma.io/) with structured relational seed fixtures |
| **ATS Resume Engine** | Programmatic RenderCV schema compiler with cryptographic proof hashing |
| **Deployment** | [Vercel](https://vercel.com/) (Edge Network, Serverless API functions) |

---

## 📂 Project Directory Structure

```
HACKTON/
├── public/                     # Static assets, SVG icons, platform media
├── src/
│   ├── app/                    # Next.js 16 App Router
│   │   ├── api/                # API routes (Student onboarding, RenderCV generator)
│   │   ├── industry/           # Industry portal page route
│   │   ├── student/            # Student portal page route
│   │   ├── tpo/                # Placement team portal page route
│   │   ├── globals.css         # Vibrant Light Theme tokens & CSS utilities
│   │   ├── layout.tsx          # Root layout with Sora font configuration
│   │   └── page.tsx            # Dynamic portal switcher with history sync
│   ├── components/
│   │   ├── industry/           # CandidatesTab, JobsTab, PipelineTab, ProofInspector
│   │   ├── landing/            # Redesigned 3-Tab LandingPage, Hero, 4-Step Pipeline
│   │   ├── shared/             # CommandPalette, PlatformTourModal, Primitives
│   │   ├── shell/              # PortalShell, PortalHeader, NavItem
│   │   ├── student/            # ResumeStudioTab, ProfileSkillTab, ProctoringTab, StudentOnboardingModal
│   │   ├── tpo/                # IngestionTab, BatchRankerTab, MasterPipelineTab, AuditLogTab
│   │   └── ui/                 # Accessible Radix/Shadcn UI component primitives
│   ├── hooks/                  # Custom React hooks (use-toast, use-mobile)
│   └── lib/
│       ├── dedup.ts            # Levenshtein deduplication engine
│       ├── fit-score.ts        # Algorithmic candidate match calculator
│       ├── mock-data.ts        # Rich relational database mock fixtures
│       ├── seed.ts             # Production-grade database seed script
│       ├── store.ts            # Global Zustand state management
│       └── taxonomy.ts         # Canonical skill taxonomy & normalization
├── next.config.ts              # Next.js configuration (Standalone output)
├── package.json                # Dependencies & scripts
└── tsconfig.json               # TypeScript configuration
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Node.js** 18.18+ or 20+
- **npm** or **bun** / **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/OMBADHAN45/hackethon-projects.git
   cd hackethon-projects
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or with bun
   bun install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the platform.

### Key Shortcuts & Navigation:
- **`Ctrl + K` / `Cmd + K`**: Opens the global platform Command Palette to search candidates, jobs, and tools.
- **Portal Switcher:** Use the navigation pill in the header to switch instantly between **Student**, **Industry**, and **TPO** portals.

---

## 🌐 Deployment

DRISHTI is optimized for zero-configuration deployment on **Vercel**:

- **Live Production URL:** [https://drishti-platform-tan.vercel.app](https://drishti-platform-tan.vercel.app)
- **Deployment Preview URL:** [https://drishti-platform-bcjke2lb3-sankalp-eb16.vercel.app](https://drishti-platform-bcjke2lb3-sankalp-eb16.vercel.app)

### Deploying Your Own Instance:
```bash
npx vercel --prod --name drishti-platform
```

---

## 👥 Authors & Team

Developed for hackathons and university campus innovation by the **DRISHTI Engineering Team**:
- **GitHub:** [@OMBADHAN45](https://github.com/OMBADHAN45)

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute for educational and placement technology initiatives.
