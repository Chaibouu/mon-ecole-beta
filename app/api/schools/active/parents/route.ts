import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { ParentCreateSchema } from "@/schemas/membership";
import { ensureSchoolAccess } from "@/lib/school-access";

// GET /api/schools/active/parents - lister les parents (ADMIN, TEACHER)
export async function GET(req: NextRequest) {
  try {
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId)
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    const access = await ensureSchoolAccess(req, schoolId, [
      "ADMIN",
      "TEACHER",
    ]);
    if (access instanceof Response) return access;

    const parents = await db.parentProfile.findMany({
      where: { schoolId },
      include: {
        user: true,
        children: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { id: "desc" },
    });
    return NextResponse.json({ parents });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/schools/active/parents - créer/relier un parent (ADMIN)
export async function POST(req: NextRequest) {
  try {
    const schoolId = req.headers.get("x-school-id") || "";
    if (!schoolId)
      return NextResponse.json(
        { error: "École active non définie" },
        { status: 400 }
      );
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const payload = await req.json();
    console.log("[PARENT_API] Payload reçu:", payload);

    const parsed = ParentCreateSchema.safeParse(payload);
    if (!parsed.success) {
      console.log("[PARENT_API] Validation échouée:", parsed.error.issues);
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    console.log("[PARENT_API] Validation réussie:", parsed.data);

    let userId: string;
    if ("existingUserId" in parsed.data) {
      userId = (parsed.data as any).existingUserId;
      await db.user.update({
        where: { id: userId },
        data: { role: "PARENT" as any },
      });
    } else {
      const { name, email, phone, password } = (parsed.data as any).user;

      // Vérifier si l'email existe déjà (seulement si email est fourni)
      if (email) {
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

      // Vérifier si le téléphone existe déjà (seulement si téléphone est fourni)
      if (phone) {
        const existingPhoneUser = await db.user.findUnique({
          where: { phone },
        });
        if (existingPhoneUser) {
          return NextResponse.json(
            {
              error: `Un utilisateur avec le numéro "${phone}" existe déjà`,
            },
            { status: 400 }
          );
        }
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await db.user.create({
        data: {
          name,
          email: email || null, // Permettre null si pas d'email
          phone: phone || null, // Permettre null si pas de téléphone
          password: hashed,
          role: "PARENT" as any,
          isActive: true,
          emailVerified: email ? new Date() : null, // Seulement si email fourni
        },
      });
      userId = user.id;
    }

    const data = parsed.data as any;
    const parentProfile = await db.parentProfile.upsert({
      where: { userId_schoolId: { userId, schoolId } },
      update: {},
      create: {
        userId,
        schoolId,
        phone: data.phone || null,
        address: data.address || null,
        profession: data.profession || null,
        workplace: data.workplace || null,
        preferredLanguage: data.preferredLanguage || null,
      },
    });

    await db.userSchool.upsert({
      where: { userId_schoolId: { userId, schoolId } },
      update: { role: "PARENT" as any },
      create: { userId, schoolId, role: "PARENT" as any },
    });

    // Si des enfants sont spécifiés, créer les liaisons
    if (data.children && Array.isArray(data.children)) {
      const children = data.children;
      for (const child of children) {
        // Vérifier que l'étudiant existe dans cette école
        const student = await db.studentProfile.findFirst({
          where: { id: child.studentId, schoolId },
        });

        if (student) {
          // Créer la liaison parent-enfant
          await db.parentStudent.create({
            data: {
              parentProfileId: parentProfile.id,
              studentProfileId: child.studentId,
              relationship: child.relationship || "parent",
            },
          });
        }
      }
    }

    return NextResponse.json(
      { success: true, parent: parentProfile },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
