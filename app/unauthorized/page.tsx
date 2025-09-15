"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page de sélection d'école après 5 secondes
    const timer = setTimeout(() => {
      router.push("/select-school");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center"
            >
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            </motion.div>
            
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              Accès non autorisé
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="space-y-3">
              <p className="text-slate-600 dark:text-slate-400">
                Vous n'avez pas les permissions nécessaires pour accéder à cette page 
                avec votre rôle actuel dans cette école.
              </p>
              
              <div className="text-sm text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                <p>
                  Cela peut être dû à :
                </p>
                <ul className="list-disc list-inside text-left mt-2 space-y-1">
                  <li>Un changement de rôle récent</li>
                  <li>Une école mal sélectionnée</li>
                  <li>Des permissions insuffisantes</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/select-school">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Changer d'école
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Retour au tableau de bord
                </Link>
              </Button>
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p>Redirection automatique dans 5 secondes...</p>
              <p>
                Si le problème persiste, contactez votre administrateur.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}



