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
import { StudentGradeCreateSchema, StudentGradeUpdateSchema } from "@/schemas/student-grade";
import { createStudentGrade, updateStudentGrade } from "@/actions/student-grades";
import { useState } from "react";

type StudentGradeFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  gradeId?: string;
  students: any[];
  assessments: any[];
  onSuccess?: () => void;
};

export function StudentGradeForm({ 
  mode, 
  initialData, 
  gradeId, 
  students, 
  assessments, 
  onSuccess 
}: StudentGradeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const schema = mode === "create" ? StudentGradeCreateSchema : StudentGradeUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      studentId: initialData?.studentId || "",
      assessmentId: initialData?.assessmentId || "",
      score: initialData?.score || 0,
    } : {
      studentId: "",
      assessmentId: "",
      score: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        result = await createStudentGrade(values as any);
      } else if (gradeId) {
        result = await updateStudentGrade(gradeId, values);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Note créée avec succès" : "Note mise à jour avec succès");
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
            name="assessmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Évaluation *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une évaluation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assessments.map((assessment) => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        {assessment.title} - {assessment.teacherAssignment?.subject?.name} ({assessment.teacherAssignment?.classroom?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Score *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.5"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer la note" : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
}





