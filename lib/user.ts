import { cookies } from "next/headers";

export const refreshUserToken = async (refreshToken: string) => {
  const refreshResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/refresh`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }
  );

  if (!refreshResponse.ok) {
    return { error: "Impossible de rafraîchir le token" };
  }
  return await refreshResponse.json();
};

export const getUserInfo = async (accessToken: string) => {
  // Injecter automatiquement x-school-id depuis les cookies serveur
  const cookieStore = await cookies();
  const schoolId = cookieStore.get("schoolId")?.value;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (schoolId) {
    headers["x-school-id"] = schoolId;
  }

  const userResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/profile`,
    {
      method: "GET",
      headers,
    }
  );

  if (!userResponse.ok) {
    return {
      error:
        "Impossible de récupérer les informations de l'utilisateur après rafraîchissement",
      status: userResponse.status,
    } as const;
  }
  return await userResponse.json();
};
