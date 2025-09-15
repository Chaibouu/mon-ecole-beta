import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// GET /api/academic-years/active - retourne l'année académique active de l'école
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  let token = auth?.split(" ")[1] || "";
  let schoolId = req.headers.get("x-school-id") || "";
  // Les tokens/headers doivent être passés par le caller (actions via makeAuthenticatedRequest)
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

  const active = await db.academicYear.findFirst({
    where: { schoolId, isActive: true },
  });
  return NextResponse.json({ academicYear: active || null });
}

// POST /api/academic-years/active - définit l'année académique active (ADMIN)
// body: { academicYearId: string }
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    let token = auth?.split(" ")[1] || "";
    let schoolId = req.headers.get("x-school-id") || "";
    // Les tokens/headers doivent être passés par le caller (actions via makeAuthenticatedRequest)
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { academicYearId } = await req.json();
    if (!academicYearId) {
      return NextResponse.json(
        { error: "academicYearId requis" },
        { status: 400 }
      );
    }

    const year = await db.academicYear.findFirst({
      where: { id: academicYearId, schoolId },
    });
    if (!year)
      return NextResponse.json({ error: "Année invalide" }, { status: 404 });

    // Désactiver toutes les autres années puis activer celle-ci (unicité)
    await db.$transaction([
      db.academicYear.updateMany({
        where: { schoolId },
        data: { isActive: false },
      }),
      db.academicYear.update({
        where: { id: academicYearId },
        data: { isActive: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      academicYear: { ...year, isActive: true },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
