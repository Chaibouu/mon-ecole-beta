import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/tokens";
import { getUserById } from "@/data/user";
import { headers } from "next/headers";
import { db } from "@/lib/db";

// Forcer le rendu dynamique
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    // Récupérer le token d'accès depuis les cookies ou l'en-tête Authorization
    const headersList = await headers();
    const token = headersList.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    // Vérifier et récupérer l'ID utilisateur depuis le token
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 403 }
      );
    }

    // Récupérer l'utilisateur à partir de l'ID
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les rattachements école (UserSchool) + info école
    const userSchools = await db.userSchool.findMany({
      where: { userId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            logoUrl: true,
            slogan: true,
            brandPrimaryColor: true,
            brandSecondaryColor: true,
            websiteUrl: true,
          },
        },
      },
    });

    // Déterminer l'école active si fournie
    const activeSchoolIdFromHeader =
      headersList.get("x-school-id") || undefined;
    const selectedSchoolId =
      activeSchoolIdFromHeader ||
      (userSchools.length === 1 ? userSchools[0].schoolId : undefined);

    const schools = userSchools.map(us => ({
      schoolId: us.schoolId,
      code: us.school?.code || null,
      name: us.school?.name || null,
      role: us.role,
      logoUrl: us.school?.logoUrl || null,
      slogan: us.school?.slogan || null,
      brandPrimaryColor: us.school?.brandPrimaryColor || null,
      brandSecondaryColor: us.school?.brandSecondaryColor || null,
      websiteUrl: us.school?.websiteUrl || null,
    }));

    const isSuperAdmin = user.role === "SUPER_ADMIN";

    // Retourner les informations de l'utilisateur et le contexte d'école
    return NextResponse.json({ user, schools, selectedSchoolId, isSuperAdmin });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du profil utilisateur:",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

