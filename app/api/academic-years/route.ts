import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { AcademicYearCreateSchema } from "@/schemas/academic-year";

// GET /api/academic-years - liste par école
export async function GET(req: NextRequest) {
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
  const list = await db.academicYear.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ academicYears: list });
}

// POST /api/academic-years - créer (ADMIN)
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
    const parsed = AcademicYearCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const { name, startDate, endDate, isActive } = parsed.data;
    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: "La date de début doit être antérieure à la date de fin" },
        { status: 400 }
      );
    }
    const item = await db.academicYear.create({
      data: {
        schoolId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive ?? false,
      },
    });
    return NextResponse.json({ academicYear: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
