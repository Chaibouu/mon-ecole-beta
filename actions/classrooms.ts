"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listClassrooms() {
  return await makeAuthenticatedRequest(`${API_BASE}/classrooms`, "GET");
}

export async function createClassroom(input: {
  name: string;
  gradeLevelId: string;
  description?: string;
  headTeacherId?: string;
  room?: string;
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/classrooms`,
    "POST",
    input
  );
}

export async function getClassroomById(id: string) {
  return await makeAuthenticatedRequest(`${API_BASE}/classrooms/${id}`, "GET");
}

export async function updateClassroom(id: string, data: Record<string, any>) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/classrooms/${id}`,
    "PATCH",
    data
  );
}

export async function deleteClassroom(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/classrooms/${id}`,
    "DELETE"
  );
}
