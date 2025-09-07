import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { GradeLevelSubjectCreateSchema } from "@/schemas/grade-level-subject";

// GET /api/grade-level-subjects?gradeLevelId=...&subjectId=...
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const schoolId = req.headers.get("x-school-id") || "";
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

  const { searchParams } = new URL(req.url);
  const gradeLevelId = searchParams.get("gradeLevelId") || undefined;
  const subjectId = searchParams.get("subjectId") || undefined;

  const list = await db.gradeLevelSubject.findMany({
    where: {
      schoolId,
      ...(gradeLevelId ? { gradeLevelId } : {}),
      ...(subjectId ? { subjectId } : {}),
    },
    include: { gradeLevel: true, subject: true },
    orderBy: [{ gradeLevel: { name: "asc" } }, { subject: { name: "asc" } }],
  });
  return NextResponse.json({ gradeLevelSubjects: list });
}

// POST /api/grade-level-subjects (ADMIN)
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const parsed = GradeLevelSubjectCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    const { gradeLevelId, subjectId, coefficient } = parsed.data;

    // Validation existence
    const exists = await db.gradeLevel.findFirst({
      where: { id: gradeLevelId, schoolId },
      select: { id: true },
    });
    if (!exists)
      return NextResponse.json(
        { error: "Niveau scolaire invalide" },
        { status: 400 }
      );

    const subExists = await db.subject.findFirst({
      where: { id: subjectId, schoolId },
      select: { id: true },
    });
    if (!subExists)
      return NextResponse.json({ error: "Matière invalide" }, { status: 400 });

    // Unicité
    const dup = await db.gradeLevelSubject.findFirst({
      where: { gradeLevelId, subjectId },
      select: { id: true },
    });
    if (dup) {
      return NextResponse.json(
        { error: "Un coefficient pour ce niveau et cette matière existe déjà" },
        { status: 409 }
      );
    }

    const item = await db.gradeLevelSubject.create({
      data: { schoolId, gradeLevelId, subjectId, coefficient },
    });
    return NextResponse.json({ gradeLevelSubject: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
