"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listSubjects() {
  return await makeAuthenticatedRequest(`${API_BASE}/subjects`, "GET");
}

export async function createSubject(input: {
  name: string;
  description?: string;
  categoryId?: string | null;
}) {
  return await makeAuthenticatedRequest(`${API_BASE}/subjects`, "POST", input);
}

export async function getSubjectById(id: string) {
  return await makeAuthenticatedRequest(`${API_BASE}/subjects/${id}`, "GET");
}

export async function updateSubject(id: string, data: Record<string, any>) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/subjects/${id}`,
    "PATCH",
    data
  );
}

export async function deleteSubject(id: string) {
  return await makeAuthenticatedRequest(`${API_BASE}/subjects/${id}`, "DELETE");
}
