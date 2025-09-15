"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listTeachers() {
  return await makeAuthenticatedRequest(
    `${API_BASE}/schools/active/teachers`,
    "GET"
  );
}

export async function getTeacherById(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/schools/active/teachers/${id}`,
    "GET"
  );
}

export async function updateTeacher(id: string, data: Record<string, any>) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/schools/active/teachers/${id}`,
    "PATCH",
    data
  );
}

export async function deleteTeacher(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/schools/active/teachers/${id}`,
    "DELETE"
  );
}
