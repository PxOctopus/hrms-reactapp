import axios from "./axios";
import { Leave } from "../types/Leave";
import { LeaveDefinition } from "../types/LeaveDefinition";

// Get all leave types (visible to manager)
export const getLeaveDefinitions = async (): Promise<LeaveDefinition[]> => {
  const res = await axios.get("/leave-definitions");
  return res.data;
};

// Employee: Get own leaves
export const getMyLeaves = async (): Promise<Leave[]> => {
  const res = await axios.get("/leaves/my-leaves");
  return res.data;
};

// Manager: Get all leaves in company
export const getAllLeaves = async (): Promise<Leave[]> => {
  const res = await axios.get("/leaves");
  return res.data;
};

// Manager: Get leaves assigned by manager (they created for employees)
export const getLeavesAssignedByManager = async (): Promise<Leave[]> => {
  const res = await axios.get("/leaves/assigned-by-me");
  return res.data;
};

// Manager: Get leaves waiting for this manager's approval
export const getPendingLeaves = async (): Promise<Leave[]> => {
  const res = await axios.get("/leaves/pending");
  return res.data;
};

// Common: Create a new leave request
export const requestLeave = async (data: Partial<Leave>) => {
  await axios.post("/leaves", data);
};

// Manager: Approve or reject leave
export const approveOrRejectLeave = async (
  leaveId: number,
  approved: boolean
) => {
  await axios.post("/leaves/decision", { leaveId, approved });
};

export {};
