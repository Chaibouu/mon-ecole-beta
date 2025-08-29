import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { TermCreateSchema } from "@/schemas/term";

// GET /api/terms?academicYearId=... - liste des périodes pour une année
export async function GET(req: NextRequest) {
  const academicYearId = req.nextUrl.searchParams.get("academicYearId") || "";
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
  ]);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const where: any = { academicYear: { schoolId } };
  if (academicYearId) where.academicYearId = academicYearId;
  const list = await db.term.findMany({
    where,
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ terms: list });
}

// POST /api/terms - créer (ADMIN)
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
    const parsed = TermCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const { academicYearId, name, startDate, endDate } = parsed.data;
    const year = await db.academicYear.findFirst({
      where: { id: academicYearId, schoolId },
      select: { id: true },
    });
    if (!year) {
      return NextResponse.json(
        { error: "Année scolaire invalide" },
        { status: 400 }
      );
    }
    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: "La date de début doit être antérieure à la date de fin" },
        { status: 400 }
      );
    }
    const item = await db.term.create({
      data: {
        academicYearId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    return NextResponse.json({ term: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

