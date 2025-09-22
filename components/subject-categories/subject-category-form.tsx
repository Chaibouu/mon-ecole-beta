"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubjectCategoryCreateSchema, SubjectCategoryUpdateSchema } from "@/schemas/subject-category";
import { createSubjectCategory, updateSubjectCategory } from "@/actions/subject-categories";
import { useState } from "react";

type SubjectCategoryFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  categoryId?: string;
  onSuccess?: () => void;
};

export function SubjectCategoryForm({ mode, initialData, categoryId, onSuccess }: SubjectCategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const schema = mode === "create" ? SubjectCategoryCreateSchema : SubjectCategoryUpdateSchema;
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
        result = await createSubjectCategory(values as any);
      } else if (categoryId) {
        result = await updateSubjectCategory(categoryId, values);
      }
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Catégorie créée avec succès" : "Catégorie mise à jour avec succès");
        form.reset();
        onSuccess?.();
      }
    } catch {
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
              <FormLabel>Nom de la catégorie *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Scientifique" {...field} />
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
                <Textarea placeholder="Description optionnelle..." className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => onSuccess?.()} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer la catégorie" : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
















