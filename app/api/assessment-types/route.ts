import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { AssessmentTypeCreateSchema } from "@/schemas/assessment-type";

// GET /api/assessment-types
export async function GET(req: Request) {
  try {
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

    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get("active") === "true";

    const types = await db.assessmentTypeModel.findMany({
      where: { schoolId, ...(onlyActive ? { isActive: true } : {}) },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ types });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/assessment-types (ADMIN)
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok)
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

    const parsed = AssessmentTypeCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    const data = parsed.data;
    const created = await db.assessmentTypeModel.create({
      data: { ...data, schoolId },
    });
    return NextResponse.json({ type: created }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "Nom ou code déjà utilisé" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
