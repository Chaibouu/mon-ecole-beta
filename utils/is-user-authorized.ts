// Fonction pour vérifier les autorisations de l'utilisateur
// Étend la vérification à des rôles hiérarchiques si besoin
export function isUserAuthorized(
  userRole: string,
  allowedRoles: string[]
): boolean {
  // Ex: SUPER_ADMIN a accès à tout
  if (userRole === "SUPER_ADMIN") return true;
  return allowedRoles.includes(userRole);
}
