import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { ClassroomUpdateSchema } from "@/schemas/classroom";

// GET /api/classrooms/[id] - détail d'une classe
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const schoolId = req.headers.get("x-school-id") || "";
  const academicYearHeader = req.headers.get("x-academic-year-id") || "";
  const userId = await getUserIdFromToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "TEACHER",
    "PARENT",
    "STUDENT",
    "USER",
  ]);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Déterminer l'année académique active
  const activeYear = academicYearHeader
    ? { id: academicYearHeader }
    : await db.academicYear.findFirst({
        where: { schoolId, isActive: true },
        select: { id: true },
      });
  const academicYearId = activeYear?.id;

  const item = await db.classroom.findFirst({
    where: { id, schoolId },
    include: {
      gradeLevel: {
        include: {
          gradeLevelSubjects: {
            include: { subject: true },
          },
        },
      },
      headTeacher: {
        include: { user: true },
      },
      enrollments: academicYearId
        ? {
            where: { academicYearId },
            include: {
              student: {
                include: { user: true },
              },
            },
          }
        : false,
      teacherAssignments: academicYearId
        ? {
            where: { academicYearId },
            include: {
              teacher: {
                include: { user: true },
              },
              subject: true,
            },
          }
        : false,
      classroomSubjects: {
        include: { subject: true },
      },
    },
  });

  if (!item) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  // Construire un fallback de coefficients par niveau
  const levelCoeffMap = new Map<string, number>();
  item.gradeLevel?.gradeLevelSubjects?.forEach((gls: any) => {
    levelCoeffMap.set(gls.subjectId, gls.coefficient);
  });

  // Construire la liste des matières à partir du NIVEAU (source unique)
  const classroomSubjectsResolved = (
    item.gradeLevel?.gradeLevelSubjects || []
  ).map((gls: any) => ({
    id: `gls:${gls.id}`,
    subjectId: gls.subjectId,
    subject: gls.subject,
    coefficientResolved: gls.coefficient ?? 1,
  }));

  // Calculer des statistiques
  const totalStudents = item.enrollments?.length || 0;
  const totalTeachers = new Set(
    item.teacherAssignments?.map(ta => ta.teacherId) || []
  ).size;
  const totalSubjects = classroomSubjectsResolved.length;

  const classroomWithStats = {
    ...item,
    classroomSubjects: classroomSubjectsResolved,
    stats: {
      totalStudents,
      totalTeachers,
      totalSubjects,
    },
  };

  return NextResponse.json({ classroom: classroomWithStats });
}

// PATCH /api/classrooms/[id] - modifier (ADMIN)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const parsed = ClassroomUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const item = await db.classroom.update({
      where: { id, schoolId },
      data: parsed.data,
    });
    return NextResponse.json({ classroom: item });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/classrooms/[id] - supprimer (ADMIN)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await db.classroom.delete({
      where: { id, schoolId },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
