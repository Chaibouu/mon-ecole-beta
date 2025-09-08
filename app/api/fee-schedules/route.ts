import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { FeeScheduleCreateSchema } from "@/schemas/school-fees";

// GET /api/fee-schedules
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

    const feeSchedules = await db.feeSchedule.findMany({
      where: {
        schoolId,
        ...(gradeLevelId && { gradeLevelId }),
        ...(classroomId && { classroomId }),
      },
      include: {
        gradeLevel: true,
        classroom: {
          include: {
            gradeLevel: true,
          },
        },
        installments: {
          orderBy: {
            installmentOrder: "asc",
          },
        },
        parentFee: true,
      },
      orderBy: {
        itemName: "asc",
      },
    });

    return NextResponse.json({ feeSchedules });
  } catch (error) {
    console.error("Error fetching fee schedules:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/fee-schedules
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
    const parsed = FeeScheduleCreateSchema.safeParse(body);

    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    const { installments, ...feeData } = parsed.data;

    // Create main fee schedule
    const feeSchedule = await db.feeSchedule.create({
      data: {
        ...feeData,
        schoolId,
        dueDate: feeData.dueDate ? new Date(feeData.dueDate) : null,
      },
      include: {
        gradeLevel: true,
        classroom: {
          include: {
            gradeLevel: true,
          },
        },
      },
    });

    // Create installments if provided
    if (installments && installments.length > 0) {
      await Promise.all(
        installments.map((installment, index) =>
          db.feeSchedule.create({
            data: {
              schoolId,
              gradeLevelId: feeData.gradeLevelId,
              classroomId: feeData.classroomId,
              itemName: `${feeData.itemName} - ${installment.name}`,
              amountCents: installment.amountCents,
              dueDate: new Date(installment.dueDate),
              // Link to parent and mark as installment
              parentFeeId: feeSchedule.id,
              isInstallment: true,
              installmentOrder: index + 1,
            },
          })
        )
      );
    }

    return NextResponse.json({ feeSchedule }, { status: 201 });
  } catch (error) {
    console.error("Error creating fee schedule:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
