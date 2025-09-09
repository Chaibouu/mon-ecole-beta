import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";

// GET /api/teacher/classes - Récupérer toutes les classes d'un enseignant
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

    // Récupérer toutes les classes où cet enseignant a des cours
    const timetableEntries = await db.timetableEntry.findMany({
      where: {
        teacherId: teacherProfile.id,
        academicYearId: academicYearId || {
          not: undefined, // Si pas d'année spécifiée, prendre toutes
        },
      },
      include: {
        classroom: {
          include: {
            gradeLevel: true,
            enrollments: {
              where: academicYearId
                ? { academicYearId }
                : {
                    academicYear: { isActive: true },
                  },
              include: {
                student: {
                  include: {
                    user: true,
                  },
                },
                academicYear: true,
              },
            },
          },
        },
        subject: true,
        academicYear: true,
      },
    });

    // Grouper par classe pour éviter les doublons
    const classesMap = new Map();

    timetableEntries.forEach(entry => {
      const classroomId = entry.classroom.id;

      if (!classesMap.has(classroomId)) {
        const students = entry.classroom.enrollments.map(enrollment => ({
          id: enrollment.student.id,
          user: enrollment.student.user,
          matricule: enrollment.student.matricule,
          gender: enrollment.student.gender,
          enrollment: {
            id: enrollment.id,
            academicYear: enrollment.academicYear,
          },
        }));

        classesMap.set(classroomId, {
          classroom: {
            id: entry.classroom.id,
            name: entry.classroom.name,
            gradeLevel: entry.classroom.gradeLevel,
          },
          students,
          subjects: new Set(),
          timetableEntries: [],
        });
      }

      // Ajouter la matière et l'entrée d'emploi du temps
      const classData = classesMap.get(classroomId);
      classData.subjects.add(entry.subject.name);
      classData.timetableEntries.push({
        id: entry.id,
        subject: entry.subject,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
      });
    });

    // Convertir en array et transformer les Sets en arrays
    const classes = Array.from(classesMap.values()).map(classData => ({
      ...classData,
      subjects: Array.from(classData.subjects),
      studentCount: classData.students.length,
    }));

    return NextResponse.json({
      teacher: teacherProfile,
      classes,
      totalClasses: classes.length,
      totalStudents: classes.reduce((sum, cls) => sum + cls.studentCount, 0),
    });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
