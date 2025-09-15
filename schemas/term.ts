import { z } from "zod";

export const TermCreateSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis"),
    startDate: z.string().min(1, "La date de début est requise"),
    endDate: z.string().min(1, "La date de fin est requise"),
    academicYearId: z.string().min(1, "L'année académique est requise"),
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
  )
  .transform(data => {
    // Transformer les chaînes de date en objets Date pour Prisma
    return {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    };
  });

export const TermUpdateSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis").optional(),
    startDate: z.string().min(1, "La date de début est requise").optional(),
    endDate: z.string().min(1, "La date de fin est requise").optional(),
    academicYearId: z
      .string()
      .min(1, "L'année académique est requise")
      .optional(),
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
  )
  .transform(data => {
    // Transformer les chaînes de date en objets Date pour Prisma
    const transformed: any = { ...data };
    if (data.startDate) {
      transformed.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      transformed.endDate = new Date(data.endDate);
    }
    return transformed;
  });
