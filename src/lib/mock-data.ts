// ===========================================================================
// DRISHTI — Production-Grade Relational Mock Data & Evidence Ledger
// Entities: Companies -> Jobs -> Students -> Evidence -> Resumes -> Applications
// ===========================================================================

export type SkillStatus = "verified" | "unverified" | "failed";

export interface GitHubEvidence {
  id: string;
  kind: "github";
  skill: string;
  repo: string;
  filePath: string;
  line?: number;
  commitSha: string;
  commitUrl: string;
  snippet: string;
  scannedAt: number;
}

export interface AssessmentEvidence {
  id: string;
  kind: "assessment";
  skill: string;
  score: number; // 0..100
  passed: boolean;
  warnings: number;
  takenAt: number;
  durationSec: number;
  proctorLogs?: ProctorLogEntry[];
}

export interface ProjectEvidence {
  id: string;
  kind: "project";
  skill: string;
  title: string;
  repo: string;
  faculty: string;
  grade: string; // A+, A, B+
  rubric: { criterion: string; score: number; max: number }[];
  complexity: number; // 1..5
}

export type EvidenceRecord = GitHubEvidence | AssessmentEvidence | ProjectEvidence;

export interface StudentSkill {
  canonical: string;
  status: SkillStatus;
  assessmentId?: string;
  githubIds?: string[];
  projectId?: string;
}

export interface ProctorLogEntry {
  type: string;
  time: number;
  message: string;
  confidence?: number;
  timestamp?: string;
  severity?: "low" | "medium" | "critical";
}

export interface StudentProfile {
  id: string;
  name: string;
  roll: string;
  branch: string;
  batch: string;
  cgpa: number;
  githubUser: string;
  reposScanned: number;
  verificationScore: number;
  avatarColor: string;
  skills: StudentSkill[];
  evidence: (GitHubEvidence | AssessmentEvidence | ProjectEvidence)[];
  assessments: AssessmentEvidence[];
  projects: ProjectEvidence[];
  personalEmail?: string;
  phone?: string;
  bio?: string;
  location?: { city: string; state: string; pinCode: string };
  education?: {
    tenth: { board: string; score: number; year: number; schoolName?: string };
    twelfth: { board: string; stream: string; score: number; year: number; collegeName?: string };
    college: { name: string; branch: string; gradYear: number; cgpa: number };
  };
  professionalStatus?: "Fresher" | "Employed";
  employmentDetails?: { company: string; role: string };
  links?: {
    linkedin: string;
    github: string;
    leetcode?: string;
    kaggle?: string;
    hackerrank?: string;
    codeforces?: string;
    portfolio?: string;
  };
  pendingAssessmentQueue?: string[];
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  location: string;
  cin: string;
  verificationStatus: "Verified" | "Pending" | "Rejected";
  hiringPartnerTier: "Tier-1 Strategic" | "Enterprise" | "Growth Partner";
  openRolesCount: number;
  description: string;
}

export interface JobOpening {
  id: string;
  companyId?: string;
  company: string;
  role: string;
  location: string;
  ctc: string;
  eligibility: string;
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
  sources: string[];
  postedAt: number;
  alumniCount?: number;
}

export type ApplicationStage =
  | "Applied"
  | "Shortlisted"
  | "Assessment"
  | "Technical Interview"
  | "HR Interview"
  | "Offer";

export const PIPELINE_STAGES: ApplicationStage[] = [
  "Applied",
  "Shortlisted",
  "Assessment",
  "Technical Interview",
  "HR Interview",
  "Offer",
];

export interface Application {
  id: string;
  studentId: string;
  jobId: string;
  stage: ApplicationStage;
  appliedAt: number;
  fitScore?: number;
  matchExplanation?: string;
}

export interface InterviewQuestion {
  id: string;
  company: string;
  role: string;
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reportedBy: string;
  reportedAt: number;
}

const NOW = Date.now();
const DAY = 86400000;

// ===========================================================================
// 1. COMPANIES (Tier-1 Hiring Partners)
// ===========================================================================

export const COMPANIES: Company[] = [
  {
    id: "comp_neural",
    name: "Neural Tech",
    domain: "neuraltech.ai",
    location: "Bengaluru, Karnataka",
    cin: "U72900KA2021PTC148920",
    verificationStatus: "Verified",
    hiringPartnerTier: "Tier-1 Strategic",
    openRolesCount: 3,
    description: "Deep-tech enterprise building autonomous AI agent architectures and real-time distributed tensor inference systems.",
  },
  {
    id: "comp_acme",
    name: "Acme Corp",
    domain: "acmecorp.io",
    location: "Pune, Maharashtra",
    cin: "U74999PN2019PTC186412",
    verificationStatus: "Verified",
    hiringPartnerTier: "Enterprise",
    openRolesCount: 2,
    description: "Global cloud infrastructure provider delivering automated multi-region microservice deployments and edge caching platforms.",
  },
  {
    id: "comp_finserve",
    name: "FinServe Technologies",
    domain: "finserve.tech",
    location: "Mumbai, Maharashtra",
    cin: "U67190MH2020PTC339811",
    verificationStatus: "Verified",
    hiringPartnerTier: "Tier-1 Strategic",
    openRolesCount: 2,
    description: "High-concurrency fintech platform processing over $14B annually in real-time interbank settlements with sub-10ms latency.",
  },
  {
    id: "comp_finnable",
    name: "Finnable Credit",
    domain: "finnable.com",
    location: "Pune, Maharashtra",
    cin: "U65999KA2018PTC112345",
    verificationStatus: "Verified",
    hiringPartnerTier: "Enterprise",
    openRolesCount: 1,
    description: "Rapid consumer credit and instant lending infrastructure with automated algorithmic risk assessment.",
  },
];

// ===========================================================================
// 2. JOBS (Including deliberate duplicate pairs for Cosine Deduplication)
// ===========================================================================

export const JOBS: JobOpening[] = [
  {
    id: "job_neural_sde1",
    companyId: "comp_neural",
    company: "Neural Tech",
    role: "SDE-1 (Backend & Distributed Systems)",
    location: "Bengaluru, India",
    ctc: "16 LPA",
    eligibility: "BE/BTech 2026, CGPA >= 7.5",
    requiredSkills: ["Python", "Node.js", "PostgreSQL"],
    preferredSkills: ["Docker", "Redis", "Distributed Systems"],
    description: "Design and scale Node.js & Python backend services with PostgreSQL and Redis caching for our autonomous agent orchestrator.",
    sources: ["Partner Portal", "Alumni Referral"],
    postedAt: NOW - 2 * DAY,
    alumniCount: 3,
  },
  {
    id: "job_neural_dedup_wa",
    companyId: "comp_neural",
    company: "NEURAL TECH",
    role: "SDE-1 Backend & Systems",
    location: "Bengaluru, India",
    ctc: "16 LPA",
    eligibility: "BE/BTech 2026, CGPA >= 7.5",
    requiredSkills: ["Python", "Node.js", "PostgreSQL"],
    preferredSkills: ["Docker", "Redis"],
    description: "Urgent hiring: Neural Tech hiring SDE-1 Backend Engineers Bengaluru. Python, Node.js, PostgreSQL, Redis caching. 16 LPA for 2026 batch.",
    sources: ["WhatsApp Forward"],
    postedAt: NOW - 2 * DAY + 1800000,
    alumniCount: 3,
  },
  {
    id: "job_acme_frontend",
    companyId: "comp_acme",
    company: "Acme Corp",
    role: "Full Stack Engineer (React & TypeScript)",
    location: "Pune / Remote",
    ctc: "14 LPA",
    eligibility: "BE/BTech 2026, CGPA >= 8.0",
    requiredSkills: ["React", "TypeScript", "Node.js"],
    preferredSkills: ["Tailwind CSS", "Next.js", "PostgreSQL"],
    description: "Build ultra-responsive, accessible web interfaces and backend microservices using modern React, TypeScript, and Node.js.",
    sources: ["Partner Portal", "Email Forward"],
    postedAt: NOW - 3 * DAY,
    alumniCount: 2,
  },
  {
    id: "job_acme_devops",
    companyId: "comp_acme",
    company: "Acme Corp",
    role: "Cloud Infrastructure & DevOps Engineer",
    location: "Remote (India)",
    ctc: "15 LPA",
    eligibility: "BE/BTech 2026, CGPA >= 7.0",
    requiredSkills: ["Docker", "Linux", "CI/CD"],
    preferredSkills: ["Kubernetes", "AWS", "Python"],
    description: "Own container orchestration, automated deployment pipelines, infrastructure as code, and Linux kernel performance tuning.",
    sources: ["WhatsApp Forward"],
    postedAt: NOW - 4 * DAY,
    alumniCount: 1,
  },
  {
    id: "job_finserve_backend",
    companyId: "comp_finserve",
    company: "FinServe Technologies",
    role: "High-Concurrency Backend Engineer",
    location: "Mumbai, India",
    ctc: "18 LPA",
    eligibility: "BE/BTech 2026, CGPA >= 8.0",
    requiredSkills: ["Node.js", "PostgreSQL", "Redis", "SQL"],
    preferredSkills: ["Distributed Systems", "AWS", "Docker"],
    description: "Architect sub-10ms payment settlement gateways handling 50,000 requests/second with transactional consistency and Redis caching.",
    sources: ["Partner Portal"],
    postedAt: NOW - 1 * DAY,
    alumniCount: 4,
  },
  {
    id: "job_neural_ml",
    companyId: "comp_neural",
    company: "Neural Tech",
    role: "Machine Learning & LLM Systems Engineer",
    location: "Bengaluru, India",
    ctc: "22 LPA",
    eligibility: "BE/BTech 2026, CGPA >= 8.5",
    requiredSkills: ["Python", "Machine Learning", "PyTorch", "SQL"],
    preferredSkills: ["FastAPI", "Docker", "PostgreSQL"],
    description: "Train, fine-tune, and optimize transformer architectures, vector embeddings, and real-time tensor inference engines in production.",
    sources: ["Alumni Referral"],
    postedAt: NOW - 1 * DAY,
    alumniCount: 2,
  },
  {
    id: "job_finnable",
    companyId: "comp_finnable",
    company: "Finnable Credit",
    role: "Backend Engineer",
    location: "Pune, India",
    ctc: "12 LPA",
    eligibility: "BE/BTech 2026, CGPA >= 7.5",
    requiredSkills: ["Node.js", "PostgreSQL", "Redis"],
    preferredSkills: ["Docker", "AWS"],
    description: "Design and scale Node.js microservices with PostgreSQL and Redis caching for our lending platform.",
    sources: ["Partner Portal", "Alumni Referral"],
    postedAt: NOW - 5 * DAY,
    alumniCount: 3,
  },
];

