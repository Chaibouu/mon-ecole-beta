import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";

// GET /api/parent/children/[studentId]/attendance - Récupérer l'assiduité d'un enfant
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const academicYearId = req.headers.get("x-academic-year-id") || "";

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const month = searchParams.get("month"); // Format: YYYY-MM

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

    // Vérifier que l'utilisateur est bien le parent de cet enfant
    const parentProfile = await db.parentProfile.findFirst({
      where: { userId, schoolId },
    });

    if (!parentProfile) {
      return NextResponse.json(
        { error: "Profil parent non trouvé" },
        { status: 404 }
      );
    }

    const isParentOfChild = await db.parentStudent.findFirst({
      where: {
        parentProfileId: parentProfile.id,
        studentProfileId: studentId,
      },
    });

    if (!isParentOfChild) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à voir ces informations" },
        { status: 403 }
      );
    }

    // Récupérer l'inscription actuelle de l'enfant
    const student = await db.studentProfile.findFirst({
      where: { id: studentId, schoolId },
      include: {
        user: true,
        enrollments: {
          where: academicYearId
            ? { academicYearId }
            : {
                academicYear: { isActive: true },
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
    });

    if (!student || !student.enrollments[0]) {
      return NextResponse.json(
        { error: "Étudiant ou inscription non trouvé" },
        { status: 404 }
      );
    }

    const currentEnrollment = student.enrollments[0];

    // Construire les filtres de date
    let dateFilter = {};
    if (month) {
      const [year, monthNum] = month.split("-");
      const startOfMonth = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(monthNum), 0);
      dateFilter = {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    } else if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    } else {
      // Par défaut, le mois actuel
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    }

    // Récupérer les enregistrements de présence
    const attendanceRecords = await db.attendanceRecord.findMany({
      where: {
        studentId: studentId,
        timetableEntry: {
          classroomId: currentEnrollment.classroomId,
          academicYearId: currentEnrollment.academicYearId,
        },
        ...dateFilter,
      },
      include: {
        timetableEntry: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: [{ date: "desc" }, { timetableEntry: { startTime: "asc" } }],
    });

    // Calculer les statistiques
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(
      r => r.status === "PRESENT"
    ).length;
    const absentCount = attendanceRecords.filter(
      r => r.status === "ABSENT"
    ).length;
    const lateCount = attendanceRecords.filter(r => r.status === "LATE").length;
    const excusedCount = attendanceRecords.filter(
      r => r.status === ("EXCUSED" as any)
    ).length;

    const attendanceRate =
      totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

    // Organiser par date
    const recordsByDate: { [key: string]: any[] } = {};
    attendanceRecords.forEach(record => {
      const dateKey = record.date.toISOString().split("T")[0];
      if (!recordsByDate[dateKey]) {
        recordsByDate[dateKey] = [];
      }
      recordsByDate[dateKey].push(record);
    });

    // Statistiques par matière
    const subjectStats: { [key: string]: any } = {};
    attendanceRecords.forEach((record: any) => {
      const subjectName =
        record.timetableEntry?.subject?.name || "Matière inconnue";
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }
      subjectStats[subjectName].total += 1;
      subjectStats[subjectName][record.status.toLowerCase()] += 1;
    });

    return NextResponse.json({
      student,
      attendanceRecords,
      recordsByDate,
      statistics: {
        totalRecords,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
      },
      subjectStats,
    });
  } catch (error) {
    console.error("Error fetching student attendance for parent:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
