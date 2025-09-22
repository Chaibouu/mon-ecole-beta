"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";
import { z } from "zod";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

const ChangePasswordSchema = z.object({
  userId: z.string().min(1, "L'ID utilisateur est requis"),
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  userType: z.enum(["teacher", "parent", "student"], {
    errorMap: () => ({ message: "Type d'utilisateur invalide" }),
  }),
});

export async function changeUserPassword(
  input: z.infer<typeof ChangePasswordSchema>
) {
  try {
    const validatedInput = ChangePasswordSchema.parse(input);

    return await makeAuthenticatedRequest(
      `${API_BASE}/admin/users/${validatedInput.userId}/password`,
      "PATCH",
      {
        newPassword: validatedInput.newPassword,
        userType: validatedInput.userType,
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Erreur lors de la modification du mot de passe" };
  }
}
