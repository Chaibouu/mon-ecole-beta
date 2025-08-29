"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listEnrollments(
  classroomId?: string,
  studentId?: string
) {
  const params = new URLSearchParams();
  if (classroomId) params.append("classroomId", classroomId);
  if (studentId) params.append("studentId", studentId);

  const queryString = params.toString();
  const url = `${API_BASE}/enrollments${queryString ? `?${queryString}` : ""}`;

  return await makeAuthenticatedRequest(url, "GET");
}

export async function createEnrollment(input: {
  studentId: string;
  classroomId: string;
  academicYearId: string;
  status?: "ACTIVE" | "TRANSFERRED" | "COMPLETED" | "DROPPED";
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/enrollments`,
    "POST",
    input
  );
}

export async function getEnrollmentById(id: string) {
  return await makeAuthenticatedRequest(`${API_BASE}/enrollments/${id}`, "GET");
}

export async function updateEnrollment(id: string, data: Record<string, any>) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/enrollments/${id}`,
    "PATCH",
    data
  );
}

export async function deleteEnrollment(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/enrollments/${id}`,
    "DELETE"
  );
}
