// src/lib/shiftApi.ts
import axios from "./axios";
import type { Shift, ShiftAssignment, EmployeeLite } from "../types/shift";
import type { Leave } from "../types/Leave";

/**
 * Shift & Employee Shift API client
 *
 * Conventions:
 * - Company scoping is derived from the authenticated user on the backend.
 * - Times travel as "HH:mm".
 * - Dates travel as ISO "YYYY-MM-DD".
 */
export const shiftApi = {
  // ---------- Shifts (CRUD) ----------

  list: async (): Promise<Shift[]> => {
    const { data } = await axios.get(`/shifts`);
    return (data as any[]).map((s) => ({
      id: s.id,
      name: s.shiftName ?? s.name,
      startTime: s.startTime, // "HH:mm"
      endTime: s.endTime,     // "HH:mm"
      companyId: s.companyId,
    }));
  },

  get: async (id: number): Promise<Shift> => {
    const { data } = await axios.get(`/shifts/${id}`);
    return {
      id: data.id,
      name: data.shiftName ?? data.name,
      startTime: data.startTime,
      endTime: data.endTime,
      companyId: data.companyId,
    };
  },

  create: (payload: { name: string; startTime: string; endTime: string }) =>
    axios.post(`/shifts`, {
      shiftName: payload.name,
      startTime: payload.startTime,
      endTime: payload.endTime,
      // NOTE: companyId is resolved from the authenticated user on the server
    }),

  update: (id: number, payload: Partial<Shift>) =>
    axios.put(`/shifts/${id}`, {
      shiftName: payload.name,
      startTime: payload.startTime,
      endTime: payload.endTime,
    }),

  remove: (id: number) => axios.delete(`/shifts/${id}`),

  // ---------- Employee Shifts (single-day assignments) ----------

  assignOneDay: (payload: {
    employeeId: number;
    shiftId: number;
    shiftDate: string; // ISO YYYY-MM-DD
    active?: boolean;
  }) =>
    axios.post(`/employee-shifts`, {
      employeeId: payload.employeeId,
      shiftId: payload.shiftId,
      shiftDate: payload.shiftDate,
      active: payload.active ?? true,
    }),

  /** Simple list of all assignments for a given employee */
  listAssignmentsByEmployee: (employeeId: number) =>
    axios
      .get<ShiftAssignment[]>(`/employee-shifts`, { params: { employeeId } })
      .then((r) => r.data),

  /** Range list used by the manager weekly grid (denormalized start/end times) */
  listAssignmentsInRange: (employeeId: number, from: string, to: string) =>
    axios
      .get<ShiftAssignment[]>(`/employee-shifts/range`, { params: { employeeId, from, to } })
      .then((r) => r.data),

  /** Range list for the CURRENT employee (no employeeId in params) */
  listMyAssignmentsInRange: (from: string, to: string) =>
    axios
      .get<ShiftAssignment[]>(`/employee-shifts/mine/range`, { params: { from, to } })
      .then((r) => r.data),

  /** Soft-delete a single-day assignment (EmployeeShift) by its ID */
  removeAssignment: (assignmentId: number) =>
    axios.delete(`/employee-shifts/${assignmentId}`),

  // ---------- Employees (lite) ----------

  /**
   * Returns employees that are assignable (already filtered on backend):
   *  - active
   *  - not pending approval
   *  - user.enabled = true
   *  - user.emailVerified = true
   * Maps to a UI-friendly shape.
   */
  listEmployeesLite: async (): Promise<EmployeeLite[]> => {
    const { data } = await axios.get(`/employees/assignable`);
    return (data as Array<{ id: number; displayName?: string; email: string }>).map((e) => ({
      id: e.id,
      label: e.displayName ?? e.email, // fallback to email if full name is missing
      email: e.email,
      status: "ACTIVE", // assignable implies ACTIVE
    }));
  },

  // ---------- Leaves ----------

  /**
   * Fetch leaves for an employee in [from, to] (inclusive).
   * Use `status` to filter (e.g., "APPROVED"), or omit to retrieve ALL
   * (including "PENDING") so the UI can warn & disable saving.
   *
   * Backend should accept: GET /leaves?employeeId=&from=&to=&status=OPTIONAL
   */
  listLeaves: (employeeId: number, from: string, to: string, status?: Leave["status"]) =>
    axios
      .get<Leave[]>(`/leaves`, { params: { employeeId, from, to, ...(status ? { status } : {}) } })
      .then((r) => r.data),

  /** Back-compat helper when only APPROVED dates are required */
  listApprovedLeaves: (employeeId: number, from: string, to: string) =>
    axios
      .get<Leave[]>(`/leaves`, { params: { employeeId, from, to, status: "APPROVED" } })
      .then((r) => r.data),
};
