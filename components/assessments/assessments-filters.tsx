"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, Filter, X } from "lucide-react";
import { listAssessments } from "@/actions/assessments";

interface AssessmentsFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    classroomId?: string;
    subjectId?: string;
    termId?: string;
    teacherId?: string;
    type?: string;
  }) => void;
  initialFilters?: {
    search?: string;
    classroomId?: string;
    subjectId?: string;
    termId?: string;
    teacherId?: string;
    type?: string;
  };
}

export function AssessmentsFilters({ onFiltersChange, initialFilters }: AssessmentsFiltersProps) {
  const [search, setSearch] = useState(initialFilters?.search || "");
  const [classroomId, setClassroomId] = useState(initialFilters?.classroomId || "all");
  const [subjectId, setSubjectId] = useState(initialFilters?.subjectId || "all");
  const [termId, setTermId] = useState(initialFilters?.termId || "all");
  const [teacherId, setTeacherId] = useState(initialFilters?.teacherId || "all");
  const [type, setType] = useState(initialFilters?.type || "all");
  const [isExpanded, setIsExpanded] = useState(false);

  // Options pour les filtres
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<any[]>([]);

  // Charger les options pour les filtres
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Charger les évaluations pour extraire les options uniques
        const data = await listAssessments();
        if (data?.assessments) {
          const assessments = data.assessments as Array<any>;

          // Extraire les options uniques sans problèmes de typage TS
          const classroomMap = new Map<string, any>();
          const subjectMap = new Map<string, any>();
          const termMap = new Map<string, any>();
          const teacherMap = new Map<string, any>();
          const typeMap = new Map<string, any>();

          assessments.forEach((a: any) => {
            const cls = a.classroom;
            if (cls?.id) classroomMap.set(cls.id, cls);

            const subj = a.subject;
            if (subj?.id) subjectMap.set(subj.id, subj);

            const trm = a.term;
            if (trm?.id) termMap.set(trm.id, trm);

            const teacher = a.createdBy;
            if (teacher?.id && teacher.user) teacherMap.set(teacher.id, teacher);

            const t = a.assessmentType || (a.type ? { id: `legacy-${a.type}`, name: a.type } : null);
            if (t?.id) typeMap.set(t.id, t);
          });

          const uniqueClassrooms = Array.from(classroomMap.values());
          const uniqueSubjects = Array.from(subjectMap.values());
          const uniqueTerms = Array.from(termMap.values());
          const uniqueTeachers = Array.from(teacherMap.values());
          const uniqueTypes = Array.from(typeMap.values());

          setClassrooms(uniqueClassrooms);
          setSubjects(uniqueSubjects);
          setTerms(uniqueTerms);
          setTeachers(uniqueTeachers);
          setAssessmentTypes(uniqueTypes);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des options de filtres:", error);
      }
    };

    loadFilterOptions();
  }, []);

  // Appliquer les filtres quand ils changent (avec debounce pour la recherche)
  useEffect(() => {
    const filters = {
      ...(search && { search }),
      ...(classroomId && classroomId !== "all" && { classroomId }),
      ...(subjectId && subjectId !== "all" && { subjectId }),
      ...(termId && termId !== "all" && { termId }),
      ...(teacherId && teacherId !== "all" && { teacherId }),
      ...(type && type !== "all" && { type }),
    };
    
    // Debounce pour la recherche
    const timeoutId = search ? setTimeout(() => {
      onFiltersChange(filters);
    }, 300) : null;
    
    // Pour les autres filtres, pas de debounce
    if (!search) {
      onFiltersChange(filters);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [search, classroomId, subjectId, termId, teacherId, type, onFiltersChange]);

  const clearFilters = () => {
    setSearch("");
    setClassroomId("all");
    setSubjectId("all");
    setTermId("all");
    setTeacherId("all");
    setType("all");
  };

  const hasActiveFilters = search || (classroomId && classroomId !== "all") || (subjectId && subjectId !== "all") || (termId && termId !== "all") || (teacherId && teacherId !== "all") || (type && type !== "all");

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, description, matière, classe, enseignant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {hasActiveFilters && (
                <span className="ml-2 h-2 w-2 bg-primary rounded-full" />
              )}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Effacer
          </Button>
        )}
      </div>

      {/* Filtres avancés */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <label className="text-sm font-medium">Classe</label>
              <Select value={classroomId} onValueChange={setClassroomId}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les classes</SelectItem>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Matière</label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les matières" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trimestre</label>
              <Select value={termId} onValueChange={setTermId}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les trimestres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les trimestres</SelectItem>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Enseignant</label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les enseignants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les enseignants</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.user?.name || 
                       (teacher.user?.firstName && teacher.user?.lastName 
                         ? `${teacher.user.firstName} ${teacher.user.lastName}`
                         : teacher.user?.email || 'Enseignant')
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {assessmentTypes.map((assessmentType) => (
                    <SelectItem key={assessmentType.id || assessmentType.name} value={assessmentType.name}>
                      {assessmentType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
