// Canonical Skill Taxonomy — normalizes variants to canonical tags
// e.g. "ReactJS", "React.js", "react" -> "React"

export type SkillCategory =
  | "Programming"
  | "Web Dev"
  | "Databases"
  | "DevOps"
  | "AI/ML";

export interface SkillDef {
  canonical: string;
  category: SkillCategory;
  variants: string[];
}

export const SKILL_TAXONOMY: SkillDef[] = [
  { canonical: "Python", category: "Programming", variants: ["python", "py", "python3", "python language"] },
  { canonical: "Java", category: "Programming", variants: ["java", "java se", "jdk"] },
  { canonical: "C++", category: "Programming", variants: ["c++", "cpp", "c plus plus"] },
  { canonical: "C", category: "Programming", variants: ["c language", "clang c"] },
  { canonical: "JavaScript", category: "Programming", variants: ["javascript", "js", "ecmascript"] },
  { canonical: "TypeScript", category: "Programming", variants: ["typescript", "ts"] },
  { canonical: "Go", category: "Programming", variants: ["go", "golang"] },
  { canonical: "Rust", category: "Programming", variants: ["rust", "rustlang"] },
  { canonical: "SQL", category: "Programming", variants: ["sql", "structured query language"] },

  { canonical: "React", category: "Web Dev", variants: ["react", "reactjs", "react.js", "react js"] },
  { canonical: "Next.js", category: "Web Dev", variants: ["next", "nextjs", "next.js"] },
  { canonical: "Node.js", category: "Web Dev", variants: ["node", "nodejs", "node.js"] },
  { canonical: "Express", category: "Web Dev", variants: ["express", "expressjs", "express.js"] },
  { canonical: "Vue", category: "Web Dev", variants: ["vue", "vuejs", "vue.js"] },
  { canonical: "Angular", category: "Web Dev", variants: ["angular", "angularjs", "angular.js"] },
  { canonical: "Tailwind CSS", category: "Web Dev", variants: ["tailwind", "tailwindcss", "tailwind css"] },
  { canonical: "HTML", category: "Web Dev", variants: ["html", "html5"] },
  { canonical: "CSS", category: "Web Dev", variants: ["css", "css3"] },
  { canonical: "Django", category: "Web Dev", variants: ["django"] },
  { canonical: "Flask", category: "Web Dev", variants: ["flask"] },
  { canonical: "FastAPI", category: "Web Dev", variants: ["fastapi", "fast api"] },
  { canonical: "Spring Boot", category: "Web Dev", variants: ["spring", "spring boot", "springboot"] },

  { canonical: "PostgreSQL", category: "Databases", variants: ["postgres", "postgresql", "pg"] },
  { canonical: "MySQL", category: "Databases", variants: ["mysql"] },
  { canonical: "MongoDB", category: "Databases", variants: ["mongo", "mongodb", "mongo db"] },
  { canonical: "Redis", category: "Databases", variants: ["redis", "ioredis"] },
  { canonical: "SQLite", category: "Databases", variants: ["sqlite", "sqlite3"] },

  { canonical: "Docker", category: "DevOps", variants: ["docker", "containerization"] },
  { canonical: "Kubernetes", category: "DevOps", variants: ["kubernetes", "k8s"] },
  { canonical: "AWS", category: "DevOps", variants: ["aws", "amazon web services"] },
  { canonical: "GCP", category: "DevOps", variants: ["gcp", "google cloud"] },
  { canonical: "CI/CD", category: "DevOps", variants: ["ci/cd", "cicd", "github actions", "jenkins"] },
  { canonical: "Linux", category: "DevOps", variants: ["linux", "bash", "shell"] },
  { canonical: "Nginx", category: "DevOps", variants: ["nginx"] },

  { canonical: "Machine Learning", category: "AI/ML", variants: ["ml", "machine learning"] },
  { canonical: "TensorFlow", category: "AI/ML", variants: ["tensorflow", "tf"] },
  { canonical: "PyTorch", category: "AI/ML", variants: ["pytorch", "torch"] },
  { canonical: "scikit-learn", category: "AI/ML", variants: ["scikit", "sklearn", "scikit-learn"] },
  { canonical: "NLP", category: "AI/ML", variants: ["nlp", "natural language processing"] },
  { canonical: "OpenCV", category: "AI/ML", variants: ["opencv", "cv2"] },
];

const VARIANT_INDEX: Record<string, string> = {};
for (const def of SKILL_TAXONOMY) {
  VARIANT_INDEX[def.canonical.toLowerCase()] = def.canonical;
  for (const v of def.variants) VARIANT_INDEX[v.toLowerCase()] = def.canonical;
}

export function normalizeSkill(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/[^a-z0-9+#. ]/g, "").trim();
  return VARIANT_INDEX[key] ?? raw.trim();
}

export function normalizeSkills(raw: string[]): string[] {
  const out = new Set<string>();
  for (const r of raw) {
    const n = normalizeSkill(r);
    if (n) out.add(n);
  }
  return Array.from(out);
}

export function canonicalFor(raw: string): { raw: string; canonical: string; changed: boolean } {
  const canonical = normalizeSkill(raw);
  return { raw, canonical, changed: canonical.toLowerCase() !== raw.trim().toLowerCase() };
}

export function categoryOf(canonical: string): SkillCategory {
  const def = SKILL_TAXONOMY.find((d) => d.canonical === canonical);
  return def?.category ?? "Programming";
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  "Programming",
  "Web Dev",
  "Databases",
  "DevOps",
  "AI/ML",
];

export function skillsByCategory(): Record<SkillCategory, string[]> {
  const map: Record<SkillCategory, string[]> = {
    Programming: [],
    "Web Dev": [],
    Databases: [],
    DevOps: [],
    "AI/ML": [],
  };
  for (const def of SKILL_TAXONOMY) map[def.category].push(def.canonical);
  return map;
}
