"use client";

import { useAppStore, type ActiveRole, type ChatMessage, type ChatAction } from "./store";

export interface RoleConfig {
  role: ActiveRole;
  title: string;
  badge: string;
  description: string;
  welcomeMessage: string;
  quickPrompts: string[];
  placeholder: string;
}

export const ROLE_CONFIGS: Record<ActiveRole, RoleConfig> = {
  Student: {
    role: "Student",
    title: "Career Coach",
    badge: "🎓 Career Coach",
    description: "Proof-linked guidance, interview prep & fit score insights",
    welcomeMessage:
      "👋 Hello! I am your **Drishti Career Coach**. I have real-time access to your verified skills, GitHub commit proofs, ATS score, and company applications. Ask me about your job fit scores, tailored interview questions, or skill verification!",
    quickPrompts: [
      "Why is my fit score low for the Acme Corp job?",
      "Give me 3 interview questions for Node.js based on my resume.",
      "How do I verify my unverified skills through proctoring?",
      "Tailor my resume for high-concurrency backend roles.",
    ],
    placeholder: "Ask career coach about fit scores, interview prep, verification...",
  },
  Industry: {
    role: "Industry",
    title: "Data Assistant",
    badge: "💼 Data Assistant",
    description: "Tamper-proof candidate search, proof inspection & talent analytics",
    welcomeMessage:
      "💼 Welcome! I am your **Drishti Talent Data Assistant**. I can query candidates with tamper-proof GitHub proofs, benchmark scores, and zero-inflation credentials. How can I assist your hiring pipeline today?",
    quickPrompts: [
      "Which candidates have a verified SQL score above 85% and know React?",
      "Show me top backend candidates with verified GitHub code proofs.",
      "Explain the fit score breakdown for Om Deshmukh.",
      "Compare candidates with low ATS inflation and verified Redis.",
    ],
    placeholder: "Search candidates, query SQL/React benchmarks, inspect proofs...",
  },
  TPO: {
    role: "TPO",
    title: "Drive Manager",
    badge: "🏛️ Drive Manager",
    description: "Multi-company placement tracking, deduplication & drive metrics",
    welcomeMessage:
      "🏛️ Greetings! I am your **Drishti TPO Drive Manager**. I maintain centralized visibility over all campus placement drives, cross-company interview stages, multi-source job deduplication, and student verification audits.",
    quickPrompts: [
      "How many students are currently in the HR round across all companies?",
      "What is our campus placement rate and offer distribution so far?",
      "Are there any duplicate job openings detected across WhatsApp and portal?",
      "Which students have unverified skills flagged for verification?",
    ],
    placeholder: "Query campus drive stats, deduplication, placements, audit logs...",
  },
};

/**
 * Intelligent Mock Response Engine for DRISHTI AI Copilot
 * Queries real active store state (students, jobs, applications, raw sources)
 * and returns context-aware evidence-backed answers.
 */
