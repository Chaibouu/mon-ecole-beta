import { NextRequest, NextResponse } from "next/server";
import { refreshUserToken, getUserInfo } from "@/lib/user";
import { db } from "@/lib/db";

// GET /api/auth/profile - Profil consolidé pour mobile (refresh + profil)
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const bearer = auth?.split(" ")[1];
    const refreshFromCookie = req.cookies.get("refreshToken")?.value;
    const url = req.nextUrl;

    let accessToken = bearer;

    if (!accessToken && refreshFromCookie) {
      const refreshed = await refreshUserToken(refreshFromCookie);
      if ((refreshed as any)?.accessToken) {
        accessToken = (refreshed as any).accessToken as string;
      }
    }

    if (!accessToken) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const profile = await getUserInfo(accessToken);
    if ((profile as any)?.error) {
      return NextResponse.json(
        { error: (profile as any).error },
        { status: 401 }
      );
    }

    const userId = (profile as any).user?.id as string | undefined;
    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur introuvable" },
        { status: 400 }
      );
    }

    const userSchools = await db.userSchool.findMany({
      where: { userId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            logoUrl: true,
            slogan: true,
            brandPrimaryColor: true,
            brandSecondaryColor: true,
            websiteUrl: true,
          },
        },
      },
    });

    const schools = userSchools.map(us => ({
      schoolId: us.schoolId,
      code: us.school?.code || null,
      name: us.school?.name || null,
      role: us.role,
      logoUrl: us.school?.logoUrl || null,
      slogan: us.school?.slogan || null,
      brandPrimaryColor: us.school?.brandPrimaryColor || null,
      brandSecondaryColor: us.school?.brandSecondaryColor || null,
      websiteUrl: us.school?.websiteUrl || null,
    }));

    return NextResponse.json({
      accessToken,
      user: (profile as any).user,
      schools,
    });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

