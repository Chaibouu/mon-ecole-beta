"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listGradeLevelSubjects(params?: {
  gradeLevelId?: string;
  subjectId?: string;
}) {
  const query = new URLSearchParams();
  if (params?.gradeLevelId) query.set("gradeLevelId", params.gradeLevelId);
  if (params?.subjectId) query.set("subjectId", params.subjectId);
  const qs = query.toString();
  return await makeAuthenticatedRequest(
    `${API_BASE}/grade-level-subjects${qs ? `?${qs}` : ""}`,
    "GET"
  );
}

export async function createGradeLevelSubject(input: {
  gradeLevelId: string;
  subjectId: string;
  coefficient: number;
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/grade-level-subjects`,
    "POST",
    input
  );
}

export async function getGradeLevelSubjectById(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/grade-level-subjects/${id}`,
    "GET"
  );
}

export async function updateGradeLevelSubject(
  id: string,
  data: Record<string, any>
) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/grade-level-subjects/${id}`,
    "PATCH",
    data
  );
}

export async function deleteGradeLevelSubject(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/grade-level-subjects/${id}`,
    "DELETE"
  );
}
