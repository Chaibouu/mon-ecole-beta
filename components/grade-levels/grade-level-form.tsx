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
import { GradeLevelCreateSchema, GradeLevelUpdateSchema } from "@/schemas/grade-level";
import { createGradeLevel, updateGradeLevel } from "@/actions/grade-levels";
import { useState } from "react";

type GradeLevelFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  gradeLevelId?: string;
  onSuccess?: () => void;
};

export function GradeLevelForm({ mode, initialData, gradeLevelId, onSuccess }: GradeLevelFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const schema = mode === "create" ? GradeLevelCreateSchema : GradeLevelUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      name: initialData?.name || "",
      description: initialData?.description || "",
    } : {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        result = await createGradeLevel(values as any);
      } else if (gradeLevelId) {
        result = await updateGradeLevel(gradeLevelId, values);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Niveau scolaire créé avec succès" : "Niveau scolaire mis à jour avec succès");
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du niveau *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 6ème année" {...field} />
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
                  placeholder="Description optionnelle du niveau scolaire..."
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
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer le niveau" : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
