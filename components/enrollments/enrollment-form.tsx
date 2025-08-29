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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EnrollmentCreateSchema, EnrollmentUpdateSchema } from "@/schemas/enrollment";
import { createEnrollment, updateEnrollment } from "@/actions/enrollments";
import { useState } from "react";

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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un élève" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.user?.firstName} {student.user?.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une classe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classrooms.map((classroom) => (
                      <SelectItem key={classroom.id} value={classroom.id}>
                        {classroom.name} ({classroom.gradeLevel?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="academicYearId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année académique *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une année académique" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {academicYears.map((academicYear) => (
                      <SelectItem key={academicYear.id} value={academicYear.id}>
                        {academicYear.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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





