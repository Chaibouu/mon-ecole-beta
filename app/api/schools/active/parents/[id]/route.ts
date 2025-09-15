import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchoolAccess } from "@/lib/school-access";
import { ParentUpdateSchema } from "@/schemas/membership";

const includeUser = { user: true } as const;

// GET /api/schools/active/parents/[id]
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

    const parent = await db.parentProfile.findFirst({
      where: { id, schoolId },
      include: {
        user: true,
        children: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    if (!parent)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ parent });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/schools/active/parents/[id]
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
    const parsed = ParentUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    const parent = await db.parentProfile.findFirst({
      where: { id, schoolId },
    });
    if (!parent)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = parsed.data as any;
    if (data.name || data.email) {
      await db.user.update({
        where: { id: parent.userId },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.email ? { email: data.email } : {}),
        },
      });
    }
    if (data.profile) {
      await db.parentProfile.update({
        where: { id },
        data: {
          ...(data.profile.phone ? { phone: data.profile.phone } : {}),
          ...(data.profile.address ? { address: data.profile.address } : {}),
          ...(data.profile.profession
            ? { profession: data.profile.profession }
            : {}),
          ...(data.profile.workplace
            ? { workplace: data.profile.workplace }
            : {}),
          ...(data.profile.preferredLanguage
            ? { preferredLanguage: data.profile.preferredLanguage }
            : {}),
        },
      });
    }

    // Gérer les relations parent-enfant
    if (data.children !== undefined) {
      // Supprimer toutes les relations existantes
      await db.parentStudent.deleteMany({
        where: { parentProfileId: id },
      });

      // Créer les nouvelles relations
      if (data.children && Array.isArray(data.children)) {
        for (const child of data.children) {
          // Vérifier que l'étudiant existe dans cette école
          const student = await db.studentProfile.findFirst({
            where: { id: child.studentId, schoolId },
          });

          if (student) {
            await db.parentStudent.create({
              data: {
                parentProfileId: id,
                studentProfileId: child.studentId,
                relationship: child.relationship || "parent",
              },
            });
          }
        }
      }
    }

    const updated = await db.parentProfile.findFirst({
      where: { id, schoolId },
      include: {
        user: true,
        children: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ parent: updated });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/schools/active/parents/[id]
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

    const parent = await db.parentProfile.findFirst({
      where: { id, schoolId },
    });
    if (!parent)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.userSchool
      .delete({
        where: { userId_schoolId: { userId: parent.userId, schoolId } },
      })
      .catch(() => {});
    await db.parentProfile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
