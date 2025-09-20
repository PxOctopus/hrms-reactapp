import api from "./axios";
import {
  ExpenseCreateDTO,
  ExpenseResponseDTO,
  ExpenseUpdateDTO,
} from "../types/expense";
import type { PayrollAdjustment } from "../types/payroll";

/** Expenses API */
export const expensesApi = {
  // Employee
  listMy: (page = 0, size = 20) =>
    api.get<{ content: ExpenseResponseDTO[]; totalElements: number }>(
      "/expenses/my",
      { params: { page, size } }
    ),

  create: (payload: ExpenseCreateDTO) =>
    api.post<ExpenseResponseDTO>("/expenses", payload),

  update: (id: number, payload: ExpenseUpdateDTO) =>
    api.put<ExpenseResponseDTO>(`/expenses/${id}`, payload),

  submit: (id: number) =>
    api.post<ExpenseResponseDTO>(`/expenses/${id}/submit`, {}),

  withdraw: (id: number) =>
    api.post<ExpenseResponseDTO>(`/expenses/${id}/withdraw`, {}),

  remove: (id: number) => api.delete<void>(`/expenses/${id}`),

  // Manager
  /** status: "SUBMITTED" | "APPROVED" | "REJECTED" | undefined (ALL) */
  reviewQueue: (status?: string, page = 0, size = 20) =>
    api.get<{ content: ExpenseResponseDTO[]; totalElements: number }>(
      "/expenses/review",
      { params: { status, page, size } }
    ),

  approve: (id: number) =>
    api.post<ExpenseResponseDTO>(`/expenses/${id}/approve`, {}),

  reject: (id: number, reason: string) =>
    api.post<ExpenseResponseDTO>(`/expenses/${id}/reject`, { reason }),

  /** Finance/manager: mark approved expense as PAID */
  markPaid: (id: number) =>
    api.post<ExpenseResponseDTO>(`/expenses/${id}/mark-paid`, {}),

  // Optional: Employee payroll adjustments widget
  myAdjustments: (page = 0, size = 5) =>
    api.get<{ content: PayrollAdjustment[]; totalElements: number }>(
      "/payroll/adjustments/my",
      { params: { page, size } }
    ),
};
