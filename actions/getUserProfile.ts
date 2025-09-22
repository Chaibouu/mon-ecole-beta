"use server";

import { getUserInfo, refreshUserToken } from "@/lib/user";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/lib/db";

/**
 * Version unifiée qui combine getUser + getProfile
 * Utilisable partout (middleware, client, server)
 */
export const getUserProfile = cache(async () => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return { error: "Token de rafraîchissement manquant" };
    }

    let currentAccessToken = accessToken;

    // Si pas d'accessToken, tenter de le rafraîchir
    if (!accessToken) {
      try {
        const { accessToken: newAccessToken } =
          await refreshUserToken(refreshToken);
        currentAccessToken = newAccessToken;
      } catch (error) {
        return { error: "Impossible de rafraîchir le token" };
      }
    }

    if (!currentAccessToken) {
      return { error: "Token d'accès invalide" };
    }

    // Récupérer les infos utilisateur de base
    const userData = await getUserInfo(currentAccessToken);
    if (userData.error) {
      return { error: userData.error };
    }

    const userId = userData.user?.id;
    if (!userId) {
      return { error: "ID utilisateur introuvable" };
    }

    // Récupérer les écoles associées (comme dans /api/profile)
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

    // Déterminer l'école active
    const schoolIdCookie = cookieStore.get("schoolId")?.value;
    const selectedSchoolId =
      schoolIdCookie ||
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

    const isSuperAdmin = userData.user?.role === "SUPER_ADMIN";

    return {
      user: userData.user,
      schools,
      selectedSchoolId,
      isSuperAdmin,
      // Pour compatibilité avec getUser
      tokenInfo:
        currentAccessToken !== accessToken
          ? {
              accessToken: currentAccessToken,
              // Aligner sur 1 an pour cohérence avec les routes auth
              expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
            }
          : undefined,
    };
  } catch (error) {
    console.error("Erreur dans getUserProfile:", error);
    return { error: "Erreur serveur" };
  }
});

/**
 * Version allégée pour le middleware (sans écoles)
 * Plus rapide pour les vérifications basiques
 */
export const getUserBasic = cache(async () => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return { error: "Token de rafraîchissement manquant" };
    }

    let currentAccessToken = accessToken;

    if (!accessToken) {
      try {
        const { accessToken: newAccessToken } =
          await refreshUserToken(refreshToken);
        currentAccessToken = newAccessToken;
      } catch (error) {
        return { error: "Impossible de rafraîchir le token" };
      }
    }

    if (!currentAccessToken) {
      return { error: "Token d'accès invalide" };
    }

    const userData = await getUserInfo(currentAccessToken);
    if (userData.error) {
      return { error: userData.error };
    }

    return {
      user: userData.user,
      tokenInfo:
        currentAccessToken !== accessToken
          ? {
              accessToken: currentAccessToken,
              expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 an
            }
          : undefined,
    };
  } catch (error) {
    console.error("Erreur dans getUserBasic:", error);
    return { error: "Erreur serveur" };
  }
});
