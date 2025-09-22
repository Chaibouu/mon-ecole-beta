"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listSubjectCategories() {
  return await makeAuthenticatedRequest(
    `${API_BASE}/subject-categories`,
    "GET"
  );
}

export async function createSubjectCategory(input: {
  name: string;
  description?: string;
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/subject-categories`,
    "POST",
    input
  );
}

export async function getSubjectCategoryById(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/subject-categories/${id}`,
    "GET"
  );
}

export async function updateSubjectCategory(
  id: string,
  data: Record<string, any>
) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/subject-categories/${id}`,
    "PATCH",
    data
  );
}

export async function deleteSubjectCategory(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/subject-categories/${id}`,
    "DELETE"
  );
}














