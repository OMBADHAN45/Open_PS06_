"use client";

import { create } from "zustand";
import {
  STUDENTS,
  JOBS,
  APPLICATIONS,
  INTERVIEW_QUESTIONS,
  SAMPLE_INFLATED_RESUME,
  type StudentProfile,
  type JobOpening,
  type Application,
  type ApplicationStage,
  type InterviewQuestion,
  type SkillStatus,
  type GitHubEvidence,
  type AssessmentEvidence,
  type ProctorLogEntry,
  PIPELINE_STAGES,
} from "./mock-data";
import { computeFit, DEFAULT_WEIGHTS, type WeightConfig } from "./fit-score";
import { normalizeSkill } from "./taxonomy";
import {
  type StudentProfilePayload,
  createDefaultOnboardingPayload,
  createPayloadFromStudent,
} from "./onboarding-types";
import {
  type CompanyOnboardingPayload,
  createDefaultCompanyPayload,
} from "./company-types";
import { type StudentSignupPayload } from "./student-signup-types";

export type View = "landing" | "student" | "industry" | "tpo";

export interface ProctorSession {
  skill: string;
  score: number;
  passed: boolean;
  warnings: number;
  log: ProctorLogEntry[];
  takenAt: number;
}

export interface JobParseResult {
  role: string;
  company: string;
  ctc: string;
  location: string;
  eligibility: string;
  requiredSkills: string[];
  preferredSkills: string[];
  rawVariants: { raw: string; canonical: string }[];
}

interface AppState {
  view: View;
  setView: (v: View) => void;

  // active student (for student portal demo)
  activeStudentId: string;
  setActiveStudent: (id: string) => void;

  // Student Onboarding Pipeline payload
  onboardingPayload: StudentProfilePayload;
  setOnboardingPayload: (p: StudentProfilePayload) => void;
  onboardingModalOpen: boolean;
  setOnboardingModalOpen: (open: boolean) => void;

  // New Student Signup & Onboarding Pipeline
  studentSignupPayload: StudentSignupPayload | null;
  setStudentSignupPayload: (p: StudentSignupPayload | null) => void;
  studentOnboardingModalOpen: boolean;
  setStudentOnboardingModalOpen: (open: boolean) => void;
  pendingAssessmentQueue: string[];
  setPendingAssessmentQueue: (skills: string[]) => void;
  onboardStudent: (payload: StudentSignupPayload) => void;

  // Company / Recruiter Onboarding Pipeline payload
  companyPayload: CompanyOnboardingPayload;
  setCompanyPayload: (p: CompanyOnboardingPayload) => void;
  companyOnboardingOpen: boolean;
  setCompanyOnboardingOpen: (open: boolean) => void;

  students: StudentProfile[];
  jobs: JobOpening[];
  applications: Application[];
  interviewQuestions: InterviewQuestion[];

  // recruiter weight sliders
  weights: WeightConfig;
  setWeights: (w: WeightConfig) => void;

  // recruiter candidate comparison selection
  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  // proof drawer state (shared)
  proofDrawer: { open: boolean; studentId?: string; skill?: string };
  openProof: (studentId: string, skill: string) => void;
  closeProof: () => void;

  // recruiter proof inspector
  inspector: { open: boolean; studentId?: string; jobId?: string; subtab: string };
  openInspector: (studentId: string, jobId?: string) => void;
  setInspectorSubtab: (s: string) => void;
  closeInspector: () => void;

  // student portal: selected job for resume generation
  resumeTargetJobId: string | null;
  setResumeTargetJob: (id: string | null) => void;

  // proctoring: last session per skill
  proctorSessions: Record<string, ProctorSession>;
  recordProctorSession: (s: ProctorSession) => void;

  // skill selection (claim/unclaim a skill for active student)
  toggleStudentSkill: (studentId: string, skill: string) => void;

  // apply skill assessment result -> updates student skill status
  applyAssessmentResult: (studentId: string, skill: string, score: number, passed: boolean, warnings: number) => void;

