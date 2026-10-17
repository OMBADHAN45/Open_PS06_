// Strict TypeScript interfaces for DRISHTI Student Onboarding & Resume Studio
// Zero 'any' types allowed.

export interface TenthRecord {
  schoolName: string;
  board: string;
  passingYear: number;
  percentageOrCgpa: number;
}

export interface TwelfthRecord {
  collegeName: string;
  board: string;
  passingYear: number;
  percentage: number;
}

export interface EngineeringRecord {
  collegeName: string;
  sgpas: number[]; // Semester 1 through 8 SGPA
  cgpa: number; // Auto-calculated cumulative CGPA
  activeBacklogs: number;
}

export interface CodingEcosystem {
  githubUrl: string; // Mandatory
  leetcodeUrl: string;
  hackerrankUrl: string;
  codechefUrl: string;
  portfolioUrl: string;
}

export interface VerifiedProofItem {
  skill: string;
  source: "github" | "assessment" | "project";
  proofId: string;
  proofUrl?: string;
  commitSha?: string;
  score?: number;
  verifiedAt: string;
  details: string;
}

export interface ScrubbedSkillItem {
  skill: string;
  reason: string;
  status: "unverified" | "failed";
}

export interface EvidenceLedger {
  verifiedSkills: VerifiedProofItem[];
  scrubbedSkills: ScrubbedSkillItem[];
}

export interface StudentProfilePayload {
  // Step 1: Authentication & Core Identity
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  rollNumber: string; // College Roll / PRN
  department: string;
  gradYear: number;

  // Step 2: Academic Ledger
  tenth: TenthRecord;
  twelfth: TwelfthRecord;
  engineering: EngineeringRecord;

  // Step 3: Coding Ecosystem (Evidence Anchors)
  codingEcosystem: CodingEcosystem;

  // Step 4: Initial Skill Assertion
  claimedSkills: string[];

  // Evidence Ledger
  evidenceLedger: EvidenceLedger;

  // Submission metadata
  submittedAt: string;
}

// Canonical skills organized by category for Onboarding Step 4
export const ONBOARDING_SKILL_CATEGORIES: Record<string, string[]> = {
  Languages: ["TypeScript", "JavaScript", "Python", "Java", "C++", "Go", "Rust"],
  "Web Dev": ["React", "Next.js", "Node.js", "Express", "Tailwind CSS", "GraphQL"],
  Databases: ["PostgreSQL", "Redis", "MongoDB", "MySQL", "Prisma"],
  DevOps: ["Docker", "Kubernetes", "AWS", "Git", "GitHub Actions", "Linux"],
  "AI / ML": ["Machine Learning", "PyTorch", "TensorFlow", "FastAPI", "NLP"],
};

// Generates an initial default payload matching the active student demo data
export function createDefaultOnboardingPayload(
  name = "Om Badhan",
  roll = "2022BTECS00042",
  branch = "Computer Science & Engineering",
  gradYear = 2026
): StudentProfilePayload {
  return {
    fullName: name,
    email: "om.badhan@coep.ac.in",
    rollNumber: roll,
    department: branch,
    gradYear: gradYear,
    tenth: {
      schoolName: "St. Vincent High School",
      board: "CBSE",
      passingYear: 2020,
      percentageOrCgpa: 94.6,
    },
    twelfth: {
      collegeName: "Fergusson Junior College",
      board: "State Board (HSC)",
      passingYear: 2022,
      percentage: 92.4,
    },
    engineering: {
      collegeName: "COEP Technological University, Pune",
      sgpas: [8.9, 9.1, 9.25, 9.3, 9.15, 9.4, 0, 0],
      cgpa: 9.18,
      activeBacklogs: 0,
    },
    codingEcosystem: {
      githubUrl: "https://github.com/ombadhan45",
      leetcodeUrl: "https://leetcode.com/u/ombadhan",
      hackerrankUrl: "https://www.hackerrank.com/profile/ombadhan45",
      codechefUrl: "https://www.codechef.com/users/ombadhan45",
      portfolioUrl: "https://ombadhan.dev",
    },
    claimedSkills: [
      "React",
      "Node.js",
      "Redis",
      "PostgreSQL",
      "TypeScript",
      "Python",
      "Docker",
      "Kubernetes",
      "AWS",
      "Go",
      "GraphQL",
    ],
    evidenceLedger: {
      verifiedSkills: [
        {
          skill: "Redis",
          source: "github",
          proofId: "ev_om_redis_1",
          proofUrl: "https://github.com/ombadhan45/cache-layer/commit/a8f3b12",
          commitSha: "a8f3b12",
          verifiedAt: "2026-09-14",
          details: "ioredis caching layer with TTL eviction @ line 12",
        },
        {
          skill: "Node.js",
          source: "github",
          proofId: "ev_om_node_1",
          proofUrl: "https://github.com/ombadhan45/drishti-core/commit/f4c891e",
          commitSha: "f4c891e",
          verifiedAt: "2026-09-15",
          details: "Express async router & rate-limiting middleware",
        },
        {
          skill: "PostgreSQL",
          source: "assessment",
          proofId: "ev_om_sql_test",
          score: 92,
          verifiedAt: "2026-09-18",
          details: "Proctored Exam: Advanced Indexing & Query Tuning (92/100, 0 warnings)",
        },
        {
          skill: "TypeScript",
          source: "project",
          proofId: "ev_om_ts_proj",
          score: 95,
          verifiedAt: "2026-09-20",
          details: "Faculty Rubric: Compiler AST parser (Grade A+)",
        },
        {
          skill: "React",
          source: "github",
          proofId: "ev_om_react_1",
          proofUrl: "https://github.com/ombadhan45/portfolio/commit/c3d9a11",
          commitSha: "c3d9a11",
          verifiedAt: "2026-09-10",
          details: "SSR hydration & custom hook memoization",
        },
        {
          skill: "Python",
          source: "assessment",
          proofId: "ev_om_py_test",
          score: 88,
          verifiedAt: "2026-09-22",
          details: "Proctored Exam: Concurrency & Asyncio (88/100, 0 warnings)",
        },
      ],
      scrubbedSkills: [
        {
          skill: "Docker",
          reason: "Pending hands-on containerization proctored assessment.",
          status: "unverified",
        },
        {
          skill: "Kubernetes",
          reason: "No cryptographic commits or cluster deployments found in repositories.",
          status: "unverified",
        },
        {
          skill: "AWS",
          reason: "No IAM/cloud formation templates or proctored test logs verified.",
          status: "unverified",
        },
        {
          skill: "Go",
          reason: "No Go source code detected across 14 scanned repositories.",
          status: "unverified",
        },
        {
          skill: "GraphQL",
          reason: "Unverified claim — pending schema design assessment.",
          status: "unverified",
        },
      ],
    },
    submittedAt: new Date().toISOString(),
  };
}

