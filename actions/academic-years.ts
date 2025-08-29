"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listAcademicYears() {
  return await makeAuthenticatedRequest(`${API_BASE}/academic-years`, "GET");
}

export async function createAcademicYear(input: {
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/academic-years`,
    "POST",
    input
  );
}

export async function getAcademicYearById(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/academic-years/${id}`,
    "GET"
  );
}

export async function updateAcademicYear(
  id: string,
  data: Record<string, any>
) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/academic-years/${id}`,
    "PATCH",
    data
  );
}

export async function deleteAcademicYear(id: string) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/academic-years/${id}`,
    "DELETE"
  );
}
