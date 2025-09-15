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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClassroomCreateSchema, ClassroomUpdateSchema } from "@/schemas/classroom";
import { createClassroom, updateClassroom } from "@/actions/classrooms";
import { listTeachers } from "@/actions/school-members";
import { TeacherSelect } from "@/components/classrooms/teacher-select";
import { useState, useEffect } from "react";

type ClassroomFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  classroomId?: string;
  gradeLevels: any[];
  onSuccess?: () => void;
};

export function ClassroomForm({ mode, initialData, classroomId, gradeLevels, onSuccess }: ClassroomFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const teachers = Array.isArray((initialData as any)?.__teachers)
    ? (initialData as any).__teachers
    : Array.isArray((initialData as any)?.teachers) ? (initialData as any).teachers : [];
  
  const schema = mode === "create" ? ClassroomCreateSchema : ClassroomUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      name: initialData?.name || "",
      gradeLevelId: initialData?.gradeLevelId || "",
      description: initialData?.description || "",
      headTeacherId: initialData?.headTeacherId || "none",
      room: initialData?.room || "",
    } : {
      name: "",
      gradeLevelId: "",
      description: "",
      headTeacherId: "none",
      room: "",
    },
  });

  // teachers are passed from server via initialData.__teachers

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      // Traiter la valeur "none" pour headTeacherId
      const processedValues = {
        ...values,
        headTeacherId: values.headTeacherId === "none" ? undefined : values.headTeacherId,
      };

      let result: any;
      if (mode === "create") {
        result = await createClassroom(processedValues as any);
      } else if (classroomId) {
        result = await updateClassroom(classroomId, processedValues);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Classe créée avec succès" : "Classe mise à jour avec succès");
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la classe *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 6ème A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gradeLevelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Niveau scolaire *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un niveau scolaire" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {gradeLevels.map((gradeLevel) => (
                      <SelectItem key={gradeLevel.id} value={gradeLevel.id}>
                        {gradeLevel.name}
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
            name="room"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salle</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Salle 101, Bâtiment A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="headTeacherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professeur principal</FormLabel>
                <FormControl>
                  <TeacherSelect
                    teachers={teachers}
                    value={field.value}
                    onChange={(option) => field.onChange(option?.value || "none")}
                    placeholder="Rechercher un professeur principal..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description optionnelle de la classe..."
                  className="min-h-[100px]"
                  {...field} 
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
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer la classe" : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
