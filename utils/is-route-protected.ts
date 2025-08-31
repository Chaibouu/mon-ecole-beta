import { canUserAccessPath } from "@/lib/navigationUtils";

/**
 * Fonction pour vérifier si une route est protégée et si l'utilisateur est autorisé à y accéder
 * @param userRole - Le rôle de l'utilisateur actuel
 * @param pathname - Le chemin de la route actuelle
 * @returns true si l'utilisateur n'est pas autorisé à accéder à la route, false sinon
 */
export const isRouteProtected = (
  userRole: string,
  pathname: string
): boolean => {
  // Si pas de rôle, considérer comme non autorisé pour les routes protégées
  if (!userRole) {
    return true;
  }

  // Routes toujours accessibles (pour éviter les blocages)
  const alwaysAccessibleRoutes = [
    "/dashboard",
    "/select-school",
    "/auth/login",
    "/auth/logout",
    "/unauthorized", // Important: éviter boucle de redirection
  ];

  if (alwaysAccessibleRoutes.includes(pathname)) {
    return false;
  }

  try {
    // Utiliser notre nouveau système de navigation
    const hasAccess = canUserAccessPath(userRole, pathname);

    // Retourner true si l'utilisateur n'a PAS accès (route protégée)
    return !hasAccess;
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    // En cas d'erreur, permettre l'accès pour éviter de bloquer complètement
    return false;
  }
};
