"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { listSubjects } from "@/actions/subjects";
import { toast } from "sonner";

const TeacherSubjectSchema = z.object({
  primarySubjectId: z.string().optional().nullable(),
  bio: z.string().optional(),
});

type TeacherSubjectFormData = z.infer<typeof TeacherSubjectSchema>;

type Teacher = {
  id: string;
  user: { name: string; email: string };
  bio?: string;
  primarySubject?: { id: string; name: string } | null;
};

interface TeacherSubjectFormProps {
  teacher: Teacher;
  onSubmit: (data: TeacherSubjectFormData) => void;
}

export function TeacherSubjectForm({ teacher, onSubmit }: TeacherSubjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);

  const form = useForm<TeacherSubjectFormData>({
    resolver: zodResolver(TeacherSubjectSchema),
    defaultValues: {
      primarySubjectId: teacher.primarySubject?.id || undefined,
      bio: teacher.bio || "",
    },
  });

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res: any = await listSubjects();
        setSubjects(Array.isArray(res?.subjects) ? res.subjects : []);
      } catch (err) {
        toast.error("Erreur lors du chargement des matières");
      }
    };
    loadSubjects();
  }, []);

  const handleSubmit = async (values: TeacherSubjectFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="primarySubjectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matière principale</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "" ? null : value)}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une matière principale" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Aucune matière principale</SelectItem>
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
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description de l'enseignant..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
