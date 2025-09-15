import { z } from "zod";

export const ClassroomSubjectCreateSchema = z.object({
  classroomId: z.string().min(1, "La classe est requise"),
  subjectId: z.string().min(1, "La matière est requise"),
  coefficient: z.number().min(0, "Le coefficient doit être positif"),
});

export const ClassroomSubjectUpdateSchema = z
  .object({
    classroomId: z.string().min(1, "La classe est requise").optional(),
    subjectId: z.string().min(1, "La matière est requise").optional(),
    coefficient: z
      .number()
      .min(0, "Le coefficient doit être positif")
      .optional(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );
