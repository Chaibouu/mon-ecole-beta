"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

type AttendanceFilters = {
  studentId?: string;
  classroomId?: string;
  timetableEntryId?: string;
  teacherId?: string;
  subjectId?: string;
  academicYearId?: string;
  from?: string; // ISO
  to?: string; // ISO
};

export async function listAttendance(filters: AttendanceFilters = {}) {
  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) qs.append(k, String(v));
  });
  const url = `${API_BASE}/attendance-records${qs.toString() ? `?${qs.toString()}` : ""}`;
  return makeAuthenticatedRequest(url, "GET");
}

// Alias pour la compatibilité
export const listAttendanceRecords = listAttendance;

type CreateAttendancePayload = {
  studentId: string;
  date: string; // ISO yyyy-mm-dd
  status: "PRESENT" | "ABSENT" | "EXPELLED" | "SICK" | "LATE";
  timetableEntryId: string;
  notes?: string;
};

export async function createAttendance(data: CreateAttendancePayload) {
  return makeAuthenticatedRequest(
    `${API_BASE}/attendance-records`,
    "POST",
    data
  );
}

// Alias pour la compatibilité
export const createAttendanceRecord = createAttendance;

export async function updateAttendance(
  id: string,
  data: Partial<CreateAttendancePayload>
) {
  return makeAuthenticatedRequest(
    `${API_BASE}/attendance-records/${id}`,
    "PATCH",
    data
  );
}

// Alias pour la compatibilité
export const updateAttendanceRecord = updateAttendance;

export async function getAttendanceRecordById(id: string) {
  return makeAuthenticatedRequest(
    `${API_BASE}/attendance-records/${id}`,
    "GET"
  );
}

export async function deleteAttendance(id: string) {
  return makeAuthenticatedRequest(
    `${API_BASE}/attendance-records/${id}`,
    "DELETE"
  );
}

// Alias pour la compatibilité
export const deleteAttendanceRecord = deleteAttendance;

export async function getAttendanceAnalytics(filters: AttendanceFilters = {}) {
  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) qs.append(k, String(v));
  });
  const url = `${API_BASE}/attendance-records/analytics${qs.toString() ? `?${qs.toString()}` : ""}`;
  return makeAuthenticatedRequest(url, "GET");
}

export async function getClassroomStudents(classroomId: string) {
  return makeAuthenticatedRequest(
    `${API_BASE}/classrooms/${classroomId}/students`,
    "GET"
  );
}

export async function checkExistingAttendance(
  timetableEntryId: string,
  date: string
) {
  const qs = new URLSearchParams();
  qs.append("timetableEntryId", timetableEntryId);
  qs.append("from", date);
  qs.append("to", date);

  return makeAuthenticatedRequest(
    `${API_BASE}/attendance-records?${qs.toString()}`,
    "GET"
  );
}

export async function updateOrCreateAttendance(
  studentId: string,
  date: string,
  status: "PRESENT" | "ABSENT" | "EXPELLED" | "SICK" | "LATE",
  timetableEntryId: string,
  notes?: string
) {
  // First check if attendance record exists
  const checkData: any = await checkExistingAttendance(timetableEntryId, date);
  const existingRecords = Array.isArray(checkData?.attendanceRecords)
    ? checkData.attendanceRecords
    : [];
  const existingRecord = existingRecords.find(
    (r: any) => r.studentId === studentId
  );

  if (existingRecord) {
    // Update existing record
    return updateAttendance(existingRecord.id, {
      studentId,
      date,
      status,
      timetableEntryId,
      notes,
    });
  } else {
    // Create new record
    return createAttendance({
      studentId,
      date,
      status,
      timetableEntryId,
      notes,
    });
  }
}
