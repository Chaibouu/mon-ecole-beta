"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listClassroomSubjects(
  classroomId?: string,
  subjectId?: string,
  academicYearId?: string
) {
  const params = new URLSearchParams();
  if (classroomId) params.append("classroomId", classroomId);
  if (subjectId) params.append("subjectId", subjectId);
  if (academicYearId) params.append("academicYearId", academicYearId);

  const queryString = params.toString();
  const url = `${API_BASE}/classroom-subjects${queryString ? `?${queryString}` : ""}`;

  return await makeAuthenticatedRequest(url, "GET");
}

// Action spécifique pour définir/surcharger le coefficient de classe
export async function setClassroomSubjectCoefficient(input: {
  classroomId: string;
  subjectId: string;
  coefficient: number;
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/classroom-subjects`,
    "POST",
    input
  );
}

export async function createClassroomSubject(input: {
  classroomId: string;
  subjectId: string;
  coefficient: number;
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/classroom-subjects`,
    "POST",
    input
  );
}

export async function getClassroomSubjectById(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/classroom-subjects/${id}`,
    "GET"
  );
}

export async function updateClassroomSubject(
  id: string,
  data: Record<string, any>
) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/classroom-subjects/${id}`,
    "PATCH",
    data
  );
}

export async function deleteClassroomSubject(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/classroom-subjects/${id}`,
    "DELETE"
  );
}
