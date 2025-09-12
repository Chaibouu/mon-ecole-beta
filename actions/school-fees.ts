"use server";

import { makeAuthenticatedRequest } from "./makeAuthenticatedRequest";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const API_BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

// ========================
// Fee Schedules (Structure des frais)
// ========================

export async function listFeeSchedules(
  filters: {
    gradeLevelId?: string;
    classroomId?: string;
  } = {}
) {
  const params = new URLSearchParams();
  if (filters.gradeLevelId) params.append("gradeLevelId", filters.gradeLevelId);
  if (filters.classroomId) params.append("classroomId", filters.classroomId);

  return makeAuthenticatedRequest(
    `${API_BASE}/fee-schedules?${params.toString()}`,
    "GET"
  );
}

export async function createFeeSchedule(data: {
  gradeLevelId?: string;
  classroomId?: string;
  itemName: string;
  amountCents: number;
  dueDate?: string;
  installments?: Array<{
    name: string;
    amountCents: number;
    dueDate: string;
  }>;
}) {
  console.log("[CREATE_FEE_SCHEDULE] API URL:", `${API_BASE}/fee-schedules`);
  return makeAuthenticatedRequest(`${API_BASE}/fee-schedules`, "POST", data);
}

export async function updateFeeSchedule(
  id: string,
  data: {
    gradeLevelId?: string;
    classroomId?: string;
    itemName?: string;
    amountCents?: number;
    dueDate?: string;
    installments?: Array<{
      name: string;
      amountCents: number;
      dueDate: string;
    }>;
  }
) {
  return makeAuthenticatedRequest(
    `${API_BASE}/fee-schedules/${id}`,
    "PUT",
    data
  );
}

export async function deleteFeeSchedule(id: string) {
  return makeAuthenticatedRequest(`${API_BASE}/fee-schedules/${id}`, "DELETE");
}

// ========================
// Student Payment Schedules (Échéanciers de paiement)
// ========================

export async function getStudentPaymentSchedule(studentId: string) {
  return makeAuthenticatedRequest(
    `${API_BASE}/students/${studentId}/payment-schedule`,
    "GET"
  );
}

// ========================
// Payments (Paiements)
// ========================

export async function listPayments(
  filters: {
    studentId?: string;
    feeScheduleId?: string;
    method?: string;
    gradeLevelId?: string;
    classroomId?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}
) {
  const params = new URLSearchParams();
  if (filters.studentId) params.append("studentId", filters.studentId);
  if (filters.feeScheduleId)
    params.append("feeScheduleId", filters.feeScheduleId);
  if (filters.method) params.append("method", filters.method);
  if (filters.gradeLevelId) params.append("gradeLevelId", filters.gradeLevelId);
  if (filters.classroomId) params.append("classroomId", filters.classroomId);
  if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.append("dateTo", filters.dateTo);

  return makeAuthenticatedRequest(
    `${API_BASE}/payments?${params.toString()}`,
    "GET"
  );
}

export async function createPayment(data: {
  studentId: string;
  feeScheduleId: string;
  amountCents: number;
  method?: string;
  reference?: string;
  paidAt?: string;
  dueDate?: string;
  notes?: string;
}) {
  return makeAuthenticatedRequest(`${API_BASE}/payments`, "POST", data);
}

export async function getPaymentAnalytics(
  filters: {
    gradeLevelId?: string;
    classroomId?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}
) {
  const params = new URLSearchParams();
  if (filters.gradeLevelId) params.append("gradeLevelId", filters.gradeLevelId);
  if (filters.classroomId) params.append("classroomId", filters.classroomId);
  if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.append("dateTo", filters.dateTo);

  return makeAuthenticatedRequest(
    `${API_BASE}/payments/analytics?${params.toString()}`,
    "GET"
  );
}

// ========================
// Parent-Student Relations
// ========================

export async function getParentStudents(parentId?: string) {
  const params = new URLSearchParams();
  if (parentId) params.append("parentId", parentId);

  return makeAuthenticatedRequest(
    `${API_BASE}/parent-students?${params.toString()}`,
    "GET"
  );
}

export async function linkParentToStudent(data: {
  parentProfileId: string;
  studentProfileId: string;
  relationship?: string;
}) {
  return makeAuthenticatedRequest(`${API_BASE}/parent-students`, "POST", data);
}

export async function unlinkParentFromStudent(id: string) {
  return makeAuthenticatedRequest(
    `${API_BASE}/parent-students/${id}`,
    "DELETE"
  );
}

// ========================
// Student Financial Overview
// ========================

export async function getStudentFinancialOverview(studentId: string) {
  return makeAuthenticatedRequest(
    `${API_BASE}/students/${studentId}/financial-overview`,
    "GET"
  );
}

export async function getParentFinancialOverview(parentId?: string) {
  return makeAuthenticatedRequest(
    `${API_BASE}/parents/${parentId || "me"}/financial-overview`,
    "GET"
  );
}
