import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
// import { getUserIdFromToken } from "@/lib/auth-utils";

// GET /api/parent/children - Récupérer tous les enfants du parent connecté
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";

    if (!schoolId) {
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un parent dans cette école
    const parentProfile = await db.parentProfile.findFirst({
      where: {
        userId,
        schoolId,
      },
    });

    if (!parentProfile) {
      return NextResponse.json(
        { error: "Profil parent non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer tous les enfants de ce parent avec leurs informations complètes
    const children = await db.parentStudent.findMany({
      where: {
        parentProfileId: parentProfile.id,
      },
      include: {
        student: {
          include: {
            user: true,
            enrollments: {
              where: {
                academicYear: {
                  isActive: true,
                },
              },
              include: {
                classroom: {
                  include: {
                    gradeLevel: true,
                  },
                },
                academicYear: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ children });
  } catch (error) {
    console.error("Error fetching parent children:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
