"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { z as zodNS } from "zod";
import { createAssessmentType, updateAssessmentType } from "@/actions/assessment-types";
import { useState } from "react";
import { toast } from "sonner";

type AssessmentTypeFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  typeId?: string;
  onSuccess?: () => void;
};

export function AssessmentTypeForm({ mode, initialData, typeId, onSuccess }: AssessmentTypeFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Only name is relevant now; define local schemas to avoid pick() on refined types
  const CreateOnlyName = zodNS.object({
    name: z.string().min(1, "Le nom est requis"),
  });
  const UpdateOnlyName = zodNS.object({
    name: z.string().min(1, "Le nom est requis"),
  });
  const schema = (mode === "create" ? CreateOnlyName : UpdateOnlyName) as any;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "edit"
        ? {
            name: initialData?.name || "",
          }
        : {
            name: "",
          },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        result = await createAssessmentType(values as any);
      } else if (typeId) {
        result = await updateAssessmentType(typeId, values as any);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Type créé" : "Type modifié");
        onSuccess?.();
      }
    } catch (e) {
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
              <FormLabel>Nom *</FormLabel>
              <FormControl>
                <Input placeholder="Examen / Quiz / Devoir" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}


