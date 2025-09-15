import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";

// GET /api/parent/children/[studentId]/timetable - Récupérer l'emploi du temps d'un enfant
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

    // Récupérer l'emploi du temps de la classe
    const timetableEntries = await db.timetableEntry.findMany({
      where: {
        classroomId: currentEnrollment.classroomId,
        academicYearId: currentEnrollment.academicYearId,
      },
      include: {
        subject: true,
        teacher: {
          include: {
            user: true,
          },
        },
        classroom: {
          include: {
            gradeLevel: true,
          },
        },
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
        timetableByDay[dayName].push(entry);
      }
    });

    return NextResponse.json({
      student,
      classroom: currentEnrollment.classroom,
      timetable: timetableByDay,
      timetableEntries,
    });
  } catch (error) {
    console.error("Error fetching student timetable for parent:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
