import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { z } from "zod";

const AddChildSchema = z.object({
  studentId: z.string().min(1, "L'ID de l'étudiant est requis"),
  relationship: z.string().min(1, "La relation est requise"),
});

// GET /api/parents/[id]/children - Récupérer les enfants d'un parent
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const parentId = resolvedParams.id;

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

    // Récupérer les enfants liés à ce parent
    const parentStudents = await db.parentStudent.findMany({
      where: {
        parentProfileId: parentId,
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

    const children = parentStudents.map(ps => ({
      id: ps.id,
      studentId: ps.student.id,
      name: ps.student.user?.name,
      matricule: ps.student.matricule,
      gender: ps.student.gender,
      relationship: ps.relationship,
      currentEnrollment: ps.student.enrollments[0] || null,
    }));

    return NextResponse.json({ children });
  } catch (error) {
    console.error("Error fetching parent children:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/parents/[id]/children - Ajouter un enfant à un parent
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const parentId = resolvedParams.id;

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

    const body = await req.json();
    const parsed = AddChildSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { studentId, relationship } = parsed.data;

    // Vérifier que le parent existe
    const parentProfile = await db.parentProfile.findFirst({
      where: {
        id: parentId,
        schoolId,
      },
    });

    if (!parentProfile) {
      return NextResponse.json({ error: "Parent non trouvé" }, { status: 404 });
    }

    // Vérifier que l'étudiant existe
    const student = await db.studentProfile.findFirst({
      where: {
        id: studentId,
        schoolId,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Étudiant non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si la liaison existe déjà
    const existingLink = await db.parentStudent.findFirst({
      where: {
        parentProfileId: parentId,
        studentProfileId: studentId,
      },
    });

    if (existingLink) {
      return NextResponse.json(
        { error: "Cette liaison parent-enfant existe déjà" },
        { status: 409 }
      );
    }

    // Créer la liaison
    const parentStudent = await db.parentStudent.create({
      data: {
        parentProfileId: parentId,
        studentProfileId: studentId,
        relationship,
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
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Liaison parent-enfant créée avec succès",
      parentStudent: {
        id: parentStudent.id,
        studentId: parentStudent.student.id,
        name: parentStudent.student.user?.name,
        matricule: parentStudent.student.matricule,
        relationship: parentStudent.relationship,
        currentEnrollment: parentStudent.student.enrollments[0] || null,
      },
    });
  } catch (error) {
    console.error("Error adding child to parent:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/parents/[id]/children/[childId] - Supprimer une liaison parent-enfant
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const parentId = resolvedParams.id;

    const url = new URL(req.url);
    const childLinkId = url.searchParams.get("linkId");

    if (!childLinkId) {
      return NextResponse.json(
        { error: "ID de liaison requis" },
        { status: 400 }
      );
    }

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

    // Vérifier que la liaison existe et appartient au bon parent
    const parentStudent = await db.parentStudent.findFirst({
      where: {
        id: childLinkId,
        parentProfileId: parentId,
      },
    });

    if (!parentStudent) {
      return NextResponse.json(
        { error: "Liaison parent-enfant non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la liaison
    await db.parentStudent.delete({
      where: {
        id: childLinkId,
      },
    });

    return NextResponse.json({
      message: "Liaison parent-enfant supprimée avec succès",
    });
  } catch (error) {
    console.error("Error removing child from parent:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}