// ===========================================================================
// 3. STUDENTS & EVIDENCE LEDGERS (7 Diverse Realistic Profiles)
// ===========================================================================

export const STUDENTS: StudentProfile[] = [
  // 1. Om Deshmukh (Full Stack & Systems)
  {
    id: "stu_om",
    name: "Om Deshmukh",
    roll: "TECO21123",
    branch: "Computer Engineering",
    batch: "2026",
    cgpa: 9.18,
    githubUser: "omcodes",
    reposScanned: 16,
    verificationScore: 92,
    avatarColor: "#9fe0ff",
    personalEmail: "om.deshmukh26@gmail.com",
    phone: "+91 98230 44102",
    bio: "High-concurrency backend architect specializing in Node.js microservices, PostgreSQL transaction locking, and distributed Redis streaming engines.",
    location: { city: "Pune", state: "Maharashtra", pinCode: "411005" },
    education: {
      tenth: { schoolName: "Loyola High School, Pune", board: "CBSE", score: 94.2, year: 2020 },
      twelfth: { collegeName: "Fergusson Junior College", board: "State Board (HSC)", stream: "Science (PCM)", score: 93.4, year: 2022 },
      college: { name: "COEP Technological University, Pune", branch: "Computer Engineering", gradYear: 2026, cgpa: 9.18 },
    },
    professionalStatus: "Fresher",
    links: {
      linkedin: "https://linkedin.com/in/om-deshmukh-tech",
      github: "https://github.com/omcodes",
      leetcode: "https://leetcode.com/u/omcodes",
      portfolio: "https://omcodes.dev",
    },
    skills: [
      { canonical: "Node.js", status: "verified", assessmentId: "as_om_node", githubIds: ["gh_om_node1", "gh_om_node2"] },
      { canonical: "PostgreSQL", status: "verified", assessmentId: "as_om_pg", githubIds: ["gh_om_pg1"] },
      { canonical: "React", status: "verified", assessmentId: "as_om_react", githubIds: ["gh_om_react1"] },
      { canonical: "Redis", status: "verified", assessmentId: "as_om_redis", githubIds: ["gh_om_redis1"] },
      { canonical: "Docker", status: "failed", assessmentId: "as_om_docker_fail" },
      { canonical: "Kubernetes", status: "failed", assessmentId: "as_om_k8s_fail" },
      { canonical: "AWS", status: "unverified" },
    ],
    assessments: [
      { id: "as_om_node", kind: "assessment", skill: "Node.js", score: 96, passed: true, warnings: 0, takenAt: NOW - 5 * DAY, durationSec: 1800 },
      { id: "as_om_pg", kind: "assessment", skill: "PostgreSQL", score: 94, passed: true, warnings: 0, takenAt: NOW - 4 * DAY, durationSec: 2100 },
      { id: "as_om_react", kind: "assessment", skill: "React", score: 91, passed: true, warnings: 0, takenAt: NOW - 3 * DAY, durationSec: 1500 },
      { id: "as_om_redis", kind: "assessment", skill: "Redis", score: 90, passed: true, warnings: 0, takenAt: NOW - 2 * DAY, durationSec: 1200 },
      { id: "as_om_docker_fail", kind: "assessment", skill: "Docker", score: 68, passed: false, warnings: 2, takenAt: NOW - 1 * DAY, durationSec: 1900 },
      { id: "as_om_k8s_fail", kind: "assessment", skill: "Kubernetes", score: 54, passed: false, warnings: 3, takenAt: NOW - 1 * DAY, durationSec: 1100 },
    ],
    evidence: [
      {
        id: "gh_om_node1",
        kind: "github",
        skill: "Node.js",
        repo: "auth-gateway",
        filePath: "src/server.ts",
        line: 14,
        commitSha: "d4a8b22",
        commitUrl: "https://github.com/omcodes/auth-gateway/commit/d4a8b22",
        snippet: "import express from 'express';\nimport { rateLimitMiddleware } from './middleware/rate-limiter';\nconst app = express();\napp.use(rateLimitMiddleware);",
        scannedAt: NOW - 4 * DAY,
      },
      {
        id: "gh_om_node2",
        kind: "github",
        skill: "Node.js",
        repo: "cache-middleware",
        filePath: "src/middleware/cache.ts",
        line: 22,
        commitSha: "e7c1f55",
        commitUrl: "https://github.com/omcodes/cache-middleware/commit/e7c1f55",
        snippet: "import Redis from 'ioredis';\nexport const redis = new Redis(process.env.REDIS_URL);\nexport async function getCached(key: string) { return await redis.get(key); }",
        scannedAt: NOW - 2 * DAY,
      },
      {
        id: "gh_om_pg1",
        kind: "github",
        skill: "PostgreSQL",
        repo: "fin-ledger",
        filePath: "src/db/connection-pool.ts",
        line: 18,
        commitSha: "f0b2e88",
        commitUrl: "https://github.com/omcodes/fin-ledger/commit/f0b2e88",
        snippet: "import { Pool } from 'pg';\nexport const pool = new Pool({\n  max: 20,\n  idleTimeoutMillis: 30000,\n  connectionString: process.env.DATABASE_URL\n});",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_om_react1",
        kind: "github",
        skill: "React",
        repo: "placement-dashboard",
        filePath: "src/components/SkillMatrix.tsx",
        line: 32,
        commitSha: "c9d2f10",
        commitUrl: "https://github.com/omcodes/placement-dashboard/commit/c9d2f10",
        snippet: "export function SkillMatrix({ skills }: { skills: string[] }) {\n  return (\n    <div className='grid grid-cols-2 gap-2'>\n      {skills.map(s => <Badge key={s}>{s}</Badge>)}\n    </div>\n  );\n}",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_om_redis1",
        kind: "github",
        skill: "Redis",
        repo: "cache-middleware",
        filePath: "src/cache/pubsub.ts",
        line: 12,
        commitSha: "f2a034b",
        commitUrl: "https://github.com/omcodes/cache-middleware/commit/f2a034b",
        snippet: "export async function publishEvent(channel: string, payload: any) {\n  await redis.publish(channel, JSON.stringify(payload));\n}",
        scannedAt: NOW - 2 * DAY,
      },
    ],
    projects: [
      {
        id: "proj_om_1",
        kind: "project",
        skill: "Node.js",
        title: "Campus Distributed Event Queue",
        repo: "campus-queue",
        faculty: "Dr. A. S. Joshi",
        grade: "A+",
        rubric: [
          { criterion: "System Architecture", score: 10, max: 10 },
          { criterion: "Concurrency & Locks", score: 9, max: 10 },
          { criterion: "Test Coverage", score: 9, max: 10 },
        ],
        complexity: 4,
      },
    ],
  },

  // 2. Mayur Patil (Cloud & DevOps Specialist)
  {
    id: "stu_mayur",
    name: "Mayur Patil",
    roll: "TEIT21045",
    branch: "Information Technology",
    batch: "2026",
    cgpa: 8.76,
    githubUser: "mayur-devops",
    reposScanned: 19,
    verificationScore: 89,
    avatarColor: "#10b981",
    personalEmail: "mayur.patil2026@gmail.com",
    phone: "+91 97654 32189",
    bio: "Cloud native engineer specialized in containerization, hardened Linux virtualization, and multi-stage automated GitHub Actions pipelines.",
    location: { city: "Nashik", state: "Maharashtra", pinCode: "422005" },
    education: {
      tenth: { schoolName: "St. Francis High School, Nashik", board: "State Board (SSC)", score: 91.8, year: 2020 },
      twelfth: { collegeName: "KTHM College, Nashik", board: "State Board (HSC)", stream: "Science (PCM)", score: 88.6, year: 2022 },
      college: { name: "Government College of Engineering, Pune", branch: "Information Technology", gradYear: 2026, cgpa: 8.76 },
    },
    professionalStatus: "Fresher",
    links: {
      linkedin: "https://linkedin.com/in/mayur-patil-cloud",
      github: "https://github.com/mayur-devops",
      portfolio: "https://mayurpatil.tech",
    },
    skills: [
      { canonical: "Docker", status: "verified", assessmentId: "as_mayur_docker", githubIds: ["gh_mayur_dock1"] },
      { canonical: "Linux", status: "verified", assessmentId: "as_mayur_linux", githubIds: ["gh_mayur_lin1"] },
      { canonical: "CI/CD", status: "verified", assessmentId: "as_mayur_cicd", githubIds: ["gh_mayur_ci1"] },
      { canonical: "Python", status: "verified", assessmentId: "as_mayur_py", githubIds: ["gh_mayur_py1"] },
      { canonical: "React", status: "failed", assessmentId: "as_mayur_react_fail" },
      { canonical: "Node.js", status: "unverified" },
      { canonical: "Kubernetes", status: "unverified" },
    ],
    assessments: [
      { id: "as_mayur_docker", kind: "assessment", skill: "Docker", score: 95, passed: true, warnings: 0, takenAt: NOW - 6 * DAY, durationSec: 1600 },
      { id: "as_mayur_linux", kind: "assessment", skill: "Linux", score: 92, passed: true, warnings: 0, takenAt: NOW - 5 * DAY, durationSec: 1800 },
      { id: "as_mayur_cicd", kind: "assessment", skill: "CI/CD", score: 91, passed: true, warnings: 0, takenAt: NOW - 3 * DAY, durationSec: 1400 },
      { id: "as_mayur_py", kind: "assessment", skill: "Python", score: 88, passed: true, warnings: 0, takenAt: NOW - 2 * DAY, durationSec: 1500 },
      { id: "as_mayur_react_fail", kind: "assessment", skill: "React", score: 62, passed: false, warnings: 1, takenAt: NOW - 1 * DAY, durationSec: 1700 },
    ],
    evidence: [
      {
        id: "gh_mayur_dock1",
        kind: "github",
        skill: "Docker",
        repo: "production-deployments",
        filePath: "docker/Dockerfile.prod",
        line: 12,
        commitSha: "91ab34e",
        commitUrl: "https://github.com/mayur-devops/production-deployments/commit/91ab34e",
        snippet: "FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nRUN npm run build",
        scannedAt: NOW - 5 * DAY,
      },
      {
        id: "gh_mayur_lin1",
        kind: "github",
        skill: "Linux",
        repo: "production-deployments",
        filePath: "scripts/setup-kernel-limits.sh",
        line: 8,
        commitSha: "4c82fe1",
        commitUrl: "https://github.com/mayur-devops/production-deployments/commit/4c82fe1",
        snippet: "sysctl -w fs.file-max=2097152\nsysctl -w net.core.somaxconn=65535\nulimit -n 65535",
        scannedAt: NOW - 4 * DAY,
      },
      {
        id: "gh_mayur_ci1",
        kind: "github",
        skill: "CI/CD",
        repo: "production-deployments",
        filePath: ".github/workflows/deploy.yml",
        line: 19,
        commitSha: "7d291ba",
        commitUrl: "https://github.com/mayur-devops/production-deployments/commit/7d291ba",
        snippet: "name: Automated CI/CD\non: [push]\njobs:\n  build-and-test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_mayur_py1",
        kind: "github",
        skill: "Python",
        repo: "ops-telemetry",
        filePath: "monitor.py",
        line: 15,
        commitSha: "3f8812c",
        commitUrl: "https://github.com/mayur-devops/ops-telemetry/commit/3f8812c",
        snippet: "import psutil\ndef collect_metrics():\n    return {'cpu': psutil.cpu_percent(), 'ram': psutil.virtual_memory().percent}",
        scannedAt: NOW - 2 * DAY,
      },
    ],
    projects: [
      {
        id: "proj_mayur_1",
        kind: "project",
        skill: "Docker",
        title: "Automated Multi-Stage Kubernetes Cluster Builder",
        repo: "k8s-autobuilder",
        faculty: "Prof. P. M. Shinde",
        grade: "A+",
        rubric: [
          { criterion: "Reproducibility", score: 10, max: 10 },
          { criterion: "Security & Least Privilege", score: 9, max: 10 },
          { criterion: "Documentation", score: 9, max: 10 },
        ],
        complexity: 4,
      },
    ],
  },

  // 3. Prakhar Sharma (AI/ML & Data Engineering)
  {
    id: "stu_prakhar",
    name: "Prakhar Sharma",
    roll: "TECO21088",
    branch: "Computer Engineering",
    batch: "2026",
    cgpa: 9.65,
    githubUser: "prakhar-ml",
    reposScanned: 22,
    verificationScore: 97,
    avatarColor: "#ffe2b2",
    personalEmail: "prakhar.sharma.ai@gmail.com",
    phone: "+91 99112 88471",
    bio: "Machine learning research fellow with publications in transformer model quantization, contrastive vision-language representation, and PyTorch optimization.",
    location: { city: "Mumbai", state: "Maharashtra", pinCode: "400076" },
    education: {
      tenth: { schoolName: "Delhi Public School, R.K. Puram", board: "CBSE", score: 98.4, year: 2020 },
      twelfth: { collegeName: "Pace Junior Science College, Mumbai", board: "State Board (HSC)", stream: "Science (PCM)", score: 96.8, year: 2022 },
      college: { name: "VJTI, Mumbai", branch: "Computer Engineering", gradYear: 2026, cgpa: 9.65 },
    },
    professionalStatus: "Fresher",
    links: {
      linkedin: "https://linkedin.com/in/prakhar-sharma-ml",
      github: "https://github.com/prakhar-ml",
      kaggle: "https://kaggle.com/prakharml",
      portfolio: "https://prakharsharma.ai",
    },
    skills: [
      { canonical: "Python", status: "verified", assessmentId: "as_prakhar_py", githubIds: ["gh_prakhar_py1"] },
      { canonical: "Machine Learning", status: "verified", assessmentId: "as_prakhar_ml", githubIds: ["gh_prakhar_ml1"] },
      { canonical: "PyTorch", status: "verified", assessmentId: "as_prakhar_torch", githubIds: ["gh_prakhar_torch1"] },
      { canonical: "SQL", status: "verified", assessmentId: "as_prakhar_sql", githubIds: ["gh_prakhar_sql1"] },
      { canonical: "Kubernetes", status: "failed", assessmentId: "as_prakhar_k8s_fail" },
      { canonical: "FastAPI", status: "unverified" },
      { canonical: "Docker", status: "unverified" },
    ],
    assessments: [
      { id: "as_prakhar_py", kind: "assessment", skill: "Python", score: 98, passed: true, warnings: 0, takenAt: NOW - 7 * DAY, durationSec: 1500 },
      { id: "as_prakhar_ml", kind: "assessment", skill: "Machine Learning", score: 96, passed: true, warnings: 0, takenAt: NOW - 5 * DAY, durationSec: 2200 },
      { id: "as_prakhar_torch", kind: "assessment", skill: "PyTorch", score: 94, passed: true, warnings: 0, takenAt: NOW - 4 * DAY, durationSec: 2000 },
      { id: "as_prakhar_sql", kind: "assessment", skill: "SQL", score: 92, passed: true, warnings: 0, takenAt: NOW - 3 * DAY, durationSec: 1600 },
      { id: "as_prakhar_k8s_fail", kind: "assessment", skill: "Kubernetes", score: 58, passed: false, warnings: 3, takenAt: NOW - 1 * DAY, durationSec: 1200 },
    ],
    evidence: [
      {
        id: "gh_prakhar_py1",
        kind: "github",
        skill: "Python",
        repo: "transformer-distill",
        filePath: "models/transformer_encoder.py",
        line: 44,
        commitSha: "a319f02",
        commitUrl: "https://github.com/prakhar-ml/transformer-distill/commit/a319f02",
        snippet: "import torch\nimport torch.nn as nn\nclass MultiHeadAttention(nn.Module):\n    def __init__(self, d_model=512, n_heads=8):\n        super().__init__()",
        scannedAt: NOW - 5 * DAY,
      },
      {
        id: "gh_prakhar_ml1",
        kind: "github",
        skill: "Machine Learning",
        repo: "transformer-distill",
        filePath: "training/train_distill.py",
        line: 28,
        commitSha: "1f893cb",
        commitUrl: "https://github.com/prakhar-ml/transformer-distill/commit/1f893cb",
        snippet: "loss = distillation_loss(student_logits, teacher_logits, labels, alpha=0.7, temp=4.0)\nloss.backward()\noptimizer.step()",
        scannedAt: NOW - 4 * DAY,
      },
      {
        id: "gh_prakhar_torch1",
        kind: "github",
        skill: "PyTorch",
        repo: "vector-indexer",
        filePath: "src/embeddings.py",
        line: 18,
        commitSha: "5e28ab1",
        commitUrl: "https://github.com/prakhar-ml/vector-indexer/commit/5e28ab1",
        snippet: "with torch.no_grad():\n    embeddings = model.encode(texts, normalize_embeddings=True)",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_prakhar_sql1",
        kind: "github",
        skill: "SQL",
        repo: "vector-indexer",
        filePath: "db/create_vector_table.sql",
        line: 5,
        commitSha: "8a11bc3",
        commitUrl: "https://github.com/prakhar-ml/vector-indexer/commit/8a11bc3",
        snippet: "CREATE EXTENSION IF NOT EXISTS vector;\nCREATE TABLE document_embeddings (id UUID PRIMARY KEY, embedding vector(768));",
        scannedAt: NOW - 2 * DAY,
      },
    ],
    projects: [
      {
        id: "proj_prakhar_1",
        kind: "project",
        skill: "Machine Learning",
        title: "Self-Supervised Low-Resource Language Tokenizer",
        repo: "indic-tokenizer",
        faculty: "Dr. S. K. Mahajan",
        grade: "A+",
        rubric: [
          { criterion: "Theoretical Novelty", score: 10, max: 10 },
          { criterion: "Experimental Rigor", score: 10, max: 10 },
          { criterion: "Reproducibility", score: 9, max: 10 },
        ],
        complexity: 5,
      },
    ],
  },

  // 4. Viraj Anap (Full Stack & Systems Specialist)
  {
    id: "stu_viraj",
    name: "Viraj Anap",
    roll: "TECO21014",
    branch: "Computer Engineering",
    batch: "2026",
    cgpa: 9.48,
    githubUser: "virajanap",
    reposScanned: 25,
    verificationScore: 96,
    avatarColor: "#06b6d4",
    personalEmail: "viraj.anap2026@gmail.com",
    phone: "+91 91234 56780",
    bio: "Full stack systems developer building ultra-scalable React web applications, high-performance Node.js APIs, and strictly normalized PostgreSQL architectures.",
    location: { city: "Pune", state: "Maharashtra", pinCode: "411038" },
    education: {
      tenth: { schoolName: "Abhinava Vidyalaya, Pune", board: "State Board (SSC)", score: 96.2, year: 2020 },
      twelfth: { collegeName: "Sir Parashurambhau (SP) College, Pune", board: "State Board (HSC)", stream: "Science (PCM)", score: 94.8, year: 2022 },
      college: { name: "Pune Institute of Computer Technology (PICT)", branch: "Computer Engineering", gradYear: 2026, cgpa: 9.48 },
    },
    professionalStatus: "Fresher",
    links: {
      linkedin: "https://linkedin.com/in/viraj-anap",
      github: "https://github.com/virajanap",
      leetcode: "https://leetcode.com/u/virajanap",
      portfolio: "https://virajanap.me",
    },
    skills: [
      { canonical: "React", status: "verified", assessmentId: "as_viraj_react", githubIds: ["gh_viraj_react1"] },
      { canonical: "Node.js", status: "verified", assessmentId: "as_viraj_node", githubIds: ["gh_viraj_node1"] },
      { canonical: "PostgreSQL", status: "verified", assessmentId: "as_viraj_pg", githubIds: ["gh_viraj_pg1"] },
      { canonical: "TypeScript", status: "verified", assessmentId: "as_viraj_ts", githubIds: ["gh_viraj_ts1"] },
      { canonical: "AWS", status: "failed", assessmentId: "as_viraj_aws_fail" },
      { canonical: "Docker", status: "unverified" },
    ],
    assessments: [
      { id: "as_viraj_react", kind: "assessment", skill: "React", score: 97, passed: true, warnings: 0, takenAt: NOW - 6 * DAY, durationSec: 1500 },
      { id: "as_viraj_node", kind: "assessment", skill: "Node.js", score: 95, passed: true, warnings: 0, takenAt: NOW - 5 * DAY, durationSec: 1800 },
      { id: "as_viraj_pg", kind: "assessment", skill: "PostgreSQL", score: 94, passed: true, warnings: 0, takenAt: NOW - 4 * DAY, durationSec: 1900 },
      { id: "as_viraj_ts", kind: "assessment", skill: "TypeScript", score: 96, passed: true, warnings: 0, takenAt: NOW - 3 * DAY, durationSec: 1400 },
      { id: "as_viraj_aws_fail", kind: "assessment", skill: "AWS", score: 69, passed: false, warnings: 2, takenAt: NOW - 1 * DAY, durationSec: 1800 },
    ],
    evidence: [
      {
        id: "gh_viraj_react1",
        kind: "github",
        skill: "React",
        repo: "drishti-platform",
        filePath: "src/components/studio/LivePreview.tsx",
        line: 45,
        commitSha: "7b941ca",
        commitUrl: "https://github.com/virajanap/drishti-platform/commit/7b941ca",
        snippet: "export function LivePreview({ payload }: { payload: StudentPayload }) {\n  return <RenderCVViewer data={payload} verifyHash={computeHash(payload)} />;\n}",
        scannedAt: NOW - 4 * DAY,
      },
      {
        id: "gh_viraj_node1",
        kind: "github",
        skill: "Node.js",
        repo: "payment-rail",
        filePath: "src/services/settlement.ts",
        line: 78,
        commitSha: "2d8819f",
        commitUrl: "https://github.com/virajanap/payment-rail/commit/2d8819f",
        snippet: "export async function processSettlement(batchId: string) {\n  const client = await pool.connect();\n  try {\n    await client.query('BEGIN');\n    // execute atomic transfers\n    await client.query('COMMIT');\n  } finally { client.release(); }\n}",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_viraj_pg1",
        kind: "github",
        skill: "PostgreSQL",
        repo: "payment-rail",
        filePath: "db/migrations/001_idempotency.sql",
        line: 12,
        commitSha: "8c339ef",
        commitUrl: "https://github.com/virajanap/payment-rail/commit/8c339ef",
        snippet: "CREATE TABLE idempotency_keys (\n  key VARCHAR(64) PRIMARY KEY,\n  response JSONB NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_viraj_ts1",
        kind: "github",
        skill: "TypeScript",
        repo: "typed-event-bus",
        filePath: "src/index.ts",
        line: 24,
        commitSha: "5f102aa",
        commitUrl: "https://github.com/virajanap/typed-event-bus/commit/5f102aa",
        snippet: "export type EventMap = Record<string, unknown>;\nexport class TypedBus<T extends EventMap> {\n  emit<K extends keyof T>(event: K, data: T[K]): void {}\n}",
        scannedAt: NOW - 2 * DAY,
      },
    ],
    projects: [
      {
        id: "proj_viraj_1",
        kind: "project",
        skill: "React",
        title: "Cryptographic Evidence Ledger & Truth-Enforced Resume Studio",
        repo: "drishti-platform",
        faculty: "Dr. B. R. Patil",
        grade: "A+",
        rubric: [
          { criterion: "System Integrity", score: 10, max: 10 },
          { criterion: "Code Architecture", score: 10, max: 10 },
          { criterion: "Real-time Verification", score: 9, max: 10 },
        ],
        complexity: 5,
      },
    ],
  },

  // 5. Aarav Gupta (Competitive Programmer & Backend)
  {
    id: "stu_aarav",
    name: "Aarav Gupta",
    roll: "TECO21102",
    branch: "Computer Engineering",
    batch: "2026",
    cgpa: 8.95,
    githubUser: "aarav-algo",
    reposScanned: 18,
    verificationScore: 90,
    avatarColor: "#ec4899",
    personalEmail: "aarav.gupta2026@gmail.com",
    phone: "+91 98450 11920",
    bio: "Algorithm problem solver with 600+ LeetCode problems solved, specializing in low-latency Python algorithms and optimized SQL indexing.",
    location: { city: "Bengaluru", state: "Karnataka", pinCode: "560034" },
    education: {
      tenth: { schoolName: "National Public School, Indiranagar", board: "CBSE", score: 95.6, year: 2020 },
      twelfth: { collegeName: "Christ Junior College, Bengaluru", board: "State Board (PUC)", stream: "Science (PCMC)", score: 93.2, year: 2022 },
      college: { name: "PES University, Bengaluru", branch: "Computer Science", gradYear: 2026, cgpa: 8.95 },
    },
    professionalStatus: "Fresher",
    links: {
      linkedin: "https://linkedin.com/in/aarav-gupta-algo",
      github: "https://github.com/aarav-algo",
      leetcode: "https://leetcode.com/u/aaravgupta",
      codeforces: "https://codeforces.com/profile/aarav_g",
    },
    skills: [
      { canonical: "Python", status: "verified", assessmentId: "as_aarav_py", githubIds: ["gh_aarav_py1"] },
      { canonical: "SQL", status: "verified", assessmentId: "as_aarav_sql", githubIds: ["gh_aarav_sql1"] },
      { canonical: "PostgreSQL", status: "verified", assessmentId: "as_aarav_pg", githubIds: ["gh_aarav_pg1"] },
      { canonical: "Redis", status: "verified", assessmentId: "as_aarav_redis", githubIds: ["gh_aarav_redis1"] },
      { canonical: "Docker", status: "failed", assessmentId: "as_aarav_docker_fail" },
      { canonical: "React", status: "unverified" },
    ],
    assessments: [
      { id: "as_aarav_py", kind: "assessment", skill: "Python", score: 95, passed: true, warnings: 0, takenAt: NOW - 5 * DAY, durationSec: 1600 },
      { id: "as_aarav_sql", kind: "assessment", skill: "SQL", score: 94, passed: true, warnings: 0, takenAt: NOW - 4 * DAY, durationSec: 1800 },
      { id: "as_aarav_pg", kind: "assessment", skill: "PostgreSQL", score: 91, passed: true, warnings: 0, takenAt: NOW - 3 * DAY, durationSec: 1700 },
      { id: "as_aarav_redis", kind: "assessment", skill: "Redis", score: 89, passed: true, warnings: 0, takenAt: NOW - 2 * DAY, durationSec: 1300 },
      { id: "as_aarav_docker_fail", kind: "assessment", skill: "Docker", score: 65, passed: false, warnings: 2, takenAt: NOW - 1 * DAY, durationSec: 1600 },
    ],
    evidence: [
      {
        id: "gh_aarav_py1",
        kind: "github",
        skill: "Python",
        repo: "algo-solutions",
        filePath: "graphs/dijkstra_indexed_priority_queue.py",
        line: 35,
        commitSha: "6d3910f",
        commitUrl: "https://github.com/aarav-algo/algo-solutions/commit/6d3910f",
        snippet: "class IndexedPriorityQueue:\n    def __init__(self, capacity):\n        self.heap = []\n        self.pos = {}\n    def push(self, key, priority): ...",
        scannedAt: NOW - 4 * DAY,
      },
      {
        id: "gh_aarav_sql1",
        kind: "github",
        skill: "SQL",
        repo: "query-optimizer",
        filePath: "queries/analytical_aggregates.sql",
        line: 14,
        commitSha: "4e882a1",
        commitUrl: "https://github.com/aarav-algo/query-optimizer/commit/4e882a1",
        snippet: "SELECT user_id, DATE_TRUNC('month', created_at) AS month,\n       COUNT(*) OVER (PARTITION BY user_id ORDER BY created_at) AS rolling_count\nFROM transaction_logs;",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_aarav_pg1",
        kind: "github",
        skill: "PostgreSQL",
        repo: "query-optimizer",
        filePath: "db/b_tree_indexing.sql",
        line: 8,
        commitSha: "9b117cd",
        commitUrl: "https://github.com/aarav-algo/query-optimizer/commit/9b117cd",
        snippet: "CREATE INDEX idx_user_orders ON orders (user_id, status) INCLUDE (total_amount);",
        scannedAt: NOW - 2 * DAY,
      },
      {
        id: "gh_aarav_redis1",
        kind: "github",
        skill: "Redis",
        repo: "rate-guard",
        filePath: "token_bucket.py",
        line: 21,
        commitSha: "1a882cf",
        commitUrl: "https://github.com/aarav-algo/rate-guard/commit/1a882cf",
        snippet: "pipe = redis.pipeline()\npipe.zremrangebyscore(key, 0, now - window)\npipe.zadd(key, {now: now})\nresults = pipe.execute()",
        scannedAt: NOW - 2 * DAY,
      },
    ],
    projects: [
      {
        id: "proj_aarav_1",
        kind: "project",
        skill: "Python",
        title: "Sub-Millisecond In-Memory Distributed KV Store",
        repo: "flash-kv",
        faculty: "Dr. K. Narayanan",
        grade: "A",
        rubric: [
          { criterion: "Time Complexity", score: 10, max: 10 },
          { criterion: "Memory Management", score: 9, max: 10 },
          { criterion: "Benchmarking", score: 8, max: 10 },
        ],
        complexity: 4,
      },
    ],
  },

  // 6. Sneha Kulkarni (Frontend & Design Systems Lead)
  {
    id: "stu_sneha",
    name: "Sneha Kulkarni",
    roll: "TEIT21077",
    branch: "Information Technology",
    batch: "2026",
    cgpa: 9.32,
    githubUser: "snehak-ui",
    reposScanned: 21,
    verificationScore: 94,
    avatarColor: "#8b5cf6",
    personalEmail: "sneha.kulkarni26@gmail.com",
    phone: "+91 94220 77114",
    bio: "Design-conscious frontend engineer crafting accessible component systems, framer-motion micro-animations, and performant React applications.",
    location: { city: "Pune", state: "Maharashtra", pinCode: "411004" },
    education: {
      tenth: { schoolName: "Sevasadan High School, Pune", board: "State Board (SSC)", score: 97.4, year: 2020 },
      twelfth: { collegeName: "Fergusson Junior College", board: "State Board (HSC)", stream: "Science (PCM)", score: 94.6, year: 2022 },
      college: { name: "COEP Technological University, Pune", branch: "Information Technology", gradYear: 2026, cgpa: 9.32 },
    },
    professionalStatus: "Fresher",
    links: {
      linkedin: "https://linkedin.com/in/sneha-kulkarni-ui",
      github: "https://github.com/snehak-ui",
      portfolio: "https://snehakulkarni.design",
    },
    skills: [
      { canonical: "React", status: "verified", assessmentId: "as_sneha_react", githubIds: ["gh_sneha_react1"] },
      { canonical: "TypeScript", status: "verified", assessmentId: "as_sneha_ts", githubIds: ["gh_sneha_ts1"] },
      { canonical: "Node.js", status: "verified", assessmentId: "as_sneha_node", githubIds: ["gh_sneha_node1"] },
      { canonical: "Tailwind CSS", status: "verified", assessmentId: "as_sneha_tw", githubIds: ["gh_sneha_tw1"] },
      { canonical: "Machine Learning", status: "failed", assessmentId: "as_sneha_ml_fail" },
      { canonical: "Python", status: "unverified" },
    ],
    assessments: [
      { id: "as_sneha_react", kind: "assessment", skill: "React", score: 98, passed: true, warnings: 0, takenAt: NOW - 6 * DAY, durationSec: 1400 },
      { id: "as_sneha_ts", kind: "assessment", skill: "TypeScript", score: 96, passed: true, warnings: 0, takenAt: NOW - 5 * DAY, durationSec: 1500 },
      { id: "as_sneha_tw", kind: "assessment", skill: "Tailwind CSS", score: 95, passed: true, warnings: 0, takenAt: NOW - 4 * DAY, durationSec: 1200 },
      { id: "as_sneha_node", kind: "assessment", skill: "Node.js", score: 88, passed: true, warnings: 0, takenAt: NOW - 3 * DAY, durationSec: 1700 },
      { id: "as_sneha_ml_fail", kind: "assessment", skill: "Machine Learning", score: 50, passed: false, warnings: 3, takenAt: NOW - 1 * DAY, durationSec: 1100 },
    ],
    evidence: [
      {
        id: "gh_sneha_react1",
        kind: "github",
        skill: "React",
        repo: "prism-design-system",
        filePath: "src/components/Modal/AccessibleModal.tsx",
        line: 28,
        commitSha: "5a993fe",
        commitUrl: "https://github.com/snehak-ui/prism-design-system/commit/5a993fe",
        snippet: "export function AccessibleModal({ isOpen, onClose, children }: ModalProps) {\n  useFocusTrap(isOpen);\n  useEscapeKey(onClose);\n  return <Portal><div role='dialog' aria-modal='true'>{children}</div></Portal>;\n}",
        scannedAt: NOW - 4 * DAY,
      },
      {
        id: "gh_sneha_ts1",
        kind: "github",
        skill: "TypeScript",
        repo: "prism-design-system",
        filePath: "src/tokens/typography.ts",
        line: 16,
        commitSha: "8b224cd",
        commitUrl: "https://github.com/snehak-ui/prism-design-system/commit/8b224cd",
        snippet: "export const typeScale = {\n  xs: ['0.75rem', { lineHeight: '1rem' }],\n  sm: ['0.875rem', { lineHeight: '1.25rem' }],\n} as const;\nexport type TypeScale = keyof typeof typeScale;",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_sneha_tw1",
        kind: "github",
        skill: "Tailwind CSS",
        repo: "prism-design-system",
        filePath: "tailwind.config.js",
        line: 12,
        commitSha: "1c778ef",
        commitUrl: "https://github.com/snehak-ui/prism-design-system/commit/1c778ef",
        snippet: "module.exports = {\n  darkMode: 'class',\n  theme: {\n    extend: {\n      colors: { drishti: { bg: '#02060f', gold: '#ffe2b2', cyan: '#06b6d4' } }\n    }\n  }\n};",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_sneha_node1",
        kind: "github",
        skill: "Node.js",
        repo: "asset-bundler",
        filePath: "bin/bundle.js",
        line: 19,
        commitSha: "7e192aa",
        commitUrl: "https://github.com/snehak-ui/asset-bundler/commit/7e192aa",
        snippet: "const fs = require('fs/promises');\nasync function optimizeSVG(path) {\n  const raw = await fs.readFile(path, 'utf8');\n  return raw.replace(/<!--.*?-->/sg, '');\n}",
        scannedAt: NOW - 2 * DAY,
      },
    ],
    projects: [
      {
        id: "proj_sneha_1",
        kind: "project",
        skill: "React",
        title: "WCAG 2.1 AAA Compliant Design System & Animation Engine",
        repo: "prism-design-system",
        faculty: "Prof. N. V. Deshmukh",
        grade: "A+",
        rubric: [
          { criterion: "Accessibility Audit", score: 10, max: 10 },
          { criterion: "Component Modularity", score: 10, max: 10 },
          { criterion: "Performance (FCP)", score: 9, max: 10 },
        ],
        complexity: 4,
      },
    ],
  },

  // 7. Ananya Deshpande (Data Engineer & Backend)
  {
    id: "stu_ananya",
    name: "Ananya Deshpande",
    roll: "TECO21056",
    branch: "Computer Engineering",
    batch: "2026",
    cgpa: 8.92,
    githubUser: "ananya-data",
    reposScanned: 17,
    verificationScore: 91,
    avatarColor: "#14b8a6",
    personalEmail: "ananya.deshpande26@gmail.com",
    phone: "+91 97631 88022",
    bio: "Data pipeline builder creating resilient ETL workflows, SQL analytical queries, and real-time telemetry dashboards.",
    location: { city: "Nagpur", state: "Maharashtra", pinCode: "440010" },
    education: {
      tenth: { schoolName: "Somlalit School, Nagpur", board: "CBSE", score: 94.8, year: 2020 },
      twelfth: { collegeName: "Dr. Ambedkar College, Nagpur", board: "State Board (HSC)", stream: "Science (PCM)", score: 92.4, year: 2022 },
      college: { name: "VNIT Nagpur", branch: "Computer Science", gradYear: 2026, cgpa: 8.92 },
    },
    professionalStatus: "Fresher",
    links: {
      linkedin: "https://linkedin.com/in/ananya-deshpande-data",
      github: "https://github.com/ananya-data",
    },
    skills: [
      { canonical: "Python", status: "verified", assessmentId: "as_ananya_py", githubIds: ["gh_ananya_py1"] },
      { canonical: "SQL", status: "verified", assessmentId: "as_ananya_sql", githubIds: ["gh_ananya_sql1"] },
      { canonical: "PostgreSQL", status: "verified", assessmentId: "as_ananya_pg", githubIds: ["gh_ananya_pg1"] },
      { canonical: "Linux", status: "verified", assessmentId: "as_ananya_lin", githubIds: ["gh_ananya_lin1"] },
      { canonical: "Docker", status: "failed", assessmentId: "as_ananya_docker_fail" },
      { canonical: "React", status: "unverified" },
    ],
    assessments: [
      { id: "as_ananya_py", kind: "assessment", skill: "Python", score: 93, passed: true, warnings: 0, takenAt: NOW - 6 * DAY, durationSec: 1600 },
      { id: "as_ananya_sql", kind: "assessment", skill: "SQL", score: 95, passed: true, warnings: 0, takenAt: NOW - 5 * DAY, durationSec: 1700 },
      { id: "as_ananya_pg", kind: "assessment", skill: "PostgreSQL", score: 92, passed: true, warnings: 0, takenAt: NOW - 4 * DAY, durationSec: 1800 },
      { id: "as_ananya_lin", kind: "assessment", skill: "Linux", score: 90, passed: true, warnings: 0, takenAt: NOW - 3 * DAY, durationSec: 1500 },
      { id: "as_ananya_docker_fail", kind: "assessment", skill: "Docker", score: 71, passed: false, warnings: 2, takenAt: NOW - 1 * DAY, durationSec: 1600 },
    ],
    evidence: [
      {
        id: "gh_ananya_py1",
        kind: "github",
        skill: "Python",
        repo: "stream-etl",
        filePath: "pipeline/consumer.py",
        line: 38,
        commitSha: "3b889fa",
        commitUrl: "https://github.com/ananya-data/stream-etl/commit/3b889fa",
        snippet: "def process_telemetry(record: dict) -> dict:\n    clean = {k: v for k, v in record.items() if v is not None}\n    clean['processed_at'] = datetime.utcnow().isoformat()\n    return clean",
        scannedAt: NOW - 4 * DAY,
      },
      {
        id: "gh_ananya_sql1",
        kind: "github",
        skill: "SQL",
        repo: "stream-etl",
        filePath: "sql/cohort_retention.sql",
        line: 15,
        commitSha: "7e441db",
        commitUrl: "https://github.com/ananya-data/stream-etl/commit/7e441db",
        snippet: "WITH cohort AS (\n  SELECT user_id, MIN(DATE_TRUNC('month', order_date)) AS cohort_month\n  FROM orders GROUP BY user_id\n)\nSELECT cohort_month, COUNT(DISTINCT user_id) FROM cohort GROUP BY cohort_month;",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_ananya_pg1",
        kind: "github",
        skill: "PostgreSQL",
        repo: "stream-etl",
        filePath: "db/partitioned_telemetry.sql",
        line: 22,
        commitSha: "2a106cc",
        commitUrl: "https://github.com/ananya-data/stream-etl/commit/2a106cc",
        snippet: "CREATE TABLE telemetry_events (\n  event_id UUID,\n  created_at TIMESTAMP NOT NULL,\n  payload JSONB\n) PARTITION BY RANGE (created_at);",
        scannedAt: NOW - 2 * DAY,
      },
      {
        id: "gh_ananya_lin1",
        kind: "github",
        skill: "Linux",
        repo: "stream-etl",
        filePath: "scripts/daemon.sh",
        line: 9,
        commitSha: "9c334bb",
        commitUrl: "https://github.com/ananya-data/stream-etl/commit/9c334bb",
        snippet: "#!/usr/bin/env bash\nset -euo pipefail\nnohup python3 -u pipeline/consumer.py >> /var/log/etl.log 2>&1 &",
        scannedAt: NOW - 2 * DAY,
      },
    ],
    projects: [
      {
        id: "proj_ananya_1",
        kind: "project",
        skill: "SQL",
        title: "High-Volume Telemetry Analytics & Partitioned Warehouse",
        repo: "telemetry-warehouse",
        faculty: "Dr. R. M. Raut",
        grade: "A",
        rubric: [
          { criterion: "Query Optimization", score: 10, max: 10 },
          { criterion: "Schema Partitioning", score: 9, max: 10 },
          { criterion: "Documentation", score: 8, max: 10 },
        ],
        complexity: 4,
      },
    ],
  },
];

