import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { ClassroomSubjectCreateSchema } from "@/schemas/classroom-subject";

// GET /api/classroom-subjects?classroomId=... - liste des coefficients par classe
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const schoolId = req.headers.get("x-school-id") || "";
  const userId = await getUserIdFromToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "TEACHER",
    "USER",
  ]);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const classroomId = searchParams.get("classroomId") || undefined;
  const list = await db.classroomSubject.findMany({
    where: { schoolId, classroomId },
  });
  return NextResponse.json({ classroomSubjects: list });
}

// POST /api/classroom-subjects - créer/mettre à jour un coefficient (ADMIN)
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const parsed = ClassroomSubjectCreateSchema.safeParse(await req.json());

    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const { classroomId, subjectId, coefficient } = parsed.data;
    const item = await db.classroomSubject.upsert({
      where: { classroomId_subjectId: { classroomId, subjectId } },
      update: { coefficient },
      create: { schoolId, classroomId, subjectId, coefficient },
    });
    return NextResponse.json({ classroomSubject: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/classroom-subjects?classroomId=...&subjectId=... (ADMIN)
export async function DELETE(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const subjectId = searchParams.get("subjectId");
    if (!classroomId || !subjectId) {
      return NextResponse.json(
        { error: "classroomId et subjectId requis" },
        { status: 400 }
      );
    }
    await db.classroomSubject.delete({
      where: { classroomId_subjectId: { classroomId, subjectId } },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

