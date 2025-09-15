import { z } from "zod";

export const UserCreateSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"], {
    errorMap: () => ({ message: "Rôle invalide" }),
  }),
});
