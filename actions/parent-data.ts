"use server";

import { makeAuthenticatedRequest } from "./makeAuthenticatedRequest";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function getParentChildren() {
  try {
    const result = await makeAuthenticatedRequest(
      `${API_BASE}/parents/children`,
      "GET"
    );

    if (result?.error) {
      return { error: result.error };
    }

    return result;
  } catch (error) {
    console.error("Error fetching parent children:", error);
    return { error: "Erreur lors de la récupération des données" };
  }
}

export async function getParentPaymentsSummary() {
  try {
    const result = await makeAuthenticatedRequest(
      `${API_BASE}/parents/payments-summary`,
      "GET"
    );

    if (result?.error) {
      return { error: result.error };
    }

    return result;
  } catch (error) {
    console.error("Error fetching parent payments summary:", error);
    return { error: "Erreur lors de la récupération du résumé des paiements" };
  }
}

// Gestion des liaisons parent-enfant (pour les admins)
export async function getParentChildrenByParentId(parentId: string) {
  try {
    const result = await makeAuthenticatedRequest(
      `${API_BASE}/parents/${parentId}/children`,
      "GET"
    );

    if (result?.error) {
      return { error: result.error };
    }

    return result;
  } catch (error) {
    console.error("Error fetching parent children by ID:", error);
    return { error: "Erreur lors de la récupération des enfants" };
  }
}

export async function addChildToParent(
  parentId: string,
  data: {
    studentId: string;
    relationship: string;
  }
) {
  try {
    const result = await makeAuthenticatedRequest(
      `${API_BASE}/parents/${parentId}/children`,
      "POST",
      data
    );

    if (result?.error) {
      return { error: result.error };
    }

    return result;
  } catch (error) {
    console.error("Error adding child to parent:", error);
    return { error: "Erreur lors de l'ajout de l'enfant" };
  }
}

export async function removeChildFromParent(parentId: string, linkId: string) {
  try {
    const result = await makeAuthenticatedRequest(
      `${API_BASE}/parents/${parentId}/children?linkId=${linkId}`,
      "DELETE"
    );

    if (result?.error) {
      return { error: result.error };
    }

    return result;
  } catch (error) {
    console.error("Error removing child from parent:", error);
    return { error: "Erreur lors de la suppression de la liaison" };
  }
}

// Créer un parent avec ses liaisons enfants
export async function createParentWithChildren(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  children: Array<{
    studentId: string;
    relationship: string;
  }>;
}) {
  try {
    // D'abord créer le parent
    const parentResult = await makeAuthenticatedRequest(
      `${API_BASE}/parents`,
      "POST",
      {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        address: data.address,
      }
    );

    if (parentResult?.error) {
      return { error: parentResult.error };
    }

    const parentId = parentResult.parent?.id;
    if (!parentId) {
      return { error: "Erreur lors de la création du parent" };
    }

    // Ensuite ajouter les liaisons enfants
    const childrenResults = [];
    for (const child of data.children) {
      const childResult = await addChildToParent(parentId, {
        studentId: child.studentId,
        relationship: child.relationship,
      });

      if (childResult?.error) {
        console.warn(
          `Erreur lors de l'ajout de l'enfant ${child.studentId}:`,
          childResult.error
        );
      } else {
        childrenResults.push(childResult);
      }
    }

    return {
      parent: parentResult.parent,
      childrenLinks: childrenResults,
      message: `Parent créé avec succès. ${childrenResults.length} enfant(s) lié(s).`,
    };
  } catch (error) {
    console.error("Error creating parent with children:", error);
    return { error: "Erreur lors de la création du parent" };
  }
}
