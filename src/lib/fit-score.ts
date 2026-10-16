// Fit Score calculation for student <-> job matching
// Formula:
//   Fit = 0.65 * (verifiedRequired / totalRequired)
//       + 0.25 * (verifiedPreferred / totalPreferred)
//       + 0.10 * projectComplexityFactor
// All inputs normalized to [0,1].

import type { StudentProfile, JobOpening, EvidenceRecord } from "./mock-data";

export interface WeightConfig {
  requiredWeight: number; // default 0.65
  preferredWeight: number; // default 0.25
  projectWeight: number; // default 0.10
}

export const DEFAULT_WEIGHTS: WeightConfig = {
  requiredWeight: 0.65,
  preferredWeight: 0.25,
  projectWeight: 0.10,
};

export interface FitResult {
  score: number; // 0..100
  verifiedRequired: string[];
  missingRequired: string[];
  verifiedPreferred: string[];
  missingPreferred: string[];
  projectComplexity: number; // 0..1
  explanation: string;
  breakdown: { requiredRatio: number; preferredRatio: number; projectFactor: number };
}

export function verifiedSkillsFor(student: StudentProfile): Set<string> {
  return new Set(
    student.skills.filter((s) => s.status === "verified").map((s) => s.canonical)
  );
}

export function projectComplexityFactor(student: StudentProfile): number {
  if (!student.projects.length) return 0;
  // avg of project complexity (1..5) mapped to 0..1
  const sum = student.projects.reduce((acc, p) => acc + p.complexity, 0);
  return Math.min(1, sum / (student.projects.length * 5));
}

export function computeFit(
  student: StudentProfile,
  job: JobOpening,
  weights: WeightConfig = DEFAULT_WEIGHTS
): FitResult {
  const verified = verifiedSkillsFor(student);

  const verifiedRequired = job.requiredSkills.filter((s) => verified.has(s));
  const missingRequired = job.requiredSkills.filter((s) => !verified.has(s));
  const verifiedPreferred = job.preferredSkills.filter((s) => verified.has(s));
  const missingPreferred = job.preferredSkills.filter((s) => !verified.has(s));

  const requiredRatio = job.requiredSkills.length
    ? verifiedRequired.length / job.requiredSkills.length
    : 1;
  const preferredRatio = job.preferredSkills.length
    ? verifiedPreferred.length / job.preferredSkills.length
    : 1;
  const projectFactor = projectComplexityFactor(student);

  const wTotal = weights.requiredWeight + weights.preferredWeight + weights.projectWeight || 1;
  const wr = weights.requiredWeight / wTotal;
  const wp = weights.preferredWeight / wTotal;
  const wpr = weights.projectWeight / wTotal;

  const score =
    (wr * requiredRatio + wp * preferredRatio + wpr * projectFactor) * 100;

  const explanation = buildExplanation({
    score,
    verifiedRequired,
    missingRequired,
    verifiedPreferred,
    student,
  });

  return {
    score: Math.round(score),
    verifiedRequired,
    missingRequired,
    verifiedPreferred,
    missingPreferred,
    projectComplexity: projectFactor,
    explanation,
    breakdown: {
      requiredRatio: Math.round(requiredRatio * 100) / 100,
      preferredRatio: Math.round(preferredRatio * 100) / 100,
      projectFactor: Math.round(projectFactor * 100) / 100,
    },
  };
}

function buildExplanation(args: {
  score: number;
  verifiedRequired: string[];
  missingRequired: string[];
  verifiedPreferred: string[];
  student: StudentProfile;
}): string {
  const { score, verifiedRequired, missingRequired, verifiedPreferred, student } = args;
  const parts: string[] = [];
  const tier =
    score >= 85 ? "Strong match" : score >= 70 ? "Good match" : score >= 50 ? "Partial match" : "Weak match";
  parts.push(`${tier} (${Math.round(score)}%)`);
  if (verifiedRequired.length) {
    parts.push(
      `backed by verified ${verifiedRequired.slice(0, 3).join(", ")} implementations`
    );
    const repos = new Set<string>();
    student.evidence.forEach((e) => {
      if (e.kind === "github" && verifiedRequired.includes(e.skill)) repos.add(e.repo);
    });
    if (repos.size) parts.push(`across ${repos.size} ${repos.size === 1 ? "repository" : "repositories"}`);
  }
  if (student.assessments.length) {
    const top = [...student.assessments].sort((a, b) => b.score - a.score)[0];
    parts.push(`and a ${top.score}% ${top.skill} proctored score`);
  }
  if (missingRequired.length) {
    parts.push(`; gaps remain in ${missingRequired.slice(0, 2).join(", ")}`);
  }
  return parts.join(" ") + ".";
}

export function fitTier(score: number): {
  label: string;
  color: string;
  text: string;
} {
  if (score >= 85) return { label: "Strong", color: "var(--drishti-emerald)", text: "#10b981" };
  if (score >= 70) return { label: "Good", color: "var(--drishti-blue)", text: "#9fe0ff" };
  if (score >= 50) return { label: "Partial", color: "var(--drishti-amber)", text: "#f59e0b" };
  return { label: "Weak", color: "var(--drishti-crimson)", text: "#ef4444" };
}
