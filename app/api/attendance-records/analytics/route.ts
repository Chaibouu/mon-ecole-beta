import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// GET /api/attendance-records/analytics?classroomId=...&subjectId=...&from=...&to=...
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const schoolId = req.headers.get("x-school-id") || "";
  const userId = await getUserIdFromToken(token);

  if (!userId)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const roleOk = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "TEACHER",
    "PARENT",
    "STUDENT",
    "USER",
  ]);

  if (!roleOk)
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

  const sp = req.nextUrl.searchParams;
  const classroomId = sp.get("classroomId") || undefined;
  const subjectId = sp.get("subjectId") || undefined;
  const academicYearId = sp.get("academicYearId") || undefined;
  const from = sp.get("from");
  const to = sp.get("to");

  const isAdmin = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  // Scope restrictions for non-admins
  let scopedStudentIds: string[] | undefined = undefined;
  let scopedTeacherId: string | undefined = undefined;

  if (!isAdmin) {
    const teacher = await db.teacherProfile.findFirst({
      where: { userId, schoolId },
      select: { id: true },
    });
    const parent = await db.parentProfile.findFirst({
      where: { userId, schoolId },
      select: { id: true },
    });
    const student = await db.studentProfile.findFirst({
      where: { userId, schoolId },
      select: { id: true },
    });

    if (teacher) {
      scopedTeacherId = teacher.id;
    } else if (student) {
      scopedStudentIds = [student.id];
    } else if (parent) {
      const children = await db.parentStudent.findMany({
        where: { parentProfileId: parent.id },
        select: { studentProfileId: true },
      });
      scopedStudentIds = children.map(c => c.studentProfileId);
      if (scopedStudentIds.length === 0) scopedStudentIds = ["__none__"];
    } else {
      return NextResponse.json({ error: "Accès restreint" }, { status: 403 });
    }
  }

  try {
    // Base query conditions
    const baseWhere = {
      student: { schoolId },
      ...(scopedStudentIds ? { studentId: { in: scopedStudentIds } } : {}),
      date: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
      ...(classroomId || subjectId || academicYearId || scopedTeacherId
        ? {
            timetableEntry: {
              ...(classroomId ? { classroomId } : {}),
              ...(subjectId ? { subjectId } : {}),
              ...(academicYearId ? { academicYearId } : {}),
              ...(scopedTeacherId ? { teacherId: scopedTeacherId } : {}),
            },
          }
        : {}),
    };

    // Get detailed records for charts
    const attendanceRecords = await db.attendanceRecord.findMany({
      where: baseWhere,
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
        timetableEntry: {
          include: {
            subject: { select: { name: true } },
            teacher: {
              include: {
                user: { select: { name: true } },
              },
            },
            classroom: { select: { name: true } },
          },
        },
      },
      orderBy: [{ date: "asc" }],
    });

    // Calculate summary statistics
    const totalRecords = attendanceRecords.length;
    const statusCounts = attendanceRecords.reduce(
      (acc, record) => {
        const status = record.status || "PRESENT";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Group by date for daily trends
    const dailyStats = attendanceRecords.reduce(
      (acc, record) => {
        const dateKey = record.date.toISOString().split("T")[0];
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            PRESENT: 0,
            ABSENT: 0,
            LATE: 0,
            SICK: 0,
            EXPELLED: 0,
            total: 0,
          };
        }
        const status = record.status || "PRESENT";
        acc[dateKey][status]++;
        acc[dateKey].total++;
        return acc;
      },
      {} as Record<string, any>
    );

    // Group by week for weekly trends
    const weeklyStats = attendanceRecords.reduce(
      (acc, record) => {
        const date = new Date(record.date);
        const startOfWeek = new Date(
          date.setDate(date.getDate() - date.getDay())
        );
        const weekKey = startOfWeek.toISOString().split("T")[0];

        if (!acc[weekKey]) {
          acc[weekKey] = {
            weekStart: weekKey,
            present: 0,
            absent: 0,
            total: 0,
          };
        }

        if (record.status === "PRESENT") {
          acc[weekKey].present++;
        } else {
          acc[weekKey].absent++;
        }
        acc[weekKey].total++;
        return acc;
      },
      {} as Record<string, any>
    );

    // Calculate attendance rate by classroom if admin
    let classroomStats = {};
    if (isAdmin && !classroomId) {
      // For now, we'll skip the complex groupBy and just return empty stats
      // This could be enhanced later with proper classroom-level analytics
      classroomStats = {};
    }

    return NextResponse.json({
      success: true,
      data: {
        attendanceRecords: attendanceRecords.map(record => ({
          id: record.id,
          date: record.date,
          status: record.status,
          notes: record.notes,
          student: {
            id: record.student.id,
            name: record.student.user?.name || "N/A",
          },
          timetableEntry: record.timetableEntry
            ? {
                id: record.timetableEntry.id,
                subject: record.timetableEntry.subject?.name || "N/A",
                teacher: record.timetableEntry.teacher?.user?.name || "N/A",
                classroom: record.timetableEntry.classroom?.name || "N/A",
              }
            : null,
        })),
        summary: {
          totalRecords,
          statusCounts,
          attendanceRate:
            totalRecords > 0
              ? Math.round(((statusCounts.PRESENT || 0) / totalRecords) * 100)
              : 0,
        },
        trends: {
          daily: Object.values(dailyStats).sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
          weekly: Object.values(weeklyStats)
            .map((week: any) => ({
              ...week,
              rate:
                week.total > 0
                  ? Math.round((week.present / week.total) * 100)
                  : 0,
            }))
            .sort(
              (a: any, b: any) =>
                new Date(a.weekStart).getTime() -
                new Date(b.weekStart).getTime()
            ),
        },
        classroomStats,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des analytics" },
      { status: 500 }
    );
  }
}
