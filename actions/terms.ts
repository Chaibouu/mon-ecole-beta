"use server";

import { makeAuthenticatedRequest } from "./makeAuthenticatedRequest";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function listTerms(academicYearId?: string) {
  const params = new URLSearchParams();
  if (academicYearId) params.append("academicYearId", academicYearId);

  return makeAuthenticatedRequest(
    `${API_BASE}/terms?${params.toString()}`,
    "GET"
  );
}
