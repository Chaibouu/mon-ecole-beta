import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";
import { AcademicYearUpdateSchema } from "@/schemas/academic-year";

// GET /api/academic-years/[id] - détail d'une année académique
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = req.headers.get("authorization");
  let token = auth?.split(" ")[1] || "";
  let schoolId = req.headers.get("x-school-id") || "";
  if (!token || !schoolId) {
    const cookieStore = await cookies();
    token = token || cookieStore.get("accessToken")?.value || "";
    schoolId = schoolId || cookieStore.get("schoolId")?.value || "";
  }
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
  const item = await db.academicYear.findFirst({
    where: { id, schoolId },
  });
  if (!item) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json({ academicYear: item });
}

// PATCH /api/academic-years/[id] - modifier (ADMIN)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = req.headers.get("authorization");
    let token = auth?.split(" ")[1] || "";
    let schoolId = req.headers.get("x-school-id") || "";
    if (!token || !schoolId) {
      const cookieStore = await cookies();
      token = token || cookieStore.get("accessToken")?.value || "";
      schoolId = schoolId || cookieStore.get("schoolId")?.value || "";
    }
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const parsed = AcademicYearUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const error = parsed.error.issues.map((i: any) => i.message).join(", ");
      return NextResponse.json({ error }, { status: 400 });
    }
    const updateData = {
      ...parsed.data,
      ...(parsed.data.startDate && {
        startDate: new Date(parsed.data.startDate),
      }),
      ...(parsed.data.endDate && { endDate: new Date(parsed.data.endDate) }),
    };

    const item = await db.academicYear.update({
      where: { id, schoolId },
      data: updateData,
    });
    return NextResponse.json({ academicYear: item });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/academic-years/[id] - supprimer (ADMIN)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = req.headers.get("authorization");
    let token = auth?.split(" ")[1] || "";
    let schoolId = req.headers.get("x-school-id") || "";
    if (!token || !schoolId) {
      const cookieStore = await cookies();
      token = token || cookieStore.get("accessToken")?.value || "";
      schoolId = schoolId || cookieStore.get("schoolId")?.value || "";
    }
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const ok = await requireSchoolRole(userId, schoolId, ["ADMIN"]);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await db.academicYear.delete({
      where: { id, schoolId },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
