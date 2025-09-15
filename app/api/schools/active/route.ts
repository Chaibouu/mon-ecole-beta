import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchoolAccess } from "@/lib/school-access";

// GET /api/schools/active - détail de l'école active (ADMIN, TEACHER, SUPER_ADMIN)
export async function GET(req: NextRequest) {
  try {
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId) {
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    }

    const access = await ensureSchoolAccess(req, schoolId, [
      "ADMIN",
      "TEACHER",
    ]);
    if (access instanceof Response) return access;

    const school = await db.school.findFirst({
      where: { id: schoolId, isDeleted: false } as any,
    });
    if (!school)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ school });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/schools/active - mise à jour par l'admin de l'école active (ADMIN, SUPER_ADMIN)
export async function PATCH(req: NextRequest) {
  try {
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId) {
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    }

    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const body = await req.json();
    // Optionnel: valider via SchoolUpdateSchema si nécessaire
    const exists = await db.school.findFirst({
      where: { id: schoolId, isDeleted: false } as any,
    });
    if (!exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await db.school.update({
      where: { id: schoolId },
      data: body,
    });
    return NextResponse.json({ school: updated });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
