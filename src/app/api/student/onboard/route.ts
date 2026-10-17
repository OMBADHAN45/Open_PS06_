import { NextRequest, NextResponse } from "next/server";
import { type StudentSignupPayload } from "@/lib/student-signup-types";

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as StudentSignupPayload;

    if (!payload || !payload.profileData) {
      return NextResponse.json(
        { error: "Invalid payload: profileData is required" },
        { status: 400 }
      );
    }

    const { profileData, pendingSkills } = payload;

    // Field validations
    if (!profileData.fullName || profileData.fullName.trim().length < 2) {
      return NextResponse.json(
        { error: "Full Legal Name is required" },
        { status: 400 }
      );
    }

    if (!profileData.personalEmail || !profileData.personalEmail.includes("@")) {
      return NextResponse.json(
        { error: "Valid Personal Email is required" },
        { status: 400 }
      );
    }

    if (!profileData.phone || profileData.phone.trim().length < 8) {
      return NextResponse.json(
        { error: "Primary Phone Number is required" },
        { status: 400 }
      );
    }

    if (!profileData.location?.city || !profileData.location?.state) {
      return NextResponse.json(
        { error: "City and State are required" },
        { status: 400 }
      );
    }

    if (!profileData.education?.college?.name || !profileData.education?.college?.branch) {
      return NextResponse.json(
        { error: "College Name and Department are required" },
        { status: 400 }
      );
    }

    if (!profileData.links?.github || !profileData.links?.linkedin) {
      return NextResponse.json(
        { error: "Mandatory links (LinkedIn and GitHub) are required" },
        { status: 400 }
      );
    }

    // Generate unique student record identifier
    const studentId = `stu_${Date.now()}`;

    // Return success response with queued skills isolated from active profile
    return NextResponse.json({
      success: true,
      message: "Student registration & onboarding completed successfully.",
      studentId,
      profileSummary: {
        fullName: profileData.fullName,
        email: profileData.personalEmail,
        college: profileData.education.college.name,
        branch: profileData.education.college.branch,
        professionalStatus: profileData.professionalStatus,
        activeProfileSkillsCount: 0, // CRITICAL: 0 skills added directly
        pendingAssessmentQueueCount: (pendingSkills || []).length,
      },
      queuedSkills: pendingSkills || [],
      dashboardUrl: "/student",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
