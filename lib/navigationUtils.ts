import {
  schoolNavigation,
  filterNavigationByRole,
  getAccessiblePaths,
  type NavigationGroup,
  type NavigationItem,
  type ChildrenItem,
} from "@/settings/schoolNavigation";

/**
 * Utilitaires pour la navigation côté serveur
 */

/**
 * Vérifie si un utilisateur avec un rôle donné peut accéder à un chemin
 */
/**
 * Mapping des anciens rôles vers les nouveaux rôles du système
 */
function mapLegacyRole(role: string): string {
  const roleMapping: { [key: string]: string } = {
    USER: "STUDENT", // Migration: anciens USER deviennent STUDENT (temporaire)
    ADMIN: "ADMIN",
    SUPER_ADMIN: "SUPER_ADMIN",
    TEACHER: "TEACHER",
    STUDENT: "STUDENT",
    PARENT: "PARENT",
  };

  return roleMapping[role] || "STUDENT"; // Fallback vers STUDENT
}

export function canUserAccessPath(userRole: string, path: string): boolean {
  // Mapper le rôle legacy s'il existe
  const mappedRole = mapLegacyRole(userRole);
  const accessiblePaths = getAccessiblePaths(mappedRole);
  return accessiblePaths.includes(path);
}

/**
 * Trouve le premier chemin accessible pour un rôle donné
 */
export function getFirstAccessiblePath(userRole: string): string {
  const accessiblePaths = getAccessiblePaths(userRole);
  return accessiblePaths[0] || "/dashboard";
}

/**
 * Récupère la navigation complète pour un rôle
 */
export function getNavigationForRole(userRole: string): NavigationGroup[] {
  return filterNavigationByRole(schoolNavigation, userRole);
}

/**
 * Trouve un élément de navigation par son chemin
 */
export function findNavigationItemByPath(
  path: string
): NavigationItem | ChildrenItem | null {
  for (const group of schoolNavigation) {
    for (const item of group.items) {
      if (item.path === path) {
        return item;
      }

      if (item.children) {
        const child = item.children.find(c => c.path === path);
        if (child) {
          return child;
        }
      }
    }
  }
  return null;
}

/**
 * Récupère le breadcrumb pour un chemin donné
 */
export function getBreadcrumb(path: string): { title: string; path: string }[] {
  const breadcrumb: { title: string; path: string }[] = [];

  for (const group of schoolNavigation) {
    for (const item of group.items) {
      if (item.path === path) {
        breadcrumb.push({ title: group.title, path: "#" });
        breadcrumb.push({ title: item.title, path: item.path });
        return breadcrumb;
      }

      if (item.children) {
        const child = item.children.find(c => c.path === path);
        if (child) {
          breadcrumb.push({ title: group.title, path: "#" });
          breadcrumb.push({
            title: item.title,
            path: item.path === "#" ? path : item.path,
          });
          breadcrumb.push({ title: child.title, path: child.path });
          return breadcrumb;
        }
      }
    }
  }

  return breadcrumb;
}

/**
 * Récupère tous les rôles qui ont accès à un chemin donné
 */
export function getRolesWithAccessToPath(path: string): string[] {
  const roles = ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"];
  return roles.filter(role => canUserAccessPath(role, path));
}

/**
 * Valide si un rôle existe dans le système
 */
export function isValidRole(role: string): boolean {
  const validRoles = ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"];
  return validRoles.includes(role);
}

/**
 * Récupère la hiérarchie des rôles (du plus élevé au plus bas)
 */
export function getRoleHierarchy(): string[] {
  return ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"];
}

/**
 * Compare deux rôles et retourne true si le premier est supérieur au second
 */
export function isRoleHigher(role1: string, role2: string): boolean {
  const hierarchy = getRoleHierarchy();
  const index1 = hierarchy.indexOf(role1);
  const index2 = hierarchy.indexOf(role2);

  // Si un rôle n'est pas trouvé, il est considéré comme le plus bas
  if (index1 === -1) return false;
  if (index2 === -1) return true;

  return index1 < index2;
}
