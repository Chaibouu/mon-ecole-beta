import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import bcrypt from "bcryptjs";
import { UserCreateSchema } from "@/schemas/user";

// POST /api/users - création d'un utilisateur par SUPER_ADMIN
// GET /api/users - lister les utilisateurs (pour sélection dans les formulaires)
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (me?.role !== "SUPER_ADMIN" && me?.role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (me?.role !== "SUPER_ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const contentType = req.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await req.json()
      : Object.fromEntries((await req.formData()).entries());
    const parsed = UserCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const { name, email, password, role } = parsed.data as any;

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        isActive: true,
        emailVerified: new Date(),
      },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