// ===========================================================================
// 4. APPLICATIONS (16+ Relational Entries with Explainable AI Fit Scores)
// ===========================================================================

export const APPLICATIONS: Application[] = [
  // 1. Om Deshmukh -> Neural Tech SDE-1
  {
    id: "app_1",
    studentId: "stu_om",
    jobId: "job_neural_sde1",
    stage: "Assessment",
    appliedAt: NOW - 2 * DAY,
    fitScore: 94,
    matchExplanation: "Exceptional match (94%). Verified Node.js (96%), PostgreSQL (94%), and Redis (90%) backends backed by 4 GitHub repos and verified express/pool implementations.",
  },
  // 2. Viraj Anap -> Neural Tech SDE-1
  {
    id: "app_2",
    studentId: "stu_viraj",
    jobId: "job_neural_sde1",
    stage: "Technical Interview",
    appliedAt: NOW - 2 * DAY,
    fitScore: 92,
    matchExplanation: "Strong match (92%). Verified React (97%), Node.js (95%), and PostgreSQL (93%) transaction locks. Missing evidence for Docker containerization.",
  },
  // 3. Mayur Patil -> Acme Corp Cloud & DevOps
  {
    id: "app_3",
    studentId: "stu_mayur",
    jobId: "job_acme_devops",
    stage: "Offer",
    appliedAt: NOW - 4 * DAY,
    fitScore: 95,
    matchExplanation: "Outstanding match (95%). Verified Docker (95%), Linux (92%), and automated CI/CD pipelines verified with 95% proctoring score and faculty A+ project.",
  },
  // 4. Prakhar Sharma -> Neural Tech ML Systems
  {
    id: "app_4",
    studentId: "stu_prakhar",
    jobId: "job_neural_ml",
    stage: "Offer",
    appliedAt: NOW - 3 * DAY,
    fitScore: 98,
    matchExplanation: "Flawless match (98%). Deep research in PyTorch transformers (94%) and Python ML pipelines (96%) backed by 98% proctored assessment.",
  },
  // 5. Sneha Kulkarni -> Acme Corp Full Stack
  {
    id: "app_5",
    studentId: "stu_sneha",
    jobId: "job_acme_frontend",
    stage: "Technical Interview",
    appliedAt: NOW - 2 * DAY,
    fitScore: 94,
    matchExplanation: "High-confidence frontend lead (94%). 98% React verification score, advanced TypeScript design systems, and verified Node.js asset bundler.",
  },
  // 6. Aarav Gupta -> FinServe Backend
  {
    id: "app_6",
    studentId: "stu_aarav",
    jobId: "job_finserve_backend",
    stage: "Shortlisted",
    appliedAt: NOW - 2 * DAY,
    fitScore: 89,
    matchExplanation: "Strong backend match (89%). High algorithm proficiency (LeetCode 600+), verified Python (95%), PostgreSQL (91%), and Redis rate limiting.",
  },
  // 7. Ananya Deshpande -> FinServe Backend
  {
    id: "app_7",
    studentId: "stu_ananya",
    jobId: "job_finserve_backend",
    stage: "Assessment",
    appliedAt: NOW - 2 * DAY,
    fitScore: 86,
    matchExplanation: "Solid analytical profile (86%). Verified PostgreSQL partitioned tables (92%) and SQL query optimization (95%). Lacks verified Redis cache.",
  },
  // 8. Om Deshmukh -> FinServe Backend
  {
    id: "app_8",
    studentId: "stu_om",
    jobId: "job_finserve_backend",
    stage: "HR Interview",
    appliedAt: NOW - 3 * DAY,
    fitScore: 96,
    matchExplanation: "Top tier alignment (96%). Verified Redis cache invalidation, PostgreSQL connection pooling, and 96% Node.js backend exam score.",
  },
  // 9. Viraj Anap -> Acme Corp Full Stack
  {
    id: "app_9",
    studentId: "stu_viraj",
    jobId: "job_acme_frontend",
    stage: "Offer",
    appliedAt: NOW - 3 * DAY,
    fitScore: 96,
    matchExplanation: "Exceptional candidate (96%). Full stack mastery: React (97%), TypeScript (96%), and Node.js (95%) verified across 3 production-grade repos.",
  },
  // 10. Mayur Patil -> Neural Tech SDE-1
  {
    id: "app_10",
    studentId: "stu_mayur",
    jobId: "job_neural_sde1",
    stage: "Applied",
    appliedAt: NOW - 1 * DAY,
    fitScore: 68,
    matchExplanation: "Moderate fit (68%). Strong in Docker and Linux infrastructure, but lacks verified Node.js and PostgreSQL backend evidence.",
  },
  // 11. Sneha Kulkarni -> Neural Tech SDE-1
  {
    id: "app_11",
    studentId: "stu_sneha",
    jobId: "job_neural_sde1",
    stage: "Shortlisted",
    appliedAt: NOW - 2 * DAY,
    fitScore: 82,
    matchExplanation: "Good frontend & API coverage (82%). Verified React and Node.js. Lacks PostgreSQL complex indexing proofs.",
  },
  // 12. Prakhar Sharma -> FinServe Backend
  {
    id: "app_12",
    studentId: "stu_prakhar",
    jobId: "job_finserve_backend",
    stage: "Shortlisted",
    appliedAt: NOW - 2 * DAY,
    fitScore: 81,
    matchExplanation: "Strong Python/SQL core (81%). High algorithmic ability, though primary experience is ML rather than high-throughput transaction processing.",
  },
  // 13. Aarav Gupta -> Neural Tech SDE-1
  {
    id: "app_13",
    studentId: "stu_aarav",
    jobId: "job_neural_sde1",
    stage: "Applied",
    appliedAt: NOW - 1 * DAY,
    fitScore: 88,
    matchExplanation: "Strong systems problem solver (88%). Verified Python (95%) and SQL data structures. Missing Node.js production evidence.",
  },
  // 14. Ananya Deshpande -> Neural Tech ML Systems
  {
    id: "app_14",
    studentId: "stu_ananya",
    jobId: "job_neural_ml",
    stage: "Applied",
    appliedAt: NOW - 1 * DAY,
    fitScore: 78,
    matchExplanation: "Competent data pipeline builder (78%). Solid Python (93%) & SQL (95%) proofs, but missing advanced PyTorch neural network training.",
  },
  // 15. Om Deshmukh -> Acme Corp Full Stack
  {
    id: "app_15",
    studentId: "stu_om",
    jobId: "job_acme_frontend",
    stage: "Shortlisted",
    appliedAt: NOW - 2 * DAY,
    fitScore: 91,
    matchExplanation: "Strong dual-stack capability (91%). Verified React frontend state management and verified Node.js microservices.",
  },
  // 16. Viraj Anap -> FinServe Backend
  {
    id: "app_16",
    studentId: "stu_viraj",
    jobId: "job_finserve_backend",
    stage: "HR Interview",
    appliedAt: NOW - 4 * DAY,
    fitScore: 93,
    matchExplanation: "High-throughput backend profile (93%). Verified PostgreSQL connection pool manager and verified Node.js payment settlement ledger.",
  },
  // 17. Mayur Patil -> Finnable Credit
  {
    id: "app_17",
    studentId: "stu_mayur",
    jobId: "job_finnable",
    stage: "Applied",
    appliedAt: NOW - 3 * DAY,
    fitScore: 65,
    matchExplanation: "Partial fit (65%). Verified Linux & Docker infrastructure, but lacks Node.js and PostgreSQL database evidence.",
  },
];

