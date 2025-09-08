import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { TermCreateSchema } from "@/schemas/term";

// GET /api/terms
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const academicYearId = req.headers.get("x-academic-year-id") || "";
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const roleOk = await requireSchoolRole(userId, schoolId, [
      "SUPER_ADMIN",
      "ADMIN",
      "TEACHER",
      "PARENT",
    ]);
    if (!roleOk) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const academicYearFilter =
      req.nextUrl.searchParams.get("academicYearId") || academicYearId;

    const terms = await db.term.findMany({
      where: {
        academicYear: {
          schoolId,
          ...(academicYearFilter && { id: academicYearFilter }),
        },
      },
      include: {
        academicYear: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json({ terms });
  } catch (error) {
    console.error("Error fetching terms:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/terms - créer un trimestre (ADMIN)
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const roleOk = await requireSchoolRole(userId, schoolId, [
      "SUPER_ADMIN",
      "ADMIN",
    ]);
    if (!roleOk) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const parsed = TermCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    const { name, startDate, endDate, academicYearId } = parsed.data;

    // Vérifier que l'année académique appartient à cette école
    const academicYear = await db.academicYear.findFirst({
      where: { id: academicYearId, schoolId },
    });

    if (!academicYear) {
      return NextResponse.json(
        { error: "Année académique non trouvée" },
        { status: 404 }
      );
    }

    const term = await db.term.create({
      data: {
        name,
        startDate, // Déjà transformé en Date par le schéma
        endDate, // Déjà transformé en Date par le schéma
        academicYearId,
      },
      include: {
        academicYear: true,
      },
    });

    return NextResponse.json({ term }, { status: 201 });
  } catch (error) {
    console.error("Error creating term:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
