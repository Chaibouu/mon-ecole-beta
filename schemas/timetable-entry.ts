import { z } from "zod";

export const TimetableEntryCreateSchema = z.object({
  classroomId: z.string().min(1, "La classe est requise"),
  academicYearId: z.string().min(1, "L'année académique est requise"),
  subjectId: z.string().min(1, "La matière est requise"),
  teacherId: z.string().min(1, "L'enseignant est requis"),
  dayOfWeek: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  startTime: z.string().min(1, "L'heure de début est requise"),
  endTime: z.string().min(1, "L'heure de fin est requise"),
});

export const TimetableEntryUpdateSchema = z
  .object({
    classroomId: z.string().min(1, "La classe est requise").optional(),
    academicYearId: z
      .string()
      .min(1, "L'année académique est requise")
      .optional(),
    subjectId: z.string().min(1, "La matière est requise").optional(),
    teacherId: z.string().min(1, "L'enseignant est requis").optional(),
    dayOfWeek: z
      .enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ])
      .optional(),
    startTime: z.string().min(1, "L'heure de début est requise").optional(),
    endTime: z.string().min(1, "L'heure de fin est requise").optional(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );
