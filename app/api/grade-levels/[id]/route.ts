import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { GradeLevelUpdateSchema } from "@/schemas/grade-level";

// GET /api/grade-levels/[id] - détail d'un niveau
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "TEACHER",
    "PARENT",
    "STUDENT",
    "USER",
  ]);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const item = await db.gradeLevel.findFirst({
    where: { id, schoolId },
  });
  if (!item) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json({ gradeLevel: item });
}

// PATCH /api/grade-levels/[id] - modifier (ADMIN)
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const parsed = GradeLevelUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const item = await db.gradeLevel.update({
      where: { id, schoolId },
      data: parsed.data,
    });
    return NextResponse.json({ gradeLevel: item });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/grade-levels/[id] - supprimer (ADMIN)
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await db.gradeLevel.delete({
      where: { id, schoolId },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
