"use server";

import { makeAuthenticatedRequest } from "./makeAuthenticatedRequest";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function getStudentPayments(studentId: string) {
  try {
    const result = await makeAuthenticatedRequest(
      `${API_BASE}/students/${studentId}/payments`,
      "GET"
    );

    if (result?.error) {
      return { error: result.error };
    }

    return result;
  } catch (error) {
    console.error("Error fetching student payments:", error);
    return {
      error: "Erreur lors de la récupération des paiements de l'étudiant",
    };
  }
}

export async function searchStudents(query: string = "") {
  try {
    const result = await makeAuthenticatedRequest(
      `${API_BASE}/students?search=${encodeURIComponent(query)}`,
      "GET"
    );

    if (result?.error) {
      return { error: result.error };
    }

    return result;
  } catch (error) {
    console.error("Error searching students:", error);
    return {
      error: "Erreur lors de la recherche d'étudiants",
    };
  }
}

export async function createStudentPayment(data: {
  studentId: string;
  feeScheduleId: string;
  amountCents: number;
  method: string;
  notes?: string;
}) {
  try {
    const result = await makeAuthenticatedRequest(
      `${API_BASE}/payments`,
      "POST",
      data
    );

    if (result?.error) {
      return { error: result.error };
    }

    return result;
  } catch (error) {
    console.error("Error creating student payment:", error);
    return {
      error: "Erreur lors de la création du paiement",
    };
  }
}
