import { z } from "zod";

export const GradeLevelCreateSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  category: z.enum(["COLLEGE", "LYCEE"]).default("COLLEGE"),
});

export const GradeLevelUpdateSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis").optional(),
    description: z.string().optional(),
    category: z.enum(["COLLEGE", "LYCEE"]).optional(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );
