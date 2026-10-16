import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

/* -----------------------------------------------------------------------
 * Types mirroring the frontend mock-data shapes (server-safe subset)
 * --------------------------------------------------------------------- */
interface GitHubEvidence {
  id: string;
  kind: "github";
  skill: string;
  repo: string;
  filePath: string;
  line?: number;
  commitSha: string;
  commitUrl: string;
  snippet: string;
}

interface AssessmentEvidence {
  id: string;
  kind: "assessment";
  skill: string;
  score: number;
  passed: boolean;
  warnings: number;
}

interface ProjectEvidence {
  id: string;
  kind: "project";
  skill: string;
  title: string;
  repo: string;
  faculty: string;
  grade: string;
  complexity: number;
}

type Evidence = GitHubEvidence | AssessmentEvidence | ProjectEvidence;

interface StudentPayload {
  name: string;
  roll: string;
  branch: string;
  batch: string;
  cgpa: number;
  githubUser: string;
  verificationScore: number;
  verifiedSkills: string[];
  evidence: Evidence[];
  projects: ProjectEvidence[];
  assessments: AssessmentEvidence[];
  targetJob?: { company: string; role: string };
}

/* -----------------------------------------------------------------------
 * YAML builder — strict RenderCV-compatible schema
 * Zero-inflation: only verified evidence is serialised
 * --------------------------------------------------------------------- */
function buildRenderCVYaml(student: StudentPayload): string {
  const ghEvidence = student.evidence.filter(
    (e): e is GitHubEvidence => e.kind === "github"
  );
  const passedAssessments = student.assessments.filter((a) => a.passed);
  const projects = student.projects;

  const experienceBullets: string[] = [];

  for (const gh of ghEvidence) {
    const proofUrl =
      gh.commitUrl ||
      `https://github.com/${student.githubUser}/${gh.repo}/commit/${gh.commitSha}`;
    experienceBullets.push(
      `- Implemented **${gh.skill}** in \`${gh.repo}/${gh.filePath}${gh.line ? `#L${gh.line}` : ""}\` — commit [${gh.commitSha}](${proofUrl}) [🔗 Proof Verified]`
    );
  }

  for (const p of projects) {
    experienceBullets.push(
      `- Built **"${p.title}"** using ${p.skill} — Faculty: ${p.faculty}, Grade: ${p.grade}, Complexity: ${p.complexity}/5 [🔗 Proof Verified]`
    );
  }

  if (passedAssessments.length > 0) {
    const top = [...passedAssessments].sort((a, b) => b.score - a.score)[0];
    experienceBullets.push(
      `- Cleared proctored **${top.skill}** assessment: ${top.score}/100, ${top.warnings} violations [🔗 Proof Verified]`
    );
  }

  const skillsLine = student.verifiedSkills.join(", ");

  return `cv:
  name: ${student.name}
  location: ${student.branch}, Batch ${student.batch}
  email: ${student.githubUser}@students.drishti.edu
  phone: "+91-XXXXXXXXXX"
  social_networks:
    - network: GitHub
      username: ${student.githubUser}
  sections:
    summary:
      - "Verification Score: ${student.verificationScore}% | CGPA: ${student.cgpa} | Roll: ${student.roll}"
      - "All claims below are cryptographically traceable to GitHub commits or proctored assessments."
    verified_experience_and_projects:
${experienceBullets.map((b) => `      ${b}`).join("\n")}
    verified_skills:
      - label: Technical Skills
        details: "${skillsLine}"

design:
  theme: classic
  font: Source Sans 3
  font_size: 10pt
  page_size: us-letter
  color: "#01579B"
  disable_external_links_in_source_code: false
  page_numbering_style: NAME - Page PAGE_NUMBER of TOTAL_PAGES
  show_last_updated_date: true
  header_font_size: 30 pt
  text_alignment: justified
  margins:
    page:
      top: 2 cm
      bottom: 2 cm
      left: 2 cm
      right: 2 cm
    section_title:
      top: 0.3 cm
      bottom: 0.2 cm
    entry_area:
      left_and_right: 0.2 cm
      vertical_between: 0.2 cm
      date_and_location_width: 4.5 cm
    highlights_area:
      top: 0.10 cm
      left: 0.4 cm
      vertical_between_bullet_points: 0.10 cm
    header:
      vertical_between_name_and_connections: 5 pt
      bottom: 5 pt
      horizontal_between_connections: 0.5 cm
`;
}

