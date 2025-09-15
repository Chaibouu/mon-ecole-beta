"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

/**
 * Lister tous les parents de l'école active avec leurs statistiques
 */
export async function listParents() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/schools/active/parents`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Obtenir un parent par son ID avec tous ses détails
 */
export async function getParentById(id: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/schools/active/parents/${id}`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Créer un nouveau parent
 */
export async function createParent(input: {
  user: {
    name: string;
    email?: string;
    password: string;
    phone?: string;
  };
  phone?: string;
  address?: string;
  profession?: string;
  workplace?: string;
  preferredLanguage?: string;
  children?: Array<{
    studentId: string;
    relationship: string;
  }>;
}) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/schools/active/parents`,
      "POST",
      input
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Mettre à jour un parent
 */
export async function updateParent(id: string, data: Record<string, any>) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/schools/active/parents/${id}`,
      "PATCH",
      data
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Supprimer un parent
 */
export async function deleteParent(id: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/schools/active/parents/${id}`,
      "DELETE"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}
