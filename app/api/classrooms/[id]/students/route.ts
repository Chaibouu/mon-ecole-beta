import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// GET /api/classrooms/[id]/students
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const schoolId = req.headers.get("x-school-id") || "";

  console.log("API Debug - Token:", token ? "Present" : "Missing");
  console.log("API Debug - SchoolId:", schoolId);

  const userId = await getUserIdFromToken(token);
  console.log("API Debug - UserId:", userId);

  if (!userId) {
    console.log("API Debug - No userId found");
    return NextResponse.json(
      { error: "Token invalide ou manquant" },
      { status: 401 }
    );
  }

  const roleOk = await requireSchoolRole(userId, schoolId, [
    "SUPER_ADMIN",
    "ADMIN",
    "TEACHER",
  ]);

  console.log("API Debug - Role check:", roleOk);

  if (!roleOk) {
    console.log("API Debug - Role check failed");
    return NextResponse.json(
      { error: "Accès interdit - rôle insuffisant" },
      { status: 403 }
    );
  }

  try {
    const resolvedParams = await params;
    const classroomId = resolvedParams.id;

    // Verify classroom belongs to school
    const classroom = await db.classroom.findFirst({
      where: { id: classroomId, schoolId },
      select: { id: true, name: true },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classe non trouvée" },
        { status: 404 }
      );
    }

    // Get active academic year
    const academicYear = await db.academicYear.findFirst({
      where: { schoolId, isActive: true },
      select: { id: true },
    });

    if (!academicYear) {
      return NextResponse.json(
        { error: "Aucune année académique active" },
        { status: 404 }
      );
    }

    // Get enrolled students for this classroom and academic year
    const enrollments = await db.enrollment.findMany({
      where: {
        classroomId,
        academicYearId: academicYear.id,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          user: {
            name: "asc",
          },
        },
      },
    });

    const students = enrollments.map(enrollment => ({
      id: enrollment.student.id,
      user: enrollment.student.user,
      enrollmentId: enrollment.id,
    }));

    return NextResponse.json({
      success: true,
      classroom: {
        id: classroom.id,
        name: classroom.name,
      },
      academicYear: {
        id: academicYear.id,
      },
      students,
      total: students.length,
    });
  } catch (error) {
    console.error("Error fetching classroom students:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des élèves" },
      { status: 500 }
    );
  }
}
