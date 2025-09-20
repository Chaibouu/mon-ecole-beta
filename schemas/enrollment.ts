import { z } from "zod";

export const EnrollmentCreateSchema = z.object({
  studentId: z.string().min(1, "L'élève est requis"),
  classroomId: z.string().min(1, "La classe est requise"),
  academicYearId: z.string().optional(),
  status: z
    .enum(["ACTIVE", "TRANSFERRED", "COMPLETED", "DROPPED"])
    .default("ACTIVE"),
  isMobileSubscribed: z.boolean().optional(),
});

export const EnrollmentUpdateSchema = z
  .object({
    studentId: z.string().min(1, "L'élève est requis").optional(),
    classroomId: z.string().min(1, "La classe est requise").optional(),
    academicYearId: z
      .string()
      .min(1, "L'année académique est requise")
      .optional(),
    status: z
      .enum(["ACTIVE", "TRANSFERRED", "COMPLETED", "DROPPED"])
      .optional(),
    isMobileSubscribed: z.boolean().optional(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );
