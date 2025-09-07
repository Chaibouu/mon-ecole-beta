import { z } from "zod";

export const TeacherAssignmentCreateSchema = z.object({
  teacherId: z.string().min(1, "L'enseignant est requis"),
  subjectId: z.string().min(1, "La matière est requise"),
  classroomId: z.string().min(1, "La classe est requise"),
  academicYearId: z.string().optional(), // Optionnel car géré automatiquement
});

export const TeacherAssignmentUpdateSchema = z
  .object({
    teacherId: z.string().min(1, "L'enseignant est requis").optional(),
    subjectId: z.string().min(1, "La matière est requise").optional(),
    classroomId: z.string().min(1, "La classe est requise").optional(),
    academicYearId: z.string().optional(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );
