import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { StudentGradeCreateSchema } from "@/schemas/student-grade";

// GET /api/student-grades?studentId=...&termId=...&assessmentId=...&classroomId=...&subjectId=...&teacherId=...
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
  const assessmentId = searchParams.get("assessmentId") || undefined;
  const classroomId = searchParams.get("classroomId") || undefined;
  const subjectId = searchParams.get("subjectId") || undefined;
  const teacherId = searchParams.get("teacherId") || undefined; // TeacherProfile.id

  const list = await db.studentGrade.findMany({
    where: {
      student: { schoolId },
      ...(studentId ? { studentId } : {}),
      ...(assessmentId ? { assessmentId } : {}),
      assessment: {
        ...(termId ? { termId } : {}),
        ...(subjectId ? { subjectId } : {}),
        ...(classroomId ? { classroomId } : {}),
        ...(teacherId ? { createdById: teacherId } : {}),
        ...(academicYearId && !termId ? { term: { academicYearId } } : {}),
      },
    },
    include: {
      assessment: {
        include: {
          subject: true,
          classroom: { include: { gradeLevel: true } },
          term: true,
          createdBy: { include: { user: true } },
        },
      },
      student: { include: { user: true } },
    },
  });
  return NextResponse.json({ grades: list });
}

// POST /api/student-grades (TEACHER, ADMIN)
// - Single create: { assessmentId, studentId, score }
// - Bulk upsert: { assessmentId, grades: [{ studentId, score }] }
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
    const body = await req.json();

    // Bulk mode
    if (Array.isArray(body?.grades) && body?.assessmentId) {
      const assessmentId: string = body.assessmentId;
      const grades: Array<{
        studentId: string;
        note?: number;
        score?: number;
      }> = body.grades;
      if (!grades.length) {
        return NextResponse.json(
          { error: "Aucune note fournie" },
          { status: 400 }
        );
      }

      // Validate against assessment maxScore
      const assessment = await db.assessment.findFirst({
        where: { id: assessmentId },
        select: { id: true, maxScore: true },
      });
      if (!assessment) {
        return NextResponse.json(
          { error: "Évaluation introuvable" },
          { status: 404 }
        );
      }
      const invalid = grades
        .map(g => ({
          studentId: g.studentId,
          score: (typeof g.note === "number" ? g.note : g.score) ?? 0,
        }))
        .filter(g => g.score < 0 || g.score > assessment.maxScore);
      if (invalid.length > 0) {
        return NextResponse.json(
          {
            error: `Certaines notes dépassent le barème (max ${assessment.maxScore}).`,
            invalid,
          },
          { status: 400 }
        );
      }

      // Upsert in transaction for idempotency and performance
      const results = await db.$transaction(
        grades.map(g =>
          db.studentGrade.upsert({
            where: {
              assessmentId_studentId: { assessmentId, studentId: g.studentId },
            },
            update: {
              score: (typeof g.note === "number" ? g.note : g.score) ?? 0,
            },
            create: {
              assessmentId,
              studentId: g.studentId,
              score: (typeof g.note === "number" ? g.note : g.score) ?? 0,
            },
          })
        )
      );
      return NextResponse.json({ grades: results }, { status: 201 });
    }

    // Single mode
    const parsed = StudentGradeCreateSchema.safeParse(body);
    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    // Validate against maxScore for single create
    const singleAssessment = await db.assessment.findFirst({
      where: { id: parsed.data.assessmentId },
      select: { id: true, maxScore: true },
    });
    if (!singleAssessment) {
      return NextResponse.json(
        { error: "Évaluation introuvable" },
        { status: 404 }
      );
    }
    if (
      parsed.data.score < 0 ||
      parsed.data.score > singleAssessment.maxScore
    ) {
      return NextResponse.json(
        {
          error: `La note doit être comprise entre 0 et ${singleAssessment.maxScore}`,
        },
        { status: 400 }
      );
    }
    const item = await db.studentGrade.create({ data: parsed.data });
    return NextResponse.json({ grade: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
