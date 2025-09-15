"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

type ListParams = {
  classroomId?: string;
  day?: string; // MONDAY..SUNDAY
};

export async function listTimetableEntries(params: ListParams = {}) {
  const qs = new URLSearchParams();
  if (params.classroomId) qs.append("classroomId", params.classroomId);
  if (params.day) qs.append("day", params.day);
  const url = `${API_BASE}/timetable-entries${qs.toString() ? `?${qs.toString()}` : ""}`;
  return makeAuthenticatedRequest(url, "GET");
}

export async function getWeeklyTimetable(classroomId: string) {
  return makeAuthenticatedRequest(
    `${API_BASE}/classrooms/${classroomId}/timetable`,
    "GET"
  );
}

type CreatePayload = {
  classroomId: string;
  academicYearId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: string; // enum as string
  startTime: string; // ISO
  endTime: string; // ISO
};

export async function createTimetableEntry(data: CreatePayload) {
  return makeAuthenticatedRequest(
    `${API_BASE}/timetable-entries`,
    "POST",
    data
  );
}

export async function updateTimetableEntry(
  id: string,
  data: Partial<CreatePayload>
) {
  return makeAuthenticatedRequest(
    `${API_BASE}/timetable-entries/${id}`,
    "PATCH",
    data
  );
}

export async function getTimetableEntryById(id: string) {
  return makeAuthenticatedRequest(`${API_BASE}/timetable-entries/${id}`, "GET");
}

export async function deleteTimetableEntry(id: string) {
  return makeAuthenticatedRequest(
    `${API_BASE}/timetable-entries/${id}`,
    "DELETE"
  );
}
