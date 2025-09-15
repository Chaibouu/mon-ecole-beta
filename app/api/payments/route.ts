import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import {
  PaymentCreateSchema,
  PaymentFiltersSchema,
} from "@/schemas/school-fees";

// GET /api/payments
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const roleOk = await requireSchoolRole(userId, schoolId, [
      "SUPER_ADMIN",
      "ADMIN",
      "TEACHER",
      "PARENT",
    ]);
    if (!roleOk) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    // Filters
    const studentId = req.nextUrl.searchParams.get("studentId") || undefined;
    const feeScheduleId =
      req.nextUrl.searchParams.get("feeScheduleId") || undefined;
    const method = req.nextUrl.searchParams.get("method") || undefined;
    const gradeLevelId =
      req.nextUrl.searchParams.get("gradeLevelId") || undefined;
    const classroomId =
      req.nextUrl.searchParams.get("classroomId") || undefined;
    const dateFrom = req.nextUrl.searchParams.get("dateFrom") || undefined;
    const dateTo = req.nextUrl.searchParams.get("dateTo") || undefined;

    // For parents, filter by their children
    let studentFilter: any = {};

    if (studentId) {
      studentFilter.id = studentId;
    }

    // If user is a parent, get their children's payments only
    const userSchool = await db.userSchool.findFirst({
      where: { userId, schoolId },
    });

    if (userSchool?.role === "PARENT") {
      const parentProfile = await db.parentProfile.findFirst({
        where: { userId, schoolId },
        include: {
          children: {
            select: { studentProfileId: true },
          },
        },
      });

      if (parentProfile?.children.length) {
        studentFilter.id = {
          in: parentProfile.children.map(c => c.studentProfileId),
        };
      } else {
        return NextResponse.json({ payments: [] });
      }
    }

    const payments = await db.payment.findMany({
      where: {
        schoolId,
        ...(Object.keys(studentFilter).length > 0 && {
          student: studentFilter,
        }),
        ...(feeScheduleId && { feeScheduleId }),

        ...(method && { method: method as any }),
        ...(dateFrom && { paidAt: { gte: new Date(dateFrom) } }),
        ...(dateTo && { paidAt: { lte: new Date(dateTo) } }),
        ...(gradeLevelId && {
          student: {
            enrollments: {
              some: {
                classroom: {
                  gradeLevelId,
                },
              },
            },
          },
        }),
        ...(classroomId && {
          student: {
            enrollments: {
              some: { classroomId },
            },
          },
        }),
      },
      include: {
        student: {
          include: {
            user: true,
            enrollments: {
              include: {
                classroom: {
                  include: {
                    gradeLevel: true,
                  },
                },
              },
            },
          },
        },
        feeSchedule: {
          include: {
            gradeLevel: true,
            classroom: true,
            term: true,
          },
        },
      },
      orderBy: {
        paidAt: "desc",
      },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/payments
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const roleOk = await requireSchoolRole(userId, schoolId, [
      "SUPER_ADMIN",
      "ADMIN",
    ]);
    if (!roleOk) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = PaymentCreateSchema.safeParse(body);

    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    // Verify student belongs to school
    const student = await db.studentProfile.findFirst({
      where: {
        id: parsed.data.studentId,
        schoolId,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Élève non trouvé dans cette école" },
        { status: 404 }
      );
    }

    // Verify fee schedule belongs to school and load relations
    const feeSchedule = await db.feeSchedule.findFirst({
      where: {
        id: parsed.data.feeScheduleId,
        schoolId,
      },
      include: {
        parentFee: true,
        installments: true,
      },
    });

    if (!feeSchedule) {
      return NextResponse.json(
        { error: "Structure de frais non trouvée" },
        { status: 404 }
      );
    }

    // Business rules: sequential installments vs full payment
    // Build context: determine parent and installments set
    const isInstallment = !!feeSchedule.parentFeeId;
    const parentFeeId = isInstallment
      ? feeSchedule.parentFeeId!
      : feeSchedule.id;
    const parentFee = isInstallment ? feeSchedule.parentFee : feeSchedule;

    // Fetch all installments for parent (ordered)
    const installments = await db.feeSchedule.findMany({
      where: { schoolId, parentFeeId },
      orderBy: { installmentOrder: "asc" },
    });

    // Fetch existing payments for this student on parent and installments
    const relatedFeeIds = [parentFeeId, ...installments.map(i => i.id)];
    const existingPayments = await db.payment.findMany({
      where: {
        schoolId,
        studentId: parsed.data.studentId,
        feeScheduleId: { in: relatedFeeIds },
      },
    });

    // Helpers
    const sumPaidFor = (feeId: string) =>
      existingPayments
        .filter(p => p.feeScheduleId === feeId)
        .reduce((s, p) => s + p.amountCents, 0);

    // If paying full (parent), allow even if some installments were paid.
    // We'll cap the amount to the remaining global below.

    // If paying an installment, enforce order and prevent overlap with full payment
    if (isInstallment) {
      // Enforce sequential order: all previous installments must be fully paid
      const ordered = installments;
      const currentIndex = ordered.findIndex(i => i.id === feeSchedule.id);
      for (let i = 0; i < currentIndex; i++) {
        const inst = ordered[i];
        const paid = sumPaidFor(inst.id);
        if (paid < inst.amountCents) {
          return NextResponse.json(
            {
              error: `Veuillez d'abord régler la tranche ${i + 1} avant de payer la suivante.`,
            },
            { status: 400 }
          );
        }
      }
      // Amount must not exceed remaining for this installment
      const alreadyPaid = sumPaidFor(feeSchedule.id);
      const remaining = feeSchedule.amountCents - alreadyPaid;
      if (parsed.data.amountCents > remaining) {
        return NextResponse.json(
          { error: "Montant supérieur au restant de la tranche." },
          { status: 400 }
        );
      }
      // Global cap: also ensure we don't exceed the remaining global across parent + all installments
      const paidOnParent = sumPaidFor(parentFeeId);
      const paidOnInstallments = installments.reduce(
        (s, inst) => s + sumPaidFor(inst.id),
        0
      );
      const globalRemaining =
        parentFee!.amountCents - (paidOnParent + paidOnInstallments);
      if (parsed.data.amountCents > globalRemaining) {
        return NextResponse.json(
          { error: "Montant supérieur au restant total du frais." },
          { status: 400 }
        );
      }
    } else {
      // Paying full: amount must not exceed remaining on parent (consider all installment payments too)
      const paidOnParent = sumPaidFor(parentFeeId);
      const paidOnInstallments = installments.reduce(
        (s, inst) => s + sumPaidFor(inst.id),
        0
      );
      const remaining =
        parentFee!.amountCents - (paidOnParent + paidOnInstallments);
      if (parsed.data.amountCents > remaining) {
        return NextResponse.json(
          { error: "Montant supérieur au restant à payer." },
          { status: 400 }
        );
      }
    }

    // Create payment
    const payment = await db.payment.create({
      data: {
        ...parsed.data,
        schoolId,
        paidAt: parsed.data.paidAt ? new Date(parsed.data.paidAt) : new Date(),
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      },
      include: {
        student: {
          include: {
            user: true,
            enrollments: {
              include: {
                classroom: {
                  include: {
                    gradeLevel: true,
                  },
                },
              },
            },
          },
        },
        feeSchedule: {
          include: {
            gradeLevel: true,
            classroom: true,
            term: true,
          },
        },
      },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
