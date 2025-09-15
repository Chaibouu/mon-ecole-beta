import * as z from "zod";
import { UserRole } from "@prisma/client";
import {
  isEmail,
  isPhoneNumber,
  isNigerianPhone,
} from "@/lib/validation-utils";

// Schéma de validation pour les numéros de téléphone internationaux
export const PhoneSchema = z
  .string()
  .refine(val => isPhoneNumber(val), {
    message:
      "Format invalide. Utilisez un numéro de téléphone international (ex: +227XXXXXXXX, +33123456789)",
  })
  .optional();

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine(
    data => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: "New password is required!",
      path: ["newPassword"],
    }
  )
  .refine(
    data => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: "Password is required!",
      path: ["password"],
    }
  );

// Schéma pour l'action forgot-password
export const PasswordResetSchema = z.object({
  email: z.string().email({ message: "L'adresse email n'est pas valide" }),
});

// Schéma pour l'action reset-password
export const resetPasswordSchema = z.object({
  token: z.string().optional(),
  newPassword: z
    .string({
      message: "Le mot de passe est requis",
    })
    .min(8, {
      message: "Le mot de passe doit contenir au moins 8 caractères",
    }),
});

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email ou numéro de téléphone requis")
    .refine(
      val => {
        // Accepter soit un email valide soit un numéro de téléphone international
        return isEmail(val) || isPhoneNumber(val);
      },
      {
        message:
          "Format invalide. Utilisez un email valide ou un numéro de téléphone international (ex: +227XXXXXXXX)",
      }
    ),
  password: z
    .string({
      message: "Le mot de passe est requis",
    })
    .min(8, {
      message: "Le mot de passe doit contenir au moins 8 caractères",
    }),
  code: z.optional(z.string()),
  rememberMe: z.boolean().optional(),
});

// SignupSchema supprimé - non utilisé dans l'application

export const ResendVerificationSchema = z.object({
  email: z.string().email({
    message: "L'adresse email n'est pas valide",
  }),
});

export const ResetPasswordSchema = z.object({
  token: z.string({
    message: "Le token est requis",
  }),
  newPassword: z
    .string({
      message: "Le mot de passe est requis",
    })
    .min(8, {
      message: "Le mot de passe doit comporter au moins 8 caractères",
    }),
});
