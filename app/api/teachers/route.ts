import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

// GET /api/teachers - liste des professeurs avec leurs matières
export async function GET(req: Request) {
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

  const list = await db.teacherProfile.findMany({
    where: { schoolId },
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
    orderBy: { user: { name: "asc" } },
  });
  return NextResponse.json({ teachers: list });
}
