import { z } from "zod";

export const SubjectCategoryCreateSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
});

export const SubjectCategoryUpdateSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis").optional(),
    description: z.string().optional(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );














