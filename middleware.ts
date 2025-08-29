import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { validateAuthEdge } from "./lib/auth-edge"; // Edge-compatible auth
import { applyRateLimit } from "./lib/rateLimit";
import { isRouteProtected } from "./utils/is-route-protected";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  try {
    // Vérification des routes
    const isApiRoute = nextUrl.pathname.startsWith("/api"); // API routes
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix); // Auth API routes
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname); // Public routes
    const isAuthRoute = authRoutes.includes(nextUrl.pathname); // Auth-related pages (login, register, etc.)

    // Appliquer un "rate limit" uniquement sur les routes d'authentification
    if (isApiAuthRoute) {
      const rateLimitResponse = await applyRateLimit(req);
      if (rateLimitResponse) {
        return rateLimitResponse; // Retourner la réponse si le rate limit est dépassé
      }
      return NextResponse.next(); // Continuer l'exécution si le rate limit n'est pas dépassé
    }

    // **Cas API :** Récupérer les tokens directement depuis l'en-tête d'authentification
    if (isApiRoute) {
      const authorizationHeader = req.headers.get("Authorization");
      const accessToken = authorizationHeader?.split(" ")[1];

      // Si c'est une API d'authentification, pas besoin de vérifier le token
      if (isApiAuthRoute) {
        return NextResponse.next();
      }

      // Si c'est une API protégée, vérifier uniquement le token ici
      // L'exigence de x-school-id est gérée au niveau des endpoints concernés
      if (!isPublicRoute && !accessToken) {
        return NextResponse.json(
          { error: "Token d'accès manquant ou non valide" },
          { status: 401 }
        );
      }

      return NextResponse.next();
    }

    // **Cas Frontend** : si pas d'accessToken mais un refreshToken, tenter un refresh ICI
    let accessTokenCookie = req.cookies.get("accessToken")?.value;
    const refreshTokenCookie = req.cookies.get("refreshToken")?.value;

    if (!accessTokenCookie && refreshTokenCookie) {
      try {
        const refreshUrl = new URL("/api/auth/refresh", nextUrl);
        const refreshRes = await fetch(refreshUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refreshTokenCookie }),
          cache: "no-store",
        });

        if (refreshRes.ok) {
          const { accessToken, accessTokenExpiresAt } = await refreshRes.json();
          const res = NextResponse.next();
          res.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: accessTokenExpiresAt,
            path: "/",
            sameSite: "lax",
          });
          return res;
        }
      } catch {
        // ignore, handled below
      }
    }

    const isLoggedIn = Boolean(req.cookies.get("accessToken")?.value);

    // **Auth Routes** : Rediriger les utilisateurs connectés loin des pages de login, etc.
    if (isAuthRoute && isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    // **Protected Routes par défaut** : Si ce n'est pas une route publique ou d'authentification, elle est protégée
    if (!isPublicRoute && !isAuthRoute && !isLoggedIn) {
      let callbackUrl = nextUrl.pathname;
      if (nextUrl.search) {
        callbackUrl += nextUrl.search;
      }
      const encodedCallbackUrl = encodeURIComponent(callbackUrl);

      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
      );
    }

    // **Public Routes** : Accès libre aux routes publiques
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // **Toutes les autres routes** : Si aucune autre règle ne s'applique, laisser passer
    return NextResponse.next();
  } catch (error) {
    console.error("Erreur dans le middleware:", error);

    // En cas d'erreur, rediriger vers la page de login
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }
}

// Configuration pour matcher les routes nécessaires
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
