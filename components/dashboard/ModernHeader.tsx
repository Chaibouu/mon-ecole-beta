"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  Moon, 
  Sun,
  Building2,
  ChevronDown
} from "lucide-react";
import { setActiveAcademicYear, listAcademicYears, getActiveAcademicYear } from "@/actions/academic-years";
import { getUserProfile } from "@/actions/getUserProfile";
import { logout } from "@/actions/logout";
import { cleanupClientAuth } from "@/actions/cleanupAuth";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface School {
  schoolId: string;
  name: string | null;
  code: string | null;
  logoUrl?: string | null;
  brandPrimaryColor?: string | null;
  brandSecondaryColor?: string | null;
  role: string;
}

interface ModernHeaderProps {
  onSidebarToggle: () => void;
}

export function ModernHeader({ onSidebarToggle }: ModernHeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [notifications] = useState(3); // Mock notification count
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [activeAcademicYear, setActiveAcademicYearState] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const result = await getUserProfile();
        if (!result.error) {
          setUser(result.user);
          setSchools(result.schools || []);
          
          // Find selected school
          const currentSchoolId = localStorage.getItem("schoolId") || result.selectedSchoolId;
          console.log('====CURRENT SCHOOL ID=========================');
          console.log(currentSchoolId);
          console.log('====================================');
          console.log('===result.schools==============');
          console.log(result.schools);
          console.log('====================================');
          const currentSchool = result.schools?.find((s: School) => s.schoolId === currentSchoolId) as any;
          console.log('=======currentSchool=================');
          console.log(currentSchool);
          console.log('====================================');
          const schoolToUse = currentSchool || result.schools?.[0] || null;
          setSelectedSchool(schoolToUse);
          console.log('======schoolToUse===================');
          console.log(schoolToUse);
          console.log('====================================');
          // Apply branding
          if (schoolToUse) {
            if (schoolToUse.brandPrimaryColor) {
              document.documentElement.style.setProperty('--brand-primary', schoolToUse.brandPrimaryColor as string);
            }
            if (schoolToUse.brandSecondaryColor) {
              document.documentElement.style.setProperty('--brand-secondary', schoolToUse.brandSecondaryColor as string);
            }
          }
          // Charger années académiques et année active via actions (makeAuthenticatedRequest)
          if (schoolToUse) {
            try {
              const [yearsRes, activeRes] = await Promise.all([
                listAcademicYears(),
                getActiveAcademicYear(),
              ]);
              console.log('====RESSS=========================');
              console.log(yearsRes);
              console.log('====================================');
              setAcademicYears(Array.isArray((yearsRes as any)?.academicYears) ? (yearsRes as any).academicYears : []);
              setActiveAcademicYearState((activeRes as any)?.academicYear || null);
            } catch (e) {
              // ignore
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      // Nettoyer les données côté client d'abord
      cleanupClientAuth();
      
      // Puis appeler l'API de déconnexion
      await logout();
      toast.success("Déconnexion réussie");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
      // Même en cas d'erreur, rediriger vers login
      router.push("/auth/login");
    }
  };

  const handleAcademicYearChange = async (academicYearId: string) => {
    try {
      const res = await setActiveAcademicYear(academicYearId);
      if ((res as any)?.error) {
        toast.error((res as any).error);
        return;
      }
      // local update
      const year = academicYears.find(y => y.id === academicYearId);
      setActiveAcademicYearState(year || null);
      toast.success("Année académique changée");
      window.location.reload();
    } catch (e) {
      toast.error("Erreur lors du changement d'année");
    }
  };
  console.log('=yeaaar=============================');
  console.log(academicYears);
  console.log('====================================');

  const handleSchoolChange = async (schoolId: string) => {
    try {
      // Update localStorage
      localStorage.setItem("schoolId", schoolId);
      
      // Update server-side cookie
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/active-school`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors du changement d'école");
      }

      // Update local state
      const newSchool = schools.find(s => s.schoolId === schoolId);
      setSelectedSchool(newSchool || null);

      // Apply new branding
      if (newSchool) {
        if (newSchool.brandPrimaryColor) {
          document.documentElement.style.setProperty('--brand-primary', newSchool.brandPrimaryColor);
        }
        if (newSchool.brandSecondaryColor) {
          document.documentElement.style.setProperty('--brand-secondary', newSchool.brandSecondaryColor);
        }
      }

      toast.success("École changée avec succès");
      // Refresh the page to update all components
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors du changement d'école");
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Current school indicator */}
          {selectedSchool && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center space-x-3 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg"
            >
              {selectedSchool.logoUrl ? (
                <img 
                  src={selectedSchool.logoUrl} 
                  alt={`Logo ${selectedSchool.name}`}
                  className="w-8 h-8 rounded-md object-cover"
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm"
                  style={{ 
                    backgroundColor: selectedSchool.brandPrimaryColor || '#3B82F6' 
                  }}
                >
                  {selectedSchool.code?.[0] || selectedSchool.name?.[0] || 'E'}
                </div>
              )}
              
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800 dark:text-white">
                  {selectedSchool.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedSchool.code}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 p-0"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="w-9 h-9 p-0 relative">
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs flex items-center justify-center"
              >
                {notifications}
              </Badge>
            )}
          </Button>

          {/* School switcher */}
          {schools.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Changer d'école</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {schools.map((school) => (
                  <DropdownMenuItem
                    key={school.schoolId}
                    onClick={() => handleSchoolChange(school.schoolId)}
                    className="flex items-center space-x-3 p-3"
                  >
                    {school.logoUrl ? (
                      <img 
                        src={school.logoUrl} 
                        alt={`Logo ${school.name || "École"}`}
                        className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                      />
                    ) : (
                      <div 
                        className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ 
                          backgroundColor: school.brandPrimaryColor || '#3B82F6' 
                        }}
                      >
                        {school.code?.[0] || school.name?.[0] || 'E'}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{school.name || "École sans nom"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {school.code || "N/A"} • {school.role}
                      </div>
                    </div>
                    
                    {selectedSchool?.schoolId === school.schoolId && (
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Academic year switcher (ADMIN only) */}
          {selectedSchool?.role === "ADMIN" && academicYears.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <span className="text-xs font-medium">
                    {activeAcademicYear?.name || "Année ?"}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Année académique</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {academicYears.map((year) => (
                  <DropdownMenuItem
                    key={year.id}
                    onClick={() => handleAcademicYearChange(year.id)}
                    className="flex items-center justify-between"
                  >
                    <span>{year.name}</span>
                    {activeAcademicYear?.id === year.id && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.image} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-700">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || 'Utilisateur'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
