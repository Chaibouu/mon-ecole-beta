"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listTimetableEntries(
  classroomId?: string,
  teacherId?: string
) {
  const params = new URLSearchParams();
  if (classroomId) params.append("classroomId", classroomId);
  if (teacherId) params.append("teacherId", teacherId);

  const queryString = params.toString();
  const url = `${API_BASE}/timetable-entries${queryString ? `?${queryString}` : ""}`;

  return await makeAuthenticatedRequest(url, "GET");
}

export async function createTimetableEntry(input: {
  classroomId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  startTime: string;
  endTime: string;
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/timetable-entries`,
    "POST",
    input
  );
}

export async function getTimetableEntryById(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/timetable-entries/${id}`,
    "GET"
  );
}

export async function updateTimetableEntry(
  id: string,
  data: Record<string, any>
) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/timetable-entries/${id}`,
    "PATCH",
    data
  );
}

export async function deleteTimetableEntry(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/timetable-entries/${id}`,
    "DELETE"
  );
}
