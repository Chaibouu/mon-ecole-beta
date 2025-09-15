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
import { AssessmentCreateSchema, AssessmentUpdateSchema } from "@/schemas/assessment";
import { createAssessment, updateAssessment } from "@/actions/assessments";
import { useState } from "react";

type AssessmentFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  assessmentId?: string;
  classrooms: any[];
  subjects: any[];
  terms: any[];
  onSuccess?: () => void;
};

const typeOptions = [
  { value: "EXAM", label: "Examen" },
  { value: "QUIZ", label: "Quiz" },
  { value: "HOMEWORK", label: "Devoir" },
];

export function AssessmentForm({ 
  mode, 
  initialData, 
  assessmentId, 
  classrooms, 
  subjects, 
  terms, 
  onSuccess 
}: AssessmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const schema = mode === "create" ? AssessmentCreateSchema : AssessmentUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      classroomId: initialData?.classroomId || "",
      subjectId: initialData?.subjectId || "",
      termId: initialData?.termId || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      type: initialData?.type || "EXAM",
      coefficient: initialData?.coefficient || 1,
      assignedAt: initialData?.assignedAt ? new Date(initialData.assignedAt).toISOString().split('T')[0] : "",
      dueAt: initialData?.dueAt ? new Date(initialData.dueAt).toISOString().split('T')[0] : "",
    } : {
      classroomId: "",
      subjectId: "",
      termId: "",
      title: "",
      description: "",
      type: "EXAM",
      coefficient: 1,
      assignedAt: new Date().toISOString().split('T')[0],
      dueAt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        result = await createAssessment(values as any);
      } else if (assessmentId) {
        result = await updateAssessment(assessmentId, values);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Évaluation créée avec succès" : "Évaluation mise à jour avec succès");
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        {classroom.name}
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
            name="subjectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matière *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une matière" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
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
            name="termId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trimestre *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un trimestre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {term.name}
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d'évaluation *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
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
            name="coefficient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coefficient *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0.1" 
                    step="0.1"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Examen de mathématiques - Chapitre 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description détaillée de l'évaluation..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="assignedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'attribution *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date limite (optionnel)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer l'évaluation" : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
}