// ===========================================================================
// 5. CROWDSOURCED INTERVIEW QUESTIONS
// ===========================================================================

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "iq_1",
    company: "Neural Tech",
    role: "SDE-1 (Backend & Distributed Systems)",
    question: "How do you prevent cache stampede when invalidating high-traffic Redis keys across multiple worker nodes?",
    category: "Distributed Systems",
    difficulty: "Hard",
    reportedBy: "Om Deshmukh",
    reportedAt: NOW - 3 * DAY,
  },
  {
    id: "iq_2",
    company: "FinServe Technologies",
    role: "High-Concurrency Backend Engineer",
    question: "Walk through PostgreSQL MVCC (Multi-Version Concurrency Control) and how 'SELECT FOR UPDATE' prevents double-spending.",
    category: "Databases",
    difficulty: "Hard",
    reportedBy: "Viraj Anap",
    reportedAt: NOW - 2 * DAY,
  },
  {
    id: "iq_3",
    company: "Acme Corp",
    role: "Cloud Infrastructure & DevOps Engineer",
    question: "Explain the Linux cgroups v2 architecture and how Docker enforces memory swap limits on container processes.",
    category: "DevOps & OS",
    difficulty: "Medium",
    reportedBy: "Mayur Patil",
    reportedAt: NOW - 4 * DAY,
  },
  {
    id: "iq_4",
    company: "Neural Tech",
    role: "Machine Learning & LLM Systems Engineer",
    question: "How does FlashAttention optimize the memory IO bottleneck during transformer self-attention computation?",
    category: "Machine Learning",
    difficulty: "Hard",
    reportedBy: "Prakhar Sharma",
    reportedAt: NOW - 2 * DAY,
  },
  {
    id: "iq_5",
    company: "Acme Corp",
    role: "Full Stack Engineer (React & TypeScript)",
    question: "How do React 19 server components differ from SSR, and how does the reconciliation fiber tree serialize boundary data?",
    category: "Frontend",
    difficulty: "Medium",
    reportedBy: "Sneha Kulkarni",
    reportedAt: NOW - 1 * DAY,
  },
];

