// src/lib/leaveApi.ts
import axios from "./axios";
import { Leave } from "../types/Leave";
import { LeaveDefinition } from "../types/LeaveDefinition";

/** Payload matching backend LeaveRequestDTO */
export type LeaveRequestPayload = {
  leaveDefinitionId: number;
  startDate: string;   // ISO yyyy-mm-dd
  endDate: string;     // ISO yyyy-mm-dd
  reason?: string;
  employeeId?: number; // required when manager assigns on behalf of employee
};

/** Payload used by overlap/quota checks (same shape as request) */
export type LeaveCheckPayload = LeaveRequestPayload;

/** Normalized response for quota check */
export type QuotaCheckResult = { ok: boolean; remainingDays?: number };

/** Employee's own allocation record (normalized) */
export type MyAllocation = {
  leaveDefinitionId: number;
  totalDays: number;
  usedDays: number;
};

// ---------------------- Definitions & Lists ----------------------

/** Get all leave definitions (active list is filtered on the client) */
export const getLeaveDefinitions = async (): Promise<LeaveDefinition[]> => {
  const res = await axios.get("/leave-definitions");
  return res.data;
};

/** Employee: get own leaves */
export const getMyLeaves = async (): Promise<Leave[]> => {
  const res = await axios.get("/leaves/my-leaves");
  return res.data;
};

/** Manager: get all leaves in company */
export const getAllLeaves = async (): Promise<Leave[]> => {
  const res = await axios.get("/leaves");
  return res.data;
};

/** Manager: leaves created/assigned by me */
export const getLeavesAssignedByManager = async (): Promise<Leave[]> => {
  const res = await axios.get("/leaves/assigned-by-me");
  return res.data;
};

/** Manager: pending leaves waiting for my approval */
export const getPendingLeaves = async (): Promise<Leave[]> => {
  const res = await axios.get("/leaves/pending");
  return res.data;
};

/** Manager: leaves I approved */
export const getLeavesApprovedByManager = async (): Promise<Leave[]> => {
  const res = await axios.get("/leaves/approved-by-me");
  return res.data;
};

/**
 * Employee: get my leave allocations (what manager assigned me).
 * change the path accordingly:
 *  - separate controller:  "/assigned-leaves/me"
 *  - inside LeaveController: "/leaves/allocations/me"
 */
export const getMyAllocations = async (): Promise<MyAllocation[]> => {
  const res = await axios.get("/leaves/allocations/me");
  const arr = Array.isArray(res.data) ? res.data : [];

  return arr.map((raw: any) => ({
    leaveDefinitionId:
      Number(
        raw.leaveDefinitionId ??
        raw.leave_definition_id ??
        raw.definitionId ??
        raw.definition_id
      ),
    totalDays: Number(raw.totalDays ?? raw.total_days ?? 0),
    usedDays: Number(raw.usedDays ?? raw.used_days ?? 0),
  })) as MyAllocation[];
};

// ---------------------- Mutations ----------------------

/** Create a new leave request (employee -> PENDING, manager -> APPROVED) */
export const requestLeave = async (data: LeaveRequestPayload): Promise<void> => {
  await axios.post("/leaves", data);
};

/** Approve or reject leave */
export const approveOrRejectLeave = async (
  leaveId: number,
  approved: boolean
): Promise<void> => {
  await axios.post("/leaves/decision", { leaveId, approved });
};

// ---------------------- Pre-checks (UI live validation) ----------------------

/**
 * Returns true if dates overlap with an existing leave.
 * Backend may return a boolean or an object like { overlap: boolean } — both are handled.
 */
export const checkLeaveOverlap = async (payload: LeaveCheckPayload): Promise<boolean> => {
  const { data } = await axios.post("/leaves/check/overlap", payload);
  if (typeof data === "boolean") return data;
  if (data && typeof data.overlap === "boolean") return data.overlap;
  return false;
};

/**
 * Quota check: normalized { ok, remainingDays }.
 * Backend may return:
 *  - boolean
 *  - { ok, remainingDays }
 *  - { ok, remaining_days }  // snake_case
 */
export const checkLeaveQuota = async (payload: LeaveCheckPayload): Promise<QuotaCheckResult> => {
  const { data } = await axios.post("/leaves/check/quota", payload);

  if (typeof data === "boolean") return { ok: data };

  if (data && typeof data.ok === "boolean") {
    const remaining =
      data.remainingDays ??
      data.remaining_days ??
      data.remaining ??
      undefined;

    return {
      ok: data.ok,
      remainingDays: typeof remaining === "number" ? remaining : undefined,
    };
  }

  // Fallback: unknown shape → treat as ok; server will still validate on submit
  return { ok: true };
};

export {};
