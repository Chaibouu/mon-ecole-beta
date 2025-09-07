import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { FeeScheduleUpdateSchema } from "@/schemas/school-fees";

// PUT /api/fee-schedules/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const feeScheduleId = resolvedParams.id;

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
    const parsed = FeeScheduleUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    // Check if fee schedule exists and belongs to school
    const existingFeeSchedule = await db.feeSchedule.findFirst({
      where: {
        id: feeScheduleId,
        schoolId,
      },
    });

    if (!existingFeeSchedule) {
      return NextResponse.json(
        { error: "Structure de frais non trouvée" },
        { status: 404 }
      );
    }

    const { installments, ...feeData } = parsed.data;

    const updateData = {
      ...feeData,
      ...(feeData.dueDate && { dueDate: new Date(feeData.dueDate) }),
    };

    // Use a transaction to handle installments
    const result = await db.$transaction(async tx => {
      // Update main fee schedule
      const updatedFeeSchedule = await tx.feeSchedule.update({
        where: { id: feeScheduleId },
        data: updateData,
      });

      // Handle installments if provided
      if (installments !== undefined) {
        // Delete existing installments
        await tx.feeSchedule.deleteMany({
          where: {
            parentFeeId: feeScheduleId,
            isInstallment: true,
          },
        });

        // Create new installments
        if (installments.length > 0) {
          for (let i = 0; i < installments.length; i++) {
            const installment = installments[i];
            await tx.feeSchedule.create({
              data: {
                schoolId,
                gradeLevelId: updatedFeeSchedule.gradeLevelId,
                classroomId: updatedFeeSchedule.classroomId,
                termId: updatedFeeSchedule.termId,
                itemName: installment.name,
                amountCents: installment.amountCents,
                dueDate: installment.dueDate
                  ? new Date(installment.dueDate)
                  : null,
                isInstallment: true,
                parentFeeId: feeScheduleId,
                installmentOrder: i + 1,
              },
            });
          }
        }
      }

      // Return updated fee schedule with installments
      return await tx.feeSchedule.findUnique({
        where: { id: feeScheduleId },
        include: {
          gradeLevel: true,
          classroom: {
            include: {
              gradeLevel: true,
            },
          },
          term: true,
          installments: {
            orderBy: {
              installmentOrder: "asc",
            },
          },
        },
      });
    });

    const feeSchedule = result;

    return NextResponse.json({ feeSchedule });
  } catch (error) {
    console.error("Error updating fee schedule:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/fee-schedules/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const feeScheduleId = resolvedParams.id;

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

    // Check if fee schedule exists and belongs to school
    const existingFeeSchedule = await db.feeSchedule.findFirst({
      where: {
        id: feeScheduleId,
        schoolId,
      },
    });

    if (!existingFeeSchedule) {
      return NextResponse.json(
        { error: "Structure de frais non trouvée" },
        { status: 404 }
      );
    }

    // Check if there are any payments linked to this fee schedule
    const linkedPayments = await db.payment.findFirst({
      where: { feeScheduleId },
    });

    if (linkedPayments) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer: des paiements sont liés à cette structure",
        },
        { status: 400 }
      );
    }

    await db.feeSchedule.delete({
      where: { id: feeScheduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fee schedule:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
