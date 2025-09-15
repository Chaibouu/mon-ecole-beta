import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchoolAccess } from "@/lib/school-access";

// GET /api/schools/[id]/members - lister les membres d'une école
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: schoolId } = await params;
    const access = await ensureSchoolAccess(req, schoolId, [
      "ADMIN",
      "TEACHER",
    ]);
    if (access instanceof Response) return access;

    const members = await db.userSchool.findMany({
      where: { schoolId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            emailVerified: true,
            // createdAt: true,
          },
        },
      },
      orderBy: [{ role: "asc" }, { user: { name: "asc" } }],
    });

    return NextResponse.json({ members });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
