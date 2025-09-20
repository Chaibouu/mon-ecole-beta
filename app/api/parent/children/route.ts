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

    // Formater la réponse pour l'app mobile: inclure le flag d'abonnement sur l'inscription active
    const formatted = children.map((link: any) => {
      const student = link.student;
      const enrollment = Array.isArray(student.enrollments)
        ? student.enrollments[0]
        : null;
      return {
        id: student.id,
        name:
          student.user?.name ||
          `${student.user?.firstName || ""} ${student.user?.lastName || ""}`.trim() ||
          student.user?.email,
        email: student.user?.email,
        matricule: student.matricule,
        isMobileSubscribed: enrollment?.isMobileSubscribed ?? false,
        classroom: enrollment?.classroom
          ? {
              name: enrollment.classroom.name,
              gradeLevel: enrollment.classroom.gradeLevel?.name,
            }
          : null,
      };
    });

    return NextResponse.json({ children: formatted });
  } catch (error) {
    console.error("Error fetching parent children:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
