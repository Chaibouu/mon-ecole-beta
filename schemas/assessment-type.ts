import { z } from "zod";

export const AssessmentTypeCreateSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  code: z.string().min(1).optional(),
  defaultMaxScore: z.number().positive("Le barème doit être > 0").default(20),
  defaultCoefficient: z
    .number()
    .min(0, "Le coefficient doit être >= 0")
    .default(1),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).optional(),
});

export const AssessmentTypeUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    defaultMaxScore: z.number().positive().optional(),
    defaultCoefficient: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni",
  });
