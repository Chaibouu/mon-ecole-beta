"use client";

/**
 * Nettoie toutes les données d'authentification côté client
 * À appeler lors de la déconnexion ou changement d'utilisateur
 */
export function cleanupClientAuth() {
  if (typeof window !== "undefined") {
    // Nettoyer localStorage
    localStorage.removeItem("schoolId");

    // Nettoyer sessionStorage si on l'utilise
    sessionStorage.clear();

    console.log("Client auth data cleaned up");
  }
}

/**
 * Nettoie uniquement les données spécifiques à l'école
 * À appeler lors du changement de rôle (admin → super admin)
 */
export function cleanupSchoolContext() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("schoolId");
    console.log("School context cleaned up");
  }
}

/**
 * Vérifie si le schoolId dans localStorage est valide pour l'utilisateur actuel
 */
export function validateSchoolContext(
  userSchools: any[],
  isSuperAdmin: boolean
): boolean {
  if (typeof window === "undefined") return true;

  const storedSchoolId = localStorage.getItem("schoolId");

  // Si SUPER_ADMIN, ne devrait pas avoir de schoolId stocké
  if (isSuperAdmin && storedSchoolId) {
    console.log("SUPER_ADMIN detected with stored schoolId, cleaning up");
    localStorage.removeItem("schoolId");
    return false;
  }

  // Si pas SUPER_ADMIN, vérifier que le schoolId est valide
  if (!isSuperAdmin && storedSchoolId) {
    const isValidSchool = userSchools.some(
      school => school.schoolId === storedSchoolId
    );
    if (!isValidSchool) {
      console.log("Invalid schoolId found in localStorage, cleaning up");
      localStorage.removeItem("schoolId");
      return false;
    }
  }

  return true;
}
