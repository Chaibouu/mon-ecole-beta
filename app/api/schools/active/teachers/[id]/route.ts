import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSchoolAccess } from "@/lib/school-access";
import { TeacherUpdateSchema } from "@/schemas/membership";

// Helper: include user with teacher profile
const includeUser = { user: true } as const;

// GET /api/schools/active/teachers/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId) {
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    }
    const access = await ensureSchoolAccess(req, schoolId, [
      "ADMIN",
      "TEACHER",
    ]);
    if (access instanceof Response) return access;

    const teacher = await db.teacherProfile.findFirst({
      where: { id, schoolId },
      include: includeUser,
    });
    if (!teacher)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ teacher });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/schools/active/teachers/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId) {
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    }
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const payload = await req.json();
    const parsed = TeacherUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    const teacher = await db.teacherProfile.findFirst({
      where: { id, schoolId },
    });
    if (!teacher)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = parsed.data as any;

    // Mettre à jour les champs utilisateur
    const userUpdateData: any = {};
    if (data.firstName !== undefined) userUpdateData.firstName = data.firstName;
    if (data.lastName !== undefined) userUpdateData.lastName = data.lastName;
    if (data.email !== undefined)
      userUpdateData.email =
        data.email && data.email !== "" ? data.email : null;
    if (data.phone !== undefined) userUpdateData.phone = data.phone;

    if (Object.keys(userUpdateData).length > 0) {
      await db.user.update({
        where: { id: teacher.userId },
        data: userUpdateData,
      });
    }

    // Mettre à jour les champs du profil professeur
    const profileUpdateData: any = {};
    if (data.bio !== undefined) profileUpdateData.bio = data.bio;
    if (data.employeeNumber !== undefined)
      profileUpdateData.employeeNumber = data.employeeNumber;
    if (data.gender !== undefined) profileUpdateData.gender = data.gender;
    if (data.dateOfBirth !== undefined)
      profileUpdateData.dateOfBirth = data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : null;
    if (data.placeOfBirth !== undefined)
      profileUpdateData.placeOfBirth = data.placeOfBirth;
    if (data.nationality !== undefined)
      profileUpdateData.nationality = data.nationality;
    if (data.bloodType !== undefined)
      profileUpdateData.bloodType = data.bloodType;
    if (data.address !== undefined) profileUpdateData.address = data.address;
    if (data.emergencyContact !== undefined)
      profileUpdateData.emergencyContact = data.emergencyContact;
    if (data.emergencyPhone !== undefined)
      profileUpdateData.emergencyPhone = data.emergencyPhone;
    if (data.hireDate !== undefined)
      profileUpdateData.hireDate = data.hireDate
        ? new Date(data.hireDate)
        : null;
    if (data.qualification !== undefined)
      profileUpdateData.qualification = data.qualification;
    if (data.specialization !== undefined)
      profileUpdateData.specialization = data.specialization;
    if (data.experienceYears !== undefined)
      profileUpdateData.experienceYears = data.experienceYears
        ? parseInt(data.experienceYears)
        : null;
    if (data.salary !== undefined)
      profileUpdateData.salary = data.salary
        ? parseInt(data.salary) * 100
        : null; // Convertir en centimes
    if (data.status !== undefined) profileUpdateData.status = data.status;

    if (Object.keys(profileUpdateData).length > 0) {
      await db.teacherProfile.update({
        where: { id },
        data: profileUpdateData,
      });
    }

    // Mettre à jour les matières si fournies
    if (data.subjectIds !== undefined) {
      await db.teacherProfile.update({
        where: { id },
        data: {
          subjects: {
            set: data.subjectIds.map((sid: string) => ({ id: sid })),
          },
        },
      });
    }

    const updated = await db.teacherProfile.findFirst({
      where: { id, schoolId },
      include: includeUser,
    });
    return NextResponse.json({ teacher: updated });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/schools/active/teachers/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId) {
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    }
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const teacher = await db.teacherProfile.findFirst({
      where: { id, schoolId },
    });
    if (!teacher)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Retirer le lien userSchool et le profil enseignant pour cette école
    await db.userSchool
      .delete({
        where: { userId_schoolId: { userId: teacher.userId, schoolId } },
      })
      .catch(() => {});

    await db.teacherProfile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
