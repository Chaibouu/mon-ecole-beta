import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createEncryptedJWT } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await req.json()
      : {};
    const refreshTokenFromBody = body?.refreshToken as string | undefined;
    const refreshTokenFromCookie = req.cookies.get("refreshToken")?.value;
    const refreshToken = refreshTokenFromBody || refreshTokenFromCookie;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Token de rafraîchissement manquant" },
        { status: 400 }
      );
    }

    // Rechercher le token de rafraîchissement dans la base de données
    const session = await db.session.findUnique({
      where: { refreshToken },
    });

    if (!session || new Date() > session.refreshTokenExpires) {
      return NextResponse.json(
        { error: "Token de rafraîchissement expiré ou introuvable" },
        { status: 403 }
      );
    }

    // Générer un nouveau token d'accès chiffré avec JWE
    const payload = { userId: session.userId }; // Charger les informations utilisateur
    const newAccessToken = createEncryptedJWT(payload, "8h");

    // Calculer l'expiration du token d'accès (en secondes)
    const accessTokenExpiresAt = 60 * 60 * 8;

    // Mettre à jour la session avec le nouveau token d'accès et l'heure d'expiration
    await db.session.update({
      where: { id: session.id },
      data: {
        sessionToken: newAccessToken, // Stocker le nouveau token d'accès chiffré
        expires: new Date(Date.now() + accessTokenExpiresAt * 1000),
      },
    });

    // Préparer la réponse
    const url = req.nextUrl;
    const returnTo = url.searchParams.get("returnTo");

    const res = returnTo
      ? NextResponse.redirect(returnTo)
      : NextResponse.json({
          accessToken: newAccessToken,
          accessTokenExpiresAt,
        });

    // Définir le cookie d'accessToken pour les clients web
    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: accessTokenExpiresAt,
      path: "/",
      sameSite: "lax",
    });

    return res;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement des tokens :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

