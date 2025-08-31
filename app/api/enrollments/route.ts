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
  const academicYearHeader = req.headers.get("x-academic-year-id") || "";
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

  // Déterminer l'année académique à utiliser
  const activeYear = academicYearHeader
    ? { id: academicYearHeader }
    : await db.academicYear.findFirst({
        where: { schoolId, isActive: true },
        select: { id: true },
      });
  const academicYearId: string | undefined = activeYear?.id;

  const list = await db.enrollment.findMany({
    where: {
      classroomId,
      student: { schoolId },
      ...(academicYearId ? { academicYearId } : {}),
    },
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
    const academicYearHeader = req.headers.get("x-academic-year-id") || "";
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

    // Déterminer l'année académique (priorité au header, sinon active)
    let academicYearId = academicYearHeader;
    if (!academicYearId) {
      const active = await db.academicYear.findFirst({
        where: { schoolId, isActive: true },
      });
      if (!active) {
        return NextResponse.json(
          { error: "Aucune année académique active" },
          { status: 400 }
        );
      }
      academicYearId = active.id;
    }

    // TS: s'assurer que academicYearId est une string
    if (!academicYearId) {
      return NextResponse.json(
        { error: "Année académique invalide" },
        { status: 400 }
      );
    }
    // Contrainte métier: un élève ne peut pas être inscrit deux fois dans la même classe pour la même année
    const duplicate = await db.enrollment.findFirst({
      where: {
        studentId: (parsed.data as any).studentId,
        classroomId: (parsed.data as any).classroomId,
        academicYearId,
      },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "Cet élève est déjà inscrit dans cette classe pour cette année",
        },
        { status: 409 }
      );
    }

    const item = await db.enrollment.create({
      data: { ...parsed.data, academicYearId },
    });
    return NextResponse.json({ enrollment: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
