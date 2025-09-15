import { cookies } from "next/headers";
import { refreshUserToken } from "@/lib/user";

export async function makeAuthenticatedRequest(
  url: string,
  method: string,
  body: any = null,
  headers: { [key: string]: string } = {},
  contentType?: string
) {
  try {
    const cookieStore = await cookies();

    // Récupérer le token d'accès et le token de rafraîchissement depuis les cookies
    let accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // Si le refreshToken est absent, retourner une erreur
    if (!refreshToken) {
      return { error: "Token de rafraîchissement manquant" };
    }

    // Vérifier si le corps de la requête est du FormData
    const isFormData = body instanceof FormData;

    // Créer une copie des headers pour manipuler plus facilement
    const finalHeaders: { [key: string]: string } = {
      ...headers,
      ...(isFormData
        ? {} // Si c'est du FormData, le navigateur gère le Content-Type
        : { "Content-Type": contentType || "application/json" }),
    };

    // Supprimer Content-Type si c'est du FormData
    if (isFormData) {
      delete finalHeaders["Content-Type"];
    }

    // Fonction utilitaire: injecter school et academic year
    const injectTenantHeaders = () => {
      const schoolId = cookieStore.get("schoolId")?.value;
      if (schoolId && !finalHeaders["x-school-id"]) {
        finalHeaders["x-school-id"] = schoolId;
      }
      const academicYearId = cookieStore.get("academicYearId")?.value;
      if (academicYearId && !finalHeaders["x-academic-year-id"]) {
        finalHeaders["x-academic-year-id"] = academicYearId;
      }
    };

    // Si l'accessToken est présent, essayer de récupérer les informations
    if (accessToken) {
      try {
        finalHeaders["Authorization"] = `Bearer ${accessToken}`;
        // Injecter x-school-id et x-academic-year-id si présents en cookies
        injectTenantHeaders();

        const options: RequestInit = {
          method,
          headers: finalHeaders,
          body: isFormData ? body : body ? JSON.stringify(body) : null,
        };

        const response = await fetch(url, options);

        if (!response.ok) {
          // Si 401, essayer un refresh puis retry (403 = autorisation insuffisante, pas de refresh)
          if (response.status === 401) {
            const refreshed = await attemptRefreshAndRetry(
              refreshToken!,
              url,
              method,
              body,
              finalHeaders,
              isFormData
            );
            return refreshed;
          }
          const error = await safeJson(response);
          return error;
        }

        return await safeJson(response);
      } catch (error) {
        console.error("Erreur lors de l'utilisation du token d'accès:", error);
      }
    }

    // Si l'`accessToken` est invalide ou absent, tenter de le rafraîchir
    try {
      const { accessToken: newAccessToken, accessTokenExpiresAt } =
        await refreshUserToken(refreshToken);

      // Mettre à jour l'accessToken dans les cookies
      cookieStore.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        maxAge: accessTokenExpiresAt,
        path: "/",
        sameSite: "lax",
      });

      // Utiliser le nouveau token d'accès
      finalHeaders["Authorization"] = `Bearer ${newAccessToken}`;
      injectTenantHeaders();

      // Faire la requête authentifiée avec le nouveau token d'accès
      const options: RequestInit = {
        method,
        headers: finalHeaders,
        body: isFormData ? body : body ? JSON.stringify(body) : null,
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await safeJson(response);
        return error;
      }

      const contentTypeHeader = response.headers.get("Content-Type");
      if (contentTypeHeader?.includes("application/pdf")) {
        return await response.blob();
      }

      return await safeJson(response);
    } catch (error) {
      console.error("Erreur lors du refresh et de la requête:", error);
      return { error: "Erreur lors de la requête authentifiée" };
    }
  } catch (error) {
    console.error("Erreur dans makeAuthenticatedRequest:", error);
    throw new Error("Erreur lors de la requête authentifiée");
  }
}

async function attemptRefreshAndRetry(
  refreshToken: string,
  url: string,
  method: string,
  body: any,
  headers: Record<string, string>,
  isFormData: boolean
) {
  try {
    const cookieStore = await cookies();
    const refreshed = await refreshUserToken(refreshToken);
    if ((refreshed as any)?.error) {
      return refreshed;
    }
    const { accessToken: newAccessToken, accessTokenExpiresAt } =
      refreshed as any;
    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      maxAge: accessTokenExpiresAt,
      path: "/",
      sameSite: "lax",
    });
    headers["Authorization"] = `Bearer ${newAccessToken}`;
    // Réinjecter schoolId/academicYearId au cas où
    const schoolId3 = cookieStore.get("schoolId")?.value;
    if (schoolId3 && !headers["x-school-id"]) {
      headers["x-school-id"] = schoolId3;
    }
    const academicYearId3 = cookieStore.get("academicYearId")?.value;
    if (academicYearId3 && !headers["x-academic-year-id"]) {
      headers["x-academic-year-id"] = academicYearId3;
    }
    const options: RequestInit = {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : null,
    };
    const retry = await fetch(url, options);
    if (!retry.ok) {
      const error = await safeJson(retry);
      return error;
    }
    return await safeJson(retry);
  } catch (e) {
    console.error("Erreur lors du refresh et retry:", e);
    return { error: "Erreur lors de la requête authentifiée" };
  }
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return { ok: res.ok, status: res.status };
  }
}
