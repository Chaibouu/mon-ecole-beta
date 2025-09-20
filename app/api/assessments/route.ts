import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { AssessmentCreateSchema } from "@/schemas/assessment";

// GET /api/assessments?classroomId=...&termId=...&subjectId=...&teacherId=...&search=...&type=...
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
  const classroomId = searchParams.get("classroomId") || undefined;
  const termId = searchParams.get("termId") || undefined;
  const subjectId = searchParams.get("subjectId") || undefined;
  const teacherId = searchParams.get("teacherId") || undefined;
  const search = searchParams.get("search") || undefined;
  const type = searchParams.get("type") || undefined;

  // Build where clause
  const where: any = {
    schoolId,
    ...(classroomId && { classroomId }),
    ...(termId && { termId }),
    ...(subjectId && { subjectId }),
    ...(teacherId && { createdById: teacherId }),
    ...(type && { type }),
    ...(academicYearId && !termId && { term: { academicYearId } }),
  };

  // Add search functionality
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { subject: { name: { contains: search, mode: "insensitive" } } },
      { classroom: { name: { contains: search, mode: "insensitive" } } },
      {
        createdBy: {
          user: { name: { contains: search, mode: "insensitive" } },
        },
      },
      {
        createdBy: {
          user: { firstName: { contains: search, mode: "insensitive" } },
        },
      },
      {
        createdBy: {
          user: { lastName: { contains: search, mode: "insensitive" } },
        },
      },
      {
        createdBy: {
          user: { email: { contains: search, mode: "insensitive" } },
        },
      },
      { assessmentType: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const list = await db.assessment.findMany({
    where,
    include: {
      assessmentType: true,
      subject: true,
      classroom: { include: { gradeLevel: true } },
      term: true,
      createdBy: { include: { user: true } },
    },
    orderBy: [{ assignedAt: "desc" }],
  });
  return NextResponse.json({ assessments: list });
}

// POST /api/assessments (TEACHER, ADMIN)
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const academicYearId = req.headers.get("x-academic-year-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN", "TEACHER"]);
    if (!ok)
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    const parsed = AssessmentCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const data = parsed.data;
    // Phase 1: si assessmentTypeId manquant, mapper depuis type
    let assessmentTypeId = (data as any).assessmentTypeId as string | undefined;
    if (!assessmentTypeId && (data as any).type) {
      const legacyType = (data as any).type as string;
      const mapped = await db.assessmentTypeModel.findFirst({
        where: { schoolId, OR: [{ code: legacyType }, { name: legacyType }] },
        select: { id: true },
      });
      assessmentTypeId = mapped?.id;
    }

    // Déterminer l'auteur enseignant de l'évaluation
    let createdByTeacherId: string | null = null;
    const teacherProfile = await db.teacherProfile.findFirst({
      where: { userId, schoolId },
      select: { id: true },
    });
    if (teacherProfile?.id) {
      createdByTeacherId = teacherProfile.id;
    } else {
      // Fallback: si l'utilisateur n'est pas professeur (ex: ADMIN),
      // associer l'évaluation au professeur affecté à la classe/matière (et année scolaire si fournie)
      const assignment = await db.teacherAssignment.findFirst({
        where: {
          classroomId: data.classroomId,
          subjectId: data.subjectId,
          ...(academicYearId ? { academicYearId } : {}),
        },
        select: { teacherId: true },
      });
      if (assignment?.teacherId) createdByTeacherId = assignment.teacherId;
    }
    if (!createdByTeacherId) {
      return NextResponse.json(
        { error: "Aucun professeur assigné pour cette classe/matière" },
        { status: 400 }
      );
    }

    const item = await db.assessment.create({
      data: {
        subjectId: data.subjectId,
        classroomId: data.classroomId,
        termId: data.termId,
        title: data.title,
        description: data.description,
        type: (data as any).type ?? "EXAM",
        assignedAt: data.assignedAt ? new Date(data.assignedAt) : undefined,
        dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
        maxScore: (data as any).maxScore ?? 20,
        assessmentTypeId,
        schoolId,
        createdById: createdByTeacherId,
      },
    });
    return NextResponse.json({ assessment: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
