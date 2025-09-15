import { z } from "zod";

export const StudentGradeCreateSchema = z.object({
  assessmentId: z.string().min(1, "L'évaluation est requise"),
  studentId: z.string().min(1, "L'élève est requis"),
  score: z.number().min(0, "Le score ne peut pas être négatif"),
});

export const StudentGradeUpdateSchema = z
  .object({
    assessmentId: z.string().min(1, "L'évaluation est requise").optional(),
    studentId: z.string().min(1, "L'élève est requis").optional(),
    score: z.number().min(0, "Le score ne peut pas être négatif").optional(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );
