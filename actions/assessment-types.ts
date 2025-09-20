"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listAssessmentTypes(onlyActive?: boolean) {
  const url = `${API_BASE}/assessment-types${onlyActive ? `?active=true` : ""}`;
  return await makeAuthenticatedRequest(url, "GET");
}

export async function createAssessmentType(input: {
  name: string;
  code?: string;
  defaultMaxScore?: number;
  defaultCoefficient?: number;
  isActive?: boolean;
  order?: number;
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/assessment-types`,
    "POST",
    input
  );
}

export async function getAssessmentTypeById(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/assessment-types/${id}`,
    "GET"
  );
}

export async function updateAssessmentType(
  id: string,
  data: Record<string, any>
) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/assessment-types/${id}`,
    "PATCH",
    data
  );
}

export async function deleteAssessmentType(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/assessment-types/${id}`,
    "DELETE"
  );
}
