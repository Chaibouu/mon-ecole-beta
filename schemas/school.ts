import { z } from "zod";
import { isPhoneNumber } from "@/lib/validation-utils";

export const SchoolCreateSchema = z.object({
  code: z
    .string({ message: "Le code de l'école est requis" })
    .min(2, { message: "Le code doit contenir au moins 2 caractères" })
    .max(20, { message: "Le code ne doit pas dépasser 20 caractères" }),
  name: z
    .string({ message: "Le nom de l'école est requis" })
    .min(3, { message: "Le nom doit contenir au moins 3 caractères" }),
  address: z.string().optional(),
  phone: z
    .string()
    .refine(val => !val || isPhoneNumber(val), {
      message:
        "Format invalide. Utilisez un numéro de téléphone international (ex: +227XXXXXXXX, +33123456789)",
    })
    .optional(),
  email: z
    .string()
    .email({ message: "L'adresse email de l'école n'est pas valide" })
    .optional(),
});

// Mise à jour partielle des champs de l'école
export const SchoolUpdateSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Le nom doit contenir au moins 3 caractères" })
      .optional(),
    code: z
      .string()
      .min(2, { message: "Le code doit contenir au moins 2 caractères" })
      .max(20, { message: "Le code ne doit pas dépasser 20 caractères" })
      .optional(),
    address: z.string().optional().nullable(),
    phone: z
      .string()
      .refine(val => !val || isPhoneNumber(val), {
        message:
          "Format invalide. Utilisez un numéro de téléphone international (ex: +227XXXXXXXX, +33123456789)",
      })
      .optional()
      .nullable(),
    email: z
      .string()
      .email({ message: "L'adresse email de l'école n'est pas valide" })
      .optional()
      .nullable(),
    logoUrl: z.string().url().optional().nullable(),
    websiteUrl: z.string().url().optional(),
    slogan: z.string().optional().nullable(),
    brandPrimaryColor: z.string().optional().nullable(),
    brandSecondaryColor: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "Aucun champ à mettre à jour",
    path: ["_"],
  });
