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
    id: "rs_1",
    company: "Finnable Credit",
    role: "Backend Engineer",
    location: "Pune, India",
    ctc: "12 LPA",
    source: "WhatsApp Forward",
    rawText: "Urgent hiring Finnable Credit Backend Engineer Pune Nodejs Postgres Redis 12 LPA",
    postedAt: Date.now() - 2 * 86400000,
  },
  {
    id: "rs_2",
    company: "FINNABLE CREDIT",
    role: "Back-end Engineer",
    location: "Pune",
    ctc: "12 LPA",
    source: "Alumni Referral",
    rawText: "Finnable Credit hiring backend engineer Pune Node.js PostgreSQL Redis cache 12LPA",
    postedAt: Date.now() - 2 * 86400000 + 3600000,
  },
  {
    id: "rs_3",
    company: "Finnable Credit",
    role: "Backend Engineer",
    location: "Pune, India",
    ctc: "12 LPA",
    source: "Partner Portal",
    rawText: "Backend Engineer at Finnable Credit Pune Node Postgres Redis 12 LPA",
    postedAt: Date.now() - 2 * 86400000 + 7200000,
  },
  {
    id: "rs_4",
    company: "Novos Labs",
    role: "Full Stack Engineer",
    location: "Remote",
    ctc: "14 LPA",
    source: "Partner Portal",
    rawText: "Novos Labs Full Stack Engineer React Node Postgres 14 LPA Remote",
    postedAt: Date.now() - 3 * 86400000,
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  view: "landing",
  setView: (v) => set({ view: v }),

  activeStudentId: "stu_om",
  setActiveStudent: (id) => set({ activeStudentId: id }),

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
