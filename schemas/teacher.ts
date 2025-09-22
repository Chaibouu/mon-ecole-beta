import { z } from "zod";
import { isPhoneNumber } from "@/lib/validation-utils";

export const TeacherCreateSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom de famille est requis"),
    email: z
      .string()
      .email("L'email doit être valide")
      .optional()
      .or(z.literal("")),
    phone: z.string().refine(val => isPhoneNumber(val), {
      message:
        "Format invalide. Utilisez un numéro de téléphone international (ex: +227XXXXXXXX)",
    }),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .optional(),
    // Champs du profil enseignant
    bio: z.string().optional(),
    employeeNumber: z.string().optional(),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    placeOfBirth: z.string().optional(),
    nationality: z.string().optional(),
    bloodType: z.string().optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    hireDate: z.string().optional(),
    qualification: z.string().optional(),
    specialization: z.string().optional(),
    experienceYears: z.string().optional(),
    salary: z.string().optional(),
    status: z.string().optional(),
    subjectIds: z.array(z.string()).optional(),
  })
  .refine(
    data => {
      if (data.email && data.email !== "") {
        return z.string().email().safeParse(data.email).success;
      }
      return true;
    },
    {
      message: "Adresse email invalide",
      path: ["email"],
    }
  );

export const TeacherUpdateSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis").optional(),
    lastName: z.string().min(1, "Le nom de famille est requis").optional(),
    email: z
      .string()
      .email("L'email doit être valide")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .refine(val => isPhoneNumber(val), {
        message:
          "Format invalide. Utilisez un numéro de téléphone international (ex: +227XXXXXXXX)",
      })
      .optional(),
    // Champs du profil enseignant
    bio: z.string().optional(),
    employeeNumber: z.string().optional(),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    placeOfBirth: z.string().optional(),
    nationality: z.string().optional(),
    bloodType: z.string().optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    hireDate: z.string().optional(),
    qualification: z.string().optional(),
    specialization: z.string().optional(),
    experienceYears: z.string().optional(),
    salary: z.string().optional(),
    status: z.string().optional(),
    subjectIds: z.array(z.string()).optional(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  )
  .refine(
    data => {
      if (data.email && data.email !== "") {
        return z.string().email().safeParse(data.email).success;
      }
      return true;
    },
    {
      message: "Adresse email invalide",
      path: ["email"],
    }
  );
