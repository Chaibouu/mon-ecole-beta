import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { AttendanceRecordCreateSchema } from "@/schemas/attendance-record";

// GET /api/attendance-records?studentId=...&from=...&to=...
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
  const studentId = sp.get("studentId") || undefined;
  const classroomId = sp.get("classroomId") || undefined;
  const timetableEntryId = sp.get("timetableEntryId") || undefined;
  const teacherId = sp.get("teacherId") || undefined;
  const subjectId = sp.get("subjectId") || undefined;
  const academicYearId = sp.get("academicYearId") || undefined;
  const from = sp.get("from");
  const to = sp.get("to");

  const isAdmin = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "SUPER_ADMIN",
  ]);
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

  // Access scope restrictions for non-admins
  let scopedStudentIds: string[] | undefined = undefined;
  let scopedTeacherId: string | undefined = undefined;
  if (!isAdmin) {
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
      if (scopedStudentIds.length === 0) scopedStudentIds = ["__none__"]; // force no results
    } else {
      return NextResponse.json({ error: "Accès restreint" }, { status: 403 });
    }
  }

  const list = await db.attendanceRecord.findMany({
    where: {
      student: { schoolId },
      ...(studentId ? { studentId } : {}),
      ...(scopedStudentIds ? { studentId: { in: scopedStudentIds } } : {}),
      date: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
      ...(timetableEntryId ||
      classroomId ||
      subjectId ||
      teacherId ||
      academicYearId
        ? {
            timetableEntry: {
              ...(timetableEntryId ? { id: timetableEntryId } : {}),
              ...(classroomId ? { classroomId } : {}),
              ...(subjectId ? { subjectId } : {}),
              ...(academicYearId ? { academicYearId } : {}),
              ...(teacherId || scopedTeacherId
                ? { teacherId: teacherId ?? scopedTeacherId }
                : {}),
            },
          }
        : {}),
    },
    include: {
      student: { include: { user: true } },
      timetableEntry: {
        include: {
          subject: true,
          teacher: { include: { user: true } },
          classroom: true,
        },
      },
    },
    orderBy: [{ date: "asc" }, { timetableEntryId: "asc" }],
  });
  return NextResponse.json({ attendanceRecords: list });
}

// POST /api/attendance-records (TEACHER, ADMIN)
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN", "TEACHER"]);
    if (!ok)
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    const parsed = AttendanceRecordCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const { studentId, date, status, timetableEntryId, notes } = parsed.data;

    // Resolve teacher profile and timetable entry
    const teacher = await db.teacherProfile.findFirst({
      where: { userId, schoolId },
      select: { id: true },
    });
    const te = await db.timetableEntry.findFirst({
      where: { id: timetableEntryId, classroom: { schoolId } },
      include: { classroom: true },
    });
    if (!te)
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    // Only the assigned teacher or admin can record
    const isAdmin = await requireSchoolRole(userId, schoolId, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (!isAdmin) {
      if (!teacher || teacher.id !== te.teacherId) {
        return NextResponse.json(
          { error: "Seul l'enseignant assigné peut émarger" },
          { status: 403 }
        );
      }
    }
    // Ensure student is enrolled in this class for the same academic year day
    const enrollment = await db.enrollment.findFirst({
      where: {
        studentId,
        classroomId: te.classroomId,
        academicYearId: te.academicYearId,
      },
      select: { id: true },
    });
    if (!enrollment) {
      return NextResponse.json(
        { error: "Élève non inscrit dans cette classe pour l'année" },
        { status: 400 }
      );
    }
    // Prevent duplicate attendance for same student, same date, same course
    const exists = await db.attendanceRecord.findFirst({
      where: { studentId, date: new Date(date), timetableEntryId },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Présence déjà enregistrée pour ce cours" },
        { status: 400 }
      );
    }
    const item = await db.attendanceRecord.create({
      data: {
        studentId,
        date: new Date(date),
        status: status as any,
        recordedById: teacher?.id ?? null,
        timetableEntryId: timetableEntryId ?? null,
        notes: notes ?? null,
      },
    });
    return NextResponse.json({ attendanceRecord: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
