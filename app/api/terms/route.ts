import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

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
