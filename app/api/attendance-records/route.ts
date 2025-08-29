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
  const ok = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "TEACHER",
    "PARENT",
    "STUDENT",
    "USER",
  ]);
  if (!ok)
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  const studentId = req.nextUrl.searchParams.get("studentId") || undefined;
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  const list = await db.attendanceRecord.findMany({
    where: {
      student: { schoolId },
      studentId,
      date: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
    },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ attendance: list });
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
    const { studentId, date, status, recordedById, timetableEntryId, notes } =
      parsed.data;
    const item = await db.attendanceRecord.create({
      data: {
        studentId,
        date: new Date(date),
        status: status as any,
        recordedById: recordedById ?? null,
        timetableEntryId: timetableEntryId ?? null,
        notes: notes ?? null,
      },
    });
    return NextResponse.json({ attendanceRecord: item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

