import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";

// GET /api/teacher/classes/[classroomId]/students - Récupérer les élèves d'une classe
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const { classroomId } = await params;
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const academicYearId = req.headers.get("x-academic-year-id") || "";

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
      where: { userId, schoolId },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Profil enseignant non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'enseignant a bien des cours dans cette classe
    const hasAccessToClass = await db.timetableEntry.findFirst({
      where: {
        teacherId: teacherProfile.id,
        classroomId: classroomId,
        academicYearId: academicYearId || {
          not: undefined,
        },
      },
    });

    if (!hasAccessToClass) {
      return NextResponse.json(
        { error: "Vous n'avez pas accès à cette classe" },
        { status: 403 }
      );
    }

    // Récupérer les informations de la classe
    const classroom = await db.classroom.findFirst({
      where: { id: classroomId, schoolId },
      include: {
        gradeLevel: true,
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classe non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer tous les élèves de cette classe
    const enrollments = await db.enrollment.findMany({
      where: {
        classroomId: classroomId,
        academicYearId: academicYearId || {
          not: undefined,
        },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        academicYear: true,
      },
      orderBy: {
        student: {
          user: {
            name: "asc",
          },
        },
      },
    });

    // Récupérer les statistiques d'assiduité récentes pour chaque élève
    const studentsWithStats = await Promise.all(
      enrollments.map(async enrollment => {
        // Statistiques d'assiduité du mois actuel
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const attendanceRecords = await db.attendanceRecord.findMany({
          where: {
            studentId: enrollment.student.id,
            timetableEntry: {
              classroomId: classroomId,
            },
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

        const totalRecords = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(
          r => r.status === "PRESENT"
        ).length;
        const attendanceRate =
          totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

        return {
          id: enrollment.student.id,
          user: enrollment.student.user,
          matricule: enrollment.student.matricule,
          gender: enrollment.student.gender,
          dateOfBirth: enrollment.student.dateOfBirth,
          enrollment: {
            id: enrollment.id,
            academicYear: enrollment.academicYear,
          },
          attendanceStats: {
            totalRecords,
            presentCount,
            attendanceRate: Math.round(attendanceRate * 100) / 100,
          },
        };
      })
    );

    return NextResponse.json({
      classroom,
      students: studentsWithStats,
      totalStudents: studentsWithStats.length,
    });
  } catch (error) {
    console.error("Error fetching class students for teacher:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
