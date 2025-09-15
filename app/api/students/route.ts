import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// GET /api/students
export async function GET(req: NextRequest) {
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
      "TEACHER",
    ]);
    if (!roleOk) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    // Get search parameter
    const search = req.nextUrl.searchParams.get("search");

    const students = await db.studentProfile.findMany({
      where: {
        schoolId,
        ...(search && {
          OR: [
            {
              user: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              matricule: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        enrollments: {
          include: {
            classroom: {
              include: {
                gradeLevel: true,
              },
            },
          },
          orderBy: {
            enrolledAt: "desc",
          },
          take: 1, // Get most recent enrollment
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
      take: 20, // Limit results for search
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
