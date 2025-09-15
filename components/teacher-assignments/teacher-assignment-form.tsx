"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { TeacherAssignmentCreateSchema, TeacherAssignmentUpdateSchema } from "@/schemas/teacher-assignment";
import { createTeacherAssignment, updateTeacherAssignment } from "@/actions/teacher-assignments";
import { useState, useMemo, useEffect } from "react";

type TeacherAssignmentFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  assignmentId?: string;
  teachers: any[];
  subjects: any[];
  classrooms: any[];
  academicYears: any[];
  onSuccess?: () => void;
};

export function TeacherAssignmentForm({ 
  mode, 
  initialData, 
  assignmentId, 
  teachers, 
  subjects, 
  classrooms, 
  academicYears, 
  onSuccess 
}: TeacherAssignmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  
  const schema = mode === "create" ? TeacherAssignmentCreateSchema : TeacherAssignmentUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      teacherId: initialData?.teacherId || "",
      subjectId: initialData?.subjectId || "",
      classroomId: initialData?.classroomId || "",
      academicYearId: initialData?.academicYearId || "",
    } : {
      teacherId: "",
      subjectId: "",
      classroomId: "",
      academicYearId: "",
    },
  });

  // Prepare options for SearchableSelect
  const teacherOptions = useMemo(() => 
    teachers.map((teacher) => ({
      value: teacher.id,
      label: `${teacher.user?.firstName || ""} ${teacher.user?.lastName || ""}`.trim() || 
             `${teacher.user?.name || ""}`.trim() || "Enseignant",
      subjects: teacher.subjects || []
    })), [teachers]
  );

  const classroomOptions = useMemo(() => 
    classrooms.map((classroom) => ({
      value: classroom.id,
      label: `${classroom.name}${classroom.gradeLevel?.name ? ` (${classroom.gradeLevel.name})` : ""}`
    })), [classrooms]
  );

  // Get selected teacher's subjects for subject dropdown
  const teacherSubjects = useMemo(() => {
    if (!selectedTeacher) return [];
    const teacher = teachers.find(t => t.id === selectedTeacher.value);
    return teacher?.subjects || [];
  }, [selectedTeacher, teachers]);

  // Subject options filtered by selected teacher
  const subjectOptions = useMemo(() => 
    teacherSubjects.map((subject: any) => ({
      value: subject.id,
      label: subject.name
    })), [teacherSubjects]
  );

  // Auto-select subject if teacher has only one
  useEffect(() => {
    if (teacherSubjects.length === 1) {
      form.setValue("subjectId", teacherSubjects[0].id);
    } else if (teacherSubjects.length === 0) {
      form.setValue("subjectId", "");
    }
  }, [teacherSubjects, form]);

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        result = await createTeacherAssignment(values as any);
      } else if (assignmentId) {
        result = await updateTeacherAssignment(assignmentId, values);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Affectation créée avec succès" : "Affectation mise à jour avec succès");
        form.reset();
        onSuccess?.();
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enseignant *</FormLabel>
                <FormControl>
                  <SearchableSelect
                    options={teacherOptions}
                    value={selectedTeacher}
                    onChange={(option) => {
                      setSelectedTeacher(option);
                      field.onChange(option?.value || "");
                      // Reset subject when teacher changes
                      form.setValue("subjectId", "");
                    }}
                    placeholder="Rechercher un enseignant..."
                    isClearable={false}
                    noOptionsMessage="Aucun enseignant trouvé"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="classroomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classe *</FormLabel>
                <FormControl>
                  <SearchableSelect
                    options={classroomOptions}
                    value={classroomOptions.find(option => option.value === field.value) || null}
                    onChange={(option) => field.onChange(option?.value || "")}
                    placeholder="Rechercher une classe..."
                    isClearable={false}
                    noOptionsMessage="Aucune classe trouvée"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Smart subject field */}
        {selectedTeacher && (
          <FormField
            control={form.control}
            name="subjectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matière *</FormLabel>
                <FormControl>
                  {teacherSubjects.length === 1 ? (
                    // Read-only if teacher has only one subject
                    <div className="flex h-11 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm">
                      <span className="text-gray-700">{teacherSubjects[0].name}</span>
                      <span className="ml-2 text-xs text-gray-500">(Matière unique)</span>
                    </div>
                  ) : teacherSubjects.length > 1 ? (
                    // Dropdown if teacher has multiple subjects
                    <SearchableSelect
                      options={subjectOptions}
                      value={subjectOptions.find((option: any) => option.value === field.value) || null}
                      onChange={(option: any) => field.onChange(option?.value || "")}
                      placeholder="Sélectionner une matière..."
                      isClearable={false}
                      noOptionsMessage="Aucune matière trouvée"
                    />
                  ) : (
                    // Message if teacher has no subjects
                    <div className="flex h-11 w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm">
                      <span className="text-red-600">Cet enseignant n'a aucune matière assignée</span>
                    </div>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Display teacher's subjects info */}
        {teacherSubjects.length > 1 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Matières disponibles :</h4>
            <div className="flex flex-wrap gap-2">
              {teacherSubjects.map((subject: any) => (
                <span 
                  key={subject.id} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {subject.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || (selectedTeacher && teacherSubjects.length === 0)}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer l'affectation" : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
}








