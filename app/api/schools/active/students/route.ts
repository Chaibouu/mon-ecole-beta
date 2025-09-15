import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { StudentCreateSchema } from "@/schemas/membership";
import { ensureSchoolAccess } from "@/lib/school-access";

// GET /api/schools/active/students - lister les élèves (ADMIN, TEACHER)
export async function GET(req: NextRequest) {
  try {
    const schoolId = req.headers.get("x-school-id") || "";
    const academicYearId = req.headers.get("x-academic-year-id") || "";

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

    // Vérifier si on doit inclure les informations de classe
    const url = new URL(req.url);
    const includeClassrooms =
      url.searchParams.get("includeClassrooms") === "true";

    const students = await db.studentProfile.findMany({
      where: { schoolId },
      include: {
        user: true,
        parentLinks: {
          include: {
            parent: {
              include: {
                user: true,
              },
            },
          },
        },
        ...(includeClassrooms && academicYearId
          ? {
              enrollments: {
                where: { academicYearId },
                include: {
                  classroom: {
                    include: {
                      gradeLevel: true,
                    },
                  },
                },
              },
            }
          : {}),
      },
      orderBy: { id: "desc" },
    });

    // Formater les données si on inclut les classes
    const formattedStudents = includeClassrooms
      ? students.map(student => ({
          ...student,
          currentClassroom:
            (student as any).enrollments?.[0]?.classroom || null,
        }))
      : students;

    return NextResponse.json({ students: formattedStudents });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/schools/active/students - créer/relier un élève (ADMIN)
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
    const parsed = StudentCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    let userId: string;
    if ("existingUserId" in parsed.data) {
      userId = (parsed.data as any).existingUserId;
      await db.user.update({
        where: { id: userId },
        data: { role: "STUDENT" as any },
      });
    } else {
      const { name, email, phone, password } = (parsed.data as any).user;

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
          phone,
          password: hashed,
          role: "STUDENT" as any,
          isActive: true,
          emailVerified: new Date(),
        },
      });
      userId = user.id;
    }

    const { matricule, gender, dateOfBirth } =
      (parsed.data as any).profile || {};

    await db.studentProfile.upsert({
      where: { userId_schoolId: { userId, schoolId } },
      update: {
        ...(matricule && { matricule }),
        ...(gender && { gender }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      },
      create: {
        userId,
        schoolId,
        ...(matricule && { matricule }),
        ...(gender && { gender }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      },
    });
    await db.userSchool.upsert({
      where: { userId_schoolId: { userId, schoolId } },
      update: { role: "STUDENT" as any },
      create: { userId, schoolId, role: "STUDENT" as any },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
