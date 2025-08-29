"use server";
import { makeAuthenticatedRequest } from "./makeAuthenticatedRequest";

/**
 * Créer/lier un admin à une école
 */
export async function createSchoolAdmin(schoolId: string, data: any) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/${schoolId}/admins`,
      "POST",
      data
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Créer/lier un enseignant à une école
 */
export async function createSchoolTeacher(schoolId: string, data: any) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/${schoolId}/teachers`,
      "POST",
      data
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Créer/lier un parent à une école
 */
export async function createSchoolParent(schoolId: string, data: any) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/${schoolId}/parents`,
      "POST",
      data
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Créer/lier un élève à une école
 */
export async function createSchoolStudent(schoolId: string, data: any) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/${schoolId}/students`,
      "POST",
      data
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Lister les membres d'une école avec leurs rôles
 */
export async function getSchoolMembers(schoolId: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/${schoolId}/members`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Lister tous les utilisateurs disponibles (pour liaison)
 */
export async function getAvailableUsers() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/users`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Lister tous les enseignants de l'école active
 */
export async function listTeachers() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/teachers`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Lister tous les élèves de l'école active
 */
export async function listStudents() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/students`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Lister tous les parents de l'école active
 */
export async function listParents() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/parents`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Obtenir un enseignant par son ID
 */
export async function getTeacherById(id: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/teachers/${id}`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Créer un nouvel enseignant
 */
export async function createTeacher(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  hireDate?: string;
  specialization?: string;
  bio?: string;
}) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/teachers`,
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
 * Mettre à jour un enseignant
 */
export async function updateTeacher(id: string, data: Record<string, any>) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/teachers/${id}`,
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
 * Supprimer un enseignant
 */
export async function deleteTeacher(id: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/schools/active/teachers/${id}`,
      "DELETE"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}
