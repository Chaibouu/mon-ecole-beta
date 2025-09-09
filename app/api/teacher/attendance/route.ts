import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";

// GET /api/teacher/attendance - Récupérer les enregistrements d'assiduité pour un cours
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timetableEntryId = searchParams.get("timetableEntryId");
    const date = searchParams.get("date"); // Format: YYYY-MM-DD
    const classroomId = searchParams.get("classroomId");

    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";

    if (!schoolId) {
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    }

    if (!date || !classroomId) {
      return NextResponse.json(
        { error: "Date et classe requises" },
        { status: 400 }
      );
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un enseignant
    const teacherProfile = await db.teacherProfile.findFirst({
      where: { userId, schoolId },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Profil enseignant non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier l'accès à cette classe
    const hasAccess = await db.timetableEntry.findFirst({
      where: {
        teacherId: teacherProfile.id,
        classroomId: classroomId,
        ...(timetableEntryId ? { id: timetableEntryId } : {}),
      },
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Accès non autorisé à cette classe" },
        { status: 403 }
      );
    }

    const targetDate = new Date(date);

    // Récupérer les enregistrements d'assiduité existants
    const whereClause: any = {
      date: {
        gte: new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate()
        ),
        lt: new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate() + 1
        ),
      },
    };

    if (timetableEntryId) {
      whereClause.timetableEntryId = timetableEntryId;
    } else {
      // Si pas de timetableEntryId spécifique, chercher tous les cours de cette classe ce jour-là
      const classroomTimetableEntries = await db.timetableEntry.findMany({
        where: {
          classroomId: classroomId,
          teacherId: teacherProfile.id,
        },
        select: { id: true },
      });
      whereClause.timetableEntryId = {
        in: classroomTimetableEntries.map(entry => entry.id),
      };
    }

    const existingRecords = await db.attendanceRecord.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: true,
          },
        },
        timetableEntry: {
          include: {
            subject: true,
          },
        },
      },
    });

    // Récupérer tous les élèves de la classe
    const enrollments = await db.enrollment.findMany({
      where: {
        classroomId: classroomId,
        academicYear: { isActive: true },
      },
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
    });

    return NextResponse.json({
      date: targetDate,
      classroomId,
      timetableEntryId,
      students: enrollments.map(enrollment => enrollment.student),
      attendanceRecords: existingRecords,
      totalStudents: enrollments.length,
      recordedCount: existingRecords.length,
    });
  } catch (error) {
    console.error("Error fetching attendance for teacher:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/teacher/attendance - Enregistrer l'assiduité
export async function POST(req: NextRequest) {
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

    const teacherProfile = await db.teacherProfile.findFirst({
      where: { userId, schoolId },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Profil enseignant non trouvé" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { classroomId, date, timetableEntryId, attendanceData } = body;

    // attendanceData: [{ studentId, status, notes? }]

    if (
      !classroomId ||
      !date ||
      !attendanceData ||
      !Array.isArray(attendanceData)
    ) {
      return NextResponse.json(
        { error: "Données d'assiduité invalides" },
        { status: 400 }
      );
    }

    // Vérifier l'accès à cette classe
    const hasAccess = await db.timetableEntry.findFirst({
      where: {
        teacherId: teacherProfile.id,
        classroomId: classroomId,
        ...(timetableEntryId ? { id: timetableEntryId } : {}),
      },
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Accès non autorisé à cette classe" },
        { status: 403 }
      );
    }

    const targetDate = new Date(date);

    // Supprimer les enregistrements existants pour cette date/classe/cours
    const deleteWhereClause: any = {
      date: {
        gte: new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate()
        ),
        lt: new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate() + 1
        ),
      },
    };

    if (timetableEntryId) {
      deleteWhereClause.timetableEntryId = timetableEntryId;
    } else {
      // Si pas de timetableEntryId spécifique, supprimer tous les enregistrements de cette classe pour ce jour
      const classroomTimetableEntries = await db.timetableEntry.findMany({
        where: {
          classroomId: classroomId,
          teacherId: teacherProfile.id,
        },
        select: { id: true },
      });
      deleteWhereClause.timetableEntryId = {
        in: classroomTimetableEntries.map(entry => entry.id),
      };
    }

    await db.attendanceRecord.deleteMany({
      where: deleteWhereClause,
    });

    // Créer les nouveaux enregistrements
    const records = await Promise.all(
      attendanceData.map(async (record: any) => {
        return await db.attendanceRecord.create({
          data: {
            studentId: record.studentId,
            timetableEntryId: timetableEntryId || hasAccess.id,
            status: record.status,
            notes: record.notes || null,
            date: targetDate,
            recordedById: teacherProfile.id,
          },
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      recordsCreated: records.length,
      records,
    });
  } catch (error) {
    console.error("Error creating attendance records:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
