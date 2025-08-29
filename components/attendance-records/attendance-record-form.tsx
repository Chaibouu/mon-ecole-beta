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
import { AttendanceRecordCreateSchema, AttendanceRecordUpdateSchema } from "@/schemas/attendance-record";
import { createAttendanceRecord, updateAttendanceRecord } from "@/actions/attendance-records";
import { useState } from "react";

type AttendanceRecordFormProps = {
  mode: "create" | "edit";
  initialData?: any;
  recordId?: string;
  students: any[];
  timetableEntries: any[];
  onSuccess?: () => void;
};

const statusOptions = [
  { value: "PRESENT", label: "Présent" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "En retard" },
  { value: "EXCUSED", label: "Excusé" },
];

export function AttendanceRecordForm({ 
  mode, 
  initialData, 
  recordId, 
  students, 
  timetableEntries, 
  onSuccess 
}: AttendanceRecordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const schema = mode === "create" ? AttendanceRecordCreateSchema : AttendanceRecordUpdateSchema;
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" ? {
      studentId: initialData?.studentId || "",
      timetableEntryId: initialData?.timetableEntryId || "",
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : "",
      status: initialData?.status || "PRESENT",
      notes: initialData?.notes || "",
    } : {
      studentId: "",
      timetableEntryId: "",
      date: new Date().toISOString().split('T')[0],
      status: "PRESENT",
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let result: any;
      if (mode === "create") {
        result = await createAttendanceRecord(values as any);
      } else if (recordId) {
        result = await updateAttendanceRecord(recordId, values);
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(mode === "create" ? "Enregistrement créé avec succès" : "Enregistrement mis à jour avec succès");
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
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Élève *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un élève" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.user?.firstName} {student.user?.lastName}
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
            name="timetableEntryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entrée d'emploi du temps *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une entrée" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timetableEntries.map((entry) => (
                      <SelectItem key={entry.id} value={entry.id}>
                        {entry.subject?.name} - {entry.classroom?.name} ({entry.dayOfWeek})
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
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes additionnelles sur la présence..."
                  className="resize-none"
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
            {isLoading ? "Enregistrement..." : mode === "create" ? "Créer l'enregistrement" : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
}





