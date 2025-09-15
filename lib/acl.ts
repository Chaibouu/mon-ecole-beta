import { db } from "@/lib/db";

// Vérifie qu'un utilisateur appartient à une école avec un rôle autorisé
export async function requireSchoolRole(
  userId: string,
  schoolId: string,
  allowedRoles: string[]
): Promise<boolean> {
  if (!userId || !schoolId) return false;
  // Super admin a accès global
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role === "SUPER_ADMIN") return true;
  const link = await db.userSchool.findFirst({
    where: { userId, schoolId },
    select: { role: true },
  });
  if (!link) return false;
  return allowedRoles.includes(link.role as any);
}

// Vérifie simplement l'appartenance à une école
export async function requireSchoolMember(
  userId: string,
  schoolId: string
): Promise<boolean> {
  if (!userId || !schoolId) return false;
  const link = await db.userSchool.findFirst({ where: { userId, schoolId } });
  return !!link;
}