/* -----------------------------------------------------------------------
 * Check if RenderCV is installed
 * --------------------------------------------------------------------- */
async function isRenderCVInstalled(): Promise<boolean> {
  try {
    await execAsync("rendercv --version");
    return true;
  } catch {
    try {
      await execAsync("python -m rendercv --version");
      return true;
    } catch {
      return false;
    }
  }
}

/* -----------------------------------------------------------------------
 * Generate PDF via RenderCV subprocess
 * --------------------------------------------------------------------- */
async function generateViaRenderCV(
  yamlContent: string,
  tmpDir: string
): Promise<string | null> {
  const yamlPath = path.join(tmpDir, "resume.yaml");
  await fs.writeFile(yamlPath, yamlContent, "utf-8");

  const cmd1 = `rendercv render "${yamlPath}" --output-folder-name "${tmpDir}"`;
  const cmd2 = `python -m rendercv render "${yamlPath}" --output-folder-name "${tmpDir}"`;

  for (const cmd of [cmd1, cmd2]) {
    try {
      await execAsync(cmd, { timeout: 30000, cwd: tmpDir });
      const files = await fs.readdir(tmpDir);
      const pdfFile = files.find((f) => f.endsWith(".pdf"));
      if (pdfFile) return path.join(tmpDir, pdfFile);
    } catch {
      // try next
    }
  }
  return null;
}

/* -----------------------------------------------------------------------
 * POST /api/generate-verified-resume
 * --------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  let body: StudentPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // === ZERO-INFLATION GATE ===
  const verifiedSet = new Set(body.verifiedSkills);
  const filteredEvidence = body.evidence.filter((e) => verifiedSet.has(e.skill));
  const filteredProjects = body.projects.filter((p) => verifiedSet.has(p.skill));
  const filteredAssessments = body.assessments.filter(
    (a) => a.passed && verifiedSet.has(a.skill)
  );

  const sanitized: StudentPayload = {
    ...body,
    evidence: filteredEvidence,
    projects: filteredProjects,
    assessments: filteredAssessments,
  };

  const yaml = buildRenderCVYaml(sanitized);
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "drishti-resume-"));

  try {
    const hasCLI = await isRenderCVInstalled();

    if (hasCLI) {
      const pdfPath = await generateViaRenderCV(yaml, tmpDir);
      if (pdfPath) {
        const pdfBuffer = await fs.readFile(pdfPath);
        const pdfBase64 = pdfBuffer.toString("base64");
        await fs.rm(tmpDir, { recursive: true, force: true });
        return NextResponse.json({
          yaml,
          pdfBase64,
          pdfMimeType: "application/pdf",
          fallback: false,
          method: "rendercv",
          studentName: body.name,
          verifiedSkillCount: body.verifiedSkills.length,
          bulletCount:
            filteredEvidence.length +
            filteredProjects.length +
            (filteredAssessments.length > 0 ? 1 : 0),
        });
      }
    }

    await fs.rm(tmpDir, { recursive: true, force: true });

    return NextResponse.json({
      yaml,
      fallback: true,
      method: "yaml-only",
      reason: hasCLI
        ? "RenderCV installed but PDF generation failed."
        : "RenderCV not installed. Run: pip install rendercv",
      studentName: body.name,
      verifiedSkillCount: body.verifiedSkills.length,
      bulletCount:
        filteredEvidence.length +
        filteredProjects.length +
        (filteredAssessments.length > 0 ? 1 : 0),
    });
  } catch (err) {
    try { await fs.rm(tmpDir, { recursive: true, force: true }); } catch {}
    return NextResponse.json({
      yaml,
      fallback: true,
      method: "yaml-only",
      reason: "Unexpected server error.",
      error: String(err),
    });
  }
}

/* Health check */
export async function GET() {
  const hasCLI = await isRenderCVInstalled();
  return NextResponse.json({
    status: "ok",
    endpoint: "POST /api/generate-verified-resume",
    renderCVAvailable: hasCLI,
    note: hasCLI
      ? "RenderCV is installed. PDF generation is active."
      : "RenderCV not found. Install via: pip install rendercv",
  });
}
