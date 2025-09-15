"use client";

import { useState, useEffect } from "react";
import {
  schoolNavigation,
  filterNavigationByRole,
  getAccessiblePaths,
  type NavigationGroup,
} from "@/settings/schoolNavigation";
import { getUserProfile } from "@/actions/getUserProfile";
import {
  validateSchoolContext,
  cleanupSchoolContext,
} from "@/actions/cleanupAuth";

interface UseNavigationReturn {
  navigation: NavigationGroup[];
  userRole: string | null;
  accessiblePaths: string[];
  isLoading: boolean;
  canAccess: (path: string) => boolean;
  refreshNavigation: () => Promise<void>;
}

export function useNavigation(): UseNavigationReturn {
  const [navigation, setNavigation] =
    useState<NavigationGroup[]>(schoolNavigation); // Initialiser avec la navigation complète
  const [userRole, setUserRole] = useState<string | null>(null);
  const [accessiblePaths, setAccessiblePaths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNavigation = async () => {
    setIsLoading(true);
    try {
      const result = await getUserProfile();
      if (!result.error) {
        const data = result;
        // Déterminer le rôle de l'utilisateur
        let role = "STUDENT"; // Valeur par défaut

        // Valider et nettoyer le contexte école si nécessaire
        validateSchoolContext(data.schools || [], data.isSuperAdmin || false);

        // Si l'utilisateur est SUPER_ADMIN, utiliser ce rôle directement
        if (data.isSuperAdmin) {
          role = "SUPER_ADMIN";
          cleanupSchoolContext();
        } else {
          // Sinon, chercher le rôle dans l'école actuelle
          const currentSchoolId =
            localStorage.getItem("schoolId") || data.selectedSchoolId;

          const currentSchool = data.schools?.find(
            (s: any) => s.schoolId === currentSchoolId
          );
          role = currentSchool?.role || data.schools?.[0]?.role || "STUDENT";
        }

        setUserRole(role);

        // Filtrer la navigation selon le rôle
        const filteredNav = filterNavigationByRole(schoolNavigation, role);
        setNavigation(filteredNav);

        // Générer la liste des chemins accessibles
        const paths = getAccessiblePaths(role);
        setAccessiblePaths(paths);
      } else {
        console.error("Erreur lors du chargement du profil:", result.error);
        // Fallback avec rôle STUDENT
        setUserRole("STUDENT");
        const fallbackNav = filterNavigationByRole(schoolNavigation, "STUDENT");
        setNavigation(fallbackNav);
        setAccessiblePaths(getAccessiblePaths("STUDENT"));
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la navigation:", error);
      // Fallback avec rôle STUDENT
      setUserRole("STUDENT");
      const fallbackNav = filterNavigationByRole(schoolNavigation, "STUDENT");
      setNavigation(fallbackNav);
      setAccessiblePaths(getAccessiblePaths("STUDENT"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNavigation();
  }, []);

  const canAccess = (path: string): boolean => {
    return accessiblePaths.includes(path);
  };

  const refreshNavigation = async () => {
    await loadNavigation();
  };

  return {
    navigation,
    userRole,
    accessiblePaths,
    isLoading,
    canAccess,
    refreshNavigation,
  };
}

/**
 * Hook pour vérifier les permissions d'accès à une route
 */
export function useRouteAccess(requiredPath: string) {
  const { canAccess, userRole, isLoading } = useNavigation();

  return {
    hasAccess: canAccess(requiredPath),
    userRole,
    isLoading,
  };
}

/**
 * Hook pour obtenir les éléments de navigation d'un groupe spécifique
 */
export function useNavigationGroup(groupTitle: string) {
  const { navigation } = useNavigation();

  const group = navigation.find(g => g.title === groupTitle);

  return {
    group,
    items: group?.items || [],
  };
}
