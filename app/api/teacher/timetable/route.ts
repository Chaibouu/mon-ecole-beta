import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";

// GET /api/teacher/timetable - Récupérer l'emploi du temps d'un enseignant
export async function GET(req: NextRequest) {
  try {
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

    // Récupérer l'emploi du temps de l'enseignant
    const timetableEntries = await db.timetableEntry.findMany({
      where: {
        teacherId: teacherProfile.id,
        academicYearId: academicYearId || {
          not: undefined,
        },
      },
      include: {
        subject: true,
        classroom: {
          include: {
            gradeLevel: true,
          },
        },
        academicYear: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    // Organiser par jour de la semaine
    const timetableByDay: { [key: string]: any[] } = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
      SUNDAY: [],
    };

    timetableEntries.forEach(entry => {
      const dayName = entry.dayOfWeek;
      if (timetableByDay[dayName]) {
        timetableByDay[dayName].push({
          id: entry.id,
          subject: entry.subject,
          classroom: entry.classroom,
          startTime: entry.startTime,
          endTime: entry.endTime,
          academicYear: entry.academicYear,
        });
      }
    });

    // Calculer les statistiques
    const totalHours = timetableEntries.reduce((sum, entry) => {
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // en heures
      return sum + duration;
    }, 0);

    const subjectStats = timetableEntries.reduce(
      (stats: { [key: string]: number }, entry) => {
        const subjectName = entry.subject.name;
        stats[subjectName] = (stats[subjectName] || 0) + 1;
        return stats;
      },
      {}
    );

    const classStats = timetableEntries.reduce(
      (stats: { [key: string]: number }, entry) => {
        const className = entry.classroom.name;
        stats[className] = (stats[className] || 0) + 1;
        return stats;
      },
      {}
    );

    return NextResponse.json({
      teacher: teacherProfile,
      timetable: timetableByDay,
      timetableEntries,
      statistics: {
        totalClasses: timetableEntries.length,
        totalHoursPerWeek: Math.round(totalHours * 100) / 100,
        subjectCount: Object.keys(subjectStats).length,
        classroomCount: Object.keys(classStats).length,
        subjectBreakdown: subjectStats,
        classBreakdown: classStats,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher timetable:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
