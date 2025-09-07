"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import { TeacherCreateSchema, TeacherUpdateSchema } from "@/schemas/teacher";
import { createTeacher } from "@/actions/school-members";
import { updateTeacher as updateTeacherApi } from "@/actions/teachers";
import { listSubjects } from "@/actions/subjects";
import { useState, useEffect } from "react";

type TeacherFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  teacherId?: string;
  onSuccess?: () => void;
};

export function TeacherForm({ mode, initialData, teacherId, onSuccess }: TeacherFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const subjects = Array.isArray((initialData as any)?.__subjects)
    ? (initialData as any).__subjects
    : [];
  
  const schema = mode === "create" ? TeacherCreateSchema : TeacherUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : "",
      hireDate: initialData?.hireDate ? new Date(initialData.hireDate).toISOString().split('T')[0] : "",
      bio: initialData?.bio || "",
      subjectIds: Array.isArray(initialData?.subjectIds) ? initialData.subjectIds : [],
    } : {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      hireDate: "",
      bio: "",
      subjectIds: [],
    },
  });

  // subjects are passed from server via initialData.__subjects

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        result = await createTeacher(values as any);
      } else if (teacherId) {
        result = await updateTeacherApi(teacherId, values);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Professeur créé avec succès" : "Professeur mis à jour avec succès");
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
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Jean" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de famille *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subjectIds"
          render={() => (
            <FormItem>
              <FormLabel>Matières enseignées</FormLabel>
              <Controller
                name="subjectIds"
                control={form.control}
                render={({ field }) => {
                  const options: { value: string; label: string }[] = subjects.map((s: any) => ({ value: s.id, label: s.name }));
                  const selectedIds: string[] = Array.isArray(field.value) ? field.value : [];
                  const value = options.filter((o) => selectedIds.includes(o.value));
                  const ReactSelect = require("react-select").default;
                  return (
                    <ReactSelect
                      isMulti
                      options={options}
                      value={value}
                      onChange={(vals: any) => field.onChange((vals || []).map((v: any) => v.value))}
                      placeholder="Sélectionnez une ou plusieurs matières"
                    />
                  );
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jean.dupont@email.com" {...field} />
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
                  <Input placeholder="+33 1 23 45 67 89" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de naissance</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hireDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'embauche</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Primary subject removed per new model */}

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biographie</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Biographie du professeur..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

