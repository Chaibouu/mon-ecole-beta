"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listTeacherAssignments(classroomId?: string) {
  const params = classroomId ? `?classroomId=${classroomId}` : "";
  return await makeAuthenticatedRequest(
    `${API_BASE}/teacher-assignments${params}`,
    "GET"
  );
}

export async function createTeacherAssignment(input: {
  teacherId: string;
  subjectId: string;
  classroomId: string;
  academicYearId: string;
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/teacher-assignments`,
    "POST",
    input
  );
}

export async function getTeacherAssignmentById(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/teacher-assignments/${id}`,
    "GET"
  );
}

export async function updateTeacherAssignment(
  id: string,
  data: Record<string, any>
) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/teacher-assignments/${id}`,
    "PATCH",
    data
  );
}

export async function deleteTeacherAssignment(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/teacher-assignments/${id}`,
    "DELETE"
  );
}




















