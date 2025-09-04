export type Asset = {
  id: number;
  name: string;
  serial?: string;
  status: "ASSIGNED" | "AVAILABLE" | "LOST" | "REPAIR";
  assignedTo?: number; // employeeId
  assignedAt?: string; // ISO
  companyId: number;
};