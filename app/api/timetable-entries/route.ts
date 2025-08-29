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
  const userId = await getUserIdFromToken(token);
  if (!userId)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const ok = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "TEACHER",
    "PARENT",
    "STUDENT",
    "USER",
  ]);
  if (!ok)
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const classroomId = searchParams.get("classroomId") || undefined;
  const day = searchParams.get("day") || undefined;
  const list = await db.timetableEntry.findMany({
    where: { classroom: { schoolId }, classroomId, dayOfWeek: day as any },
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
    const { classroomId, subjectId, teacherId, dayOfWeek, startTime, endTime } =
      parsed.data;
    const item = await db.timetableEntry.create({
      data: {
        classroomId,
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

