export interface ChildrenItem {
  title: string;
  path: string;
  allowedRoles: string[];
}
export interface NavigationItem {
  title: string;
  icon: string;
  path: string;
  children?: ChildrenItem[];
  allowedRoles: string[];
}

export const adminNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    icon: "material-symbols:dashboard",
    path: "/dashboard",
    allowedRoles: ["STUDENT"],
  },
  {
    title: "Test",
    icon: "material-symbols:dashboard",
    path: "/test",
    allowedRoles: ["ADMIN", "STUDENT"],
  },
  {
    title: "Paramètres",
    icon: "material-symbols:settings",
    path: "/dashboard/settings",
    allowedRoles: ["STUDENT"],
  },
  {
    title: "POP",
    icon: "material-symbols:settings",
    path: "/pop",
    allowedRoles: ["STUDENT"],
  },
  {
    title: "Pages",
    icon: "eos-icons:admin",
    path: "#",
    children: [
      {
        title: "Client",
        path: "/dashboard/client",
        allowedRoles: ["STUDENT"],
      },
      {
        title: "Server",
        path: "/dashboard/server",
        allowedRoles: ["STUDENT"],
      },
    ],
    allowedRoles: ["STUDENT"],
  },
];
// NOTE: Cette navigation legacy peut être supprimée quand on migre complètement vers schoolNavigation
