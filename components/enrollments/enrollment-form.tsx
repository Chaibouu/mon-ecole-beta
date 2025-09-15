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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EnrollmentCreateSchema, EnrollmentUpdateSchema } from "@/schemas/enrollment";
import { createEnrollment, updateEnrollment } from "@/actions/enrollments";
import { useState } from "react";
import { StudentSelect } from "./student-select";
import { ClassSelect } from "./class-select";
import { SearchableSelect } from "@/components/ui/searchable-select";

type EnrollmentFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  enrollmentId?: string;
  students: any[];
  classrooms: any[];
  academicYears: any[];
  onSuccess?: () => void;
};

const statusOptions = [
  { value: "ACTIVE", label: "Actif" },
  { value: "INACTIVE", label: "Inactif" },
  { value: "GRADUATED", label: "Diplômé" },
  { value: "TRANSFERRED", label: "Transféré" },
];

export function EnrollmentForm({ 
  mode, 
  initialData, 
  enrollmentId, 
  students, 
  classrooms, 
  academicYears, 
  onSuccess 
}: EnrollmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const schema = mode === "create" ? EnrollmentCreateSchema : EnrollmentUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      studentId: initialData?.studentId || "",
      classroomId: initialData?.classroomId || "",
      academicYearId: initialData?.academicYearId || "",
      status: initialData?.status || "ACTIVE",
    } : {
      studentId: "",
      classroomId: "",
      academicYearId: "",
      status: "ACTIVE",
    },
  });

  // Convertir les données pour les composants de sélection
  const getSelectedStudent = () => {
    if (!form.getValues("studentId")) return null;
    const student = students.find(s => s.id === form.getValues("studentId"));
    return student ? { value: student.id, label: student.user?.name || "" } : null;
  };

  const getSelectedClass = () => {
    if (!form.getValues("classroomId")) return null;
    const classroom = classrooms.find(c => c.id === form.getValues("classroomId"));
    return classroom ? { value: classroom.id, label: `${classroom.name} (${classroom.gradeLevel?.name})` } : null;
  };

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        result = await createEnrollment(values as any);
      } else if (enrollmentId) {
        result = await updateEnrollment(enrollmentId, values);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Inscription créée avec succès" : "Inscription mise à jour avec succès");
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
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Élève *</FormLabel>
                <FormControl>
                  <StudentSelect
                    students={students}
                    value={getSelectedStudent()}
                    onChange={(option) => field.onChange(option?.value || "")}
                    placeholder="Rechercher un élève..."
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
                  <ClassSelect
                    classes={classrooms}
                    value={getSelectedClass()}
                    onChange={(option) => field.onChange(option?.value || "")}
                    placeholder="Rechercher une classe..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <FormControl>
                  <SearchableSelect
                    options={statusOptions}
                    value={statusOptions.find(s => s.value === field.value) || null}
                    onChange={(option) => field.onChange(option?.value || "")}
                    placeholder="Sélectionner un statut"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer l'inscription" : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
}





