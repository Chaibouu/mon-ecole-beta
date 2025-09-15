"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";
import { cookies } from "next/headers";

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

// Active year helpers
export async function getActiveAcademicYear() {
  return await makeAuthenticatedRequest(
    `${API_BASE}/academic-years/active`,
    "GET"
  );
}

export async function setActiveAcademicYear(academicYearId: string) {
  const res = await makeAuthenticatedRequest(
    `${API_BASE}/academic-years/active`,
    "POST",
    { academicYearId }
  );
  // Si succès, poser le cookie côté action (pour web) et laisser mobile gérer côté client
  if (!(res as any)?.error) {
    const cookieStore = await cookies();
    cookieStore.set("academicYearId", academicYearId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 365 * 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
    });
  }
  return res;
}

export async function clearActiveAcademicYearCookie() {
  const cookieStore = await cookies();
  cookieStore.set("academicYearId", "", { maxAge: -1, path: "/" });
}
