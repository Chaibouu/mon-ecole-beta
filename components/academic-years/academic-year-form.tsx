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
import { Switch } from "@/components/ui/switch";
import { AcademicYearCreateSchema, AcademicYearUpdateSchema } from "@/schemas/academic-year";
import { createAcademicYear, updateAcademicYear } from "@/actions/academic-years";
import { useState } from "react";

type AcademicYearFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  academicYearId?: string;
  onSuccess?: () => void;
};

export function AcademicYearForm({ mode, initialData, academicYearId, onSuccess }: AcademicYearFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const schema = mode === "create" ? AcademicYearCreateSchema : AcademicYearUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      name: initialData?.name || "",
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
      endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
      isActive: initialData?.isActive || false,
    } : {
      name: "",
      startDate: "",
      endDate: "",
      isActive: false,
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        result = await createAcademicYear(values as any);
      } else if (academicYearId) {
        result = await updateAcademicYear(academicYearId, values);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Année académique créée avec succès" : "Année académique mise à jour avec succès");
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
                <FormLabel>Nom de l'année académique *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 2023-2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Année active</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Marquer cette année comme année scolaire active
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de début *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de fin *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer" : "Mettre à jour"}
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Réinitialiser
          </Button>
        </div>
      </form>
    </Form>
  );
}
