import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// GET /api/parents/payments-summary
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
      "PARENT",
    ]);
    if (!roleOk) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    // Récupérer le profil parent
    const parentProfile = await db.parentProfile.findFirst({
      where: {
        userId,
        schoolId,
      },
    });

    if (!parentProfile) {
      return NextResponse.json(
        { error: "Profil parent non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer tous les enfants avec leurs paiements
    const parentStudents = await db.parentStudent.findMany({
      where: {
        parentProfileId: parentProfile.id,
      },
      include: {
        student: {
          include: {
            user: true,
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
            payments: {
              include: {
                feeSchedule: {
                  include: {
                    gradeLevel: true,
                    classroom: true,
                  },
                },
              },
              orderBy: {
                paidAt: "desc",
              },
            },
          },
        },
      },
    });

    // Calculer le résumé pour chaque enfant
    const childrenSummary = await Promise.all(
      parentStudents.map(async ps => {
        const student = ps.student;
        const currentEnrollment = student.enrollments[0];

        if (!currentEnrollment) {
          return {
            id: student.id,
            name: student.user?.name,
            matricule: student.matricule,
            relationship: ps.relationship,
            currentEnrollment: null,
            summary: {
              totalDue: 0,
              totalPaid: 0,
              balance: 0,
              overdueCount: 0,
            },
            recentPayments: [],
            upcomingPayments: [],
          };
        }

        // Récupérer les frais applicables pour cet enfant
        const applicableFees = await db.feeSchedule.findMany({
          where: {
            schoolId,
            OR: [
              {
                gradeLevelId: currentEnrollment.classroom.gradeLevelId,
                classroomId: null,
              },
              { classroomId: currentEnrollment.classroomId },
            ],
            isInstallment: false, // Seulement les frais principaux
          },
          include: {
            installments: {
              orderBy: {
                installmentOrder: "asc",
              },
            },
          },
        });

        // Calculer le total dû
        const totalDue = applicableFees.reduce(
          (sum, fee) => sum + fee.amountCents,
          0
        );

        // Calculer le total payé
        const totalPaid = student.payments.reduce(
          (sum: number, payment: any) => sum + payment.amountCents,
          0
        );

        const balance = totalDue - totalPaid;

        // Grouper les paiements par frais
        const paymentsByFeeSchedule = new Map();
        student.payments.forEach((payment: any) => {
          const key = payment.feeScheduleId;
          if (!paymentsByFeeSchedule.has(key)) {
            paymentsByFeeSchedule.set(key, []);
          }
          paymentsByFeeSchedule.get(key).push(payment);
        });

        // Calculer les statuts des frais et compter les retards
        let overdueCount = 0;
        const feeStatuses = [];

        for (const mainFee of applicableFees) {
          if (mainFee.installments.length > 0) {
            // Frais avec tranches
            const allRelatedPayments = [];
            const mainFeePayments = paymentsByFeeSchedule.get(mainFee.id) || [];
            allRelatedPayments.push(...mainFeePayments);

            for (const installment of mainFee.installments) {
              const installmentPayments =
                paymentsByFeeSchedule.get(installment.id) || [];
              allRelatedPayments.push(...installmentPayments);
            }

            const totalPaidForMainFee = allRelatedPayments.reduce(
              (sum: number, p: any) => sum + p.amountCents,
              0
            );

            const hasMainFeePayment = mainFeePayments.length > 0;

            if (hasMainFeePayment) {
              // Mode paiement complet
              let status = "PENDING";
              if (totalPaidForMainFee >= mainFee.amountCents) {
                status = "PAID";
              } else if (totalPaidForMainFee > 0) {
                status = "PARTIALLY_PAID";
              } else if (
                mainFee.dueDate &&
                new Date(mainFee.dueDate) < new Date()
              ) {
                status = "OVERDUE";
                overdueCount++;
              }

              feeStatuses.push({
                ...mainFee,
                status,
                totalPaid: totalPaidForMainFee,
                remainingAmount: mainFee.amountCents - totalPaidForMainFee,
              });
            } else {
              // Mode par tranches
              for (const installment of mainFee.installments) {
                const installmentPayments =
                  paymentsByFeeSchedule.get(installment.id) || [];
                const totalPaidForInstallment = installmentPayments.reduce(
                  (sum: number, p: any) => sum + p.amountCents,
                  0
                );

                let status = "PENDING";
                if (totalPaidForInstallment >= installment.amountCents) {
                  status = "PAID";
                } else if (totalPaidForInstallment > 0) {
                  status = "PARTIALLY_PAID";
                } else if (
                  installment.dueDate &&
                  installment.dueDate < new Date()
                ) {
                  status = "OVERDUE";
                  overdueCount++;
                }

                feeStatuses.push({
                  ...installment,
                  status,
                  totalPaid: totalPaidForInstallment,
                  remainingAmount:
                    installment.amountCents - totalPaidForInstallment,
                });
              }
            }
          } else {
            // Frais sans tranches
            const payments = paymentsByFeeSchedule.get(mainFee.id) || [];
            const totalPaidForFee = payments.reduce(
              (sum: number, p: any) => sum + p.amountCents,
              0
            );

            let status = "PENDING";
            if (totalPaidForFee >= mainFee.amountCents) {
              status = "PAID";
            } else if (totalPaidForFee > 0) {
              status = "PARTIALLY_PAID";
            } else if (
              mainFee.dueDate &&
              new Date(mainFee.dueDate) < new Date()
            ) {
              status = "OVERDUE";
              overdueCount++;
            }

            feeStatuses.push({
              ...mainFee,
              status,
              totalPaid: totalPaidForFee,
              remainingAmount: mainFee.amountCents - totalPaidForFee,
            });
          }
        }

        // Paiements récents (5 derniers)
        const recentPayments = student.payments.slice(0, 5);

        // Prochaines échéances (frais non payés avec dates d'échéance)
        const upcomingPayments = feeStatuses
          .filter((fs: any) => fs.status !== "PAID" && fs.dueDate)
          .sort(
            (a: any, b: any) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          )
          .slice(0, 3);

        return {
          id: student.id,
          name: student.user?.name,
          matricule: student.matricule,
          relationship: ps.relationship,
          currentEnrollment,
          summary: {
            totalDue,
            totalPaid,
            balance,
            overdueCount,
          },
          recentPayments,
          upcomingPayments,
        };
      })
    );

    // Calculer le résumé global
    const globalSummary = childrenSummary.reduce(
      (acc, child) => ({
        totalDue: acc.totalDue + child.summary.totalDue,
        totalPaid: acc.totalPaid + child.summary.totalPaid,
        balance: acc.balance + child.summary.balance,
        overdueCount: acc.overdueCount + child.summary.overdueCount,
      }),
      { totalDue: 0, totalPaid: 0, balance: 0, overdueCount: 0 }
    );

    return NextResponse.json({
      globalSummary,
      children: childrenSummary,
    });
  } catch (error) {
    console.error("Error fetching parent payments summary:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
