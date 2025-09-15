"use server";

import { makeAuthenticatedRequest } from "./makeAuthenticatedRequest";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

// ========================
// Actions pour le tableau de bord enseignant
// ========================

/**
 * Récupérer toutes les classes d'un enseignant
 */
export async function getTeacherClasses() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/teacher/classes`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Récupérer les élèves d'une classe spécifique
 */
export async function getClassStudents(classroomId: string) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/teacher/classes/${classroomId}/students`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Récupérer l'emploi du temps d'un enseignant
 */
export async function getTeacherTimetable() {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/teacher/timetable`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Récupérer les enregistrements d'assiduité pour faire l'appel
 */
export async function getAttendanceForClass(options: {
  classroomId: string;
  date: string; // YYYY-MM-DD
  timetableEntryId?: string;
}) {
  try {
    const params = new URLSearchParams();
    params.append("classroomId", options.classroomId);
    params.append("date", options.date);
    if (options.timetableEntryId) {
      params.append("timetableEntryId", options.timetableEntryId);
    }

    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/teacher/attendance?${params.toString()}`,
      "GET"
    );

    if (result?.error) return result;
    return result;
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}

/**
 * Enregistrer l'assiduité (faire l'appel)
 */
export async function recordAttendance(data: {
  classroomId: string;
  date: string; // YYYY-MM-DD
  timetableEntryId?: string;
  attendanceData: Array<{
    studentId: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    notes?: string;
  }>;
}) {
  try {
    const result: any = await makeAuthenticatedRequest(
      `${API_BASE}/teacher/attendance`,
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
 * Récupérer les évaluations d'un enseignant
 */
export async function getTeacherAssessments(filters?: {
  classroomId?: string;
  subjectId?: string;
  termId?: string;
}) {
  try {
    const params = new URLSearchParams();
    if (filters?.classroomId) params.append("classroomId", filters.classroomId);
    if (filters?.subjectId) params.append("subjectId", filters.subjectId);
    if (filters?.termId) params.append("termId", filters.termId);

    const url = `${API_BASE}/teacher/assessments${
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
 * Récupérer un résumé complet pour un enseignant
 */
export async function getTeacherSummary() {
  try {
    const [classesResult, timetableResult, assessmentsResult] =
      await Promise.all([
        getTeacherClasses(),
        getTeacherTimetable(),
        getTeacherAssessments(),
      ]);

    return {
      classes: classesResult?.error ? null : classesResult,
      timetable: timetableResult?.error ? null : timetableResult,
      assessments: assessmentsResult?.error ? null : assessmentsResult,
      errors: {
        classes: classesResult?.error || null,
        timetable: timetableResult?.error || null,
        assessments: assessmentsResult?.error || null,
      },
    };
  } catch (error) {
    return { error: "Erreur de connexion" };
  }
}
