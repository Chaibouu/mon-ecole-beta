import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { AdminCreateSchema } from "@/schemas/membership";
import { ensureSchoolAccess } from "@/lib/school-access";

// POST /api/schools/[id]/admins - créer/relier un admin d'école
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: schoolId } = await params;
    const access = await ensureSchoolAccess(req, schoolId, ["ADMIN"]);
    if (access instanceof Response) return access;

    const contentType = req.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await req.json()
      : Object.fromEntries((await req.formData()).entries());

    const parsed = AdminCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    let userId: string;
    if ("existingUserId" in parsed.data) {
      userId = parsed.data.existingUserId as string;
      await db.user.update({
        where: { id: userId },
        data: { role: "ADMIN" as any },
      });
    } else {
      const { name, email, password } = (parsed.data as any).user;
      const hashed = await bcrypt.hash(password, 10);
      const user = await db.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: "ADMIN",
          isActive: true,
          emailVerified: new Date(),
        },
      });
      userId = user.id;
    }

    await db.userSchool.upsert({
      where: { userId_schoolId: { userId, schoolId } },
      update: { role: "ADMIN" as any },
      create: { userId, schoolId, role: "ADMIN" as any },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
