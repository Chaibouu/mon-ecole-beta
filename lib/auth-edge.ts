/**
 * Authentification compatible Edge Runtime pour le middleware
 * Ne décode pas le token côté Edge (pas de Prisma, pas de crypto Node).
 * Se contente de vérifier la présence du cookie d'accès.
 */

import { cookies } from "next/headers";

interface EdgeAuthResult {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  error?: string;
}

/**
 * Valide l'authentification côté Edge Runtime sans accès à la base de données
 * Utilisé uniquement dans le middleware pour les vérifications de base
 */
export async function validateAuthEdge(): Promise<EdgeAuthResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Token d'accès manquant" };
  }

  // Ne pas décoder côté Edge. Considérer uniquement l'authentification basique.
  // Les détails utilisateur/role seront résolus côté serveur (Node) dans les actions/endpoints.
  return {};
}

/**
 * Extrait le rôle utilisateur depuis le token sans accès DB
 */
export async function getUserRoleFromToken(): Promise<string> {
  // Pas de décodage côté Edge. Retourner un rôle par défaut si nécessaire.
  return "STUDENT";
}