// ===========================================================================
// 6. RESUME STUDIO & X-RAY DATA (Sample Inflated Resumes for BS Detector UI)
// ===========================================================================

export const SAMPLE_INFLATED_RESUME = `OM DESHMUKH
Computer Engineering, 2026 | CGPA 9.18 | Pune, Maharashtra

EXPERIENCE & PROJECTS
- Architected Kubernetes microservices for a global payments platform handling 10M requests/sec.
- Deployed multi-region Cassandra cluster on AWS with active-active cross-datacenter replication.
- Implemented real-time Kafka event streaming pipelines across 40 distributed services.
- Built automated Terraform infrastructure as code with zero-trust network policies.
- Trained distributed GPT-4 scale LLM models on 256 H100 GPUs with DeepSpeed.

SKILLS
Node.js, PostgreSQL, React, Python, Kubernetes, Redis, AWS, Cassandra, Kafka, GraphQL, gRPC, Terraform, Rust, GoLang, Docker.`;

export const SAMPLE_INFLATED_RESUME_DEV_OPS = `MAYUR PATIL
Information Technology, 2026 | CGPA 8.76 | Nashik, Maharashtra

EXPERIENCE & PROJECTS
- Architected multi-tenant Kubernetes clusters on AWS EKS serving 5M daily active users.
- Built low-latency high-frequency trading (HFT) matching engine in C++ and Rust.
- Trained 70B parameter open-source LLMs using PyTorch Distributed Data Parallel (DDP).
- Led enterprise React 19 migration with automated GraphQL code generation.
- Designed distributed Cassandra database cluster across 3 geographic zones.

SKILLS
Docker, Linux, CI/CD, Python, Kubernetes, AWS, C++, Rust, React, GraphQL, Cassandra, PyTorch.`;

