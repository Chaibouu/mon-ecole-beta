import { z } from "zod";

export const AcademicYearCreateSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis"),
    startDate: z.string().min(1, "La date de début est requise"),
    endDate: z.string().min(1, "La date de fin est requise"),
    isActive: z.boolean().optional(),
  })
  .refine(
    data => {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      return startDate < endDate;
    },
    {
      message: "La date de fin doit être postérieure à la date de début",
      path: ["endDate"],
    }
  );

export const AcademicYearUpdateSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis").optional(),
    startDate: z.string().min(1, "La date de début est requise").optional(),
    endDate: z.string().min(1, "La date de fin est requise").optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return startDate < endDate;
      }
      return true;
    },
    {
      message: "La date de fin doit être postérieure à la date de début",
      path: ["endDate"],
    }
  )
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );
