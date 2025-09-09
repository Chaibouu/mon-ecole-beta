import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";

// GET /api/parent/children/[studentId]/payments - Récupérer les paiements d'un enfant
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const academicYearId = req.headers.get("x-academic-year-id") || "";

    if (!schoolId) {
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est bien le parent de cet enfant
    const parentProfile = await db.parentProfile.findFirst({
      where: { userId, schoolId },
    });

    if (!parentProfile) {
      return NextResponse.json(
        { error: "Profil parent non trouvé" },
        { status: 404 }
      );
    }

    const isParentOfChild = await db.parentStudent.findFirst({
      where: {
        parentProfileId: parentProfile.id,
        studentProfileId: studentId,
      },
    });

    if (!isParentOfChild) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à voir ces informations" },
        { status: 403 }
      );
    }

    // Récupérer les informations de paiement de l'enfant (réutiliser la logique existante)
    const student = await db.studentProfile.findFirst({
      where: { id: studentId, schoolId },
      include: {
        user: true,
        enrollments: {
          where: academicYearId
            ? { academicYearId }
            : {
                academicYear: { isActive: true },
              },
          include: {
            classroom: {
              include: {
                gradeLevel: true,
              },
            },
            academicYear: true,
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

    const currentEnrollment = student.enrollments[0];
    if (!currentEnrollment) {
      return NextResponse.json({
        student,
        paymentSummary: {
          totalDue: 0,
          totalPaid: 0,
          remainingBalance: 0,
          feeSchedules: [],
        },
      });
    }

    // Récupérer TOUS les frais scolaires applicables (principaux ET tranches)
    const allApplicableFees = await db.feeSchedule.findMany({
      where: {
        schoolId,
        term: {
          academicYearId: currentEnrollment.academicYearId,
        },
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
    const mainFees = allApplicableFees.filter(
      f => f.parentFeeId === null && !f.itemName.includes(" - ")
    );

    // Récupérer les paiements existants pour cet étudiant
    const existingPayments = await db.payment.findMany({
      where: {
        studentId: studentId,
        feeSchedule: {
          term: {
            academicYearId: currentEnrollment.academicYearId,
          },
        },
      },
      include: {
        feeSchedule: true,
      },
    });

    // Debug logs
    console.log(`[Parent Payment Debug] Student: ${studentId}`);
    console.log(
      `[Parent Payment Debug] All applicable fees:`,
      allApplicableFees.length
    );
    console.log(`[Parent Payment Debug] Main fees:`, mainFees.length);
    console.log(
      `[Parent Payment Debug] Existing payments:`,
      existingPayments.length
    );
    console.log(
      `[Parent Payment Debug] Payment details:`,
      existingPayments.map(p => ({
        id: p.id,
        feeScheduleId: p.feeScheduleId,
        amountCents: p.amountCents,
        feeItemName: p.feeSchedule?.itemName,
      }))
    );

    // Calculer le résumé des paiements basé sur les frais principaux uniquement
    let totalDue = 0;
    let totalPaid = 0;

    const feeSchedulesWithStatus = mainFees.map(fee => {
      // Trouver tous les paiements liés à ce frais principal OU ses tranches
      const feePayments = existingPayments.filter(
        p =>
          p.feeScheduleId === fee.id ||
          fee.installments.some((inst: any) => inst.id === p.feeScheduleId)
      );

      const feeTotalPaid = feePayments.reduce(
        (sum, p) => sum + p.amountCents,
        0
      );

      const feeStatus =
        feeTotalPaid >= fee.amountCents
          ? "paid"
          : feeTotalPaid > 0
            ? "partial"
            : "unpaid";

      // Compter chaque frais principal une seule fois
      totalDue += fee.amountCents;
      totalPaid += feeTotalPaid;

      return {
        ...fee,
        payments: feePayments,
        totalPaid: feeTotalPaid,
        status: feeStatus,
        remainingAmount: Math.max(0, fee.amountCents - feeTotalPaid),
        installments: fee.installments || [],
      };
    });

    return NextResponse.json({
      student,
      paymentSummary: {
        totalDue,
        totalPaid,
        remainingBalance: totalDue - totalPaid,
        feeSchedules: feeSchedulesWithStatus,
      },
    });
  } catch (error) {
    console.error("Error fetching student payments for parent:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
