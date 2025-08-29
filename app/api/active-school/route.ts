import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/tokens";
import { db } from "@/lib/db";

// POST /api/active-school
// Body: { schoolId }
// Effet: définit l'école active via cookie httpOnly (web) et vérifie que l'utilisateur est bien lié à l'école
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")[1] || "";
    const userId = await getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { schoolId } = await req.json();
    if (!schoolId)
      return NextResponse.json({ error: "schoolId requis" }, { status: 400 });

    // SUPER_ADMIN: libre; sinon vérifier appartenance
    const me = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (me?.role !== "SUPER_ADMIN") {
      const link = await db.userSchool.findFirst({
        where: { userId, schoolId },
      });
      if (!link)
        return NextResponse.json(
          { error: "Accès interdit à cette école" },
          { status: 403 }
        );
    }

    // Ne pas setter de cookie ici pour compat mobile : renvoyer seulement l'info
    return NextResponse.json({ ok: true, schoolId });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

