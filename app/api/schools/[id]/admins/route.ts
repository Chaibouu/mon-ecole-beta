import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { AdminCreateSchema, AdminUpdateSchema } from "@/schemas/membership";
import { ensureSchoolAccess } from "@/lib/school-access";

// POST /api/schools/[id]/admins - créer/relier un admin d'école
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: schoolId } = await params;
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const contentType = req.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await req.json()
      : Object.fromEntries((await req.formData()).entries());

    const parsed = AdminCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    let userId: string;
    if ("existingUserId" in parsed.data) {
      userId = parsed.data.existingUserId as string;
      await db.user.update({
        where: { id: userId },
        data: { role: "ADMIN" as any },
      });
    } else {
      const { name, email, phone, password } = (parsed.data as any).user;
      const hashed = await bcrypt.hash(password, 10);
      const user = await db.user.create({
        data: {
          name,
          email,
          phone,
          password: hashed,
          role: "ADMIN",
          isActive: true,
          emailVerified: new Date(),
        },
      });
      userId = user.id;
    }

    await db.userSchool.upsert({
      where: { userId_schoolId: { userId, schoolId } },
      update: { role: "ADMIN" as any },
      create: { userId, schoolId, role: "ADMIN" as any },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// GET /api/schools/[id]/admins - Récupérer la liste des admins d'une école
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: schoolId } = await params;
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const admins = await db.userSchool.findMany({
      where: {
        schoolId,
        role: "ADMIN",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            emailVerified: true,
          },
        },
      },
    });

    return NextResponse.json({ admins });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT /api/schools/[id]/admins - Modifier un admin d'école
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: schoolId } = await params;
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await req.json()
      : Object.fromEntries((await req.formData()).entries());

    const parsed = AdminUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    const { name, email, phone, password, isActive } = parsed.data;

    // Vérifier que l'admin existe dans cette école
    const existingAdmin = await db.userSchool.findFirst({
      where: {
        userId,
        schoolId,
        role: "ADMIN",
      },
      include: {
        user: true,
      },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { error: "Administrateur non trouvé dans cette école" },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Mettre à jour l'utilisateur
    await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Erreur lors de la modification de l'admin:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/schools/[id]/admins - Supprimer un admin d'école
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: schoolId } = await params;
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'admin existe dans cette école
    const existingAdmin = await db.userSchool.findFirst({
      where: {
        userId,
        schoolId,
        role: "ADMIN",
      },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { error: "Administrateur non trouvé dans cette école" },
        { status: 404 }
      );
    }

    // Supprimer la relation UserSchool (retirer l'admin de l'école)
    await db.userSchool.delete({
      where: {
        userId_schoolId: {
          userId,
          schoolId,
        },
      },
    });

    // Optionnel : Vérifier s'il faut supprimer complètement l'utilisateur
    // Si l'utilisateur n'a plus d'école, on peut le désactiver ou le supprimer
    const remainingSchools = await db.userSchool.findMany({
      where: { userId },
    });

    if (remainingSchools.length === 0) {
      // L'utilisateur n'est plus dans aucune école, le désactiver
      await db.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Erreur lors de la suppression de l'admin:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
