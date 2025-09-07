import { z } from "zod";

export const TeacherCreateSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom de famille est requis"),
  email: z.string().email("L'email doit être valide"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  hireDate: z.string().optional(),
  bio: z.string().optional(),
  subjectIds: z.array(z.string()).optional(),
});

export const TeacherUpdateSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis").optional(),
    lastName: z.string().min(1, "Le nom de famille est requis").optional(),
    email: z.string().email("L'email doit être valide").optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    hireDate: z.string().optional(),
    bio: z.string().optional(),
    subjectIds: z.array(z.string()).optional(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );
