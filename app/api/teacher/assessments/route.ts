import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";

// GET /api/teacher/assessments - Récupérer les évaluations d'un enseignant
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const subjectId = searchParams.get("subjectId");
    const termId = searchParams.get("termId");

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

    // Vérifier que l'utilisateur est un enseignant dans cette école
    const teacherProfile = await db.teacherProfile.findFirst({
      where: {
        userId,
        schoolId,
      },
      include: {
        user: true,
      },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Profil enseignant non trouvé" },
        { status: 404 }
      );
    }

    // Construire les filtres
    const whereClause: any = {
      createdById: teacherProfile.id,
      schoolId,
    };

    if (classroomId) whereClause.classroomId = classroomId;
    if (subjectId) whereClause.subjectId = subjectId;
    if (termId) whereClause.termId = termId;

    // Récupérer les évaluations de l'enseignant
    const assessments = await db.assessment.findMany({
      where: whereClause,
      include: {
        subject: true,
        classroom: {
          include: {
            gradeLevel: true,
          },
        },
        term: true,
        assessmentType: true,
        grades: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            student: {
              user: {
                name: "asc",
              },
            },
          },
        },
      },
      orderBy: [{ assignedAt: "desc" }],
    });

    // Calculer les statistiques pour chaque évaluation
    const assessmentsWithStats = assessments.map(assessment => {
      const grades = assessment.grades;
      const totalGrades = grades.length;
      const averageScore =
        totalGrades > 0
          ? grades.reduce((sum, grade) => sum + grade.score, 0) / totalGrades
          : 0;

      const maxScore =
        totalGrades > 0 ? Math.max(...grades.map(g => g.score)) : 0;
      const minScore =
        totalGrades > 0 ? Math.min(...grades.map(g => g.score)) : 0;

      return {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        type: assessment.type,
        maxScore: assessment.maxScore,
        assessmentType: assessment.assessmentType,
        assignedAt: assessment.assignedAt,
        dueAt: assessment.dueAt,
        isBlocked: assessment.isBlocked,
        subject: assessment.subject,
        classroom: assessment.classroom,
        term: assessment.term,
        statistics: {
          totalGrades,
          averageScore: Math.round(averageScore * 100) / 100,
          maxScore,
          minScore,
          gradedStudents: totalGrades,
          pendingGrades: 0, // TODO: calculer selon les élèves inscrits
        },
        grades: grades.map(grade => ({
          id: grade.id,
          score: grade.score,
          student: {
            id: grade.student.id,
            user: grade.student.user,
            matricule: grade.student.matricule,
          },
        })),
      };
    });

    // Statistiques générales
    const totalAssessments = assessments.length;
    const totalGrades = assessments.reduce(
      (sum, a) => sum + a.grades.length,
      0
    );
    const subjectBreakdown = assessments.reduce(
      (stats: { [key: string]: number }, assessment) => {
        const subjectName = assessment.subject.name;
        stats[subjectName] = (stats[subjectName] || 0) + 1;
        return stats;
      },
      {}
    );

    return NextResponse.json({
      teacher: teacherProfile,
      assessments: assessmentsWithStats,
      statistics: {
        totalAssessments,
        totalGrades,
        subjectBreakdown,
        averageGradesPerAssessment:
          totalAssessments > 0
            ? Math.round((totalGrades / totalAssessments) * 100) / 100
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher assessments:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
