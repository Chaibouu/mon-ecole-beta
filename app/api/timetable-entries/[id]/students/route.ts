import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// GET /api/timetable-entries/[id]/students
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const schoolId = req.headers.get("x-school-id") || "";
  const userId = await getUserIdFromToken(token);
  if (!userId)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const ok = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "TEACHER",
    "PARENT",
    "STUDENT",
    "USER",
  ]);
  if (!ok)
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

  const te = await db.timetableEntry.findFirst({
    where: { id, classroom: { schoolId } },
    select: { classroomId: true, academicYearId: true },
  });
  if (!te)
    return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });

  const enrollments = await db.enrollment.findMany({
    where: { classroomId: te.classroomId, academicYearId: te.academicYearId },
    include: { student: { include: { user: true } } },
    orderBy: { enrolledAt: "asc" },
  });

  const students = enrollments.map(e => ({
    id: e.student.id,
    user: e.student.user,
    matricule: e.student.matricule,
  }));
  return NextResponse.json({ students });
}
