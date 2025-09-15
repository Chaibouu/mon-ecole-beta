import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { StudentGradeCreateSchema } from "@/schemas/student-grade";

// GET /api/student-grades?studentId=...&termId=...
export async function GET(req: Request) {
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
    "PARENT",
    "STUDENT",
    "USER",
  ]);
  if (!ok)
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || undefined;
  const termId = searchParams.get("termId") || undefined;
  const list = await db.studentGrade.findMany({
    where: {
      student: { schoolId },
      studentId,
      assessment: {
        ...(termId ? { termId } : {}),
        ...(academicYearId && !termId ? { term: { academicYearId } } : {}),
      },
    },
    include: { assessment: true },
  });
  return NextResponse.json({ grades: list });
}

// POST /api/student-grades (TEACHER, ADMIN)
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN", "TEACHER"]);
    if (!ok)
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    const parsed = StudentGradeCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const item = await db.studentGrade.create({ data: parsed.data });
    return NextResponse.json({ grade: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
