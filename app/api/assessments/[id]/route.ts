import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { AssessmentUpdateSchema } from "@/schemas/assessment";

// GET /api/assessments/[id]
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
  const item = await db.assessment.findFirst({
    where: { id, schoolId },
    include: {
      assessmentType: true,
      subject: true,
      classroom: { include: { gradeLevel: true } },
      term: true,
      createdBy: { include: { user: true } },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ assessment: item });
}

// PATCH /api/assessments/[id]
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
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN", "TEACHER"]);
    if (!ok)
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

    const parsed = AssessmentUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const exists = await db.assessment.findFirst({
      where: { id, schoolId },
      select: { id: true },
    });
    if (!exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const updated = await db.assessment.update({
      where: { id },
      data: {
        subjectId: parsed.data.subjectId,
        classroomId: parsed.data.classroomId,
        termId: parsed.data.termId,
        title: parsed.data.title,
        description: parsed.data.description,
        // conserver l'ancien enum pendant la phase 1
        type: (parsed.data as any).type,
        assessmentTypeId: (parsed.data as any).assessmentTypeId,
        maxScore: (parsed.data as any).maxScore,
        assignedAt: parsed.data.assignedAt
          ? new Date(parsed.data.assignedAt)
          : undefined,
        dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : undefined,
      },
    });
    return NextResponse.json({ assessment: updated });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/assessments/[id]
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
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN", "TEACHER"]);
    if (!ok)
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    const exists = await db.assessment.findFirst({ where: { id, schoolId } });
    if (!exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.assessment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
