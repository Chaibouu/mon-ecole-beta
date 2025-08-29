import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { EnrollmentCreateSchema } from "@/schemas/enrollment";

// GET /api/enrollments?classroomId=...&studentId=...
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const schoolId = req.headers.get("x-school-id") || "";
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
  const { searchParams } = new URL(req.url);
  const classroomId = searchParams.get("classroomId") || undefined;
  const studentId = searchParams.get("studentId") || undefined;
  const list = await db.enrollment.findMany({
    where: { classroomId, student: { schoolId } },
    include: {
      student: { include: { user: true } },
      classroom: true,
      academicYear: true,
    },
  });
  return NextResponse.json({ enrollments: list });
}

// POST /api/enrollments (ADMIN)
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok)
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    const parsed = EnrollmentCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const item = await db.enrollment.create({ data: parsed.data });
    return NextResponse.json({ enrollment: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

