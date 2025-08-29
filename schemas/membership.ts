import { z } from "zod";

const BaseUserInfo = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

export const LinkExistingUserSchema = z.object({
  existingUserId: z.string().min(1, { message: "existingUserId requis" }),
});

export const CreateNewUserSchema = z.object({
  user: BaseUserInfo,
});

export const TeacherCreateSchema = z.union([
  LinkExistingUserSchema,
  CreateNewUserSchema,
]);

export const ParentCreateSchema = z.union([
  LinkExistingUserSchema,
  CreateNewUserSchema,
]);

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
