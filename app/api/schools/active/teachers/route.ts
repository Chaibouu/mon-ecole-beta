import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { TeacherCreateSchema } from "@/schemas/membership";
import { ensureSchoolAccess } from "@/lib/school-access";

// GET /api/schools/active/teachers - lister les professeurs de l'école active (ADMIN/TEACHER)
export async function GET(req: NextRequest) {
  try {
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

    const teachers = await db.teacherProfile.findMany({
      where: { schoolId },
      include: {
        user: true,
        subjects: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ teachers });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/schools/active/teachers - créer/relier un professeur (ADMIN)
export async function POST(req: NextRequest) {
  try {
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
    const parsed = TeacherCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    let userId: string;
    if ("existingUserId" in parsed.data) {
      userId = (parsed.data as any).existingUserId;
      await db.user.update({
        where: { id: userId },
        data: { role: "TEACHER" as any },
      });
    } else {
      const { name, email, phone, password } = (parsed.data as any).user;

      // Vérifier si l'email existe déjà (seulement si fourni)
      if (email && email !== "") {
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
          return NextResponse.json(
            {
              error: `Un utilisateur avec l'email "${email}" existe déjà`,
            },
            { status: 400 }
          );
        }
      }

      const hashed = password ? await bcrypt.hash(password, 10) : undefined;

      const user = await db.user.create({
        data: {
          name,
          email: email && email !== "" ? email : undefined,
          phone,
          password: hashed,
          role: "TEACHER" as any,
          isActive: true,
          emailVerified: email && email !== "" ? new Date() : undefined,
        },
      });
      userId = user.id;
    }

    // Extraire les données du profil professeur
    const profileData: any = {};
    if ("bio" in parsed.data) profileData.bio = parsed.data.bio;
    if ("employeeNumber" in parsed.data)
      profileData.employeeNumber = parsed.data.employeeNumber;
    if ("gender" in parsed.data) profileData.gender = parsed.data.gender;
    if ("dateOfBirth" in parsed.data)
      profileData.dateOfBirth = parsed.data.dateOfBirth
        ? new Date(parsed.data.dateOfBirth)
        : undefined;
    if ("placeOfBirth" in parsed.data)
      profileData.placeOfBirth = parsed.data.placeOfBirth;
    if ("nationality" in parsed.data)
      profileData.nationality = parsed.data.nationality;
    if ("bloodType" in parsed.data)
      profileData.bloodType = parsed.data.bloodType;
    if ("address" in parsed.data) profileData.address = parsed.data.address;
    if ("emergencyContact" in parsed.data)
      profileData.emergencyContact = parsed.data.emergencyContact;
    if ("emergencyPhone" in parsed.data)
      profileData.emergencyPhone = parsed.data.emergencyPhone;
    if ("hireDate" in parsed.data)
      profileData.hireDate = parsed.data.hireDate
        ? new Date(parsed.data.hireDate)
        : undefined;
    if ("qualification" in parsed.data)
      profileData.qualification = parsed.data.qualification;
    if ("specialization" in parsed.data)
      profileData.specialization = parsed.data.specialization;
    if ("experienceYears" in parsed.data)
      profileData.experienceYears = parsed.data.experienceYears
        ? parseInt(parsed.data.experienceYears)
        : undefined;
    if ("salary" in parsed.data)
      profileData.salary = parsed.data.salary
        ? parseInt(parsed.data.salary) * 100
        : undefined; // Convertir en centimes
    if ("status" in parsed.data) profileData.status = parsed.data.status;

    const profile = await db.teacherProfile.upsert({
      where: { userId_schoolId: { userId, schoolId } },
      update: profileData,
      create: { userId, schoolId, ...profileData },
    });
    await db.userSchool.upsert({
      where: { userId_schoolId: { userId, schoolId } },
      update: { role: "TEACHER" as any },
      create: { userId, schoolId, role: "TEACHER" as any },
    });

    // Optionnel: subjectIds pour matières enseignées (sélection générale)
    if (Array.isArray(payload?.subjectIds) && payload.subjectIds.length > 0) {
      await db.teacherProfile.update({
        where: { id: profile.id },
        data: {
          subjects: {
            set: payload.subjectIds.map((sid: string) => ({ id: sid })),
          },
        },
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    // console.log(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