  // sync latest commits (mock) -> bumps reposScanned + re-scans
  syncGitHub: (studentId: string) => void;

  // move application stage
  moveApplication: (appId: string, stage: ApplicationStage) => void;
  applyToJob: (studentId: string, jobId: string) => void;

  // add interview question
  addInterviewQuestion: (q: Omit<InterviewQuestion, "id" | "reportedAt">) => void;

  // job parser (AI JD parser + skill normalizer)
  parseJobDescription: (raw: string) => JobParseResult;
  addJob: (job: JobOpening) => void;

  // dedup console raw sources (TPO)
  rawSources: { id: string; company: string; role: string; location: string; ctc?: string; source: string; rawText?: string; postedAt: number }[];
  addRawSource: (s: { company: string; role: string; location: string; ctc?: string; source: string; rawText?: string }) => void;
  clearRawSources: () => void;
}

const uid = (p: string) => p + "_" + Math.random().toString(36).slice(2, 9);

// Simple rule-based JD parser (keyword extraction + skill normalization)
function parseJD(raw: string): JobParseResult {
  const text = raw;
  const lower = text.toLowerCase();

  // role extraction
  const roleMatch =
    text.match(/(?:role|position|title)[:\s]+([^\n]+)/i) ||
    text.match(/(backend engineer|frontend engineer|full stack engineer|devops engineer|machine learning engineer|data scientist|software engineer intern|sde[- ]?1?)/i);
  const role = roleMatch ? roleMatch[1].trim().replace(/\.$/, "") : "Software Engineer";

  // company
  const companyMatch =
    text.match(/(?:company|at|@)[:\s]+([A-Z][A-Za-z0-9& ]+)/) || text.match(/^([A-Z][A-Za-z0-9& ]+)/m);
  const company = companyMatch ? companyMatch[1].trim() : "Hiring Partner";

  // ctc
  const ctcMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakh|lakhs)/i) || text.match(/ctc[:\s]+([^\n]+)/i);
  const ctc = ctcMatch ? (ctcMatch[1] + " LPA").replace(/ LPA LPA/, " LPA") : "Competitive";

  // location
  const locMatch = text.match(/(?:location|based in|at)[:\s]+([A-Za-z, ]+)/i) || text.match(/(bengaluru|bangalore|pune|mumbai|hyderabad|chennai|delhi|remote)/i);
  const location = locMatch ? locMatch[1].trim() : "India";

  // eligibility
  const eligMatch = text.match(/(?:eligibility|qualification|requirement)[:\s]+([^\n]+)/i);
  const eligibility = eligMatch ? eligMatch[1].trim() : "BE/BTech 2026";

  // skill extraction — scan known taxonomy variants
  const SKILL_VARIANTS: Record<string, string[]> = {
    Python: ["python"],
    Java: ["java"],
    "C++": ["c\\+\\+"],
    JavaScript: ["javascript", "\\bjs\\b"],
    TypeScript: ["typescript", "\\bts\\b"],
    Go: ["golang", "\\bgo\\b"],
    SQL: ["\\bsql\\b"],
    React: ["react", "reactjs", "react\\.?js"],
    "Next.js": ["next\\.?js", "nextjs"],
    "Node.js": ["node\\.?js", "nodejs"],
    Express: ["express"],
    Vue: ["vue"],
    Angular: ["angular"],
    "Tailwind CSS": ["tailwind"],
    Django: ["django"],
    Flask: ["flask"],
    "FastAPI": ["fastapi"],
    "Spring Boot": ["spring boot", "springboot"],
    PostgreSQL: ["postgres(?:ql)?", "\\bpg\\b"],
    MySQL: ["mysql"],
    MongoDB: ["mongo(?:db)?"],
    Redis: ["redis", "ioredis"],
    SQLite: ["sqlite"],
    Docker: ["docker"],
    Kubernetes: ["kubernetes", "\\bk8s\\b"],
    AWS: ["\\baws\\b", "amazon web services"],
    GCP: ["\\bgcp\\b"],
    "CI/CD": ["ci/cd", "cicd", "github actions", "jenkins"],
    Linux: ["linux", "bash"],
    Nginx: ["nginx"],
    "Machine Learning": ["machine learning", "\\bml\\b"],
    TensorFlow: ["tensorflow"],
    PyTorch: ["pytorch"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    NLP: ["\\bnlp\\b"],
    OpenCV: ["opencv"],
  };

  const found: { raw: string; canonical: string }[] = [];
  const seen = new Set<string>();
  for (const [canonical, variants] of Object.entries(SKILL_VARIANTS)) {
    for (const v of variants) {
      const re = new RegExp("(^|[^a-z0-9+#])" + v + "([^a-z0-9+#]|$)", "i");
      if (re.test(lower)) {
        // capture the raw matched variant
        const m = lower.match(new RegExp(v, "i"));
        const raw = m ? m[0] : canonical;
        if (!seen.has(canonical)) {
          seen.add(canonical);
          found.push({ raw, canonical });
        }
        break;
      }
    }
  }

  // Split into required vs preferred by section keywords
  const preferredSection = lower.includes("preferred") || lower.includes("nice to have") || lower.includes("bonus");
  let requiredSkills = found.map((f) => f.canonical);
  let preferredSkills: string[] = [];
  if (preferredSection) {
    const parts = lower.split(/preferred|nice to have|bonus/);
    if (parts.length > 1) {
      const prefText = parts[parts.length - 1];
      preferredSkills = found
        .filter((f) => prefText.includes(f.raw.toLowerCase()))
        .map((f) => f.canonical);
      requiredSkills = found.filter((f) => !preferredSkills.includes(f.canonical)).map((f) => f.canonical);
    }
  }
  if (!preferredSkills.length && requiredSkills.length > 1) {
    preferredSkills = requiredSkills.slice(-2);
    requiredSkills = requiredSkills.slice(0, -2);
  }

  return {
    role,
    company,
    ctc,
    location,
    eligibility,
    requiredSkills: requiredSkills.length ? requiredSkills : ["Node.js", "PostgreSQL"],
    preferredSkills,
    rawVariants: found,
  };
}

