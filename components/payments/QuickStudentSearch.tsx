"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, CreditCard, Eye } from "lucide-react";
import { searchStudents } from "@/actions/student-payments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  matricule: string | null;
  user: {
    name: string | null;
  };
  enrollments: Array<{
    classroom: {
      name: string;
      gradeLevel: {
        name: string;
      };
    };
  }>;
}

export function QuickStudentSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim().length < 2) {
        setStudents([]);
        setShowResults(false);
        return;
      }

      try {
        setLoading(true);
        const data = await searchStudents(searchTerm || "");
        if (data?.error) {
          toast.error(data.error);
          return;
        }
        setStudents(data.students || []);
        setShowResults(true);
      } catch (error) {
        console.error("Error searching students:", error);
        toast.error("Erreur lors de la recherche");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleStudentSelect = (studentId: string) => {
    router.push(`/students/${studentId}/payments`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Recherche rapide d'élève
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par nom, matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Recherche en cours...</p>
          </div>
        )}

        {showResults && !loading && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {students.length > 0 ? (
              students.slice(0, 5).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleStudentSelect(student.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                        {(student.user?.name || "Élève").split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{student.user?.name || "Nom non renseigné"}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {student.matricule && (
                          <span>#{student.matricule}</span>
                        )}
                        {student.enrollments[0] && (
                          <Badge variant="outline" className="text-xs">
                            {student.enrollments[0].classroom.gradeLevel.name} - {student.enrollments[0].classroom.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <CreditCard className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 py-4">
                Aucun élève trouvé pour "{searchTerm}"
              </p>
            )}
          </div>
        )}

        {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
          <p className="text-sm text-gray-500 text-center py-2">
            Tapez au moins 2 caractères pour rechercher
          </p>
        )}
      </CardContent>
    </Card>
  );
}
