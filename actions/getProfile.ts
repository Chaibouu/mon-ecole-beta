"use server";
import { makeAuthenticatedRequest } from "./makeAuthenticatedRequest";

/**
 * @deprecated Utiliser getUserProfile à la place
 * Cette fonction sera supprimée dans une version future
 */
export const getProfile = async () => {
  try {
    const data = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/profile`,
      "GET"
    );
    if ((data as any)?.error) return { error: (data as any).error };
    return { success: "OK", data };
  } catch (e) {
    return { error: "Impossible de récupérer le profil" };
  }
};
