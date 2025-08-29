"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listAttendanceRecords(
  studentId?: string,
  timetableEntryId?: string,
  date?: string
) {
  const params = new URLSearchParams();
  if (studentId) params.append("studentId", studentId);
  if (timetableEntryId) params.append("timetableEntryId", timetableEntryId);
  if (date) params.append("date", date);

  const queryString = params.toString();
  const url = `${API_BASE}/attendance-records${queryString ? `?${queryString}` : ""}`;

  return await makeAuthenticatedRequest(url, "GET");
}

export async function createAttendanceRecord(input: {
  studentId: string;
  timetableEntryId?: string;
  recordedById?: string;
  date: string;
  status?: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  notes?: string;
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/attendance-records`,
    "POST",
    input
  );
}

export async function getAttendanceRecordById(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/attendance-records/${id}`,
    "GET"
  );
}

export async function updateAttendanceRecord(
  id: string,
  data: Record<string, any>
) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/attendance-records/${id}`,
    "PATCH",
    data
  );
}

export async function deleteAttendanceRecord(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/attendance-records/${id}`,
    "DELETE"
  );
}
