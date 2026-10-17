export interface LocationInfo {
  city: string;
  state: string;
  pinCode: string;
}

export interface TenthEducation {
  board: string;
  score: number;
  year: number;
  schoolName?: string;
}

export interface TwelfthEducation {
  board: string;
  stream: string;
  score: number;
  year: number;
  collegeName?: string;
}

export interface CollegeEducation {
  name: string;
  branch: string;
  gradYear: number;
  cgpa: number;
}

export interface StudentLinks {
  linkedin: string; // Mandatory
  github: string;   // Mandatory
  leetcode?: string;
  kaggle?: string;
  hackerrank?: string;
  codeforces?: string;
  portfolio?: string;
}

export interface EmploymentDetails {
  company: string;
  role: string;
}

export interface StudentProfileData {
  personalEmail: string;
  fullName: string;
  phone: string;
  bio: string;
  location: LocationInfo;
  education: {
    tenth: TenthEducation;
    twelfth: TwelfthEducation;
    college: CollegeEducation;
  };
  professionalStatus: "Fresher" | "Employed";
  employmentDetails?: EmploymentDetails;
  links: StudentLinks;
}

export interface StudentSignupPayload {
  // 1. Goes directly to Profile & Resume
  profileData: StudentProfileData;

  // 2. ISOLATED: Goes to Assessment Queue only (NOT added to active profile or resume upon signup)
  pendingSkills: string[];
}

export const CANONICAL_TECHNICAL_SKILLS: { name: string; category: string }[] = [
  // Languages
  { name: "Python", category: "Languages" },
  { name: "JavaScript", category: "Languages" },
  { name: "TypeScript", category: "Languages" },
  { name: "Java", category: "Languages" },
  { name: "C++", category: "Languages" },
  { name: "C", category: "Languages" },
  { name: "Go", category: "Languages" },
  { name: "Rust", category: "Languages" },
  { name: "SQL", category: "Languages" },

  // Web & Backend
  { name: "React", category: "Web Dev" },
  { name: "Next.js", category: "Web Dev" },
  { name: "Node.js", category: "Web Dev" },
  { name: "Express", category: "Web Dev" },
  { name: "Tailwind CSS", category: "Web Dev" },
  { name: "FastAPI", category: "Web Dev" },
  { name: "Django", category: "Web Dev" },
  { name: "Flask", category: "Web Dev" },
  { name: "Spring Boot", category: "Web Dev" },
  { name: "GraphQL", category: "Web Dev" },

  // Databases & Caches
  { name: "PostgreSQL", category: "Databases" },
  { name: "MySQL", category: "Databases" },
  { name: "MongoDB", category: "Databases" },
  { name: "Redis", category: "Databases" },
  { name: "SQLite", category: "Databases" },
  { name: "Prisma", category: "Databases" },

  // DevOps & Cloud
  { name: "Docker", category: "DevOps" },
  { name: "Kubernetes", category: "DevOps" },
  { name: "AWS", category: "DevOps" },
  { name: "GCP", category: "DevOps" },
  { name: "CI/CD", category: "DevOps" },
  { name: "Linux", category: "DevOps" },
  { name: "GitHub Actions", category: "DevOps" },

  // AI & ML
  { name: "Machine Learning", category: "AI / ML" },
  { name: "PyTorch", category: "AI / ML" },
  { name: "TensorFlow", category: "AI / ML" },
  { name: "scikit-learn", category: "AI / ML" },
  { name: "NLP", category: "AI / ML" },
  { name: "Computer Vision", category: "AI / ML" },
  { name: "Deep Learning", category: "AI / ML" },
];

export function countWords(str: string): number {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function createDefaultSignupPayload(): StudentSignupPayload {
  return {
    profileData: {
      personalEmail: "aarav.sharma@gmail.com",
      fullName: "Aarav Sharma",
      phone: "+91 98765 43210",
      bio: "Aspiring full-stack engineer passionate about high-concurrency distributed systems, microservices architecture, and automated CI/CD deployment pipelines.",
      location: {
        city: "Pune",
        state: "Maharashtra",
        pinCode: "411005",
      },
      education: {
        tenth: {
          schoolName: "Delhi Public School",
          board: "CBSE",
          score: 95.2,
          year: 2020,
        },
        twelfth: {
          collegeName: "Fergusson Junior College",
          board: "State Board (HSC)",
          stream: "Science (PCM)",
          score: 93.6,
          year: 2022,
        },
        college: {
          name: "COEP Technological University, Pune",
          branch: "Computer Science & Engineering",
          gradYear: 2026,
          cgpa: 9.18,
        },
      },
      professionalStatus: "Fresher",
      links: {
        linkedin: "https://linkedin.com/in/aarav-sharma-dev",
        github: "https://github.com/aaravsharma-dev",
        leetcode: "https://leetcode.com/u/aaravsharma",
        portfolio: "https://aaravsharma.dev",
      },
    },
    pendingSkills: ["React", "Python", "Machine Learning", "Docker"],
  };
}
