"use server";

import { makeAuthenticatedRequest } from "./makeAuthenticatedRequest";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

// ========================
// Actions pour le tableau de bord parent
// ========================

/**
 * Récupérer tous les enfants du parent connecté
 */
export async function getParentChildren() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/parent/children`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Récupérer les informations de paiement d'un enfant
 */
export async function getChildPayments(studentId: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/parent/children/${studentId}/payments`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Récupérer l'emploi du temps d'un enfant
 */
export async function getChildTimetable(studentId: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/parent/children/${studentId}/timetable`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Récupérer les notes d'un enfant
 */
export async function getChildGrades(studentId: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/parent/children/${studentId}/grades`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Récupérer l'assiduité d'un enfant
 */
export async function getChildAttendance(
  studentId: string,
  options: {
    startDate?: string;
    endDate?: string;
    month?: string; // Format: YYYY-MM
  } = {}
) {
  try {
    const params = new URLSearchParams();
    if (options.startDate) params.append("startDate", options.startDate);
    if (options.endDate) params.append("endDate", options.endDate);
    if (options.month) params.append("month", options.month);

    const url = `${API_BASE}/parent/children/${studentId}/attendance${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const result: any = await makeAuthenticatedRequest(url, "GET");

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Récupérer un résumé complet pour un enfant (toutes les infos)
 */
export async function getChildSummary(studentId: string) {
  try {
    const [paymentsResult, timetableResult, gradesResult, attendanceResult] =
      await Promise.all([
        getChildPayments(studentId),
        getChildTimetable(studentId),
        getChildGrades(studentId),
        getChildAttendance(studentId),
      ]);

    return {
      payments: paymentsResult?.error ? null : paymentsResult,
      timetable: timetableResult?.error ? null : timetableResult,
      grades: gradesResult?.error ? null : gradesResult,
      attendance: attendanceResult?.error ? null : attendanceResult,
      errors: {
        payments: paymentsResult?.error || null,
        timetable: timetableResult?.error || null,
        grades: gradesResult?.error || null,
        attendance: attendanceResult?.error || null,
      },
    };
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}
