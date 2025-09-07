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
      include: { user: true },
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
    const parsed = ParentCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    let userId: string;
    if ("existingUserId" in parsed.data) {
      userId = (parsed.data as any).existingUserId;
      await db.user.update({
        where: { id: userId },
        data: { role: "PARENT" as any },
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
          role: "PARENT" as any,
          isActive: true,
          emailVerified: new Date(),
        },
      });
      userId = user.id;
    }

    await db.parentProfile.upsert({
      where: { userId_schoolId: { userId, schoolId } },
      update: {},
      create: { userId, schoolId },
    });
    await db.userSchool.upsert({
      where: { userId_schoolId: { userId, schoolId } },
      update: { role: "PARENT" as any },
      create: { userId, schoolId, role: "PARENT" as any },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
