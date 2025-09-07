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
      const { name, email, password } = (parsed.data as any).user;

      // Vérifier si l'email existe déjà
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json(
          {
            error: `Un utilisateur avec l'email "${email}" existe déjà`,
          },
          { status: 400 }
        );
      }

      const hashed = await bcrypt.hash(password, 10);

      const user = await db.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: "TEACHER" as any,
          isActive: true,
          emailVerified: new Date(),
        },
      });
      userId = user.id;
    }

    const profile = await db.teacherProfile.upsert({
      where: { userId_schoolId: { userId, schoolId } },
      update: {},
      create: { userId, schoolId },
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
