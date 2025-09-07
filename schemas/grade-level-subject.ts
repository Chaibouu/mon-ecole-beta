import { z } from "zod";

export const GradeLevelSubjectCreateSchema = z.object({
  gradeLevelId: z.string().min(1, "Le niveau scolaire est requis"),
  subjectId: z.string().min(1, "La matière est requise"),
  coefficient: z
    .number()
    .min(1, "Le coefficient doit être positif")
    .max(20, "Le coefficient est trop élevé")
    .default(1),
});

export const GradeLevelSubjectUpdateSchema = z
  .object({
    coefficient: z
      .number()
      .min(0.1, "Le coefficient doit être positif")
      .max(20, "Le coefficient est trop élevé")
      .optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni",
  });
