import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";

// GET /api/parent/children/[studentId]/payments - Version alternative avec logique plus flexible
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

    // Récupérer les informations de paiement de l'enfant
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

    console.log(`[Alternative Debug] School ID: ${schoolId}`);
    console.log(
      `[Alternative Debug] Academic Year ID: ${currentEnrollment.academicYearId}`
    );
    console.log(
      `[Alternative Debug] Grade Level ID: ${currentEnrollment.classroom.gradeLevelId}`
    );
    console.log(
      `[Alternative Debug] Classroom ID: ${currentEnrollment.classroomId}`
    );

    // APPROCHE 1: Récupérer tous les frais de l'école pour cette année académique
    const allFeesForYear = await db.feeSchedule.findMany({
      where: {
        schoolId,
        term: {
          academicYearId: currentEnrollment.academicYearId,
        },
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

    console.log(
      `[Alternative Debug] All fees for academic year: ${allFeesForYear.length}`
    );

    // APPROCHE 2: Filtrer les frais applicables avec une logique plus flexible
    const applicableFees = allFeesForYear.filter(fee => {
      // Frais pour tous les niveaux (pas de gradeLevelId spécifique)
      if (!fee.gradeLevelId && !fee.classroomId) {
        console.log(
          `[Alternative Debug] Fee "${fee.itemName}" applies to all students`
        );
        return true;
      }

      // Frais pour le niveau de classe de l'étudiant
      if (
        fee.gradeLevelId === currentEnrollment.classroom.gradeLevelId &&
        !fee.classroomId
      ) {
        console.log(
          `[Alternative Debug] Fee "${fee.itemName}" applies to grade level`
        );
        return true;
      }

      // Frais pour la classe spécifique de l'étudiant
      if (fee.classroomId === currentEnrollment.classroomId) {
        console.log(
          `[Alternative Debug] Fee "${fee.itemName}" applies to specific classroom`
        );
        return true;
      }

      console.log(
        `[Alternative Debug] Fee "${fee.itemName}" does not apply (Grade: ${fee.gradeLevelId}, Classroom: ${fee.classroomId})`
      );
      return false;
    });

    console.log(
      `[Alternative Debug] Applicable fees: ${applicableFees.length}`
    );

    // APPROCHE 3: Récupérer tous les paiements pour cet étudiant
    const allPayments = await db.payment.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        feeSchedule: {
          include: {
            term: true,
          },
        },
      },
    });

    console.log(
      `[Alternative Debug] All payments for student: ${allPayments.length}`
    );

    // APPROCHE 4: Filtrer les paiements pour cette année académique
    const paymentsForYear = allPayments.filter(
      payment =>
        payment.feeSchedule?.term?.academicYearId ===
        currentEnrollment.academicYearId
    );

    console.log(
      `[Alternative Debug] Payments for academic year: ${paymentsForYear.length}`
    );

    // Calculer le résumé des paiements
    let totalDue = 0;
    let totalPaid = 0;

    const feeSchedulesWithStatus = applicableFees.map(fee => {
      // Trouver tous les paiements liés à ce frais principal OU ses tranches
      const feePayments = paymentsForYear.filter(
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

    console.log(
      `[Alternative Debug] Final calculation - Total Due: ${totalDue}, Total Paid: ${totalPaid}`
    );

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





