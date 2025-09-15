import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { SchoolUpdateSchema } from "@/schemas/school";
import { requireSchoolRole } from "@/lib/acl";

// Vérifie que l'utilisateur est SUPER_ADMIN
async function ensureSuperAdmin(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const userId = await getUserIdFromToken(token);
  if (!userId)
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "SUPER_ADMIN") {
    return {
      ok: false,
      res: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true } as const;
}

// Autoriser SUPER_ADMIN global ou ADMIN rattaché à l'école
async function ensureSuperAdminOrSchoolAdmin(
  req: NextRequest,
  schoolId: string
) {
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const userId = await getUserIdFromToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role === "SUPER_ADMIN") return true;
  const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return true;
}

// GET /api/schools/[id] - détail d'une école (SUPER_ADMIN)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const access = await ensureSuperAdminOrSchoolAdmin(req, id);
  if (access instanceof Response) return access;
  const school = await db.school.findFirst({
    where: { id, isDeleted: false } as any,
  });
  if (!school)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ school });
}

// PATCH /api/schools/[id] - mise à jour (SUPER_ADMIN)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await ensureSuperAdminOrSchoolAdmin(req, id);
    if (access instanceof Response) return access;
    const body = await req.json();
    const parsed = SchoolUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const exists = await db.school.findFirst({
      where: { id, isDeleted: false } as any,
    });
    if (!exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const updated = await db.school.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ school: updated });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/schools/[id] - suppression (SUPER_ADMIN)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await ensureSuperAdmin(req);
    if (!("ok" in check) || !check.ok) return (check as any).res;
    const { id } = await params;
    await db.school.update({
      where: { id },
      data: { isDeleted: true as any, isActive: false } as any,
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
