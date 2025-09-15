"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listStudentsForTimetableEntry(id: string) {
  return makeAuthenticatedRequest(
    `${API_BASE}/timetable-entries/${id}/students`,
    "GET"
  );
}










