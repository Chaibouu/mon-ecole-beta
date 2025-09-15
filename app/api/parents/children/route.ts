import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// GET /api/parents/children
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
      "PARENT",
    ]);
    if (!roleOk) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    // Récupérer le profil parent de l'utilisateur connecté
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

    // Récupérer tous les enfants liés à ce parent
    const parentStudents = await db.parentStudent.findMany({
      where: {
        parentProfileId: parentProfile.id,
      },
      include: {
        student: {
          include: {
            user: true,
            enrollments: {
              where: {
                status: "ACTIVE",
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

    // Formater les données des enfants
    const children = parentStudents.map(ps => ({
      id: ps.student.id,
      name: ps.student.user?.name,
      matricule: ps.student.matricule,
      gender: ps.student.gender,
      relationship: ps.relationship,
      currentEnrollment: ps.student.enrollments[0] || null,
    }));

    return NextResponse.json({
      parentProfile: {
        id: parentProfile.id,
        phone: parentProfile.phone,
        address: parentProfile.address,
      },
      children,
    });
  } catch (error) {
    console.error("Error fetching parent children:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
