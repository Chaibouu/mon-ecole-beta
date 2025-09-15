import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { TeacherAssignmentUpdateSchema } from "@/schemas/teacher-assignment";
// import { TeacherAssignmentUpdateSchema } from "@/schemas/academics";

// GET /api/teacher-assignments/[id]
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
    "USER",
  ]);
  if (!ok)
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  const item = await db.teacherAssignment.findFirst({
    where: { id, academicYear: { schoolId } },
    include: {
      teacher: { include: { user: true } },
      subject: true,
      classroom: true,
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ teacherAssignment: item });
}

// PATCH /api/teacher-assignments/[id]
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
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok)
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

    const parsed = TeacherAssignmentUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    const exists = await db.teacherAssignment.findFirst({
      where: { id, academicYear: { schoolId } },
      select: { id: true },
    });
    if (!exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.teacherAssignment.update({
      where: { id },
      data: parsed.data as any,
    });
    return NextResponse.json({ teacherAssignment: updated });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/teacher-assignments/[id]
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
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok)
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    const exists = await db.teacherAssignment.findFirst({
      where: { id, academicYear: { schoolId } },
    });
    if (!exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.teacherAssignment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
