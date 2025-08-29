"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listGradeLevels() {
  return await makeAuthenticatedRequest(`${API_BASE}/grade-levels`, "GET");
}

export async function createGradeLevel(input: {
  name: string;
  description?: string;
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/grade-levels`,
    "POST",
    input
  );
}

export async function getGradeLevelById(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/grade-levels/${id}`,
    "GET"
  );
}

export async function updateGradeLevel(id: string, data: Record<string, any>) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/grade-levels/${id}`,
    "PATCH",
    data
  );
}

export async function deleteGradeLevel(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/grade-levels/${id}`,
    "DELETE"
  );
}
