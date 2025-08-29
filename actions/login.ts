"use server";

import { LoginSchema } from "@/schemas";
import { setMultipleCookies } from "./setMultipleCookies";

export const login = async (data: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) => {
  // Valider les données avec Zod
  const validatedData = LoginSchema.safeParse(data);

  if (!validatedData.success) {
    return {
      error: validatedData.error.issues.map(issue => issue.message).join(", "),
    };
  }

  const { email, password, rememberMe } = validatedData.data;

  try {
    // Appeler l'API login
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      // Afficher l'erreur envoyée par le backend
      return { error: result.error || "Erreur lors de la connexion" };
    }

    const {
      accessToken,
      refreshToken,
      selectedSchoolId,
      needsSelection,
      schools,
      isSuperAdmin,
    } = result;

    // Configuration des cookies pour les tokens

    // Cookie pour le token d'accès
    const cookiesToSet = [
      {
        name: "accessToken",
        value: accessToken,
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60, // 1 heure
          sameSite: "lax", // Cross-site permis
        },
      },
      {
        name: "refreshToken",
        value: refreshToken,
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
          sameSite: "lax", // Cross-site permis
        },
      },
    ] as any[];

    // Si une seule école: poser schoolId côté front (cookie non httpOnly) via action
    if (selectedSchoolId) {
      cookiesToSet.push({
        name: "schoolId",
        value: selectedSchoolId,
        options: {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          maxAge: 365 * 24 * 60 * 60,
          sameSite: "lax",
        },
      });
    }

    await setMultipleCookies(cookiesToSet as any);

    // Retourner infos pour que le client puisse éventuellement afficher le sélecteur
    return {
      success: "Connexion réussie",
      needsSelection,
      schools,
      isSuperAdmin,
      selectedSchoolId,
    };
  } catch (error) {
    console.error("Erreur dans loginAction:", error);
    return { error: "Erreur serveur" };
  }
};
