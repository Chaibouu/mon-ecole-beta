import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// GET /api/parent/children/[studentId]/attendance/realtime
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un parent
    const ok = await requireSchoolRole(userId, schoolId, ["PARENT"]);
    if (!ok) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const { studentId } = await params;

    // Récupérer l'élève et ses informations
    const student = await db.studentProfile.findFirst({
      where: { id: studentId, schoolId },
      include: {
        user: true,
        enrollments: {
          where: { status: "ACTIVE" },
          include: {
            classroom: {
              include: {
                gradeLevel: true,
              },
            },
          },
        },
      },
    });

    if (!student || !student.enrollments.length) {
      return NextResponse.json(
        { error: "Élève non trouvé ou non inscrit" },
        { status: 404 }
      );
    }

    const enrollment = student.enrollments[0]; // Prendre la première inscription active
    const classroom = enrollment.classroom;

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const currentTime = now.toTimeString().slice(0, 5); // Format HH:MM

    // Récupérer les entrées d'emploi du temps pour cette classe
    const timetableEntries = await db.timetableEntry.findMany({
      where: {
        classroomId: classroom.id,
        academicYearId: enrollment.academicYearId,
      },
      include: {
        subject: true,
        teacher: {
          include: { user: true },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    // Trouver le cours actuel selon l'heure et le jour
    const currentTimetableEntry = timetableEntries.find((entry: any) => {
      const dayMatches = entry.dayOfWeek === currentDay;
      const timeMatches =
        currentTime >= entry.startTime && currentTime <= entry.endTime;
      return dayMatches && timeMatches;
    });

    if (!currentTimetableEntry) {
      return NextResponse.json({
        student: {
          id: student.id,
          name:
            student.user.name ||
            `${student.user.firstName || ""} ${student.user.lastName || ""}`.trim() ||
            student.user.email,
          email: student.user.email,
          classroom: {
            name: classroom.name,
            gradeLevel: classroom.gradeLevel.name,
          },
        },
        currentSession: null,
        attendance: null,
        message: "Aucun cours en cours actuellement",
        timestamp: now.toISOString(),
      });
    }

    // Chercher la prise de présence pour ce cours aujourd'hui
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const attendanceRecord = await db.attendanceRecord.findFirst({
      where: {
        studentId,
        date: today,
        timetableEntryId: currentTimetableEntry.id,
      },
      include: {
        recordedBy: {
          include: { user: true },
        },
      },
    });

    // Informations sur la session actuelle
    const currentSession = {
      subject: currentTimetableEntry.subject.name,
      teacher:
        currentTimetableEntry.teacher.user.name ||
        `${currentTimetableEntry.teacher.user.firstName || ""} ${currentTimetableEntry.teacher.user.lastName || ""}`.trim() ||
        currentTimetableEntry.teacher.user.email,
      startTime: currentTimetableEntry.startTime,
      endTime: currentTimetableEntry.endTime,
      classroom: classroom.name,
      dayOfWeek: currentTimetableEntry.dayOfWeek,
      date: today.toISOString().split("T")[0],
    };

    // Statut de présence
    let attendance = null;
    let message = "Présence non encore prise par le professeur";

    if (attendanceRecord) {
      attendance = {
        status: attendanceRecord.status,
        statusText:
          attendanceRecord.status === "PRESENT"
            ? "Présent"
            : attendanceRecord.status === "ABSENT"
              ? "Absent"
              : attendanceRecord.status === "LATE"
                ? "En retard"
                : "Excusé",
        recordedAt: attendanceRecord.date,
        recordedBy:
          attendanceRecord.recordedBy?.user?.name ||
          `${attendanceRecord.recordedBy?.user?.firstName || ""} ${attendanceRecord.recordedBy?.user?.lastName || ""}`.trim() ||
          attendanceRecord.recordedBy?.user?.email ||
          "Professeur",
        comments: attendanceRecord.notes,
      };
      message =
        attendanceRecord.status === "PRESENT"
          ? "Présent en cours"
          : attendanceRecord.status === "ABSENT"
            ? "Absent du cours"
            : attendanceRecord.status === "LATE"
              ? "En retard au cours"
              : "Absence excusée";
    }

    return NextResponse.json({
      student: {
        id: student.id,
        name:
          student.user.name ||
          `${student.user.firstName || ""} ${student.user.lastName || ""}`.trim() ||
          student.user.email,
        email: student.user.email,
        classroom: {
          name: classroom.name,
          gradeLevel: classroom.gradeLevel.name,
        },
      },
      currentSession,
      attendance,
      message,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching real-time attendance:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
