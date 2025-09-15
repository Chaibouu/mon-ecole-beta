"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listStudentGrades(
  studentId?: string,
  assessmentId?: string,
  classroomId?: string
) {
  const params = new URLSearchParams();
  if (studentId) params.append("studentId", studentId);
  if (assessmentId) params.append("assessmentId", assessmentId);
  if (classroomId) params.append("classroomId", classroomId);

  const queryString = params.toString();
  const url = `${API_BASE}/student-grades${queryString ? `?${queryString}` : ""}`;

  return await makeAuthenticatedRequest(url, "GET");
}

export async function createStudentGrade(input: {
  studentId: string;
  assessmentId: string;
  score: number;
  comments?: string;
  gradedBy: string;
  gradedAt: string;
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/student-grades`,
    "POST",
    input
  );
}

export async function getStudentGradeById(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/student-grades/${id}`,
    "GET"
  );
}

export async function updateStudentGrade(
  id: string,
  data: Record<string, any>
) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/student-grades/${id}`,
    "PATCH",
    data
  );
}

export async function deleteStudentGrade(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/student-grades/${id}`,
    "DELETE"
  );
}

















