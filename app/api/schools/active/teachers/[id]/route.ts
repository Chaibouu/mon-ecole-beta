import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchoolAccess } from "@/lib/school-access";
import { TeacherUpdateSchema } from "@/schemas/teacher";

// Helper: include user with teacher profile
const includeUser = { user: true } as const;

// GET /api/schools/active/teachers/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId) {
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    }
    const access = await ensureSchoolAccess(req, schoolId, [
      "ADMIN",
      "TEACHER",
    ]);
    if (access instanceof Response) return access;

    const teacher = await db.teacherProfile.findFirst({
      where: { id, schoolId },
      include: includeUser,
    });
    if (!teacher)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ teacher });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/schools/active/teachers/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId) {
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    }
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const payload = await req.json();
    const parsed = TeacherUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    const teacher = await db.teacherProfile.findFirst({
      where: { id, schoolId },
    });
    if (!teacher)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = parsed.data as any;
    // Mettre à jour les champs existants uniquement
    if (data.firstName || data.lastName || data.email) {
      await db.user.update({
        where: { id: teacher.userId },
        data: {
          ...(data.firstName ? { firstName: data.firstName } : {}),
          ...(data.lastName ? { lastName: data.lastName } : {}),
          ...(data.email ? { email: data.email } : {}),
        },
      });
    }
    if (data.bio) {
      await db.teacherProfile.update({
        where: { id },
        data: { bio: data.bio },
      });
    }

    const updated = await db.teacherProfile.findFirst({
      where: { id, schoolId },
      include: includeUser,
    });
    return NextResponse.json({ teacher: updated });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/schools/active/teachers/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId) {
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    }
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const teacher = await db.teacherProfile.findFirst({
      where: { id, schoolId },
    });
    if (!teacher)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Retirer le lien userSchool et le profil enseignant pour cette école
    await db.userSchool
      .delete({
        where: { userId_schoolId: { userId: teacher.userId, schoolId } },
      })
      .catch(() => {});

    await db.teacherProfile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

