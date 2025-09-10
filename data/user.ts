import { db } from "@/lib/db";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });

    return user;
  } catch {
    return null;
  }
};

export const getUserByPhone = async (phone: string) => {
  try {
    const user = await db.user.findUnique({ where: { phone } });
    return user;
  } catch {
    return null;
  }
};

// Fonction pour récupérer un utilisateur par email OU phone (pour la migration)
export const getUserByEmailOrPhone = async (identifier: string) => {
  try {
    // Recherche par téléphone d'abord
    const userByPhone = await db.user.findUnique({
      where: { phone: identifier },
    });
    if (userByPhone) return userByPhone;

    // Puis recherche par email
    const userByEmail = await db.user.findUnique({
      where: { email: identifier },
    });
    return userByEmail;
  } catch {
    return null;
  }
};

// export const getUserById = async (id: string) => {
//   try {
//     const user = await db.user.findUnique({ where: { id } });

//     return user;
//   } catch {
//     return null;
//   }
// };

export async function getUserById(userId: string) {
  try {
    // Récupérer les informations de l'utilisateur depuis la base de données
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        image: true,
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    return user;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
}
