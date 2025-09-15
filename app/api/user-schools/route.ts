import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// POST /api/user-schools - lier un utilisateur à une école avec un rôle (ADMIN/TEACHER/STUDENT/PARENT)
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Seul SUPER_ADMIN ou ADMIN de l'école peut lier un user
    const me = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (me?.role !== "SUPER_ADMIN") {
      const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
      if (!ok)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { targetUserId, targetSchoolId, role } = await req.json();
    if (!targetUserId || !targetSchoolId || !role) {
      return NextResponse.json(
        { error: "targetUserId, targetSchoolId, role requis" },
        { status: 400 }
      );
    }

    const link = await db.userSchool.upsert({
      where: {
        userId_schoolId: { userId: targetUserId, schoolId: targetSchoolId },
      },
      update: { role },
      create: { userId: targetUserId, schoolId: targetSchoolId, role },
    });
    return NextResponse.json({ userSchool: link }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

