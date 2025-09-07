import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// GET /api/payments/analytics
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
    const gradeLevelId =
      req.nextUrl.searchParams.get("gradeLevelId") || undefined;
    const classroomId =
      req.nextUrl.searchParams.get("classroomId") || undefined;
    const termId = req.nextUrl.searchParams.get("termId") || undefined;
    const dateFrom = req.nextUrl.searchParams.get("dateFrom") || undefined;
    const dateTo = req.nextUrl.searchParams.get("dateTo") || undefined;

    // Base filter for payments
    let paymentFilter: any = {
      schoolId,
    };

    // Add filters
    if (gradeLevelId) {
      paymentFilter.student = {
        enrollments: {
          some: {
            classroom: {
              gradeLevelId,
            },
          },
        },
      };
    }

    if (classroomId) {
      paymentFilter.student = {
        enrollments: {
          some: { classroomId },
        },
      };
    }

    if (termId) {
      paymentFilter.feeSchedule = {
        termId,
      };
    }

    // Date filter for payments
    if (dateFrom || dateTo) {
      paymentFilter.paidAt = {};
      if (dateFrom) paymentFilter.paidAt.gte = new Date(dateFrom);
      if (dateTo) paymentFilter.paidAt.lte = new Date(dateTo);
    }

    // Get all payments with related data
    const payments = await db.payment.findMany({
      where: paymentFilter,
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

    // Get all fee schedules for the school to calculate expected amounts
    let feeScheduleFilter: any = { schoolId };
    if (gradeLevelId) {
      feeScheduleFilter.gradeLevelId = gradeLevelId;
    }
    if (classroomId) {
      feeScheduleFilter.classroomId = classroomId;
    }
    if (termId) {
      feeScheduleFilter.termId = termId;
    }

    // Récupérer SEULEMENT les frais principaux pour le calcul des totaux
    const feeSchedules = await db.feeSchedule.findMany({
      where: {
        ...feeScheduleFilter,
        isInstallment: false, // Seulement les frais principaux
      },
      include: {
        installments: true,
        gradeLevel: true,
        classroom: true,
      },
    });

    // Récupérer tous les étudiants actifs pour calculer le montant attendu réel
    const activeStudents = await db.studentProfile.findMany({
      where: {
        schoolId,
        enrollments: {
          some: {
            status: "ACTIVE",
          },
        },
      },
      include: {
        enrollments: {
          where: {
            status: "ACTIVE",
          },
          include: {
            classroom: {
              include: {
                gradeLevel: true,
              },
            },
          },
        },
      },
    });

    // Calculer le montant total attendu basé sur les étudiants et leurs frais applicables
    let totalExpected = 0;

    activeStudents.forEach(student => {
      const currentEnrollment = student.enrollments[0]; // Un seul enrollment actif
      if (currentEnrollment) {
        // Trouver les frais applicables pour cet étudiant
        const applicableFees = feeSchedules.filter(fee => {
          // Frais au niveau de la classe
          if (fee.classroomId === currentEnrollment.classroomId) {
            return true;
          }
          // Frais au niveau du grade (sans classe spécifique)
          if (
            fee.gradeLevelId === currentEnrollment.classroom.gradeLevelId &&
            !fee.classroomId
          ) {
            return true;
          }
          return false;
        });

        // Ajouter les montants des frais applicables
        applicableFees.forEach(fee => {
          totalExpected += fee.amountCents;
        });
      }
    });

    const totalCollected = payments.reduce(
      (sum, payment) => sum + payment.amountCents,
      0
    );

    const collectionRate =
      totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    // Group payments by fee schedule to calculate pending and overdue amounts
    const paymentsByFeeSchedule = new Map();
    payments.forEach(payment => {
      const key = payment.feeScheduleId;
      if (!paymentsByFeeSchedule.has(key)) {
        paymentsByFeeSchedule.set(key, []);
      }
      paymentsByFeeSchedule.get(key).push(payment);
    });

    let pendingAmount = 0;
    let overdueAmount = 0;
    let paidCount = 0;
    let partiallyPaidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    // Calculer les stats basées sur chaque étudiant et ses frais applicables
    activeStudents.forEach(student => {
      const currentEnrollment = student.enrollments[0];
      if (currentEnrollment) {
        // Trouver les frais applicables pour cet étudiant
        const applicableFees = feeSchedules.filter(fee => {
          // Frais au niveau de la classe
          if (fee.classroomId === currentEnrollment.classroomId) {
            return true;
          }
          // Frais au niveau du grade (sans classe spécifique)
          if (
            fee.gradeLevelId === currentEnrollment.classroom.gradeLevelId &&
            !fee.classroomId
          ) {
            return true;
          }
          return false;
        });

        // Pour chaque frais applicable à cet étudiant
        applicableFees.forEach(feeSchedule => {
          // Calculer les paiements pour ce frais principal ET ses tranches
          let totalPaidForFee = 0;

          // Paiements sur le frais principal
          const mainFeePayments =
            paymentsByFeeSchedule.get(feeSchedule.id) || [];
          totalPaidForFee += mainFeePayments
            .filter((p: any) => p.studentId === student.id)
            .reduce((sum: number, p: any) => sum + p.amountCents, 0);

          // Paiements sur les tranches
          if (feeSchedule.installments) {
            feeSchedule.installments.forEach(installment => {
              const installmentPayments =
                paymentsByFeeSchedule.get(installment.id) || [];
              totalPaidForFee += installmentPayments
                .filter((p: any) => p.studentId === student.id)
                .reduce((sum: number, p: any) => sum + p.amountCents, 0);
            });
          }

          const remainingAmount = feeSchedule.amountCents - totalPaidForFee;

          if (totalPaidForFee >= feeSchedule.amountCents) {
            paidCount++;
          } else if (totalPaidForFee > 0) {
            partiallyPaidCount++;
            pendingAmount += remainingAmount;
            if (
              feeSchedule.dueDate &&
              new Date(feeSchedule.dueDate) < new Date()
            ) {
              overdueAmount += remainingAmount;
            }
          } else {
            if (
              feeSchedule.dueDate &&
              new Date(feeSchedule.dueDate) < new Date()
            ) {
              overdueCount++;
              overdueAmount += feeSchedule.amountCents;
            } else {
              pendingCount++;
              pendingAmount += feeSchedule.amountCents;
            }
          }
        });
      }
    });

    // Status breakdown
    const statusCounts = {
      PAID: paidCount,
      PARTIALLY_PAID: partiallyPaidCount,
      PENDING: pendingCount,
      OVERDUE: overdueCount,
    };

    // Payment methods breakdown
    const paymentMethods = payments.reduce(
      (acc: Record<string, { count: number; amount: number }>, payment) => {
        const method = payment.method || "Non spécifié";
        if (!acc[method]) {
          acc[method] = { count: 0, amount: 0 };
        }
        acc[method].count++;
        acc[method].amount += payment.amountCents;
        return acc;
      },
      {}
    );

    // Monthly trends (last 12 months)
    const monthlyTrends = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthPayments = payments
        .filter(payment => {
          const paidAt = new Date(payment.paidAt);
          return paidAt >= month && paidAt < nextMonth;
        })
        .reduce((sum, payment) => sum + payment.amountCents, 0);

      monthlyTrends.push({
        month: month.toISOString().slice(0, 7), // YYYY-MM format
        amount: monthPayments,
        label: month.toLocaleDateString("fr-FR", {
          month: "short",
          year: "numeric",
        }),
      });
    }

    const analytics = {
      totalExpected,
      totalCollected,
      collectionRate,
      pendingAmount,
      overdueAmount,
      statusCounts,
      paymentMethods,
      monthlyTrends,
      totalFeeSchedules: feeSchedules.length,
      totalPayments: payments.length,
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Error fetching payment analytics:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
