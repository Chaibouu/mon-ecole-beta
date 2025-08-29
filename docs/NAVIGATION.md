# Système de Navigation avec Gestion des Rôles

## Vue d'ensemble

Le système de navigation de Mon École est conçu pour gérer automatiquement l'affichage des éléments de menu en fonction du rôle de l'utilisateur dans l'école sélectionnée. Il offre une approche centralisée et type-safe pour configurer les permissions d'accès.

## Architecture

### Fichiers principaux

- `settings/schoolNavigation.ts` - Configuration de la navigation
- `hooks/useNavigation.ts` - Hook pour gérer la navigation côté client
- `components/dashboard/ModernSidebar.tsx` - Sidebar avec navigation dynamique
- `components/auth/route-guard.tsx` - Protection des routes
- `lib/navigationUtils.ts` - Utilitaires côté serveur

## Rôles supportés

- `SUPER_ADMIN` - Accès complet à toutes les fonctionnalités
- `ADMIN` - Administration de l'école
- `TEACHER` - Fonctionnalités enseignant
- `STUDENT` - Fonctionnalités étudiant
- `PARENT` - Fonctionnalités parent

## Configuration de la navigation

### Structure de base

```typescript
interface NavigationGroup {
  title: string;
  items: NavigationItem[];
  allowedRoles?: string[]; // Optionnel - filtre tout le groupe
}

interface NavigationItem {
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  children?: ChildrenItem[];
  allowedRoles: string[];
  description?: string;
  badge?: NavigationBadge;
}
```

### Exemple de configuration

```typescript
export const schoolNavigation: NavigationGroup[] = [
  {
    title: "Administration",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"], // Groupe visible seulement pour ces rôles
    items: [
      {
        title: "Utilisateurs",
        icon: Users,
        path: "/dashboard/users",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
        description: "Gestion des comptes utilisateurs",
        children: [
          {
            title: "Tous les utilisateurs",
            path: "/dashboard/users",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"]
          },
          {
            title: "Professeurs",
            path: "/dashboard/users/teachers",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"]
          }
        ]
      }
    ]
  }
];
```

## Utilisation

### Hook useNavigation

```typescript
import { useNavigation } from "@/hooks/useNavigation";

function MyComponent() {
  const { navigation, userRole, canAccess, isLoading } = useNavigation();
  
  // Vérifier l'accès à une route
  const hasAdminAccess = canAccess("/dashboard/admin");
  
  // Utiliser la navigation filtrée
  return (
    <nav>
      {navigation.map(group => (
        <div key={group.title}>
          <h3>{group.title}</h3>
          {group.items.map(item => (
            <Link key={item.path} href={item.path}>
              {item.title}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
```

### Protection de routes

```typescript
import { RouteGuard } from "@/components/auth/route-guard";

function ProtectedPage() {
  return (
    <RouteGuard>
      <div>Contenu protégé</div>
    </RouteGuard>
  );
}
```

### Vérification côté serveur

```typescript
import { canUserAccessPath, getNavigationForRole } from "@/lib/navigationUtils";

// Vérifier l'accès
const hasAccess = canUserAccessPath("ADMIN", "/dashboard/users");

// Récupérer la navigation pour un rôle
const adminNav = getNavigationForRole("ADMIN");
```

## Fonctionnalités avancées

### Badges de notification

```typescript
{
  title: "Présences",
  icon: UserCheck,
  path: "/dashboard/attendance",
  allowedRoles: ["TEACHER"],
  badge: {
    text: "3",
    variant: "destructive" // ou "default", "secondary", "outline"
  }
}
```

### Navigation hiérarchique

La navigation supporte plusieurs niveaux avec des sous-menus qui s'expandent/contractent automatiquement.

### Mise à jour dynamique

La navigation se met à jour automatiquement lors du changement d'école ou de rôle, sans rechargement de page.

## Bonnes pratiques

1. **Permissions granulaires** : Définissez les permissions au niveau le plus fin possible
2. **Rôles explicites** : Listez explicitement tous les rôles autorisés pour chaque élément
3. **Descriptions claires** : Ajoutez des descriptions pour améliorer l'UX
4. **Badges informatifs** : Utilisez les badges pour les notifications importantes
5. **Structure logique** : Organisez la navigation en groupes cohérents

## Migration depuis l'ancienne navigation

Pour migrer depuis le système `adminNavigation` :

1. Utilisez le même format de base avec les rôles
2. Ajoutez les icônes Lucide React au lieu des strings
3. Intégrez le système de groupes
4. Remplacez les hooks personnalisés par `useNavigation`

## Tests

```typescript
import { filterNavigationByRole, canUserAccessPath } from "@/settings/schoolNavigation";

describe("Navigation", () => {
  it("should filter navigation by role", () => {
    const teacherNav = filterNavigationByRole(schoolNavigation, "TEACHER");
    expect(teacherNav).toHaveLength(expectedLength);
  });
  
  it("should check path access", () => {
    expect(canUserAccessPath("ADMIN", "/dashboard/users")).toBe(true);
    expect(canUserAccessPath("STUDENT", "/dashboard/admin")).toBe(false);
  });
});
```
