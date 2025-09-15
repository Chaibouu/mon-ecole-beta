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
    title: "Paramètres",
    icon: "material-symbols:settings",
    path: "/dashboard/settings",
    allowedRoles: ["STUDENT"],
  },
];
// NOTE: Cette navigation legacy peut être supprimée quand on migre complètement vers schoolNavigation
