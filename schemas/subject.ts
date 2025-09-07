import { z } from "zod";

export const SubjectCreateSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  categoryId: z.string().optional().nullable(),
});

export const SubjectUpdateSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis").optional(),
    description: z.string().optional(),
    categoryId: z.string().optional().nullable(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );
