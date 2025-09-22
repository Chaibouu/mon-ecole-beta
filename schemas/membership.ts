import { z } from "zod";
import { isPhoneNumber } from "@/lib/validation-utils";

const BaseUserInfo = z
  .object({
    name: z
      .string()
      .min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
    email: z
      .string()
      .email({ message: "Adresse email invalide" })
      .optional()
      .or(z.literal("")),
    phone: z.string().refine(val => isPhoneNumber(val), {
      message:
        "Format invalide. Utilisez un numéro de téléphone international (ex: +227XXXXXXXX)",
    }),
    password: z.string().min(6, {
      message: "Le mot de passe doit contenir au moins 6 caractères",
    }),
  })
  .refine(
    data => {
      // Le téléphone est obligatoire, l'email est optionnel
      // Si email fourni, il doit être valide
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

export const LinkExistingUserSchema = z.object({
  existingUserId: z.string().min(1, { message: "existingUserId requis" }),
});

export const CreateNewUserSchema = z.object({
  user: BaseUserInfo,
});

export const TeacherCreateSchema = z.union([
  LinkExistingUserSchema,
  CreateNewUserSchema.extend({
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
  }),
]);

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

export const ParentCreateSchema = z
  .union([LinkExistingUserSchema, CreateNewUserSchema])
  .and(
    z.object({
      phone: z.string().optional(),
      address: z.string().optional(),
      profession: z.string().optional(),
      workplace: z.string().optional(),
      preferredLanguage: z.string().optional(),
      children: z
        .array(
          z.object({
            studentId: z.string(),
            relationship: z.string().optional(),
          })
        )
        .optional(),
    })
  );

export const StudentCreateSchema = z
  .union([LinkExistingUserSchema, CreateNewUserSchema])
  .and(
    z.object({
      profile: z
        .object({
          matricule: z.string().optional(),
          gender: z.string().optional(),
          dateOfBirth: z.string().optional(),
        })
        .optional(),
    })
  );

export const AdminCreateSchema = z.union([
  LinkExistingUserSchema,
  CreateNewUserSchema,
]);

export const StudentUpdateSchema = z
  .object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z
      .string()
      .refine(val => isPhoneNumber(val), {
        message:
          "Format invalide. Utilisez un numéro de téléphone international (ex: +227XXXXXXXX, +33123456789)",
      })
      .optional(),
    profile: z
      .object({
        matricule: z.string().optional(),
        studentNumber: z.string().optional(),
        gender: z.string().optional(),
        dateOfBirth: z.string().optional(),
        placeOfBirth: z.string().optional(),
        nationality: z.string().optional(),
        bloodType: z.string().optional(),
        address: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
        previousSchool: z.string().optional(),
        status: z.string().optional(),
      })
      .optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni",
  });

export const ParentUpdateSchema = z
  .object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z
      .string()
      .refine(val => isPhoneNumber(val), {
        message:
          "Format invalide. Utilisez un numéro de téléphone international (ex: +227XXXXXXXX)",
      })
      .optional(),
    profile: z
      .object({
        phone: z.string().optional(),
        address: z.string().optional(),
        profession: z.string().optional(),
        workplace: z.string().optional(),
        preferredLanguage: z.string().optional(),
      })
      .optional(),
    children: z
      .array(
        z.object({
          studentId: z.string(),
          relationship: z.string().optional(),
        })
      )
      .optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni",
  });

export const AdminUpdateSchema = z
  .object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z
      .string()
      .refine(val => isPhoneNumber(val), {
        message:
          "Format invalide. Utilisez un numéro de téléphone international (ex: +227XXXXXXXX, +33123456789)",
      })
      .optional(),
    password: z.string().min(6).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni",
  });
