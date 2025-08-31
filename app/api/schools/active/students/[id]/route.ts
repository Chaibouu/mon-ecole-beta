import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchoolAccess } from "@/lib/school-access";
import { StudentUpdateSchema } from "@/schemas/membership";

const includeUser = { user: true } as const;

// GET /api/schools/active/students/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId)
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    const access = await ensureSchoolAccess(req, schoolId, [
      "ADMIN",
      "TEACHER",
    ]);
    if (access instanceof Response) return access;

    const student = await db.studentProfile.findFirst({
      where: { id, schoolId },
      include: includeUser,
    });
    if (!student)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ student });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/schools/active/students/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId)
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const payload = await req.json();
    const parsed = StudentUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    const student = await db.studentProfile.findFirst({
      where: { id, schoolId },
    });
    if (!student)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = parsed.data as any;
    if (data.name || data.email) {
      await db.user.update({
        where: { id: student.userId },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.email ? { email: data.email } : {}),
        },
      });
    }
    if (data.profile) {
      await db.studentProfile.update({
        where: { id },
        data: {
          ...(data.profile.matricule
            ? { matricule: data.profile.matricule }
            : {}),
          ...(data.profile.gender ? { gender: data.profile.gender } : {}),
          ...(data.profile.dateOfBirth
            ? { dateOfBirth: new Date(data.profile.dateOfBirth) }
            : {}),
        },
      });
    }

    const updated = await db.studentProfile.findFirst({
      where: { id, schoolId },
      include: includeUser,
    });
    return NextResponse.json({ student: updated });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/schools/active/students/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId)
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const student = await db.studentProfile.findFirst({
      where: { id, schoolId },
    });
    if (!student)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.userSchool
      .delete({
        where: { userId_schoolId: { userId: student.userId, schoolId } },
      })
      .catch(() => {});
    await db.studentProfile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
