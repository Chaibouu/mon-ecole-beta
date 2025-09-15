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
import { ClassroomSubjectCreateSchema, ClassroomSubjectUpdateSchema } from "@/schemas/classroom-subject";
import { createClassroomSubject, updateClassroomSubject } from "@/actions/classroom-subjects";
import { useState } from "react";

type ClassroomSubjectFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  classroomSubjectId?: string;
  classrooms: any[];
  subjects: any[];
  onSuccess?: () => void;
};

export function ClassroomSubjectForm({ 
  mode, 
  initialData, 
  classroomSubjectId, 
  classrooms, 
  subjects, 
  onSuccess 
}: ClassroomSubjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const schema = mode === "create" ? ClassroomSubjectCreateSchema : ClassroomSubjectUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      classroomId: initialData?.classroomId || "",
      subjectId: initialData?.subjectId || "",
      coefficient: initialData?.coefficient || 1,
    } : {
      classroomId: "",
      subjectId: "",
      coefficient: 1,
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        result = await createClassroomSubject(values as any);
      } else if (classroomSubjectId) {
        result = await updateClassroomSubject(classroomSubjectId, values);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Matière par classe créée avec succès" : "Matière par classe mise à jour avec succès");
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
        </div>

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
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer la matière par classe" : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
}





