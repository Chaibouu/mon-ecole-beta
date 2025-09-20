import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  TrendingUp,
  Settings,
  Building,
  UserCheck,
  FileText,
  PieChart,
  CreditCard,
  Bell,
  Shield,
  Database,
  BarChart3,
  BookOpenCheck,
  UserPlus,
  School,
  Clock,
  Award,
  Users2,
  BookMarked,
  CalendarDays,
  Tags,
  User,
} from "lucide-react";

export interface NavigationBadge {
  text: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  color?: string;
}

export interface ChildrenItem {
  title: string;
  path: string;
  allowedRoles: string[];
  description?: string;
  badge?: NavigationBadge;
  icon?: React.ComponentType<any>;
}

export interface NavigationItem {
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  children?: ChildrenItem[];
  allowedRoles: string[];
  description?: string;
  badge?: NavigationBadge;
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
  allowedRoles?: string[]; // Si défini, tout le groupe est filtré par ces rôles
}

/**
 * Configuration de la navigation pour le système Mon École
 * Gestion des rôles: SUPER_ADMIN, ADMIN, TEACHER, STUDENT, PARENT, USER
 */
export const schoolNavigation: NavigationGroup[] = [
  {
    title: "Tableau de bord",
    items: [
      {
        title: "Tableau de bord",
        icon: Home,
        path: "/dashboard",
        allowedRoles: [
          "SUPER_ADMIN",
          "ADMIN",
          "TEACHER",
          "STUDENT",
          "PARENT",
          "USER",
        ],
        description: "Vue d'ensemble de l'établissement",
      },
      // {
      //   title: "Statistiques",
      //   icon: PieChart,
      //   path: "/analytics",
      //   allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
      //   description: "Analyses et rapports détaillés",
      // },
    ],
  },
  {
    title: "Administration",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    items: [
      {
        title: "Mon école",
        icon: Building,
        path: "/my-school",
        allowedRoles: ["ADMIN", "SUPER_ADMIN"],
        description: "Paramètres de mon établissement",
      },
      {
        title: "Écoles",
        icon: Building,
        path: "/schools",
        allowedRoles: ["SUPER_ADMIN"],
        description: "Gestion des établissements",
        children: [
          {
            title: "Liste des écoles",
            path: "/schools",
            allowedRoles: ["SUPER_ADMIN"],
            icon: School,
          },
          {
            title: "Créer une école",
            path: "/schools/create",
            allowedRoles: ["SUPER_ADMIN"],
            icon: UserPlus,
          },
        ],
      },
      // {
      //   title: "Utilisateurs",
      //   icon: Users,
      //   path: "/users",
      //   allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      //   description: "Gestion des comptes utilisateurs",
      //   children: [
      //     {
      //       title: "Tous les utilisateurs",
      //       path: "/users",
      //       allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      //     },
      //     {
      //       title: "Professeurs",
      //       path: "/users/teachers",
      //       allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      //     },
      //     {
      //       title: "Étudiants",
      //       path: "/users/students",
      //       allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      //     },
      //     {
      //       title: "Parents",
      //       path: "/users/parents",
      //       allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      //     },
      //   ],
      // },
      {
        title: "Années académiques",
        icon: CalendarDays,
        path: "/academic-years",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
        description: "Gestion des années scolaires",
        children: [
          {
            title: "Liste des années",
            path: "/academic-years",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
          {
            title: "Créer une année",
            path: "/academic-years/create",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
      {
        title: "Périodes scolaires",
        icon: Calendar,
        path: "/terms",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
        description: "Gestion des périodes d'évaluation",
        children: [
          {
            title: "Liste des périodes",
            path: "/terms",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
          {
            title: "Créer une période",
            path: "/terms/create",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
      // {
      //   title: "Paramètres",
      //   icon: Settings,
      //   path: "/settings",
      //   allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      //   description: "Configuration de l'établissement",
      // },
    ],
  },
  {
    title: "Structure académique",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
    items: [
      {
        title: "Niveaux scolaires",
        icon: BarChart3,
        path: "/grade-levels",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
        description: "Gestion des niveaux d'études",
        children: [
          {
            title: "Liste des niveaux",
            path: "/grade-levels",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
          {
            title: "Créer un niveau",
            path: "/grade-levels/create",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
      {
        title: "Classes",
        icon: GraduationCap,
        path: "/classrooms",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
        description: "Gestion des salles de classe",
        children: [
          {
            title: "Liste des classes",
            path: "/classrooms",
            allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
          },
          {
            title: "Créer une classe",
            path: "/classrooms/create",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
      {
        title: "Matières",
        icon: BookOpen,
        path: "/subjects",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
        description: "Programmes et matières enseignées",
        children: [
          {
            title: "Liste des matières",
            path: "/subjects",
            allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
          },
          {
            title: "Créer une matière",
            path: "/subjects/create",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
          {
            title: "Catégories",
            path: "/subject-categories",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
            icon: Tags,
          },
        ],
      },
      {
        title: "Coefficients",
        icon: BookMarked,
        path: "/grade-level-subjects",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
        description: "Coefficients par niveau et matière",
        children: [
          {
            title: "Par niveau",
            path: "/grade-level-subjects",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
    ],
  },
  {
    title: "Vie scolaire",
    items: [
      {
        title: "Emploi du temps",
        icon: Clock,
        path: "/timetable-entries",
        allowedRoles: [
          "SUPER_ADMIN",
          "ADMIN",
          "TEACHER",
          "STUDENT",
          "PARENT",
          "USER",
        ],
        description: "Planification et consultation des cours",
        children: [
          {
            title: "Vue générale",
            path: "/timetable-entries",
            allowedRoles: [
              "SUPER_ADMIN",
              "ADMIN",
              "TEACHER",
              "STUDENT",
              "PARENT",
              "USER",
            ],
          },
        ],
      },
      {
        title: "Présences",
        icon: UserCheck,
        path: "/attendance-records",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "PARENT", "USER"],
        description: "Suivi des absences et retards",
        children: [
          {
            title: "Tableau de bord",
            path: "/attendance-records",
            allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "PARENT", "USER"],
          },
          {
            title: "Faire l'appel",
            path: "/attendance-records/take-attendance",
            allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
          },
        ],
      },
      {
        title: "Affectations",
        icon: UserPlus,
        path: "/teacher-assignments",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
        description: "Attribution des professeurs aux classes",
        children: [
          {
            title: "Liste des affectations",
            path: "/teacher-assignments",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
          {
            title: "Créer une affectation",
            path: "/teacher-assignments/create",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
      {
        title: "Inscriptions",
        icon: BookOpenCheck,
        path: "/enrollments",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
        description: "Gestion des inscriptions étudiants",
        children: [
          {
            title: "Liste des inscriptions",
            path: "/enrollments",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
          {
            title: "Créer une inscription",
            path: "/enrollments/create",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
      {
        title: "Professeurs",
        icon: Users2,
        path: "/teachers",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
        description: "Gestion du corps enseignant",
        children: [
          {
            title: "Liste des professeurs",
            path: "/teachers",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
          {
            title: "Ajouter un professeur",
            path: "/teachers/create",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
      {
        title: "Élèves",
        icon: GraduationCap,
        path: "/students",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
        description: "Gestion des élèves",
        children: [
          {
            title: "Liste des élèves",
            path: "/students",
            allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
          },
          {
            title: "Ajouter un élève",
            path: "/students/create",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
      {
        title: "Parents",
        icon: Users,
        path: "/parents",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
        description: "Gestion des parents d'élèves et liaisons parent-enfant",
        children: [
          {
            title: "Liste des parents",
            path: "/parents",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
          {
            title: "Ajouter un parent",
            path: "/parents/create",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
    ],
  },
  {
    title: "Évaluations",
    allowedRoles: [
      "SUPER_ADMIN",
      "ADMIN",
      "TEACHER",
      "STUDENT",
      "PARENT",
      "USER",
    ],
    items: [
      {
        title: "Évaluations",
        icon: ClipboardList,
        path: "/assessments",
        allowedRoles: [
          "SUPER_ADMIN",
          "ADMIN",
          "TEACHER",
          "STUDENT",
          "PARENT",
          "USER",
        ],
        description: "Tests, examens et contrôles",
        children: [
          {
            title: "Liste des évaluations",
            path: "/assessments",
            allowedRoles: [
              "SUPER_ADMIN",
              "ADMIN",
              "TEACHER",
              "STUDENT",
              "PARENT",
              "USER",
            ],
          },
          {
            title: "Créer une évaluation",
            path: "/assessments/create",
            allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
          },
          {
            title: "Types d'évaluation",
            path: "/assessment-types",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
      {
        title: "Notes",
        icon: Award,
        path: "/student-grades",
        allowedRoles: [
          "SUPER_ADMIN",
          "ADMIN",
          "TEACHER",
          "STUDENT",
          "PARENT",
          "USER",
        ],
        description: "Saisie et consultation des résultats",
        children: [
          {
            title: "Liste des notes",
            path: "/student-grades",
            allowedRoles: [
              "SUPER_ADMIN",
              "ADMIN",
              "TEACHER",
              "STUDENT",
              "PARENT",
              "USER",
            ],
          },
          {
            title: "Saisir les notes",
            path: "/student-grades/create",
            allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
          },
        ],
      },
    ],
  },
  {
    title: "Espace Parent",
    allowedRoles: ["PARENT"],
    items: [
      {
        title: "Mes enfants",
        icon: Users,
        path: "/parents",
        allowedRoles: ["PARENT"],
        description: "Vue d'ensemble de vos enfants",
      },
      {
        title: "Paiements",
        icon: CreditCard,
        path: "/payments",
        allowedRoles: ["PARENT"],
        description: "Suivi des paiements de vos enfants",
      },
      {
        title: "Mon profil",
        icon: User,
        path: "/parents/profile",
        allowedRoles: ["PARENT"],
        description: "Gérer mes informations personnelles",
      },
    ],
  },
  {
    title: "Finances",
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    items: [
      {
        title: "Frais scolaires",
        icon: CreditCard,
        path: "/school-fees",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
        description: "Configuration des frais de scolarité",
      },
      {
        title: "Paiements",
        icon: CreditCard,
        path: "/payments",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
        description: "Suivi des paiements",
        children: [
          {
            title: "Historique des paiements",
            path: "/payments",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "Notifications",
        icon: Bell,
        path: "/notifications",
        allowedRoles: [
          "SUPER_ADMIN",
          "ADMIN",
          "TEACHER",
          "STUDENT",
          "PARENT",
          "USER",
        ],
        description: "Centre de notifications",
        badge: {
          text: "5",
          variant: "secondary",
        },
      },
    ],
  },
  {
    title: "Outils",
    items: [
      // {
      //   title: "Rapports",
      //   icon: FileText,
      //   path: "/reports",
      //   allowedRoles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
      //   description: "Génération de rapports personnalisés",
      // },
      {
        title: "Documentation API",
        icon: Database,
        path: "/api-docs",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
        description: "Documentation technique des endpoints",
      },
      {
        title: "Sécurité",
        icon: Shield,
        path: "/security",
        allowedRoles: ["SUPER_ADMIN"],
        description: "Gestion des accès et permissions",
      },
    ],
  },
];

/**
 * Filtre les éléments de navigation selon le rôle de l'utilisateur
 */
export function filterNavigationByRole(
  navigation: NavigationGroup[],
  userRole: string
): NavigationGroup[] {
  return navigation
    .map(group => {
      // Filtrer au niveau du groupe
      if (group.allowedRoles && !group.allowedRoles.includes(userRole)) {
        return null;
      }

      // Filtrer les items du groupe
      const filteredItems = group.items
        .map(item => {
          // Vérifier si l'utilisateur a accès à cet item
          if (!item.allowedRoles.includes(userRole)) {
            return null;
          }

          // Filtrer les sous-items s'ils existent
          if (item.children) {
            const filteredChildren = item.children.filter(child =>
              child.allowedRoles.includes(userRole)
            );

            // Si aucun enfant n'est accessible, ne pas afficher l'item parent
            if (filteredChildren.length === 0) {
              return null;
            }

            return {
              ...item,
              children: filteredChildren,
            };
          }

          return item;
        })
        .filter(Boolean) as NavigationItem[];

      // Si aucun item n'est accessible dans ce groupe, ne pas l'afficher
      if (filteredItems.length === 0) {
        return null;
      }

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter(Boolean) as NavigationGroup[];
}

/**
 * Récupère tous les chemins accessibles pour un rôle donné
 */
export function getAccessiblePaths(userRole: string): string[] {
  const filteredNav = filterNavigationByRole(schoolNavigation, userRole);
  const paths: string[] = [];

  filteredNav.forEach(group => {
    group.items.forEach(item => {
      if (item.path !== "#") {
        paths.push(item.path);
      }
      if (item.children) {
        item.children.forEach(child => {
          paths.push(child.path);
        });
      }
    });
  });

  return paths;
}
