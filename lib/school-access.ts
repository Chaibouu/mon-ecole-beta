import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/tokens";
import { requireSchoolRole } from "@/lib/acl";

/**
 * Utilitaire réutilisable pour vérifier l'accès aux ressources d'une école
 * @param req - NextRequest
 * @param schoolId - ID de l'école
 * @param allowedRoles - Rôles autorisés pour l'école (ex: ["ADMIN", "TEACHER"])
 * @returns true si autorisé, sinon NextResponse d'erreur
 */
export async function ensureSchoolAccess(
  req: NextRequest,
  schoolId: string,
  allowedRoles: string[] = ["ADMIN"]
) {
  const auth = req.headers.get("authorization");
  const token = auth?.split(" ")[1] || "";
  const callerId = await getUserIdFromToken(token);

  if (!callerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const caller = await db.user.findUnique({
    where: { id: callerId },
    select: { role: true },
  });

  // SUPER_ADMIN peut tout faire
  if (caller?.role === "SUPER_ADMIN") {
    return true as const;
  }

  // Vérifier le rôle dans l'école
  const ok = await requireSchoolRole(callerId, schoolId, allowedRoles);
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return true as const;
}
