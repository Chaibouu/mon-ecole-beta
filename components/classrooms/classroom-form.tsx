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
  const [teachers, setTeachers] = useState<any[]>([]);
  
  const schema = mode === "create" ? ClassroomCreateSchema : ClassroomUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      name: initialData?.name || "",
      gradeLevelId: initialData?.gradeLevelId || "",
      description: initialData?.description || "",
      headTeacherId: initialData?.headTeacherId || "",
      room: initialData?.room || "",
    } : {
      name: "",
      gradeLevelId: "",
      description: "",
      headTeacherId: "",
      room: "",
    },
  });

  // Charger les professeurs
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const result = await listTeachers();
        if (result?.teachers) {
          setTeachers(result.teachers);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des professeurs:", error);
      }
    };
    loadTeachers();
  }, []);

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        result = await createClassroom(values as any);
      } else if (classroomId) {
        result = await updateClassroom(classroomId, values);
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un professeur principal (optionnel)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Aucun professeur principal</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.user?.name || "Nom non renseigné"}
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
