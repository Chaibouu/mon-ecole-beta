import { z } from "zod";

// ========================
// Fee Schedule Schemas
// ========================

export const FeeScheduleCreateSchema = z
  .object({
    gradeLevelId: z.string().optional(),
    classroomId: z.string().optional(),
    itemName: z.string().min(1, "Le nom de l'élément est requis"),
    amountCents: z.number().min(1, "Le montant doit être supérieur à 0"),
    dueDate: z.string().optional(),
    installments: z
      .array(
        z.object({
          name: z.string().min(1, "Le nom de la tranche est requis"),
          amountCents: z.number().min(1, "Le montant doit être supérieur à 0"),
          dueDate: z.string().min(1, "La date d'échéance est requise"),
        })
      )
      .optional(),
  })
  .refine(
    data => {
      // Un niveau doit être spécifié
      return data.gradeLevelId;
    },
    {
      message: "Veuillez spécifier un niveau scolaire",
      path: ["gradeLevelId"],
    }
  );

export const FeeScheduleUpdateSchema = z
  .object({
    gradeLevelId: z.string().optional(),
    classroomId: z.string().optional(),
    itemName: z.string().min(1, "Le nom de l'élément est requis").optional(),
    amountCents: z
      .number()
      .min(1, "Le montant doit être supérieur à 0")
      .optional(),
    dueDate: z.string().optional(),
    installments: z
      .array(
        z.object({
          name: z.string().min(1, "Le nom de la tranche est requis"),
          amountCents: z.number().min(1, "Le montant doit être supérieur à 0"),
          dueDate: z.string().min(1, "La date d'échéance est requise"),
        })
      )
      .optional(),
  })
  .refine(
    data => {
      return Object.keys(data).length > 0;
    },
    {
      message: "Au moins un champ doit être fourni",
    }
  );

// ========================
// Student Payment Schemas
// ========================

export const StudentPaymentCreateSchema = z.object({
  studentId: z.string().min(1, "L'élève est requis"),
  feeScheduleId: z.string().min(1, "La frais de scolarité est requise"),
  amountCents: z.number().min(1, "Le montant doit être supérieur à 0"),
  dueDate: z.string().optional(),
});

export const GeneratePaymentScheduleSchema = z
  .object({
    classroomId: z.string().min(1, "La classe est requise").optional(),
    gradeLevelId: z.string().min(1, "Le niveau est requis").optional(),
    feeScheduleId: z.string().min(1, "La frais de scolarité est requise"),
  })
  .refine(
    data => {
      return data.classroomId || data.gradeLevelId;
    },
    {
      message: "Veuillez spécifier soit une classe, soit un niveau",
      path: ["classroomId"],
    }
  );

// ========================
// Payment Schemas
// ========================

export const PaymentCreateSchema = z.object({
  studentId: z.string().min(1, "L'élève est requis"),
  feeScheduleId: z.string().min(1, "La frais de scolarité est requise"),
  amountCents: z.number().min(1, "Le montant doit être supérieur à 0"),
  method: z
    .enum(["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CHECK", "CARD"])
    .default("CASH"),
  reference: z.string().optional(),
  paidAt: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

// ========================
// Parent-Student Relation Schemas
// ========================

export const ParentStudentLinkSchema = z.object({
  parentProfileId: z.string().min(1, "Le profil parent est requis"),
  studentProfileId: z.string().min(1, "Le profil élève est requis"),
  relationship: z.string().optional(),
});

// ========================
// Filter Schemas
// ========================

export const FeeScheduleFiltersSchema = z.object({
  gradeLevelId: z.string().optional(),
  classroomId: z.string().optional(),
});

export const PaymentFiltersSchema = z.object({
  studentId: z.string().optional(),
  feeScheduleId: z.string().optional(),
  method: z
    .enum(["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CHECK", "CARD"])
    .optional(),
  gradeLevelId: z.string().optional(),
  classroomId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const PaymentAnalyticsFiltersSchema = z.object({
  gradeLevelId: z.string().optional(),
  classroomId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
