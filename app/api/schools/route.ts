import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { SchoolCreateSchema } from "@/schemas/school";

// GET /api/schools - liste des écoles (SUPER_ADMIN uniquement)
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const userId = await getUserIdFromToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const schools = await db.school.findMany({
    where: { isDeleted: false } as any,
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ schools });
}

// POST /api/schools - création d'une école (SUPER_ADMIN)
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Supporte JSON et FormData selon Next.js 15
    let payload: any;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      payload = Object.fromEntries(form.entries());
    } else {
      payload = await req.json().catch(() => ({}));
    }
    const parsed = SchoolCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues.map(i => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }

    const { code, name, address, phone, email } = parsed.data;
    const school = await db.school.create({
      data: { code, name, address, phone, email },
    });
    return NextResponse.json({ school }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

