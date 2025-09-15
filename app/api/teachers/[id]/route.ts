import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// GET /api/teachers/[id] - détail d'un professeur
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const schoolId = req.headers.get("x-school-id") || "";
  const userId = await getUserIdFromToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ok = await requireSchoolRole(userId, schoolId, [
    "ADMIN",
    "TEACHER",
    "PARENT",
    "STUDENT",
    "USER",
  ]);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const item = await db.teacherProfile.findFirst({
    where: { id, schoolId },
    include: {
      user: true,
      subjects: true,
      assignments: {
        include: {
          subject: true,
          classroom: true,
          academicYear: true,
        },
      },
    },
  });
  if (!item) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json({ teacher: item });
}

// PATCH /api/teachers/[id] - modifier (ADMIN)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const schoolId = req.headers.get("x-school-id") || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { bio, subjectIds } = body as { bio?: string; subjectIds?: string[] };

    const item = await db.teacherProfile.update({
      where: { id, schoolId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(Array.isArray(subjectIds)
          ? { subjects: { set: subjectIds.map(sid => ({ id: sid })) } }
          : {}),
      },
      include: {
        user: true,
        subjects: true,
      },
    });
    return NextResponse.json({ teacher: item });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
