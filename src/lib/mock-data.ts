// Rich, realistic mock data for the DRISHTI platform demo.
// Pre-populated students (Om, Mayur, Prakhar, Viraj) with GitHub commit
// permalinks, verified skills, missing gaps, proctored test logs.

export type SkillStatus = "verified" | "unverified" | "failed";

export interface GitHubEvidence {
  id: string;
  kind: "github";
  skill: string; // canonical
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
}

export interface ProjectEvidence {
  id: string;
  kind: "project";
  skill: string;
  title: string;
  repo: string;
  faculty: string;
  grade: string; // A+, A, etc
  rubric: { criterion: string; score: number; max: number }[];
  complexity: number; // 1..5
}

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
}

export interface JobOpening {
  id: string;
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

// ---------------------------------------------------------------------------
// STUDENTS
// ---------------------------------------------------------------------------

const NOW = Date.now();
const DAY = 86400000;

export const STUDENTS: StudentProfile[] = [
  {
    id: "stu_om",
    name: "Om Deshmukh",
    roll: "TECO21123",
    branch: "Computer Engineering",
    batch: "2026",
    cgpa: 8.9,
    githubUser: "omcodes",
    reposScanned: 14,
    verificationScore: 91,
    avatarColor: "#9fe0ff",
    skills: [
      { canonical: "Python", status: "verified", assessmentId: "as_om_py", githubIds: ["gh_om_py1"] },
      { canonical: "SQL", status: "verified", assessmentId: "as_om_sql", githubIds: ["gh_om_sql1"] },
      { canonical: "React", status: "verified", githubIds: ["gh_om_react1"] },
      { canonical: "Node.js", status: "verified", githubIds: ["gh_om_node1", "gh_om_node2"] },
      { canonical: "PostgreSQL", status: "verified", githubIds: ["gh_om_pg1"] },
      { canonical: "Docker", status: "failed", assessmentId: "as_om_docker_fail" },
      { canonical: "AWS", status: "unverified" },
      { canonical: "Redis", status: "verified", githubIds: ["gh_om_redis1"] },
    ],
    evidence: [
      {
        id: "gh_om_py1",
        kind: "github",
        skill: "Python",
        repo: "campus-scheduler",
        filePath: "scheduler/core.py",
        line: 42,
        commitSha: "a1f3c90",
        commitUrl: "https://github.com/omcodes/campus-scheduler/commit/a1f3c90",
        snippet: "def schedule(courses):\n    return sorted(courses, key=lambda c: c.start)",
        scannedAt: NOW - 6 * DAY,
      },
      {
        id: "gh_om_sql1",
        kind: "github",
        skill: "SQL",
        repo: "campus-scheduler",
        filePath: "db/migrations/002_indexes.sql",
        line: 12,
        commitSha: "b27e1aa",
        commitUrl: "https://github.com/omcodes/campus-scheduler/commit/b27e1aa",
        snippet: "CREATE INDEX CONCURRENTLY idx_enroll_student ON enrollments(student_id);",
        scannedAt: NOW - 6 * DAY,
      },
      {
        id: "gh_om_react1",
        kind: "github",
        skill: "React",
        repo: "placement-dashboard",
        filePath: "src/components/SkillMatrix.tsx",
        line: 18,
        commitSha: "c9d2f10",
        commitUrl: "https://github.com/omcodes/placement-dashboard/commit/c9d2f10",
        snippet: "export function SkillMatrix({ skills }) {\n  return <ul>{skills.map(s => <li key={s.canonical}>{s.canonical}</li>)}</ul>;\n}",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_om_node1",
        kind: "github",
        skill: "Node.js",
        repo: "auth-service",
        filePath: "src/server.ts",
        line: 8,
        commitSha: "d4a8b22",
        commitUrl: "https://github.com/omcodes/auth-service/commit/d4a8b22",
        snippet: "import express from 'express';\nconst app = express();\napp.listen(3000);",
        scannedAt: NOW - 2 * DAY,
      },
      {
        id: "gh_om_node2",
        kind: "github",
        skill: "Node.js",
        repo: "cache-middleware",
        filePath: "src/middleware/cache.ts",
        line: 12,
        commitSha: "e7c1f55",
        commitUrl: "https://github.com/omcodes/cache-middleware/commit/e7c1f55",
        snippet: "import Redis from 'ioredis';\nconst redis = new Redis(process.env.REDIS_URL);",
        scannedAt: NOW - 1 * DAY,
      },
      {
        id: "gh_om_pg1",
        kind: "github",
        skill: "PostgreSQL",
        repo: "auth-service",
        filePath: "src/db/client.ts",
        line: 5,
        commitSha: "f0b2e88",
        commitUrl: "https://github.com/omcodes/auth-service/commit/f0b2e88",
        snippet: "import { Pool } from 'pg';\nexport const pool = new Pool({ connectionString: process.env.DATABASE_URL });",
        scannedAt: NOW - 2 * DAY,
      },
      {
        id: "gh_om_redis1",
        kind: "github",
        skill: "Redis",
        repo: "cache-middleware",
        filePath: "src/middleware/cache.ts",
        line: 12,
        commitSha: "e7c1f55",
        commitUrl: "https://github.com/omcodes/cache-middleware/commit/e7c1f55",
        snippet: "import Redis from 'ioredis';\nconst redis = new Redis(process.env.REDIS_URL);",
        scannedAt: NOW - 1 * DAY,
      },
      {
        id: "as_om_py",
        kind: "assessment",
        skill: "Python",
        score: 88,
        passed: true,
        warnings: 0,
        takenAt: NOW - 5 * DAY,
        durationSec: 540,
      },
      {
        id: "as_om_sql",
        kind: "assessment",
        skill: "SQL",
        score: 91,
        passed: true,
        warnings: 0,
        takenAt: NOW - 4 * DAY,
        durationSec: 480,
      },
      {
        id: "as_om_docker_fail",
        kind: "assessment",
        skill: "Docker",
        score: 48,
        passed: false,
        warnings: 3,
        takenAt: NOW - 9 * DAY,
        durationSec: 720,
      },
    ],
    assessments: [
      { id: "as_om_py", kind: "assessment", skill: "Python", score: 88, passed: true, warnings: 0, takenAt: NOW - 5 * DAY, durationSec: 540 },
      { id: "as_om_sql", kind: "assessment", skill: "SQL", score: 91, passed: true, warnings: 0, takenAt: NOW - 4 * DAY, durationSec: 480 },
      { id: "as_om_docker_fail", kind: "assessment", skill: "Docker", score: 48, passed: false, warnings: 3, takenAt: NOW - 9 * DAY, durationSec: 720 },
    ],
    projects: [
      {
        id: "pr_om_1",
        kind: "project",
        skill: "Node.js",
        title: "Evidence-Backed Auth Service",
        repo: "auth-service",
        faculty: "Prof. S. Iyer",
        grade: "A+",
        rubric: [
          { criterion: "Architecture", score: 9, max: 10 },
          { criterion: "Code Quality", score: 9, max: 10 },
          { criterion: "Testing", score: 8, max: 10 },
          { criterion: "Documentation", score: 9, max: 10 },
        ],
        complexity: 4,
      },
      {
        id: "pr_om_2",
        kind: "project",
        skill: "React",
        title: "Placement Dashboard",
        repo: "placement-dashboard",
        faculty: "Prof. R. Kulkarni",
        grade: "A",
        rubric: [
          { criterion: "Architecture", score: 8, max: 10 },
          { criterion: "Code Quality", score: 8, max: 10 },
          { criterion: "Testing", score: 7, max: 10 },
          { criterion: "Documentation", score: 8, max: 10 },
        ],
        complexity: 3,
      },
    ],
  },
  {
    id: "stu_mayur",
    name: "Mayur Patil",
    roll: "TECO21187",
    branch: "Information Technology",
    batch: "2026",
    cgpa: 8.6,
    githubUser: "mayurp",
    reposScanned: 11,
    verificationScore: 86,
    avatarColor: "#ffe2b2",
    skills: [
      { canonical: "Python", status: "verified", assessmentId: "as_mayur_py", githubIds: ["gh_mayur_py1"] },
      { canonical: "Java", status: "verified", assessmentId: "as_mayur_java" },
      { canonical: "SQL", status: "verified", assessmentId: "as_mayur_sql" },
      { canonical: "React", status: "verified", githubIds: ["gh_mayur_react1"] },
      { canonical: "Spring Boot", status: "verified", githubIds: ["gh_mayur_spring1"] },
      { canonical: "Docker", status: "verified", assessmentId: "as_mayur_docker", githubIds: ["gh_mayur_docker1"] },
      { canonical: "AWS", status: "unverified" },
    ],
    evidence: [
      {
        id: "gh_mayur_py1",
        kind: "github",
        skill: "Python",
        repo: "ml-prep-toolkit",
        filePath: "prep/vectorize.py",
        line: 24,
        commitSha: "11ab9c0",
        commitUrl: "https://github.com/mayurp/ml-prep-toolkit/commit/11ab9c0",
        snippet: "from sklearn.feature_extraction.text import TfidfVectorizer",
        scannedAt: NOW - 7 * DAY,
      },
      {
        id: "gh_mayur_react1",
        kind: "github",
        skill: "React",
        repo: "job-board-ui",
        filePath: "src/pages/Jobs.tsx",
        line: 30,
        commitSha: "22cd8b1",
        commitUrl: "https://github.com/mayurp/job-board-ui/commit/22cd8b1",
        snippet: "export default function Jobs(){ const {data} = useJobs(); return <JobList jobs={data}/> }",
        scannedAt: NOW - 6 * DAY,
      },
      {
        id: "gh_mayur_spring1",
        kind: "github",
        skill: "Spring Boot",
        repo: "inventory-api",
        filePath: "src/main/java/com/app/InventoryService.java",
        line: 14,
        commitSha: "33ef2a2",
        commitUrl: "https://github.com/mayurp/inventory-api/commit/33ef2a2",
        snippet: "@SpringBootApplication\npublic class InventoryService { ... }",
        scannedAt: NOW - 5 * DAY,
      },
      {
        id: "gh_mayur_docker1",
        kind: "github",
        skill: "Docker",
        repo: "inventory-api",
        filePath: "Dockerfile",
        line: 1,
        commitSha: "44aa3bc",
        commitUrl: "https://github.com/mayurp/inventory-api/commit/44aa3bc",
        snippet: "FROM eclipse-temurin:17-jre\nCOPY target/app.jar /app/app.jar",
        scannedAt: NOW - 4 * DAY,
      },
      {
        id: "as_mayur_py",
        kind: "assessment",
        skill: "Python",
        score: 84,
        passed: true,
        warnings: 1,
        takenAt: NOW - 8 * DAY,
        durationSec: 600,
      },
      {
        id: "as_mayur_java",
        kind: "assessment",
        skill: "Java",
        score: 79,
        passed: true,
        warnings: 0,
        takenAt: NOW - 7 * DAY,
        durationSec: 560,
      },
      {
        id: "as_mayur_sql",
        kind: "assessment",
        skill: "SQL",
        score: 82,
        passed: true,
        warnings: 0,
        takenAt: NOW - 6 * DAY,
        durationSec: 540,
      },
      {
        id: "as_mayur_docker",
        kind: "assessment",
        skill: "Docker",
        score: 77,
        passed: true,
        warnings: 1,
        takenAt: NOW - 3 * DAY,
        durationSec: 600,
      },
    ],
    assessments: [
      { id: "as_mayur_py", kind: "assessment", skill: "Python", score: 84, passed: true, warnings: 1, takenAt: NOW - 8 * DAY, durationSec: 600 },
      { id: "as_mayur_java", kind: "assessment", skill: "Java", score: 79, passed: true, warnings: 0, takenAt: NOW - 7 * DAY, durationSec: 560 },
      { id: "as_mayur_sql", kind: "assessment", skill: "SQL", score: 82, passed: true, warnings: 0, takenAt: NOW - 6 * DAY, durationSec: 540 },
      { id: "as_mayur_docker", kind: "assessment", skill: "Docker", score: 77, passed: true, warnings: 1, takenAt: NOW - 3 * DAY, durationSec: 600 },
    ],
    projects: [
      {
        id: "pr_mayur_1",
        kind: "project",
        skill: "Spring Boot",
        title: "Inventory Management API",
        repo: "inventory-api",
        faculty: "Prof. A. Deshpande",
        grade: "A",
        rubric: [
          { criterion: "Architecture", score: 8, max: 10 },
          { criterion: "Code Quality", score: 8, max: 10 },
          { criterion: "Testing", score: 7, max: 10 },
          { criterion: "Documentation", score: 8, max: 10 },
        ],
        complexity: 4,
      },
    ],
  },
  {
    id: "stu_prakhar",
    name: "Prakhar Sharma",
    roll: "TECO21201",
    branch: "Computer Engineering",
    batch: "2026",
    cgpa: 9.1,
    githubUser: "prakhar-s",
    reposScanned: 18,
    verificationScore: 94,
    avatarColor: "#10b981",
    skills: [
      { canonical: "Python", status: "verified", assessmentId: "as_prakhar_py", githubIds: ["gh_prakhar_py1"] },
      { canonical: "SQL", status: "verified", assessmentId: "as_prakhar_sql" },
      { canonical: "React", status: "verified", githubIds: ["gh_prakhar_react1"] },
      { canonical: "Node.js", status: "verified", githubIds: ["gh_prakhar_node1"] },
      { canonical: "PostgreSQL", status: "verified", githubIds: ["gh_prakhar_pg1"] },
      { canonical: "Docker", status: "verified", assessmentId: "as_prakhar_docker", githubIds: ["gh_prakhar_docker1"] },
      { canonical: "Machine Learning", status: "verified", githubIds: ["gh_prakhar_ml1"] },
      { canonical: "Redis", status: "verified", githubIds: ["gh_prakhar_redis1"] },
    ],
    evidence: [
      {
        id: "gh_prakhar_py1",
        kind: "github",
        skill: "Python",
        repo: "rcm-engine",
        filePath: "engine/recommender.py",
        line: 36,
        commitSha: "7af2c11",
        commitUrl: "https://github.com/prakhar-s/rcm-engine/commit/7af2c11",
        snippet: "import numpy as np\ndef cosine(a,b): return np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b))",
        scannedAt: NOW - 4 * DAY,
      },
      {
        id: "gh_prakhar_react1",
        kind: "github",
        skill: "React",
        repo: "rcm-dashboard",
        filePath: "src/App.tsx",
        line: 22,
        commitSha: "8bd3e22",
        commitUrl: "https://github.com/prakhar-s/rcm-dashboard/commit/8bd3e22",
        snippet: "export default function App(){ return <RecommenderView/> }",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_prakhar_node1",
        kind: "github",
        skill: "Node.js",
        repo: "rcm-api",
        filePath: "src/index.ts",
        line: 10,
        commitSha: "9ce4f33",
        commitUrl: "https://github.com/prakhar-s/rcm-api/commit/9ce4f33",
        snippet: "import Fastify from 'fastify';\nconst app = Fastify();",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_prakhar_pg1",
        kind: "github",
        skill: "PostgreSQL",
        repo: "rcm-api",
        filePath: "src/db.ts",
        line: 4,
        commitSha: "0df5a44",
        commitUrl: "https://github.com/prakhar-s/rcm-api/commit/0df5a44",
        snippet: "import pg from 'pg';\nexport const pool = new pg.Pool();",
        scannedAt: NOW - 3 * DAY,
      },
      {
        id: "gh_prakhar_docker1",
        kind: "github",
        skill: "Docker",
        repo: "rcm-api",
        filePath: "Dockerfile",
        line: 1,
        commitSha: "1e6b7c5",
        commitUrl: "https://github.com/prakhar-s/rcm-api/commit/1e6b7c5",
        snippet: "FROM node:20-alpine\nWORKDIR /app\nCOPY . .",
        scannedAt: NOW - 2 * DAY,
      },
      {
        id: "gh_prakhar_ml1",
        kind: "github",
        skill: "Machine Learning",
        repo: "rcm-engine",
        filePath: "engine/train.py",
        line: 50,
        commitSha: "2f7c8d6",
        commitUrl: "https://github.com/prakhar-s/rcm-engine/commit/2f7c8d6",
        snippet: "from sklearn.ensemble import RandomForestClassifier",
        scannedAt: NOW - 4 * DAY,
      },
      {
        id: "gh_prakhar_redis1",
        kind: "github",
        skill: "Redis",
        repo: "rcm-api",
        filePath: "src/cache.ts",
        line: 8,
        commitSha: "3a8d9e7",
        commitUrl: "https://github.com/prakhar-s/rcm-api/commit/3a8d9e7",
        snippet: "import Redis from 'ioredis';\nexport const cache = new Redis();",
        scannedAt: NOW - 2 * DAY,
      },
      {
        id: "as_prakhar_py",
        kind: "assessment",
        skill: "Python",
        score: 96,
        passed: true,
        warnings: 0,
        takenAt: NOW - 5 * DAY,
        durationSec: 460,
      },
      {
        id: "as_prakhar_sql",
        kind: "assessment",
        skill: "SQL",
        score: 93,
        passed: true,
        warnings: 0,
        takenAt: NOW - 4 * DAY,
        durationSec: 470,
      },
      {
        id: "as_prakhar_docker",
        kind: "assessment",
        skill: "Docker",
        score: 88,
        passed: true,
        warnings: 0,
        takenAt: NOW - 2 * DAY,
        durationSec: 510,
      },
    ],
    assessments: [
      { id: "as_prakhar_py", kind: "assessment", skill: "Python", score: 96, passed: true, warnings: 0, takenAt: NOW - 5 * DAY, durationSec: 460 },
      { id: "as_prakhar_sql", kind: "assessment", skill: "SQL", score: 93, passed: true, warnings: 0, takenAt: NOW - 4 * DAY, durationSec: 470 },
      { id: "as_prakhar_docker", kind: "assessment", skill: "Docker", score: 88, passed: true, warnings: 0, takenAt: NOW - 2 * DAY, durationSec: 510 },
    ],
    projects: [
      {
        id: "pr_prakhar_1",
        kind: "project",
        skill: "Machine Learning",
        title: "Recommendation Engine",
        repo: "rcm-engine",
        faculty: "Prof. M. Nair",
        grade: "A+",
        rubric: [
          { criterion: "Architecture", score: 10, max: 10 },
          { criterion: "Code Quality", score: 9, max: 10 },
          { criterion: "Testing", score: 9, max: 10 },
          { criterion: "Documentation", score: 10, max: 10 },
        ],
        complexity: 5,
      },
      {
        id: "pr_prakhar_2",
        kind: "project",
        skill: "Node.js",
        title: "RCM API Gateway",
        repo: "rcm-api",
        faculty: "Prof. S. Iyer",
        grade: "A+",
        rubric: [
          { criterion: "Architecture", score: 9, max: 10 },
          { criterion: "Code Quality", score: 9, max: 10 },
          { criterion: "Testing", score: 9, max: 10 },
          { criterion: "Documentation", score: 9, max: 10 },
        ],
        complexity: 4,
      },
    ],
  },
  {
    id: "stu_viraj",
    name: "Viraj Kulkarni",
    roll: "TECO21077",
    branch: "Computer Engineering",
    batch: "2026",
    cgpa: 8.2,
    githubUser: "virajk",
    reposScanned: 9,
    verificationScore: 78,
    avatarColor: "#9fe0ff",
    skills: [
      { canonical: "JavaScript", status: "verified", githubIds: ["gh_viraj_js1"] },
      { canonical: "React", status: "verified", githubIds: ["gh_viraj_react1"] },
      { canonical: "Node.js", status: "verified", githubIds: ["gh_viraj_node1"] },
      { canonical: "MongoDB", status: "verified", githubIds: ["gh_viraj_mongo1"] },
      { canonical: "Python", status: "unverified" },
      { canonical: "AWS", status: "unverified" },
      { canonical: "Docker", status: "unverified" },
    ],
    evidence: [
      {
        id: "gh_viraj_js1",
        kind: "github",
        skill: "JavaScript",
        repo: "portfolio-site",
        filePath: "src/main.js",
        line: 12,
        commitSha: "ab12cd3",
        commitUrl: "https://github.com/virajk/portfolio-site/commit/ab12cd3",
        snippet: "const nav = document.querySelector('.nav');",
        scannedAt: NOW - 10 * DAY,
      },
      {
        id: "gh_viraj_react1",
        kind: "github",
        skill: "React",
        repo: "expense-tracker",
        filePath: "src/App.jsx",
        line: 8,
        commitSha: "bc34de5",
        commitUrl: "https://github.com/virajk/expense-tracker/commit/bc34de5",
        snippet: "import { useState } from 'react';",
        scannedAt: NOW - 8 * DAY,
      },
      {
        id: "gh_viraj_node1",
        kind: "github",
        skill: "Node.js",
        repo: "expense-api",
        filePath: "src/index.js",
        line: 6,
        commitSha: "cd56ef6",
        commitUrl: "https://github.com/virajk/expense-api/commit/cd56ef6",
        snippet: "const express = require('express');",
        scannedAt: NOW - 7 * DAY,
      },
      {
        id: "gh_viraj_mongo1",
        kind: "github",
        skill: "MongoDB",
        repo: "expense-api",
        filePath: "src/db.js",
        line: 4,
        commitSha: "de67ab7",
        commitUrl: "https://github.com/virajk/expense-api/commit/de67ab7",
        snippet: "const { MongoClient } = require('mongodb');",
        scannedAt: NOW - 7 * DAY,
      },
    ],
    assessments: [],
    projects: [
      {
        id: "pr_viraj_1",
        kind: "project",
        skill: "React",
        title: "Expense Tracker",
        repo: "expense-tracker",
        faculty: "Prof. R. Kulkarni",
        grade: "B+",
        rubric: [
          { criterion: "Architecture", score: 7, max: 10 },
          { criterion: "Code Quality", score: 7, max: 10 },
          { criterion: "Testing", score: 5, max: 10 },
          { criterion: "Documentation", score: 6, max: 10 },
        ],
        complexity: 2,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// JOBS
// ---------------------------------------------------------------------------

export const JOBS: JobOpening[] = [
  {
    id: "job_finnable",
    company: "Finnable Credit",
    role: "Backend Engineer",
    location: "Pune, India",
    ctc: "12 LPA",
    eligibility: "BE/BTech 2026, CGPA >= 7.5",
    requiredSkills: ["Node.js", "PostgreSQL", "Redis"],
    preferredSkills: ["Docker", "AWS"],
    description:
      "Design and scale Node.js microservices with PostgreSQL and Redis caching for our lending platform.",
    sources: ["Partner Portal", "Alumni Referral", "WhatsApp Forward"],
    postedAt: NOW - 2 * DAY,
    alumniCount: 3,
  },
  {
    id: "job_novos",
    company: "Novos Labs",
    role: "Full Stack Engineer",
    location: "Remote (India)",
    ctc: "14 LPA",
    eligibility: "BE/BTech 2026, CGPA >= 8.0",
    requiredSkills: ["React", "Node.js", "PostgreSQL"],
    preferredSkills: ["Docker", "TypeScript"],
    description:
      "Build a React + Node.js analytics dashboard backed by PostgreSQL with Dockerized deployments.",
    sources: ["Partner Portal"],
    postedAt: NOW - 3 * DAY,
    alumniCount: 1,
  },
  {
    id: "job_atlas",
    company: "Atlas AI",
    role: "Machine Learning Engineer",
    location: "Bengaluru, India",
    ctc: "18 LPA",
    eligibility: "BE/BTech 2026, CGPA >= 8.5",
    requiredSkills: ["Python", "Machine Learning", "SQL"],
    preferredSkills: ["Docker", "TensorFlow", "PostgreSQL"],
    description:
      "Train and deploy ML models in production; ship a recommendation engine with Python & SQL pipelines.",
    sources: ["Alumni Referral"],
    postedAt: NOW - 1 * DAY,
    alumniCount: 2,
  },
  {
    id: "job_helios",
    company: "Helios Systems",
    role: "DevOps Engineer",
    location: "Hyderabad, India",
    ctc: "11 LPA",
    eligibility: "BE/BTech 2026, CGPA >= 7.0",
    requiredSkills: ["Docker", "AWS", "Linux"],
    preferredSkills: ["Kubernetes", "CI/CD"],
    description:
      "Own CI/CD pipelines, containerize services with Docker, and manage AWS infrastructure.",
    sources: ["WhatsApp Forward"],
    postedAt: NOW - 4 * DAY,
    alumniCount: 0,
  },
];

// ---------------------------------------------------------------------------
// APPLICATIONS (shared Kanban)
// ---------------------------------------------------------------------------

export const APPLICATIONS: Application[] = [
  { id: "app_1", studentId: "stu_om", jobId: "job_finnable", stage: "Assessment", appliedAt: NOW - 2 * DAY, fitScore: 88 },
  { id: "app_2", studentId: "stu_mayur", jobId: "job_finnable", stage: "Shortlisted", appliedAt: NOW - 2 * DAY, fitScore: 72 },
  { id: "app_3", studentId: "stu_prakhar", jobId: "job_finnable", stage: "Technical Interview", appliedAt: NOW - 2 * DAY, fitScore: 96 },
  { id: "app_4", studentId: "stu_om", jobId: "job_novos", stage: "Applied", appliedAt: NOW - 1 * DAY, fitScore: 81 },
  { id: "app_5", studentId: "stu_prakhar", jobId: "job_atlas", stage: "HR Interview", appliedAt: NOW - 1 * DAY, fitScore: 99 },
  { id: "app_6", studentId: "stu_mayur", jobId: "job_helios", stage: "Applied", appliedAt: NOW - 3 * DAY, fitScore: 64 },
];

// ---------------------------------------------------------------------------
// INTERVIEW QUESTIONS (crowdsourced)
// ---------------------------------------------------------------------------

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "iq_1",
    company: "Finnable Credit",
    role: "Backend Engineer",
    question: "Explain how Redis pub/sub differs from a message queue like RabbitMQ.",
    category: "Databases",
    difficulty: "Medium",
    reportedBy: "Om Deshmukh",
    reportedAt: NOW - 6 * DAY,
  },
  {
    id: "iq_2",
    company: "Finnable Credit",
    role: "Backend Engineer",
    question: "Design a URL shortener with read-heavy traffic and cache invalidation.",
    category: "System Design",
    difficulty: "Hard",
    reportedBy: "Prakhar Sharma",
    reportedAt: NOW - 5 * DAY,
  },
  {
    id: "iq_3",
    company: "Atlas AI",
    role: "ML Engineer",
    question: "How would you handle class imbalance in a fraud detection model?",
    category: "Machine Learning",
    difficulty: "Medium",
    reportedBy: "Prakhar Sharma",
    reportedAt: NOW - 3 * DAY,
  },
  {
    id: "iq_4",
    company: "Novos Labs",
    role: "Full Stack Engineer",
    question: "Walk through the React reconciliation algorithm and why keys matter.",
    category: "Frontend",
    difficulty: "Medium",
    reportedBy: "Om Deshmukh",
    reportedAt: NOW - 2 * DAY,
  },
];

// Sample inflated resume for the "BS Detector" demo
export const SAMPLE_INFLATED_RESUME = `OM DESHMUKH
Computer Engineering, 2026 | CGPA 8.9

EXPERIENCE & PROJECTS
- Built REST APIs using Node.js and PostgreSQL for an auth service.
- Architected Kubernetes & Redis microservices for a global payments platform.
- Led AWS EKS deployment serving 10M requests/sec with zero downtime.
- Implemented distributed tracing with OpenTelemetry across 40 services.
- Designed a Cassandra cluster with multi-region replication.

SKILLS
Node.js, PostgreSQL, React, Python, Kubernetes, Redis, AWS, Cassandra, Kafka, GraphQL, gRPC, Terraform, Rust, GoLang.`;