export function createPayloadFromStudent(student: import("./mock-data").StudentProfile): StudentProfilePayload {
  const verifiedList: VerifiedProofItem[] = [];
  const scrubbedList: ScrubbedSkillItem[] = [];

  for (const s of student.skills) {
    if (s.status === "verified") {
      const ev = student.evidence.find((e) => (e as { skill?: string }).skill === s.canonical);
      const isGithub = ev?.kind === "github";
      const isAssess = ev?.kind === "assessment";
      verifiedList.push({
        skill: s.canonical,
        source: isGithub ? "github" : isAssess ? "assessment" : "project",
        proofId: ev?.id ?? `ev_${s.canonical}`,
        proofUrl: isGithub ? (ev as { commitUrl?: string }).commitUrl : undefined,
        commitSha: isGithub ? (ev as { commitSha?: string }).commitSha : undefined,
        score: isAssess ? (ev as { score?: number }).score : 90,
        verifiedAt: "2026-09-18",
        details: isGithub
          ? `Verified permalink in ${(ev as { repo?: string }).repo || "repository"}`
          : isAssess
          ? `Proctored Exam Score: ${(ev as { score?: number }).score || 85}%`
          : "Faculty Rubric Evaluated",
      });
    } else {
      scrubbedList.push({
        skill: s.canonical,
        status: s.status,
        reason:
          s.status === "failed"
            ? "Failed proctored skill exam (<75% threshold); auto-removed."
            : "Unverified claim — pending proctored assessment or repository code proof.",
      });
    }
  }

  const gradYear = parseInt(student.batch, 10) || 2026;
  const sgpaBase = Math.min(10, Math.max(6, student.cgpa));

  return {
    fullName: student.name,
    email: `${student.name.toLowerCase().replace(/\s+/g, ".")}@coep.ac.in`,
    rollNumber: student.roll,
    department: student.branch,
    gradYear,
    tenth: {
      schoolName: "Delhi Public School",
      board: "CBSE",
      passingYear: gradYear - 6,
      percentageOrCgpa: 93.5,
    },
    twelfth: {
      collegeName: "Fergusson Junior College",
      board: "State Board (HSC)",
      passingYear: gradYear - 4,
      percentage: 91.0,
    },
    engineering: {
      collegeName: "COEP Technological University, Pune",
      sgpas: [
        Number((sgpaBase - 0.2).toFixed(2)),
        Number((sgpaBase - 0.1).toFixed(2)),
        Number(sgpaBase.toFixed(2)),
        Number((sgpaBase + 0.1).toFixed(2)),
        Number(sgpaBase.toFixed(2)),
        Number((sgpaBase + 0.2).toFixed(2)),
        0,
        0,
      ],
      cgpa: student.cgpa,
      activeBacklogs: 0,
    },
    codingEcosystem: {
      githubUrl: `https://github.com/${student.githubUser}`,
      leetcodeUrl: `https://leetcode.com/u/${student.githubUser}`,
      hackerrankUrl: `https://www.hackerrank.com/profile/${student.githubUser}`,
      codechefUrl: `https://www.codechef.com/users/${student.githubUser}`,
      portfolioUrl: `https://${student.githubUser}.dev`,
    },
    claimedSkills: student.skills.map((s) => s.canonical),
    evidenceLedger: {
      verifiedSkills: verifiedList,
      scrubbedSkills: scrubbedList,
    },
    submittedAt: new Date().toISOString(),
  };
}

