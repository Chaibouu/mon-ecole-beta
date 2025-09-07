import { z } from "zod";

export const AttendanceRecordCreateSchema = z.object({
  studentId: z.string().min(1, "L'élève est requis"),
  date: z.string().min(1, "La date est requise"),
  status: z.enum(["PRESENT", "ABSENT", "EXPELLED", "SICK", "LATE"]),
  timetableEntryId: z.string().min(1, "Le cours (emploi du temps) est requis"),
  notes: z.string().optional(),
});

export const AttendanceRecordUpdateSchema = z
  .object({
    studentId: z.string().min(1, "L'élève est requis").optional(),
    date: z.string().min(1, "La date est requise").optional(),
    status: z
      .enum(["PRESENT", "ABSENT", "EXPELLED", "SICK", "LATE"])
      .optional(),
    recordedById: z.string().optional(),
    timetableEntryId: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );
