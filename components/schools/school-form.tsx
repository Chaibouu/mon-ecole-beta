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
import { SchoolCreateSchema, SchoolUpdateSchema } from "@/schemas/school";
import { createSchool, updateSchool } from "@/actions/schools";
import { useState } from "react";

type SchoolFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  schoolId?: string;
  onSuccess?: () => void;
};

export function SchoolForm({ mode, initialData, schoolId, onSuccess }: SchoolFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const schema = mode === "create" ? SchoolCreateSchema : SchoolUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      code: initialData?.code || "",
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      logoUrl: initialData?.logoUrl || "",
      websiteUrl: initialData?.websiteUrl || "",
      slogan: initialData?.slogan || "",
      brandPrimaryColor: initialData?.brandPrimaryColor || "",
      brandSecondaryColor: initialData?.brandSecondaryColor || "",
    } : {
      code: "",
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        result = await createSchool(values as any);
      } else if (schoolId) {
        result = await updateSchool(schoolId, values);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "École créée avec succès" : "École mise à jour avec succès");
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
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code de l'école *</FormLabel>
                <FormControl>
                  <Input placeholder="EX: ALPHA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'école *</FormLabel>
                <FormControl>
                  <Input placeholder="École Primaire Alpha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contact@ecole.com" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+221 700000000" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="Quartier, Ville, Pays" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "edit" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site web</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ecole.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ecole.com/logo.png" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="slogan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slogan</FormLabel>
                  <FormControl>
                    <Input placeholder="L'excellence à votre portée" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="brandPrimaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couleur primaire</FormLabel>
                    <FormControl>
                      <Input placeholder="#3B82F6" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brandSecondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couleur secondaire</FormLabel>
                    <FormControl>
                      <Input placeholder="#F59E0B" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "En cours..." : mode === "create" ? "Créer l'école" : "Mettre à jour"}
        </Button>
      </form>
    </Form>
  );
}
