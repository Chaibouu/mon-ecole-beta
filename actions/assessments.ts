"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listAssessments(filters?: {
  subjectId?: string;
  classroomId?: string;
  termId?: string;
  teacherId?: string;
  search?: string;
  type?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.subjectId) params.append("subjectId", filters.subjectId);
  if (filters?.classroomId) params.append("classroomId", filters.classroomId);
  if (filters?.termId) params.append("termId", filters.termId);
  if (filters?.teacherId) params.append("teacherId", filters.teacherId);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.type) params.append("type", filters.type);

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
