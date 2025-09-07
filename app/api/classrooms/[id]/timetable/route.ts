import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

type DayKey =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

async function resolveAcademicYearId(
  schoolId: string,
  headerVal: string | null
) {
  if (headerVal && headerVal.length > 0) return headerVal;
  const active = await db.academicYear.findFirst({
    where: { schoolId, isActive: true },
    select: { id: true },
  });
  return active?.id || "";
}

async function isMemberOfClassroom(
  userId: string,
  schoolId: string,
  classroomId: string,
  academicYearId: string,
  rolesAllowed: string[]
): Promise<boolean> {
  // Admins/School admins bypass membership check
  const isAdmin = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "SUPER_ADMIN",
  ]);
  if (isAdmin) return true;

  // Teacher assigned to this classroom in the academic year?
  const teacher = await db.teacherProfile.findFirst({
    where: { userId, schoolId },
    select: { id: true },
  });
  if (teacher) {
    const assigned = await db.teacherAssignment.findFirst({
      where: { teacherId: teacher.id, classroomId, academicYearId },
      select: { id: true },
    });
    if (assigned) return true;
  }

  // Student enrolled in this classroom in the academic year?
  const student = await db.studentProfile.findFirst({
    where: { userId, schoolId },
    select: { id: true },
  });
  if (student) {
    const enrolled = await db.enrollment.findFirst({
      where: { studentId: student.id, classroomId, academicYearId },
      select: { id: true },
    });
    if (enrolled) return true;
  }

  // Parent of a student enrolled in this classroom?
  const parent = await db.parentProfile.findFirst({
    where: { userId, schoolId },
    select: { id: true },
  });
  if (parent) {
    const childLinked = await db.parentStudent.findFirst({
      where: {
        parentProfileId: parent.id,
        student: { enrollments: { some: { classroomId, academicYearId } } },
      },
      select: { id: true },
    });
    if (childLinked) return true;
  }

  // Other roles (USER) — not allowed unless admin
  return false;
}

// GET /api/classrooms/[id]/timetable — emploi du temps hebdomadaire, groupé par jour
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: classroomId } = await params;

  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const schoolId = req.headers.get("x-school-id") || "";
  const headerAy = req.headers.get("x-academic-year-id");
  const userId = await getUserIdFromToken(token);
  if (!userId)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const rolesOk = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "TEACHER",
    "STUDENT",
    "PARENT",
    "USER",
  ]);
  if (!rolesOk)
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

  const academicYearId = await resolveAcademicYearId(schoolId, headerAy);
  if (!academicYearId)
    return NextResponse.json(
      { error: "Année académique non trouvée" },
      { status: 400 }
    );

  const member = await isMemberOfClassroom(
    userId,
    schoolId,
    classroomId,
    academicYearId,
    []
  );
  if (!member)
    return NextResponse.json(
      { error: "Accès restreint à la classe" },
      { status: 403 }
    );

  const entries = await db.timetableEntry.findMany({
    where: { classroomId, academicYearId },
    include: {
      subject: true,
      teacher: { include: { user: true } },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  const days: DayKey[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  const grouped: Record<DayKey, any[]> = {
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: [],
    SUNDAY: [],
  };

  for (const entry of entries) {
    const key = entry.dayOfWeek as DayKey;
    if (!grouped[key]) grouped[key] = [] as any[];
    grouped[key].push(entry);
  }

  return NextResponse.json({ timetable: grouped });
}
