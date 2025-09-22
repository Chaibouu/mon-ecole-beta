import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { z } from "zod";
import bcrypt from "bcryptjs";

const ChangePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  userType: z.enum(["teacher", "parent", "student"]),
});

// PATCH /api/admin/users/[userId]/password - Modifier le mot de passe d'un utilisateur (ADMIN seulement)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Authentification standard
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est ADMIN
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId: targetUserId } = await params;
    const body = await req.json();

    const validatedData = ChangePasswordSchema.parse(body);
    const { newPassword, userType } = validatedData;

    // Vérifier que l'utilisateur cible existe et récupérer les infos
    let targetUser;
    let userProfile;

    switch (userType) {
      case "teacher":
        userProfile = await db.teacherProfile.findFirst({
          where: { userId: targetUserId },
          include: { user: true },
        });
        targetUser = userProfile?.user;
        break;

      case "parent":
        userProfile = await db.parentProfile.findFirst({
          where: { userId: targetUserId },
          include: { user: true },
        });
        targetUser = userProfile?.user;
        break;

      case "student":
        userProfile = await db.studentProfile.findFirst({
          where: { userId: targetUserId },
          include: { user: true },
        });
        targetUser = userProfile?.user;
        break;

      default:
        return NextResponse.json(
          { error: "Type d'utilisateur invalide" },
          { status: 400 }
        );
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur cible appartient à la même école
    if (
      userProfile &&
      "schoolId" in userProfile &&
      userProfile.schoolId !== schoolId
    ) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe
    await db.user.update({
      where: { id: targetUserId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: "Mot de passe modifié avec succès",
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name:
          targetUser.name ||
          `${targetUser.firstName} ${targetUser.lastName}`.trim(),
        userType,
      },
    });
  } catch (error) {
    console.error("Error changing user password:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
