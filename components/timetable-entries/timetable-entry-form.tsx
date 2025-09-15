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
import { TimetableEntryCreateSchema, TimetableEntryUpdateSchema } from "@/schemas/timetable-entry";
import { createTimetableEntry, updateTimetableEntry } from "@/actions/timetable-entries";
import { useState } from "react";

type TimetableEntryFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  entryId?: string;
  classrooms: any[];
  subjects: any[];
  teachers: any[];
  onSuccess?: () => void;
};

const dayOptions = [
  { value: "MONDAY", label: "Lundi" },
  { value: "TUESDAY", label: "Mardi" },
  { value: "WEDNESDAY", label: "Mercredi" },
  { value: "THURSDAY", label: "Jeudi" },
  { value: "FRIDAY", label: "Vendredi" },
  { value: "SATURDAY", label: "Samedi" },
  { value: "SUNDAY", label: "Dimanche" },
];

export function TimetableEntryForm({ 
  mode, 
  initialData, 
  entryId, 
  classrooms, 
  subjects, 
  teachers, 
  onSuccess 
}: TimetableEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const schema = mode === "create" ? TimetableEntryCreateSchema : TimetableEntryUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      classroomId: initialData?.classroomId || "",
      subjectId: initialData?.subjectId || "",
      teacherId: initialData?.teacherId || "",
      dayOfWeek: initialData?.dayOfWeek || "MONDAY",
      startTime: initialData?.startTime || "",
      endTime: initialData?.endTime || "",
    } : {
      classroomId: "",
      subjectId: "",
      teacherId: "",
      dayOfWeek: "MONDAY",
      startTime: "",
      endTime: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        result = await createTimetableEntry(values as any);
      } else if (entryId) {
        result = await updateTimetableEntry(entryId, values);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Entrée créée avec succès" : "Entrée mise à jour avec succès");
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une classe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classrooms.map((classroom) => (
                      <SelectItem key={classroom.id} value={classroom.id}>
                        {classroom.name}
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
          <FormField
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enseignant *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un enseignant" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.user?.firstName} {teacher.user?.lastName}
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
            name="dayOfWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jour de la semaine *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un jour" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dayOptions.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
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
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure de début *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure de fin *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>



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
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer l'entrée" : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
}





