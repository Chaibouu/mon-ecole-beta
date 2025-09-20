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
import { SearchableSelect } from "@/components/ui/searchable-select";
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
                <FormControl>
                  <SearchableSelect
                    options={students.map((s) => ({
                      value: s.id,
                      label: s.user?.name || `${s.user?.firstName ?? ""} ${s.user?.lastName ?? ""}`.trim() || s.user?.email || "Élève",
                      data: s,
                    }))}
                    value={
                      field.value
                        ? {
                            value: field.value,
                            label:
                              students.find((s) => s.id === field.value)?.user?.name ||
                              `${students.find((s) => s.id === field.value)?.user?.firstName ?? ""} ${students.find((s) => s.id === field.value)?.user?.lastName ?? ""}`.trim() ||
                              students.find((s) => s.id === field.value)?.user?.email ||
                              "Élève",
                          }
                        : null
                    }
                    onChange={(opt) => field.onChange(opt?.value || "")}
                    placeholder="Sélectionnez un élève"
                  />
                </FormControl>
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
                <FormControl>
                  <SearchableSelect
                    options={assessments.map((a) => ({
                      value: a.id,
                      label: `${a.title} — ${a.subject?.name ?? ""} (${a.classroom?.name ?? ""})`.trim(),
                      data: a,
                    }))}
                    value={
                      field.value
                        ? {
                            value: field.value,
                            label: (() => {
                              const a = assessments.find((x) => x.id === field.value);
                              return a ? `${a.title} — ${a.subject?.name ?? ""} (${a.classroom?.name ?? ""})`.trim() : "";
                            })(),
                          }
                        : null
                    }
                    onChange={(opt) => field.onChange(opt?.value || "")}
                    placeholder="Sélectionnez une évaluation"
                  />
                </FormControl>
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
          <FormLabel>Note *</FormLabel>
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





