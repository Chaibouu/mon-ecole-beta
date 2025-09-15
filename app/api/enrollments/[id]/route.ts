import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { EnrollmentUpdateSchema } from "@/schemas/enrollment";

// GET /api/enrollments/[id]
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
  const item = await db.enrollment.findFirst({
    where: { id, student: { schoolId } },
    include: {
      student: { include: { user: true } },
      classroom: true,
      academicYear: true,
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ enrollment: item });
}

// PATCH /api/enrollments/[id]
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

    const parsed = EnrollmentUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const exists = await db.enrollment.findFirst({
      where: { id, student: { schoolId } },
      select: { id: true },
    });
    if (!exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const updated = await db.enrollment.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ enrollment: updated });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/enrollments/[id]
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
    const exists = await db.enrollment.findFirst({
      where: { id, student: { schoolId } },
    });
    if (!exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.enrollment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
