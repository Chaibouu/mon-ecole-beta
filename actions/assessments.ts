"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listAssessments(
  subjectId?: string,
  classroomId?: string,
  termId?: string
) {
  const params = new URLSearchParams();
  if (subjectId) params.append("subjectId", subjectId);
  if (classroomId) params.append("classroomId", classroomId);
  if (termId) params.append("termId", termId);

  const queryString = params.toString();
  const url = `${API_BASE}/assessments${queryString ? `?${queryString}` : ""}`;

  return await makeAuthenticatedRequest(url, "GET");
}

export async function createAssessment(input: {
  subjectId: string;
  classroomId: string;
  termId: string;
  title: string;
  description?: string;
  type: "EXAM" | "QUIZ" | "HOMEWORK";
  coefficient?: number;
  assignedAt?: string;
  dueAt?: string;
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/assessments`,
    "POST",
    input
  );
}

export async function getAssessmentById(id: string) {
  return await makeAuthenticatedRequest(`${API_BASE}/assessments/${id}`, "GET");
}

export async function updateAssessment(id: string, data: Record<string, any>) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/assessments/${id}`,
    "PATCH",
    data
  );
}

export async function deleteAssessment(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/assessments/${id}`,
    "DELETE"
  );
}
