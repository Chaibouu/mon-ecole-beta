"use server";

import { makeAuthenticatedRequest } from "./makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listTerms(academicYearId?: string) {
  const params = new URLSearchParams();
  if (academicYearId) params.append("academicYearId", academicYearId);

  const result = await makeAuthenticatedRequest(
    `${API_BASE}/terms?${params.toString()}`,
    "GET"
  );

  // Debug log
  // if (process.env.NODE_ENV === "development") {
  //   console.log("Terms API Result:", JSON.stringify(result, null, 2));
  // }

  return result;
}

export async function createTerm(input: {
  name: string;
  startDate: string;
  endDate: string;
  academicYearId: string;
}) {
  return makeAuthenticatedRequest(`${API_BASE}/terms`, "POST", input);
}

export async function updateTerm(id: string, data: Record<string, any>) {
  return makeAuthenticatedRequest(`${API_BASE}/terms/${id}`, "PATCH", data);
}

export async function deleteTerm(id: string) {
  return makeAuthenticatedRequest(`${API_BASE}/terms/${id}`, "DELETE");
}

export async function getTermById(id: string) {
  return makeAuthenticatedRequest(`${API_BASE}/terms/${id}`, "GET");
}
