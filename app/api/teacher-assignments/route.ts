import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { TeacherAssignmentCreateSchema } from "@/schemas/teacher-assignment";
// import { TeacherAssignmentCreateSchema } from "@/schemas/academics";

// GET /api/teacher-assignments?classroomId=...
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const schoolId = req.headers.get("x-school-id") || "";
  const academicYearId = req.headers.get("x-academic-year-id") || "";
  const userId = await getUserIdFromToken(token);
  if (!userId)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const ok = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "TEACHER",
    "USER",
  ]);
  if (!ok)
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  const classroomId = req.nextUrl.searchParams.get("classroomId") || undefined;
  const list = await db.teacherAssignment.findMany({
    where: {
      academicYear: { schoolId },
      classroomId,
      ...(academicYearId ? { academicYearId } : {}),
    },
    include: {
      teacher: { include: { user: true } },
      subject: true,
      classroom: true,
    },
  });
  return NextResponse.json({ teacherAssignments: list });
}

// POST /api/teacher-assignments (ADMIN)
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const academicYearHeader = req.headers.get("x-academic-year-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok)
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

    const parsed = TeacherAssignmentCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    let { teacherId, subjectId, classroomId, academicYearId } = parsed.data;
    if (!academicYearId) {
      academicYearId = academicYearHeader;
      if (!academicYearId) {
        const active = await db.academicYear.findFirst({
          where: { schoolId, isActive: true },
        });
        if (!active)
          return NextResponse.json(
            { error: "Aucune année académique active" },
            { status: 400 }
          );
        academicYearId = active.id;
      }
    }
    if (!academicYearId) {
      return NextResponse.json(
        { error: "Année académique invalide" },
        { status: 400 }
      );
    }
    // Éviter les doublons d'affectation
    const duplicate = await db.teacherAssignment.findFirst({
      where: { teacherId, subjectId, classroomId, academicYearId },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Cette affectation existe déjà pour cette année" },
        { status: 409 }
      );
    }
    const item = await db.teacherAssignment.create({
      data: { teacherId, subjectId, classroomId, academicYearId },
    });
    return NextResponse.json({ teacherAssignment: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
