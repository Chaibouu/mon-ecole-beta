"use server";

import { makeAuthenticatedRequest } from "./makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

/**
 * Récupérer les détails complets d'un élève
 */
/**
 * Lister tous les élèves de l'école active
 */
export async function listStudents() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/schools/active/students`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Récupérer les détails complets d'un élève
 */
export async function getStudentDetails(studentId: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/schools/active/students/${studentId}`,
      "GET"
    );

    if (result?.error) return { error: result.error };
    return { data: result };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails de l'élève:",
      error
    );
    return { error: "Erreur de connexion" };
  }
}

/**
 * Créer un nouvel élève
 */
export async function createStudent(input: {
  user: {
    name: string;
    email?: string;
    phone: string;
    password: string;
  };
  profile: {
    matricule?: string;
    studentNumber?: string;
    gender?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    nationality?: string;
    bloodType?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    previousSchool?: string;
    status?: string;
  };
}) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/schools/active/students`,
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
 * Mettre à jour un élève
 */
export async function updateStudent(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    profile?: {
      matricule?: string;
      studentNumber?: string;
      gender?: string;
      dateOfBirth?: string;
      placeOfBirth?: string;
      nationality?: string;
      bloodType?: string;
      address?: string;
      emergencyContact?: string;
      emergencyPhone?: string;
      previousSchool?: string;
      status?: string;
    };
  }
) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/schools/active/students/${id}`,
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
 * Supprimer un élève
 */
export async function deleteStudent(id: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/schools/active/students/${id}`,
      "DELETE"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}
