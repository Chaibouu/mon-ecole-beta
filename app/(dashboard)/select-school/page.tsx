"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProfile } from "@/actions/getProfile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/common/Loader";

interface School {
  schoolId: string;
  name: string;
  code: string;
  logoUrl?: string;
  slogan?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  role: string;
}

export default function SelectSchoolPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const result = await getProfile();
        if ((result as any).error) {
          toast.error("Erreur lors du chargement des écoles");
          return;
        }
        
        const data = (result as any).data;
        setSchools(data.schools || []);
        
        // Auto-sélectionner s'il n'y a qu'une école
        if (data.schools?.length === 1) {
          setSelectedSchool(data.schools[0].schoolId);
        } else {
          // Récupérer la sélection actuelle depuis le localStorage
          const currentSchool = localStorage.getItem("schoolId");
          if (currentSchool && data.schools?.some((s: School) => s.schoolId === currentSchool)) {
            setSelectedSchool(currentSchool);
          }
        }
      } catch (error) {
        toast.error("Erreur lors du chargement");
      } finally {
        setIsLoading(false);
      }
    };

    loadSchools();
  }, []);

  const handleSelectSchool = async () => {
    if (!selectedSchool) {
      toast.error("Veuillez sélectionner une école");
      return;
    }

    setIsSubmitting(true);
    try {
      // Enregistrer dans localStorage
      localStorage.setItem("schoolId", selectedSchool);
      
      // Enregistrer le cookie côté serveur via l'API
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/active-school`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: selectedSchool }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de l'enregistrement");
      }

      toast.success("École sélectionnée avec succès");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la sélection de l'école");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (schools.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Aucune école trouvée</CardTitle>
            <CardDescription>
              Vous n'êtes associé à aucune école. Contactez votre administrateur.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </motion.div>
            
            <CardTitle className="text-3xl font-bold text-slate-800 dark:text-white">
              Sélectionnez votre école
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
              Choisissez l'établissement avec lequel vous souhaitez travailler
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            <div className="grid gap-4 md:grid-cols-2">
              {schools.map((school, index) => (
                <motion.div
                  key={school.schoolId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                      selectedSchool === school.schoolId 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => setSelectedSchool(school.schoolId)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {school.logoUrl ? (
                          <img 
                            src={school.logoUrl} 
                            alt={`Logo ${school.name}`}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                            style={{ 
                              backgroundColor: school.brandPrimaryColor || '#3B82F6' 
                            }}
                          >
                            {school.code?.[0] || school.name?.[0] || 'E'}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-slate-800 dark:text-white truncate">
                                {school.name}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Code: {school.code}
                              </p>
                              {school.slogan && (
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 italic">
                                  {school.slogan}
                                </p>
                              )}
                            </div>
                            <Badge 
                              variant={selectedSchool === school.schoolId ? "default" : "secondary"}
                              className="ml-2 flex-shrink-0"
                            >
                              {school.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="flex justify-center pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                onClick={handleSelectSchool}
                disabled={!selectedSchool || isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sélection en cours...</span>
                  </div>
                ) : (
                  'Continuer avec cette école'
                )}
              </Button>
            </motion.div>

            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Vous pourrez changer d'école à tout moment depuis le menu principal
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