const SAMPLE_RAW_SOURCES = [
  {
    id: "rs_neural_1",
    company: "Neural Tech",
    role: "SDE-1 (Backend & Distributed Systems)",
    location: "Bengaluru, India",
    ctc: "16 LPA",
    source: "Partner Portal",
    rawText: "Neural Tech is hiring SDE-1 Backend Engineers in Bengaluru. Requirements: Python, Node.js, PostgreSQL, Redis caching, microservices. CTC: 16 LPA. BE/BTech 2026.",
    postedAt: Date.now() - 2 * 86400000,
  },
  {
    id: "rs_neural_2",
    company: "NEURAL TECH",
    role: "SDE-1 Backend Engineer",
    location: "Bengaluru, India",
    ctc: "16 LPA",
    source: "WhatsApp Forward",
    rawText: "Urgent hiring: Neural Tech hiring SDE-1 Backend Engineer Bengaluru Python Nodejs Postgres Redis 16 LPA 2026 batch forward to interested folks",
    postedAt: Date.now() - 2 * 86400000 + 1800000,
  },
  {
    id: "rs_neural_3",
    company: "Neural Tech Inc",
    role: "SDE 1 - Distributed Systems & Backend",
    location: "Bengaluru",
    ctc: "16 LPA",
    source: "Alumni Referral",
    rawText: "Alumni referral opportunity at Neural Tech: SDE-1 Backend & Distributed Systems Bangalore Python Node.js PostgreSQL Redis. CTC 16 LPA.",
    postedAt: Date.now() - 2 * 86400000 + 3600000,
  },
  {
    id: "rs_acme_1",
    company: "Acme Corp",
    role: "Full Stack Engineer (React & TypeScript)",
    location: "Pune / Remote",
    ctc: "14 LPA",
    source: "Partner Portal",
    rawText: "Acme Corp hiring Full Stack Engineer React TypeScript Node.js PostgreSQL 14 LPA Pune Remote",
    postedAt: Date.now() - 3 * 86400000,
  },
  {
    id: "rs_acme_2",
    company: "Acme Corporation",
    role: "Full Stack Developer (React)",
    location: "Remote (India)",
    ctc: "14 LPA",
    source: "Alumni Referral",
    rawText: "Acme Corp alumni referral: Full Stack Developer React TypeScript Node.js 14 LPA",
    postedAt: Date.now() - 3 * 86400000 + 7200000,
  },
  {
    id: "rs_finserve_1",
    company: "FinServe Technologies",
    role: "High-Concurrency Backend Engineer",
    location: "Mumbai, India",
    ctc: "18 LPA",
    source: "Partner Portal",
    rawText: "FinServe Technologies hiring High-Concurrency Backend Engineer Mumbai Node.js PostgreSQL Redis 18 LPA",
    postedAt: Date.now() - 1 * 86400000,
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  view: "landing",
  setView: (v) => {
    set({ view: v });
    if (typeof window !== "undefined") {
      const targetPath = v === "landing" ? "/" : `/${v}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: v }, "", targetPath);
      }
    }
  },

  activeStudentId: "stu_om",
  setActiveStudent: (id) => {
    const st = get().students.find((s) => s.id === id);
    if (st) {
      set({ activeStudentId: id, onboardingPayload: createPayloadFromStudent(st) });
    } else {
      set({ activeStudentId: id });
    }
  },

  onboardingPayload: createDefaultOnboardingPayload(),
  setOnboardingPayload: (p) => set({ onboardingPayload: p }),
  onboardingModalOpen: false,
  setOnboardingModalOpen: (open) => set({ onboardingModalOpen: open }),

  studentSignupPayload: null,
  setStudentSignupPayload: (p) => set({ studentSignupPayload: p }),
  studentOnboardingModalOpen: false,
  setStudentOnboardingModalOpen: (open) => set({ studentOnboardingModalOpen: open }),
  pendingAssessmentQueue: [],
  setPendingAssessmentQueue: (skills) => set({ pendingAssessmentQueue: skills }),

  onboardStudent: (payload) => {
    const { profileData, pendingSkills } = payload;
    const newStudentId = "stu_" + Math.random().toString(36).slice(2, 9);

    const newStudent: StudentProfile = {
      id: newStudentId,
      name: profileData.fullName,
      roll: "PRN-2022-" + Math.floor(1000 + Math.random() * 9000),
      branch: profileData.education.college.branch,
      batch: String(profileData.education.college.gradYear),
      cgpa: profileData.education.college.cgpa,
      githubUser: profileData.links.github.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, ""),
      reposScanned: 0,
      verificationScore: 0,
      avatarColor: "#06b6d4",
      skills: [], // CRITICAL: Selected skills NOT added to active profile upon signup
      evidence: [],
      assessments: [],
      projects: [],
      personalEmail: profileData.personalEmail,
      phone: profileData.phone,
      bio: profileData.bio,
      location: profileData.location,
      education: profileData.education,
      professionalStatus: profileData.professionalStatus,
      employmentDetails: profileData.employmentDetails,
      links: profileData.links,
      pendingAssessmentQueue: pendingSkills,
    };

    const scrubbedItems = pendingSkills.map((sk) => ({
      skill: sk,
      reason: `Queued in Pending Assessment Queue. Unverified until proctored test completed.`,
      status: "unverified" as const,
    }));

    const newOnboardingPayload: StudentProfilePayload = {
      fullName: profileData.fullName,
      email: profileData.personalEmail,
      rollNumber: newStudent.roll,
      department: profileData.education.college.branch,
      gradYear: profileData.education.college.gradYear,
      tenth: {
        schoolName: profileData.education.tenth.schoolName || "Secondary School",
        board: profileData.education.tenth.board,
        passingYear: profileData.education.tenth.year,
        percentageOrCgpa: profileData.education.tenth.score,
      },
      twelfth: {
        collegeName: profileData.education.twelfth.collegeName || "Junior College",
        board: profileData.education.twelfth.board,
        passingYear: profileData.education.twelfth.year,
        percentage: profileData.education.twelfth.score,
      },
      engineering: {
        collegeName: profileData.education.college.name,
        sgpas: [profileData.education.college.cgpa, profileData.education.college.cgpa, profileData.education.college.cgpa, 0, 0, 0, 0, 0],
        cgpa: profileData.education.college.cgpa,
        activeBacklogs: 0,
      },
      codingEcosystem: {
        githubUrl: profileData.links.github,
        leetcodeUrl: profileData.links.leetcode || "",
        hackerrankUrl: profileData.links.hackerrank || "",
        codechefUrl: profileData.links.codeforces || "",
        portfolioUrl: profileData.links.portfolio || "",
      },
      claimedSkills: [], // EXCEPTION: NOT added to active resume upon signup
      evidenceLedger: {
        verifiedSkills: [],
        scrubbedSkills: scrubbedItems,
      },
      submittedAt: new Date().toISOString(),
    };

    set((state) => ({
      students: [newStudent, ...state.students],
      activeStudentId: newStudentId,
      studentSignupPayload: payload,
      pendingAssessmentQueue: pendingSkills,
      onboardingPayload: newOnboardingPayload,
      studentOnboardingModalOpen: false,
      view: "student",
    }));
  },

  companyPayload: createDefaultCompanyPayload(),
  setCompanyPayload: (p) => set({ companyPayload: p }),
  companyOnboardingOpen: false,
  setCompanyOnboardingOpen: (open) => set({ companyOnboardingOpen: open }),

  students: STUDENTS,
  jobs: JOBS,
  applications: APPLICATIONS,
  interviewQuestions: INTERVIEW_QUESTIONS,

  weights: DEFAULT_WEIGHTS,
  setWeights: (w) => set({ weights: w }),

  compareIds: [],
  toggleCompare: (id) =>
    set((s) => ({
      compareIds: s.compareIds.includes(id)
        ? s.compareIds.filter((x) => x !== id)
        : s.compareIds.length >= 3
        ? [...s.compareIds.slice(1), id]
        : [...s.compareIds, id],
    })),
  clearCompare: () => set({ compareIds: [] }),

  proofDrawer: { open: false },
  openProof: (studentId, skill) => set({ proofDrawer: { open: true, studentId, skill } }),
  closeProof: () => set({ proofDrawer: { open: false } }),

  inspector: { open: false, subtab: "resume" },
  openInspector: (studentId, jobId) =>
    set({ inspector: { open: true, studentId, jobId, subtab: "resume" } }),
  setInspectorSubtab: (sub) =>
    set((s) => ({ inspector: { ...s.inspector, subtab: sub } })),
  closeInspector: () => set({ inspector: { open: false, subtab: "resume" } }),

  resumeTargetJobId: null,
  setResumeTargetJob: (id) => set({ resumeTargetJobId: id }),

  proctorSessions: {},
  recordProctorSession: (sess) =>
    set((s) => ({
      proctorSessions: { ...s.proctorSessions, [sess.skill]: sess },
    })),

  toggleStudentSkill: (studentId, skillRaw) => {
    const skill = normalizeSkill(skillRaw);
    set((s) => ({
      students: s.students.map((st) => {
        if (st.id !== studentId) return st;
        const exists = st.skills.find((x) => x.canonical === skill);
        if (exists) {
          // only allow removing unverified/failed skills (can't strip verified proof)
          if (exists.status === "verified") return st;
          return { ...st, skills: st.skills.filter((x) => x.canonical !== skill) };
        }
        return {
          ...st,
          skills: [...st.skills, { canonical: skill, status: "unverified" as SkillStatus }],
        };
      }),
    }));
  },

  applyAssessmentResult: (studentId, skill, score, passed, warnings) => {
    set((s) => ({
      students: s.students.map((st) => {
        if (st.id !== studentId) return st;
        const id = uid("as");
        const assessment: AssessmentEvidence = {
          id,
          kind: "assessment",
          skill,
          score,
          passed,
          warnings,
          takenAt: Date.now(),
          durationSec: 600,
        };
        // If failed -> remove the skill from profile (auto-strip)
        let skills = [...st.skills];
        const idx = skills.findIndex((x) => x.canonical === skill);
        if (passed) {
          if (idx >= 0) {
            skills[idx] = { ...skills[idx], status: "verified", assessmentId: id };
          } else {
            skills.push({ canonical: skill, status: "verified", assessmentId: id });
          }
        } else {
          // strip failed skill
          if (idx >= 0) skills.splice(idx, 1);
        }
        // recompute verification score
        const verified = skills.filter((x) => x.status === "verified").length;
        const total = skills.length || 1;
        const verificationScore = Math.round((verified / total) * 100);
        return {
          ...st,
          skills,
          evidence: [...st.evidence.filter((e) => !(e.kind === "assessment" && e.skill === skill && (e as AssessmentEvidence).score !== score)), assessment],
          assessments: [...st.assessments.filter((a) => a.skill !== skill), assessment],
          verificationScore,
        };
      }),
    }));
  },

  syncGitHub: (studentId) => {
    set((s) => ({
      students: s.students.map((st) =>
        st.id === studentId
          ? { ...st, reposScanned: st.reposScanned + 1, evidence: st.evidence.map((e) => (e.kind === "github" ? { ...e, scannedAt: Date.now() } : e)) }
          : st
      ),
    }));
  },

  moveApplication: (appId, stage) =>
    set((s) => ({
      applications: s.applications.map((a) => (a.id === appId ? { ...a, stage } : a)),
    })),

  applyToJob: (studentId, jobId) =>
    set((s) => {
      if (s.applications.some((a) => a.studentId === studentId && a.jobId === jobId)) return s;
      const student = s.students.find((x) => x.id === studentId);
      const job = s.jobs.find((x) => x.id === jobId);
      if (!student || !job) return s;
      const fit = computeFit(student, job, s.weights);
      return {
        applications: [
          ...s.applications,
          { id: uid("app"), studentId, jobId, stage: "Applied", appliedAt: Date.now(), fitScore: fit.score },
        ],
      };
    }),

  addInterviewQuestion: (q) =>
    set((s) => ({
      interviewQuestions: [{ ...q, id: uid("iq"), reportedAt: Date.now() }, ...s.interviewQuestions],
    })),

  parseJobDescription: (raw) => parseJD(raw),

  addJob: (job) => set((s) => ({ jobs: [job, ...s.jobs] })),

  rawSources: SAMPLE_RAW_SOURCES,
  addRawSource: (src) =>
    set((s) => ({
      rawSources: [
        ...s.rawSources,
        { id: uid("rs"), ...src, postedAt: Date.now() },
      ],
    })),
  clearRawSources: () => set({ rawSources: [] }),
}));

// selector helpers
export function getStudent(id: string, students: StudentProfile[]) {
  return students.find((s) => s.id === id);
}

export function getJob(id: string, jobs: JobOpening[]) {
  return jobs.find((j) => j.id === id);
}

export function applicationsForJob(jobId: string, apps: Application[]) {
  return apps.filter((a) => a.jobId === jobId);
}

export function applicationsForStudent(studentId: string, apps: Application[]) {
  return apps.filter((a) => a.studentId === studentId);
}

export { computeFit, PIPELINE_STAGES, SAMPLE_INFLATED_RESUME };
export type { ApplicationStage, JobOpening, StudentProfile, Application, InterviewQuestion, GitHubEvidence, AssessmentEvidence };
