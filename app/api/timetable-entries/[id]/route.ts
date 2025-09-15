import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { TimetableEntryUpdateSchema } from "@/schemas/timetable-entry";

// GET /api/timetable-entries/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
  const item = await db.timetableEntry.findFirst({
    where: { id, classroom: { schoolId } },
    include: { subject: true, teacher: { include: { user: true } } },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ timetableEntry: item });
}

// PATCH /api/timetable-entries/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok)
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });

    const parsed = TimetableEntryUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const exists = await db.timetableEntry.findFirst({
      where: { id, classroom: { schoolId } },
      select: { id: true },
    });
    if (!exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    // Si modification du créneau, vérifier chevauchements
    if (
      parsed.data.startTime ||
      parsed.data.endTime ||
      parsed.data.dayOfWeek ||
      parsed.data.teacherId ||
      parsed.data.classroomId ||
      parsed.data.academicYearId
    ) {
      const current = await db.timetableEntry.findUnique({
        where: { id },
        select: {
          classroomId: true,
          academicYearId: true,
          teacherId: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
        },
      });
      if (current) {
        const day = (parsed.data.dayOfWeek as any) ?? current.dayOfWeek;
        const classroomId = parsed.data.classroomId ?? current.classroomId;
        const academicYearId =
          parsed.data.academicYearId ?? current.academicYearId;
        const teacherId = parsed.data.teacherId ?? current.teacherId;
        const start = parsed.data.startTime
          ? new Date(parsed.data.startTime)
          : current.startTime;
        const end = parsed.data.endTime
          ? new Date(parsed.data.endTime)
          : current.endTime;
        const overlapClass = await db.timetableEntry.findFirst({
          where: {
            id: { not: id },
            classroomId,
            academicYearId,
            dayOfWeek: day,
            startTime: { lt: end },
            endTime: { gt: start },
          },
          select: { id: true },
        });
        if (overlapClass) {
          return NextResponse.json(
            { error: "Conflit d'horaire pour cette classe" },
            { status: 400 }
          );
        }
        const overlapTeacher = await db.timetableEntry.findFirst({
          where: {
            id: { not: id },
            teacherId,
            academicYearId,
            dayOfWeek: day,
            startTime: { lt: end },
            endTime: { gt: start },
          },
          select: { id: true },
        });
        if (overlapTeacher) {
          return NextResponse.json(
            { error: "L'enseignant a déjà un cours sur ce créneau" },
            { status: 400 }
          );
        }
      }
    }
    const updated = await db.timetableEntry.update({
      where: { id },
      data: {
        ...parsed.data,
        startTime: parsed.data.startTime
          ? new Date(parsed.data.startTime)
          : undefined,
        endTime: parsed.data.endTime
          ? new Date(parsed.data.endTime)
          : undefined,
      },
    });
    return NextResponse.json({ timetableEntry: updated });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/timetable-entries/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok)
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    const exists = await db.timetableEntry.findFirst({
      where: { id, classroom: { schoolId } },
    });
    if (!exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.timetableEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