export const SAMPLE_INFLATED_RESUME_AI_ML = `PRAKHAR SHARMA
Computer Engineering, 2026 | CGPA 9.65 | Mumbai, Maharashtra

EXPERIENCE & PROJECTS
- Deployed production Kubernetes clusters with Istio service mesh and automated mTLS encryption.
- Architected multi-cloud infrastructure on AWS and Google Cloud Platform using Terraform.
- Built real-time React analytics dashboards with WebGL rendering for million-row datasets.
- Engineered sub-millisecond Redis distributed cache cluster with custom hash slot sharding.

SKILLS
Python, Machine Learning, PyTorch, SQL, Kubernetes, Istio, Docker, AWS, GCP, Terraform, React, Redis.`;

// ===========================================================================
// 7. PROCTORING LOGS & ANOMALY EVENTS (MediaPipe / COCO-SSD Telemetry)
// ===========================================================================

export const PROCTORING_SESSION_LOGS: Record<string, ProctorLogEntry[]> = {
  // Clean session (Om Deshmukh - Node.js Assessment)
  as_om_node: [
    { type: "session_start", time: NOW - 5 * DAY, message: "Proctored session initialized with dual-camera & mic feed", severity: "low" },
    { type: "face_verified", time: NOW - 5 * DAY + 12000, message: "Biometric single face anchor matched institutional ID", confidence: 0.98, severity: "low" },
    { type: "screen_lock", time: NOW - 5 * DAY + 24000, message: "Full-screen lock engaged; devtools access disabled", severity: "low" },
    { type: "session_complete", time: NOW - 5 * DAY + 1800000, message: "Assessment submitted with 0 integrity warnings", severity: "low" },
  ],

  // Flagged session (Om Deshmukh - Docker Assessment, Failed threshold)
  as_om_docker_fail: [
    { type: "session_start", time: NOW - 1 * DAY, message: "Proctored session initialized", severity: "low" },
    { type: "cell_phone_detected", time: NOW - 1 * DAY + 340000, message: "Warning 1: COCO-SSD flagged mobile phone in lower right frame", confidence: 0.94, severity: "critical" },
    { type: "gaze_deviation", time: NOW - 1 * DAY + 720000, message: "Warning 2: Gaze deviated from screen center for >14 seconds", confidence: 0.89, severity: "medium" },
    { type: "session_complete", time: NOW - 1 * DAY + 1900000, message: "Assessment completed with 2 integrity violations; score: 68% (Below 75% verification threshold)", severity: "critical" },
  ],

  // Terminated session (Om Deshmukh - Kubernetes Assessment, MAX_WARNINGS reached)
  as_om_k8s_fail: [
    { type: "session_start", time: NOW - 1 * DAY + 7200000, message: "Proctored session initialized", severity: "low" },
    { type: "multiple_faces_detected", time: NOW - 1 * DAY + 7400000, message: "Warning 1: Multiple human faces detected in frame (2 faces detected)", confidence: 0.96, severity: "critical" },
    { type: "audio_anomaly", time: NOW - 1 * DAY + 7600000, message: "Warning 2: Ambient vocal dialogue detected exceeding 65dB", confidence: 0.91, severity: "medium" },
    { type: "tab_switch_detected", time: NOW - 1 * DAY + 7800000, message: "Warning 3: Browser blur / alt-tab event detected. MAX_WARNINGS (3) reached.", severity: "critical" },
    { type: "session_terminated", time: NOW - 1 * DAY + 7805000, message: "Exam automatically locked & voided by DRISHTI integrity engine. Status: Failed.", severity: "critical" },
  ],
};
