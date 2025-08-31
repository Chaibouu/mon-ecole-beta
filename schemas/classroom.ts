import { z } from "zod";

export const ClassroomCreateSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  gradeLevelId: z.string().min(1, "Le niveau scolaire est requis"),
  description: z.string().optional(),
  headTeacherId: z.string().optional(),
  room: z.string().optional(),
});

export const ClassroomUpdateSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis").optional(),
    gradeLevelId: z.string().min(1, "Le niveau scolaire est requis").optional(),
    description: z.string().optional(),
    headTeacherId: z.string().optional(),
    room: z.string().optional(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );
