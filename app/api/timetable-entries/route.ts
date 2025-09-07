import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { TimetableEntryCreateSchema } from "@/schemas/timetable-entry";

// GET /api/timetable-entries?classroomId=...&day=MONDAY
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const schoolId = req.headers.get("x-school-id") || "";
  const academicYearId = req.headers.get("x-academic-year-id") || "";
  const userId = await getUserIdFromToken(token);
  if (!userId)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const ok = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "TEACHER",
    "PARENT",
    "STUDENT",
  ]);
  if (!ok)
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const classroomId = searchParams.get("classroomId") || undefined;
  const day = searchParams.get("day") || undefined;
  const list = await db.timetableEntry.findMany({
    where: {
      classroom: { schoolId },
      classroomId,
      dayOfWeek: day as any,
      academicYearId: academicYearId || undefined,
    },
    include: { subject: true, teacher: { include: { user: true } } },
    orderBy: { startTime: "asc" },
  });
  return NextResponse.json({ timetable: list });
}

// POST /api/timetable-entries (ADMIN)
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok)
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    const parsed = TimetableEntryCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const {
      classroomId,
      academicYearId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
    } = parsed.data;
    // Conflits: même classe/jour chevauchés
    const overlapping = await db.timetableEntry.findFirst({
      where: {
        classroomId,
        academicYearId,
        dayOfWeek: dayOfWeek as any,
        OR: [
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gt: new Date(startTime) },
          },
        ],
      },
      select: { id: true },
    });
    if (overlapping) {
      return NextResponse.json(
        { error: "Conflit d'horaire pour cette classe" },
        { status: 400 }
      );
    }
    // Conflit prof: même créneau
    const teacherBusy = await db.timetableEntry.findFirst({
      where: {
        teacherId,
        academicYearId,
        dayOfWeek: dayOfWeek as any,
        OR: [
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gt: new Date(startTime) },
          },
        ],
      },
      select: { id: true },
    });
    if (teacherBusy) {
      return NextResponse.json(
        { error: "L'enseignant a déjà un cours sur ce créneau" },
        { status: 400 }
      );
    }
    const item = await db.timetableEntry.create({
      data: {
        classroomId,
        academicYearId,
        subjectId,
        teacherId,
        dayOfWeek: dayOfWeek as any,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });
    return NextResponse.json({ timetableEntry: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
