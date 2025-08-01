export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Leave {
  id: number;
  employeeId: number;
  employeeFullName?: string;
  leaveDefinitionName?: string;
  leaveDefinitionId?: number;
  reason: string;
  startDate: string;
  endDate: string;
  requestDate?: string;
  decisionDate?: string;
  status: LeaveStatus;
  managerNote?: string;
  managerFullName?: string;
  createdBy?: any;
}

export { };