export async function getDrishtiBotResponse(
  input: string,
  role: ActiveRole
): Promise<ChatMessage> {
  // Realistic simulated AI reasoning latency
  const delay = 650 + Math.floor(Math.random() * 350);
  await new Promise((resolve) => setTimeout(resolve, delay));

  const lower = input.toLowerCase().trim();
  const store = useAppStore.getState();
  const students = store.students;
  const jobs = store.jobs;
  const applications = store.applications;
  const rawSources = store.rawSources;
  const activeStudent =
    students.find((s) => s.id === store.activeStudentId) || students[0];

  const now = Date.now();
  const msgId = "ai_" + Math.random().toString(36).slice(2, 9);

  // -------------------------------------------------------------
  // 1. STUDENT PERSONA (Career Coach)
  // -------------------------------------------------------------
  if (role === "Student") {
    // A. Why is my fit score low for Acme Corp?
    if (
      lower.includes("acme") ||
      (lower.includes("fit score") && (lower.includes("low") || lower.includes("why"))) ||
      lower.includes("acme corp")
    ) {
      const acmeJob = jobs.find((j) => j.company.toLowerCase().includes("acme")) || jobs[0];
      return {
        id: msgId,
        sender: "ai",
        role: "Student",
        timestamp: now,
        text: `### 📊 Fit Score Analysis: ${acmeJob.company} — ${acmeJob.role}

Your current computed **Evidence-Backed Fit Score** is **78%** (compared to the 85% recommended interview threshold).

#### 🔍 Breakdown by Weight:
* **✓ Verified Skill Matches (Weight: 50%):**
  * **TypeScript**: 92% benchmark (Verified via GitHub commits)
  * **React**: 88% benchmark (Verified in 14 commits across 2 repos)
  * **Node.js**: 90% benchmark (Proctored test passed with 0 warnings)
* **⚠ Skill Penalties & Missing Evidence (Weight: 30%):**
  * **Docker**: Marked as **Unverified** on your profile. Acme Corp ranks Docker as a high-priority preferred skill.
  * **AWS / Cloud Deployment**: Listed in the JD, but 0 commit evidence or proctored test has been recorded.
* **⚡ Recruiter Weights (Weight: 20%):**
  * Acme Corp assigns a heavy 25% weight on verified DevOps & containerization tooling.

---
💡 **Actionable Recommendation:**
Take the 10-minute proctored assessment for **Docker** on the **Assessment & Proctoring** tab. Scoring $\\ge 75\\%$ will automatically upgrade your badge and boost your Acme Corp fit score to **89%**!`,
        actions: [
          { label: "🛡️ Take Docker Assessment", action: "tab", payload: "assess" },
          { label: "📄 Open Resume Studio", action: "tab", payload: "resume" },
        ],
      };
    }

    // B. Interview questions for Node.js
    if (
      lower.includes("interview") ||
      (lower.includes("question") && (lower.includes("node") || lower.includes("resume"))) ||
      lower.includes("node.js") ||
      lower.includes("nodejs")
    ) {
      return {
        id: msgId,
        sender: "ai",
        role: "Student",
        timestamp: now,
        text: `### 🎯 Evidence-Linked Node.js Interview Questions

Based on your verified repository **\`neural-task-runner\`** and your **Node.js (90% Verified)** assessment benchmark, here are 3 technical questions tailored to your actual code proofs:

1. **Event Loop & Libuv Worker Offloading**
   * *Context:* In your task queue implementation, you handled background CPU processing.
   * *Question:* When does Node.js delegate work to the Libuv thread pool vs utilizing OS-level asynchronous non-blocking kernel polling (like epoll/kqueue)? What are the performance implications if \`UV_THREADPOOL_SIZE\` is saturated?

2. **Stream Backpressure & Memory Bounds**
   * *Context:* High-throughput I/O pipelines in distributed services.
   * *Question:* How do you guarantee backpressure when streaming multi-gigabyte files into PostgreSQL with \`stream.pipeline()\`? What happens if you rely on simple \`.on('data')\` event listeners under high network latency?

3. **Memory Leak Profiling & Heap Snapshots**
   * *Context:* Production stability under heavy concurrent load.
   * *Question:* How would you detect and locate a subtle memory leak caused by retained closures or uncleaned global event emitters using \`v8.getHeapSnapshot()\` or Chrome DevTools memory allocation timeline?`,
        actions: [
          { label: "📝 Practice in Application Prep", action: "tab", payload: "tracker" },
          { label: "🔍 View Verified Code Snippets", action: "proof", payload: { studentId: activeStudent.id, skill: "Node.js" } },
        ],
      };
    }

    // C. How do I verify my unverified skills?
    if (
      lower.includes("verify") ||
      lower.includes("proctor") ||
      lower.includes("anti-cheat") ||
      lower.includes("cheating") ||
      lower.includes("unverified")
    ) {
      return {
        id: msgId,
        sender: "ai",
        role: "Student",
        timestamp: now,
        text: `### 🛡️ How to Verify Unverified Skills on DRISHTI

DRISHTI rejects inflated self-claims. To turn any skill from **Unverified ⚠** into a tamper-proof **Verified ✓** credential:

1. Go to the **Assessment & Proctoring** tab.
2. Select any unverified skill from your queue (e.g., *Docker, Redis, Python, Spring Boot*).
3. The **AI Proctoring Engine** will activate:
   * **MediaPipe Face Mesh:** Ensures you remain in camera frame with face orientation tracking.
   * **COCO-SSD Object Detector:** Scans for forbidden secondary devices or cell phones.
   * **Page Visibility API:** Enforces strict fullscreen; flags tab switches or window defocus.
   * **Audio Monitor:** Detects background voices or speech.
4. Answer the randomized, anti-leak technical MCQs within the exam timer.
5. Score **$\\ge 75\\%$** with $\\le 2$ warnings to permanently bind the verified cryptographic proof to your profile!

*(Note: The Drishti AI Copilot is strictly disabled during active exams to preserve academic integrity.)*`,
        actions: [
          { label: "🚀 Go to Assessment Tab", action: "tab", payload: "assess" },
          { label: "📋 Check My Skill Ledger", action: "tab", payload: "profile" },
        ],
      };
    }

    // D. Resume tailoring for high-concurrency backend
    if (
      lower.includes("tailor") ||
      lower.includes("concurrency") ||
      lower.includes("backend role") ||
      lower.includes("ats") ||
      lower.includes("resume")
    ) {
      return {
        id: msgId,
        sender: "ai",
        role: "Student",
        timestamp: now,
        text: `### ✨ Resume Tailoring: High-Concurrency Backend

For high-concurrency roles (e.g., FinServe 18 LPA & Neural Tech 16 LPA):

* **Evidence to Feature:**
  * **Node.js (90%)** + **PostgreSQL (85%)** + **Redis (87%)**
  * Verified GitHub commit proof in repo \`neural-task-runner\` showcasing connection pooling and async job scheduling.
* **Suggested Bullet Point Improvement:**
  * ❌ *Before:* "Built backend with Node and database."
  * ✅ *DRISHTI Optimized:* "Architected distributed queue processing 12,000+ jobs/min using Node.js worker threads and Redis Pub/Sub; reduced p99 latency by 38% under high load [Verified Commits: 14]."
* **Proof QR Code:**
  * In **Resume Studio**, toggle *Include Verification Hashes* so recruiter ATS scanners can instantly validate your genuine code benchmarks without manual background checks.`,
        actions: [
          { label: "📄 Open Resume Studio", action: "tab", payload: "resume" },
          { label: "💼 View FinServe Opening", action: "tab", payload: "jobs" },
        ],
      };
    }
  }

  // -------------------------------------------------------------
  // 2. INDUSTRY PERSONA (Data Assistant)
  // -------------------------------------------------------------
  if (role === "Industry") {
    // A. Candidates with verified SQL > 85% and React
    if (
      (lower.includes("sql") && lower.includes("react")) ||
      (lower.includes("85") && lower.includes("sql")) ||
      lower.includes("verified sql score above 85")
    ) {
      // Query candidates
      const matchingCandidates = students.filter((s) => {
        const hasSql = s.skills.some(
          (sk) =>
            sk.canonical.toLowerCase() === "sql" && sk.status === "verified"
        );
        const hasReact = s.skills.some(
          (sk) =>
            sk.canonical.toLowerCase() === "react" &&
            (sk.status === "verified" || sk.status === "unverified")
        );
        return hasSql && hasReact;
      });

      const cards = matchingCandidates.map((c) => {
        const sqlAss = c.assessments.find((a) => a.skill.toLowerCase() === "sql");
        const reactAss = c.assessments.find((a) => a.skill.toLowerCase() === "react");
        return {
          id: c.id,
          name: c.name,
          branch: c.branch,
          cgpa: c.cgpa,
          sqlScore: sqlAss ? sqlAss.score : 95,
          reactScore: reactAss ? reactAss.score : 88,
          overallFit: Math.min(98, Math.round(c.verificationScore * 0.95 + 10)),
          verifiedCount: c.skills.filter((s) => s.status === "verified").length,
          githubUser: c.githubUser,
          avatarColor: c.avatarColor,
        };
      });

      return {
        id: msgId,
        sender: "ai",
        role: "Industry",
        timestamp: now,
        text: `### 🎯 Filter Results: Verified SQL > 85% + React Experience

Found **${cards.length} verified candidates** matching your exact technical criteria with zero unverified inflation:

${cards
  .map(
    (c, idx) =>
      `**${idx + 1}. ${c.name}** (${c.branch} · CGPA ${c.cgpa})
• **SQL Score:** **${c.sqlScore}%** ✓ Verified (Proctored benchmark)
• **React Score:** **${c.reactScore}%** ✓ Verified
• **Verified Skills:** ${c.verifiedCount} Total · **GitHub:** \`@${c.githubUser}\`
• **Overall Fit Rating:** **${c.overallFit}%**`
  )
  .join("\n\n")}

All candidates have verifiable cryptographic proof hashes attached to their commits and proctored screen logs.`,
        actions: [
          { label: "🔍 Inspect Om Deshmukh", action: "inspector", payload: { studentId: "stu_om" } },
          { label: "👥 Open Candidates Tab", action: "tab", payload: "candidates" },
        ],
        metadata: {
          candidateCards: cards,
        },
      };
    }

    // B. Top backend candidates with verified GitHub proofs
    if (
      lower.includes("top backend") ||
      (lower.includes("backend") && lower.includes("github")) ||
      lower.includes("code proof")
    ) {
      return {
        id: msgId,
        sender: "ai",
        role: "Industry",
        timestamp: now,
        text: `### 🏆 Top Backend Candidates (Verified GitHub Evidence)

1. **Om Deshmukh** (Computer Science '26)
   * **Verification Score:** **94%** (Zero Inflation Detected)
   * **Key Backends:** Node.js (90%), PostgreSQL (85%), Redis (87%), Python (92%)
   * **GitHub Evidence:** 14 verified commits in \`neural-task-runner\` (Worker threads, Redis queues).
2. **Viraj Anap** (Information Technology '26)
   * **Verification Score:** **91%**
   * **Key Backends:** Python (93%), Django (89%), PostgreSQL (90%), Docker (84%)
   * **GitHub Evidence:** 11 verified commits in microservice authentication service.
3. **Aarav Gupta** (Data Engineering '26)
   * **Verification Score:** **88%**
   * **Key Backends:** Java Spring Boot (88%), Kafka (85%), SQL (94%)
   * **GitHub Evidence:** Event-driven order streaming architecture.

All commit hashes were independently parsed from GitHub Webhook APIs with SHA validation.`,
        actions: [
          { label: "🔬 Open Proof Inspector", action: "tab", payload: "inspector" },
          { label: "📊 View Hiring Pipeline", action: "tab", payload: "pipeline" },
        ],
      };
    }

    // C. Explain fit score breakdown for Om Deshmukh
    if (
      lower.includes("om deshmukh") ||
      (lower.includes("fit score") && lower.includes("breakdown")) ||
      lower.includes("explain")
    ) {
      return {
        id: msgId,
        sender: "ai",
        role: "Industry",
        timestamp: now,
        text: `### 📈 Candidate Fit Breakdown: Om Deshmukh

* **Candidate:** Om Deshmukh (CSE 2026, CGPA: 9.12)
* **Overall Fit Score:** **94.2%** (Top 1% Percentile)

#### 🧮 4-Tier DRISHTI Scoring Algorithm:
1. **Verified Skill Coverage (40% Weight):** **96 / 100**
   * Target job requires: \`[Python, Node.js, Postgres, Redis]\`.
   * All 4 skills verified with proctored pass rates $\\ge 85\\%$.
2. **Assessment Benchmark Performance (25% Weight):** **92 / 100**
   * Node.js MCQ: 90% | SQL MCQ: 95% | Python MCQ: 92%.
   * Average proctoring violations: **0 warnings** (Clean audit).
3. **GitHub Code Proof Rigor (20% Weight):** **94 / 100**
   * 14 verified commits, AST parsed, authentic commit timestamps.
4. **Academic Standing & Integrity (15% Weight):** **91 / 100**
   * CGPA 9.12 with 0 active backlogs.

**Conclusion:** 🟢 **Strong Fit (Zero Risk)**. Ready for immediate technical interview scheduling.`,
        actions: [
          { label: "🔬 Inspect Full Proof Graph", action: "inspector", payload: { studentId: "stu_om" } },
          { label: "📋 Schedule Technical Round", action: "tab", payload: "pipeline" },
        ],
      };
    }

    // D. Keyword stuffing / inflation check
    if (
      lower.includes("inflation") ||
      lower.includes("keyword stuffing") ||
      lower.includes("ats")
    ) {
      return {
        id: msgId,
        sender: "ai",
        role: "Industry",
        timestamp: now,
        text: `### 🛡️ How DRISHTI Solves ATS Keyword Inflation

Traditional applicant tracking systems allow students to copy-paste 40+ technologies into their PDF resumes. 

**DRISHTI's Anti-Inflation Shield:**
1. **Dual Verification Requirement:** No skill can contribute to the Fit Score unless backed by either a **verified GitHub repository commit** or a **live proctored assessment score**.
2. **Auto-Scrubbing Mechanism:** When a student claims a skill without evidence, it is placed into a *Pending Assessment Queue* and discounted from recruiter feeds.
3. **Proof Drawer Access:** Recruiters can click any skill badge to inspect the exact commit diff, proctoring camera snapshots, and MCQ timestamp history.`,
        actions: [
          { label: "🔍 Try Proof Inspector", action: "tab", payload: "inspector" },
        ],
      };
    }
  }

  // -------------------------------------------------------------
  // 3. TPO PERSONA (Drive Manager)
  // -------------------------------------------------------------
  if (role === "TPO") {
    // A. How many students are in HR round across all companies?
    if (
      lower.includes("hr round") ||
      (lower.includes("hr") && lower.includes("how many")) ||
      lower.includes("across all companies") ||
      lower.includes("current round")
    ) {
      const hrApps = applications.filter((a) => a.stage === "HR Interview");
      const techApps = applications.filter((a) => a.stage === "Technical Interview");
      const offerApps = applications.filter((a) => a.stage === "Offer");

      return {
        id: msgId,
        sender: "ai",
        role: "TPO",
        timestamp: now,
        text: `### 📊 Cross-Company Master Pipeline Status

Across all active corporate drives on campus:

* **🤝 HR Round Candidates (${hrApps.length} Students):**
  * **Om Deshmukh** → FinServe Technologies (18 LPA)
  * **Aarav Gupta** → Neural Tech (16 LPA)
  * **Sneha Kulkarni** → CloudScale Networks (15 LPA)
* **💻 Technical Round:** **${techApps.length} Candidates** currently interviewing across 4 companies.
* **🎉 Confirmed Offers Issued:** **${offerApps.length} Offers** accepted with 0 placement roll-backs.
* **⚡ Pipeline Velocity:** 86% pass rate from Technical to HR stage. Average drive turnaround: 6.2 days.`,
        actions: [
          { label: "📋 Open Master Pipeline", action: "tab", payload: "pipeline" },
          { label: "📈 View Drive Analytics", action: "tab", payload: "analytics" },
        ],
        metadata: {
          metrics: [
            { label: "HR Round", value: hrApps.length },
            { label: "Tech Rounds", value: techApps.length },
            { label: "Accepted Offers", value: offerApps.length },
            { label: "Avg CTC", value: "16.2 LPA" },
          ],
        },
      };
    }

    // B. Placement rate and offer distribution
    if (
      lower.includes("placement rate") ||
      lower.includes("offer distribution") ||
      lower.includes("analytics") ||
      lower.includes("package")
    ) {
      const totalPlaced = applications.filter((a) => a.stage === "Offer").length;
      return {
        id: msgId,
        sender: "ai",
        role: "TPO",
        timestamp: now,
        text: `### 📈 Campus Placement Analytics & CTC Distribution

* **Overall Placement Rate (Eligible Students):** **84.6%**
* **Total Offers Released:** **${totalPlaced || 4} Offers**
* **Average Package:** **16.2 LPA** (Median: 15.0 LPA)
* **Highest Package:** **18.0 LPA** (FinServe Technologies)
* **Top Hiring Partners:**
  1. **FinServe Technologies** — 2 Offers (18 LPA)
  2. **Neural Tech** — 2 Offers (16 LPA)
  3. **Acme Corp** — 1 Offer (14 LPA)

**Audit Integrity:** 100% of placed candidates passed proctored technical benchmarks without disciplinary flags.`,
        actions: [
          { label: "📊 View Drive Analytics", action: "tab", payload: "analytics" },
          { label: "📑 Audit Log & Violations", action: "tab", payload: "audit" },
        ],
      };
    }

    // C. Duplicate job openings detected across WhatsApp and portal
    if (
      lower.includes("duplicate") ||
      lower.includes("dedup") ||
      lower.includes("whatsapp") ||
      lower.includes("raw source")
    ) {
      const sourcesCount = rawSources.length;
      return {
        id: msgId,
        sender: "ai",
        role: "TPO",
        timestamp: now,
        text: `### 🔍 Multi-Source Job Deduplication Report

* **Raw Ingestion Sources Scanned:** **${sourcesCount || 5} postings**
* **Duplicate Clusters Identified:** **1 Major Cluster**

#### 📋 Cluster Analysis: \`Neural Tech SDE-1 Backend\`
* **Source 1 (Portal):** "Neural Tech hiring SDE-1 Backend Engineers Bengaluru. Python, Node.js, PostgreSQL, Redis. CTC 16 LPA."
* **Source 2 (WhatsApp Group):** "Urgent hiring: Neural Tech SDE-1 Backend Python Nodejs Postgres 16 LPA 2026 batch."
* **Source 3 (Alumni Referral):** "Alumni referral opportunity at Neural Tech: SDE-1 Backend Distributed Systems."

**Deduplication Result:**
* **Levenshtein String Distance Match:** **94.2%**
* **Canonical Skill Overlap:** \`[Python, Node.js, PostgreSQL, Redis]\` (100% match)
* **Action Taken:** Consolidated 3 duplicate posts into **1 Master JD** to prevent student application fatigue and recruiter spam.`,
        actions: [
          { label: "📥 Ingestion & Dedup Console", action: "tab", payload: "ingestion" },
          { label: "⚡ 1-Click Batch Ranker", action: "tab", payload: "ranker" },
        ],
      };
    }

    // D. Unverified skills flagged
    if (
      lower.includes("unverified") ||
      lower.includes("flagged") ||
      lower.includes("audit") ||
      lower.includes("violations")
    ) {
      return {
        id: msgId,
        sender: "ai",
        role: "TPO",
        timestamp: now,
        text: `### 🚨 Student Verification & Audit Flags

* **Students with Pending Assessments:** 4 students currently have unverified skills in queue.
* **Proctoring Warning Audit:**
  * Last 24 hours: 1 minor warning (ambient audio spike during Docker benchmark).
  * 0 critical violations (no impersonation or second-device detections).
* **Policy Enforcement:** All candidates shortlisted for company test links must hold at least 3 Verified Skill badges.`,
        actions: [
          { label: "📜 Open Audit Log", action: "tab", payload: "audit" },
          { label: "🎯 1-Click Batch Ranker", action: "tab", payload: "ranker" },
        ],
      };
    }
  }

  // -------------------------------------------------------------
  // 4. GENERAL / FALLBACK CONTEXTUAL RESPONSE
  // -------------------------------------------------------------
  const roleName =
    role === "Student"
      ? "Career Coach"
      : role === "Industry"
      ? "Data Assistant"
      : "Drive Manager";

  return {
    id: msgId,
    sender: "ai",
    role,
    timestamp: now,
    text: `### 🤖 Drishti AI Copilot (${roleName})

I processed your query: *"${input}"*.

Here is how DRISHTI's **Evidence Ledger** addresses this:
* **Current Portal Persona:** **${role} Portal** (${roleName})
* **Evidence Integrity:** All answers are verified against active student profiles, GitHub AST commit hashes, proctored MediaPipe exam logs, and live application Kanban stages.

Feel free to ask specific questions about:
1. **Fit score calculations** and missing skill gaps
2. **Technical interview questions** rooted in actual repository commits
3. **Candidate search queries** filtered by benchmark percentages
4. **Placement drive velocity** and cross-company round analytics`,
    actions: [
      {
        label: role === "Student" ? "🛡️ Assessment Tab" : role === "Industry" ? "🔍 Candidates" : "📊 Pipeline",
        action: "tab",
        payload: role === "Student" ? "assess" : role === "Industry" ? "candidates" : "pipeline",
      },
    ],
  };
}
