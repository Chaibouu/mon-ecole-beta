"use server";

import { makeAuthenticatedRequest } from "@/actions/makeAuthenticatedRequest";

const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

export async function listSchools() {
  console.log("listSchools");
  return await makeAuthenticatedRequest(`${API_BASE}/schools`, "GET");
}

export async function createSchool(input: {
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}) {
  return await makeAuthenticatedRequest(`${API_BASE}/schools`, "POST", input);
}

export async function getSchoolById(id: string) {
  return await makeAuthenticatedRequest(`${API_BASE}/schools/${id}`, "GET");
}

export async function updateSchool(id: string, data: Record<string, any>) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/schools/${id}`,
    "PATCH",
    data
  );
}

export async function softDeleteSchool(id: string) {
  return await makeAuthenticatedRequest(`${API_BASE}/schools/${id}`, "DELETE");
}

export async function getActiveSchool() {
  return await makeAuthenticatedRequest(`${API_BASE}/schools/active`, "GET");
}

export async function updateActiveSchool(data: Record<string, any>) {
  return await makeAuthenticatedRequest(
    `${API_BASE}/schools/active`,
    "PATCH",
    data
  );
}
