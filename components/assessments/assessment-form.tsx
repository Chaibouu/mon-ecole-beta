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
import ReactSelect from "react-select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AssessmentCreateSchema, AssessmentUpdateSchema } from "@/schemas/assessment";
import { createAssessment, updateAssessment } from "@/actions/assessments";
import { listAssessmentTypes } from "@/actions/assessment-types";
import React, { useState } from "react";

type AssessmentFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  assessmentId?: string;
  classrooms: any[];
  subjects: any[];
  terms: any[];
  onSuccess?: () => void;
};

// Phase 1: types dynamiques chargés côté client

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
  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string; defaults?: { maxScore?: number } }[]>([]);
  
  const schema = mode === "create" ? AssessmentCreateSchema : AssessmentUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      classroomId: initialData?.classroomId || "",
      subjectId: initialData?.subjectId || "",
      termId: initialData?.termId || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      assessmentTypeId: initialData?.assessmentTypeId || "",
      type: initialData?.type || undefined,
      maxScore: initialData?.maxScore || 20,
      assignedAt: initialData?.assignedAt ? new Date(initialData.assignedAt).toISOString().split('T')[0] : "",
      dueAt: initialData?.dueAt ? new Date(initialData.dueAt).toISOString().split('T')[0] : "",
    } : {
      classroomId: "",
      subjectId: "",
      termId: "",
      title: "",
      description: "",
      assessmentTypeId: "",
      type: undefined,
      maxScore: 20,
      assignedAt: new Date().toISOString().split('T')[0],
      dueAt: "",
    },
  });

  // Charger les types dynamiques
  React.useEffect(() => {
    (async () => {
      try {
        const res = await listAssessmentTypes(true);
        const opts = (res?.types || []).map((t: any) => ({
          value: t.id,
          label: t.name,
          defaults: { maxScore: t.defaultMaxScore },
        }));
        setTypeOptions(opts);
      } catch {}
    })();
  }, []);

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
                <FormControl>
                  <div>
                    <ReactSelect
                      classNamePrefix="rs"
                      options={classrooms.map((c: any) => ({ value: c.id, label: c.name }))}
                      value={classrooms.map((c: any) => ({ value: c.id, label: c.name })).find((o: any) => o.value === field.value) || null}
                      onChange={(opt: any) => field.onChange(opt?.value || "")}
                      placeholder="Sélectionnez une classe"
                    />
                  </div>
                </FormControl>
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
                <FormControl>
                  <div>
                    <ReactSelect
                      classNamePrefix="rs"
                      options={subjects.map((s: any) => ({ value: s.id, label: s.name }))}
                      value={subjects.map((s: any) => ({ value: s.id, label: s.name })).find((o: any) => o.value === field.value) || null}
                      onChange={(opt: any) => field.onChange(opt?.value || "")}
                      placeholder="Sélectionnez une matière"
                    />
                  </div>
                </FormControl>
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
                <FormControl>
                  <div>
                    <ReactSelect
                      classNamePrefix="rs"
                      options={terms.map((t: any) => ({ value: t.id, label: t.name }))}
                      value={terms.map((t: any) => ({ value: t.id, label: t.name })).find((o: any) => o.value === field.value) || null}
                      onChange={(opt: any) => field.onChange(opt?.value || "")}
                      placeholder="Sélectionnez un trimestre"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="assessmentTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d'évaluation *</FormLabel>
                <Select onValueChange={(v) => {
                  field.onChange(v);
                  const sel = typeOptions.find(o => o.value === v);
                  if (sel?.defaults?.maxScore) form.setValue("maxScore" as any, sel.defaults.maxScore);
                }} defaultValue={field.value as any}>
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
            name="maxScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barème (score max) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    step="1"
                    placeholder="20"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 20)}
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

        <details className="rounded-md border p-4">
          <summary className="cursor-pointer font-medium">Options avancées</summary>
          <div className="mt-4 space-y-6">
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
          </div>
        </details>

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





