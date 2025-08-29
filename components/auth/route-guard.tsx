"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRouteAccess } from "@/hooks/useNavigation";
import { useSession } from "@/context/SessionContext";
import { Loader } from "@/components/common/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RouteGuard({ children, fallback }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useSession();
  const { hasAccess, userRole, isLoading } = useRouteAccess(pathname);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // Si pas authentifié, rediriger vers login
      if (!isAuthenticated || !user) {
        router.push("/auth/login");
        return;
      }

      // Attendre que la vérification des permissions soit terminée
      if (!isLoading) {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [isAuthenticated, user, isLoading, router]);

  // Afficher le loader pendant la vérification
  if (isChecking || isLoading) {
    return <Loader text="Vérification des permissions..." />;
  }

  // Si pas authentifié (normalement déjà redirigé)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Si pas d'accès à la route
  if (!hasAccess) {
    return fallback || <AccessDenied userRole={userRole} currentPath={pathname} />;
  }

  // Accès autorisé
  return <>{children}</>;
}

interface AccessDeniedProps {
  userRole: string | null;
  currentPath: string;
}

function AccessDenied({ userRole, currentPath }: AccessDeniedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-600 dark:text-red-400">
            Accès refusé
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-slate-600 dark:text-slate-400">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <div className="text-sm text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
              <p><strong>Votre rôle :</strong> {userRole}</p>
              <p><strong>Page demandée :</strong> {currentPath}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au tableau de bord
              </Link>
            </Button>
            
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Si vous pensez que c'est une erreur, contactez votre administrateur.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
