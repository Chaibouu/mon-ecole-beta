import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// GET /api/students/[id]/payments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const studentId = resolvedParams.id;

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

    // Vérifier si l'utilisateur est un parent et s'il a accès à cet étudiant
    const userRole = await db.userSchool.findFirst({
      where: { userId, schoolId },
      select: { role: true },
    });

    if (userRole?.role === "PARENT") {
      // Vérifier que ce parent a bien ce student comme enfant
      const parentProfile = await db.parentProfile.findFirst({
        where: { userId, schoolId },
      });

      if (!parentProfile) {
        return NextResponse.json(
          { error: "Profil parent non trouvé" },
          { status: 404 }
        );
      }

      const parentStudent = await db.parentStudent.findFirst({
        where: {
          parentProfileId: parentProfile.id,
          studentProfileId: studentId,
        },
      });

      if (!parentStudent) {
        return NextResponse.json(
          { error: "Accès non autorisé à cet étudiant" },
          { status: 403 }
        );
      }
    }

    // Get student with all payment-related data
    const student = await db.studentProfile.findFirst({
      where: {
        id: studentId,
        schoolId,
      },
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
        payments: {
          include: {
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
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Étudiant non trouvé" },
        { status: 404 }
      );
    }

    // Get all fee schedules that apply to this student's grade level/classroom
    const currentEnrollment = student.enrollments.find(
      e => e.status === "ACTIVE"
    );
    let applicableFeeSchedules: any[] = [];
    let mainFees: any[] = [];

    if (currentEnrollment) {
      // Récupérer TOUS les frais applicables (parents + tranches)
      const allApplicableFees = await db.feeSchedule.findMany({
        where: {
          schoolId,
          OR: [
            {
              gradeLevelId: currentEnrollment.classroom.gradeLevelId,
              classroomId: null,
            },
            { classroomId: currentEnrollment.classroomId },
          ],
        },
        include: {
          gradeLevel: true,
          classroom: true,
          term: true,
          installments: {
            orderBy: {
              installmentOrder: "asc",
            },
          },
        },
      });

      // Déterminer les frais principaux (éviter le double comptage)
      // 1) parentFeeId == null
      // 2) Fallback legacy: exclure les noms contenant " - "
      mainFees = allApplicableFees.filter(
        f => f.parentFeeId === null && !f.itemName.includes(" - ")
      );

      // Pour les paiements, offrir les 2 options : paiement complet OU par tranches
      applicableFeeSchedules = [];
      for (const mainFee of mainFees) {
        if (mainFee.installments.length > 0) {
          applicableFeeSchedules.push(mainFee);
          applicableFeeSchedules.push(...mainFee.installments);
        } else {
          applicableFeeSchedules.push(mainFee);
        }
      }

      // Déduplication par ID pour éviter les doublons
      const uniqueFeeSchedules = new Map();
      applicableFeeSchedules.forEach(fs => {
        uniqueFeeSchedules.set(fs.id, fs);
      });
      applicableFeeSchedules = Array.from(uniqueFeeSchedules.values());
    }

    // Calculate payment summary
    const totalPaid = student.payments.reduce(
      (sum: number, payment: any) => sum + payment.amountCents,
      0
    );

    // Calculer le total dû basé sur les frais principaux uniquement (utiliser mainFees)
    const totalDue = currentEnrollment
      ? mainFees.reduce((sum: number, fee: any) => sum + fee.amountCents, 0)
      : 0;

    const balance = totalDue - totalPaid;

    // Group payments by fee schedule and calculate status
    const paymentsByFeeSchedule = new Map();
    student.payments.forEach((payment: any) => {
      const key = payment.feeScheduleId;
      if (!paymentsByFeeSchedule.has(key)) {
        paymentsByFeeSchedule.set(key, []);
      }
      paymentsByFeeSchedule.get(key).push(payment);
    });

    // Create payment status for each fee schedule with installment logic
    const feeScheduleStatuses = [];

    // Traiter chaque frais principal et ses tranches
    for (const mainFee of mainFees) {
      // Calculer paiements agrégés (frais principal + tranches)
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

      // Toujours exposer le frais principal (option paiement global)
      let mainStatus = "PENDING";
      if (totalPaidForMainFee >= mainFee.amountCents) {
        mainStatus = "PAID";
      } else if (totalPaidForMainFee > 0) {
        mainStatus = "PARTIALLY_PAID";
      } else if (mainFee.dueDate && new Date(mainFee.dueDate) < new Date()) {
        mainStatus = "OVERDUE";
      }
      feeScheduleStatuses.push({
        ...mainFee,
        status: mainStatus,
        totalPaid: totalPaidForMainFee,
        remainingAmount: mainFee.amountCents - totalPaidForMainFee,
        payments: allRelatedPayments,
      });

      // Exposer aussi chaque tranche (option paiement échelonné)
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
          new Date(installment.dueDate) < new Date()
        ) {
          status = "OVERDUE";
        }

        feeScheduleStatuses.push({
          ...installment,
          status,
          totalPaid: totalPaidForInstallment,
          remainingAmount: installment.amountCents - totalPaidForInstallment,
          payments: installmentPayments,
        });
      }
    }

    // Group by status
    const feeSchedulesByStatus = {
      paid: feeScheduleStatuses.filter((fs: any) => fs.status === "PAID"),
      partiallyPaid: feeScheduleStatuses.filter(
        (fs: any) => fs.status === "PARTIALLY_PAID"
      ),
      pending: feeScheduleStatuses.filter((fs: any) => fs.status === "PENDING"),
      overdue: feeScheduleStatuses.filter((fs: any) => fs.status === "OVERDUE"),
    };

    // Recent payments (already sorted by paidAt desc)
    const recentPayments = student.payments.slice(0, 10);

    // Upcoming payments (unpaid fee schedules with due dates)
    const upcomingPayments = feeScheduleStatuses
      .filter((fs: any) => fs.status !== "PAID" && fs.dueDate)
      .sort(
        (a: any, b: any) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      .slice(0, 5);

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.user?.name,
        matricule: student.matricule,
        currentEnrollment: currentEnrollment || null,
      },
      summary: {
        totalDue,
        totalPaid,
        balance,
        // nombre de structures principales applicables
        feeScheduleCount: mainFees.length,
        paidFeeScheduleCount: feeSchedulesByStatus.paid.length,
        overdueCount: feeSchedulesByStatus.overdue.length,
      },
      feeSchedulesByStatus,
      recentPayments,
      upcomingPayments,
    });
  } catch (error) {
    console.error("Error fetching student payments:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
