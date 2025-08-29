"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listTerms() {
  return await makeAuthenticatedRequest(`${API_BASE}/terms`, "GET");
}

export async function createTerm(input: {
  name: string;
  startDate: string;
  endDate: string;
  academicYearId: string;
}) {
  return await makeAuthenticatedRequest(`${API_BASE}/terms`, "POST", input);
}

export async function getTermById(id: string) {
  return await makeAuthenticatedRequest(`${API_BASE}/terms/${id}`, "GET");
}

export async function updateTerm(id: string, data: Record<string, any>) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/terms/${id}`,
    "PATCH",
    data
  );
}

export async function deleteTerm(id: string) {
  return await makeAuthenticatedRequest(`${API_BASE}/terms/${id}`, "DELETE");
}
