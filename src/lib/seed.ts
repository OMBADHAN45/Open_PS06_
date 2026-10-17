// ===========================================================================
// DRISHTI Platform — Production-Grade Relational Database Seed Script
// Runnable via: npx tsx src/lib/seed.ts or importable into Prisma / Mongoose
// ===========================================================================

import {
  COMPANIES,
  JOBS,
  STUDENTS,
  APPLICATIONS,
  INTERVIEW_QUESTIONS,
  PROCTORING_SESSION_LOGS,
  SAMPLE_INFLATED_RESUME,
  SAMPLE_INFLATED_RESUME_DEV_OPS,
  SAMPLE_INFLATED_RESUME_AI_ML,
  type Company,
  type JobOpening,
  type StudentProfile,
  type Application,
  type InterviewQuestion,
  type ProctorLogEntry,
} from "./mock-data";

export interface DatabaseSeedBundle {
  companies: Company[];
  jobs: JobOpening[];
  students: StudentProfile[];
  applications: Application[];
  interviewQuestions: InterviewQuestion[];
  proctoringLogs: Record<string, ProctorLogEntry[]>;
  sampleResumes: {
    backendSystems: string;
    cloudDevOps: string;
    aiMachineLearning: string;
  };
  metadata: {
    platform: string;
    version: string;
    generatedAt: string;
    recordCounts: {
      companies: number;
      jobs: number;
      students: number;
      verifiedEvidenceRecords: number;
      applications: number;
      interviewQuestions: number;
      proctoringSessions: number;
    };
  };
}

/**
 * Returns the complete relational JSON seed bundle ready for Prisma/Mongoose injection
 */
export function generateSeedPayload(): DatabaseSeedBundle {
  const verifiedEvidenceRecords = STUDENTS.reduce(
    (acc, st) => acc + st.evidence.length + st.assessments.length + st.projects.length,
    0
  );

  return {
    companies: COMPANIES,
    jobs: JOBS,
    students: STUDENTS,
    applications: APPLICATIONS,
    interviewQuestions: INTERVIEW_QUESTIONS,
    proctoringLogs: PROCTORING_SESSION_LOGS,
    sampleResumes: {
      backendSystems: SAMPLE_INFLATED_RESUME,
      cloudDevOps: SAMPLE_INFLATED_RESUME_DEV_OPS,
      aiMachineLearning: SAMPLE_INFLATED_RESUME_AI_ML,
    },
    metadata: {
      platform: "DRISHTI — Evidence-Backed Campus Placement Operating System",
      version: "2.4.0",
      generatedAt: new Date().toISOString(),
      recordCounts: {
        companies: COMPANIES.length,
        jobs: JOBS.length,
        students: STUDENTS.length,
        verifiedEvidenceRecords,
        applications: APPLICATIONS.length,
        interviewQuestions: INTERVIEW_QUESTIONS.length,
        proctoringSessions: Object.keys(PROCTORING_SESSION_LOGS).length,
      },
    },
  };
}

/**
 * Validates foreign key and relational integrity across all generated seed tables
 */
export function validateRelationalIntegrity(): {
  isValid: boolean;
  errors: string[];
  summary: Record<string, number>;
} {
  const errors: string[] = [];
  const studentIds = new Set(STUDENTS.map((s) => s.id));
  const jobIds = new Set(JOBS.map((j) => j.id));
  const companyIds = new Set(COMPANIES.map((c) => c.id));

  // 1. Verify Job -> Company relationships
  JOBS.forEach((j) => {
    if (j.companyId && !companyIds.has(j.companyId)) {
      errors.push(`Job ${j.id} references non-existent companyId: ${j.companyId}`);
    }
  });

  // 2. Verify Application -> Student & Job relationships
  APPLICATIONS.forEach((a) => {
    if (!studentIds.has(a.studentId)) {
      errors.push(`Application ${a.id} references missing studentId: ${a.studentId}`);
    }
    if (!jobIds.has(a.jobId)) {
      errors.push(`Application ${a.id} references missing jobId: ${a.jobId}`);
    }
    if (!a.matchExplanation) {
      errors.push(`Application ${a.id} missing explainable matchExplanation string`);
    }
  });

  // 3. Verify Student -> Skill & Evidence relationships
  STUDENTS.forEach((st) => {
    const assessmentIds = new Set(st.assessments.map((a) => a.id));
    const evidenceIds = new Set(st.evidence.map((e) => e.id));

    st.skills.forEach((sk) => {
      if (sk.assessmentId && !assessmentIds.has(sk.assessmentId)) {
        errors.push(`Student ${st.name} skill ${sk.canonical} references missing assessmentId: ${sk.assessmentId}`);
      }
      if (sk.githubIds) {
        sk.githubIds.forEach((gid) => {
          if (!evidenceIds.has(gid)) {
            errors.push(`Student ${st.name} skill ${sk.canonical} references missing githubId: ${gid}`);
          }
        });
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    summary: {
      companiesVerified: COMPANIES.length,
      jobsVerified: JOBS.length,
      studentsVerified: STUDENTS.length,
      applicationsVerified: APPLICATIONS.length,
    },
  };
}

/**
 * Terminal Runner: Executed when run directly as a script
 */
export function runSeed(): void {
  const bundle = generateSeedPayload();
  const integrity = validateRelationalIntegrity();

  console.log("=================================================================");
  console.log(" DRISHTI — RELATIONAL DATABASE SEED COMPILATION COMPLETE");
  console.log("=================================================================");
  console.log(`Generated At: ${bundle.metadata.generatedAt}`);
  console.log(`Platform:     ${bundle.metadata.platform}`);
  console.log(`Relational Integrity: ${integrity.isValid ? "✅ PASS (0 Errors)" : "❌ FAIL"}`);
  console.log("-----------------------------------------------------------------");
  console.log(" ENTITY RECORD COUNTS:");
  console.log(`  - Companies:               ${bundle.metadata.recordCounts.companies}`);
  console.log(`  - Job Openings:            ${bundle.metadata.recordCounts.jobs} (Includes deduplication test pairs)`);
  console.log(`  - Student Profiles:        ${bundle.metadata.recordCounts.students} (Om, Mayur, Prakhar, Viraj, Aarav, Sneha, Ananya)`);
  console.log(`  - Cryptographic Evidence:  ${bundle.metadata.recordCounts.verifiedEvidenceRecords} (GitHub commits, assessments, rubrics)`);
  console.log(`  - Pipeline Applications:   ${bundle.metadata.recordCounts.applications} (Distributed across 6 Kanban stages)`);
  console.log(`  - Interview Questions:     ${bundle.metadata.recordCounts.interviewQuestions}`);
  console.log(`  - Proctoring Anomaly Logs: ${bundle.metadata.recordCounts.proctoringSessions}`);
  console.log(`  - Inflated Test Resumes:   3 distinct profiles for BS Detector`);
  console.log("=================================================================");

  if (!integrity.isValid) {
    console.error("Integrity validation errors:", integrity.errors);
  }
}

// Auto-run if executed in Node CLI
if (typeof process !== "undefined" && process.argv && process.argv[1]?.includes("seed")) {
  runSeed();
}

export {
  COMPANIES,
  JOBS,
  STUDENTS,
  APPLICATIONS,
  INTERVIEW_QUESTIONS,
  PROCTORING_SESSION_LOGS,
  SAMPLE_INFLATED_RESUME,
  SAMPLE_INFLATED_RESUME_DEV_OPS,
  SAMPLE_INFLATED_RESUME_AI_ML,
};
