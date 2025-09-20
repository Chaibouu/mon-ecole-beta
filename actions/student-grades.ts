"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listStudentGrades(filters?: {
  studentId?: string;
  assessmentId?: string;
  classroomId?: string;
  subjectId?: string;
  termId?: string;
  teacherId?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.studentId) params.append("studentId", filters.studentId);
  if (filters?.assessmentId)
    params.append("assessmentId", filters.assessmentId);
  if (filters?.classroomId) params.append("classroomId", filters.classroomId);
  if (filters?.subjectId) params.append("subjectId", filters.subjectId);
  if (filters?.termId) params.append("termId", filters.termId);
  if (filters?.teacherId) params.append("teacherId", filters.teacherId);

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

export async function bulkUpsertStudentGrades(input: {
  assessmentId: string;
  grades: Array<{ studentId: string; note?: number; score?: number }>;
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
