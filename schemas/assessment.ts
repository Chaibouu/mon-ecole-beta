import { z } from "zod";

export const AssessmentCreateSchema = z
  .object({
    subjectId: z.string().min(1, "La matière est requise"),
    classroomId: z.string().min(1, "La classe est requise"),
    termId: z.string().min(1, "Le trimestre est requis"),
    title: z.string().min(1, "Le titre est requis"),
    description: z.string().optional(),
    // Phase 1: support dynamique et rétrocompat
    assessmentTypeId: z.string().optional(),
    type: z.enum(["HOMEWORK", "QUIZ", "EXAM"]).optional(),
    maxScore: z.number().positive("Le barème doit être > 0").default(20),
    assignedAt: z.string().optional(),
    dueAt: z.string().optional(),
  })
  .refine(data => !!data.assessmentTypeId || !!data.type, {
    message: "assessmentTypeId ou type est requis",
  });

export const AssessmentUpdateSchema = z
  .object({
    subjectId: z.string().min(1, "La matière est requise").optional(),
    classroomId: z.string().min(1, "La classe est requise").optional(),
    termId: z.string().min(1, "Le trimestre est requis").optional(),
    title: z.string().min(1, "Le titre est requis").optional(),
    description: z.string().optional(),
    assessmentTypeId: z.string().optional(),
    type: z.enum(["HOMEWORK", "QUIZ", "EXAM"]).optional(),
    maxScore: z.number().positive().optional(),
    assignedAt: z.string().optional(),
    dueAt: z.string().optional(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );
