import client from "./axios";

// Lifecycle/status enums (must match backend)
export enum AssetStatus {
  IN_STOCK = "IN_STOCK",
  ASSIGNED = "ASSIGNED",
  ASSIGNED_CONFIRMED = "ASSIGNED_CONFIRMED",
  RETURN_REQUESTED = "RETURN_REQUESTED",
  MAINTENANCE = "MAINTENANCE",
  LOST = "LOST",
  RETIRE_REQUESTED = "RETIRE_REQUESTED", // NEW
  RETIRED = "RETIRED",
}

export enum AssetCondition {
  NEW = "NEW",
  USED = "USED",
}

export type AssetResponseDTO = {
  id: number;
  assetName: string;
  serialNumber?: string | null;
  status: AssetStatus;
  condition?: AssetCondition | null;
  employeeName?: string | null;
  category?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  location?: string | null;
  issueConfirmable?: boolean; 
};

export type EmployeeAssetResponseDTO = {
  id: number;
  name: string;
  serialNumber?: string | null;
  status: AssetStatus | string;
  confirmed: boolean;
  assignedDate?: string | null;
  category?: string | null;
};

// payloads...
export type AssetCreateRequest = {
  assetName: string;
  serialNumber: string;
  category?: string | null;
  description?: string | null;
  condition: AssetCondition;
  location?: string | null;
};

export type AssetConfirmRequestDTO = Record<string, never>;
export type AssetReturnRequestDTO = { reason: string };
export type AssetChangeStatusRequestDTO = { status: AssetStatus; note?: string };

// IMPORTANT: for retirement, send RETIRE_REQUESTED (not RETIRED) from employee
export type AssetIssueReportRequestDTO = { issueType: AssetStatus };

export const assetApi = {
  list: async (status?: AssetStatus) => {
    const q = status ? `?status=${status}` : "";
    const { data } = await client.get(`/assets${q}`);
    return data as AssetResponseDTO[];
  },
  create: async (payload: AssetCreateRequest) => {
    const { data } = await client.post(`/assets`, payload);
    return data as AssetResponseDTO;
  },
  update: async (id: number, payload: Partial<AssetCreateRequest>) => {
    const { data } = await client.put(`/assets/${id}`, payload);
    return data as AssetResponseDTO;
  },
  assign: async (id: number, payload: { employeeId: number; note?: string }) => {
    const { data } = await client.post(`/assets/${id}/assign`, payload);
    return data as AssetResponseDTO;
  },
  approveReturn: async (id: number) => {
    const { data } = await client.post(`/assets/${id}/approve-return`);
    return data as AssetResponseDTO;
  },
  changeStatus: async (id: number, req: AssetChangeStatusRequestDTO) => {
    const { data } = await client.post(`/assets/${id}/status`, req);
    return data as AssetResponseDTO;
  },
  archive: async (id: number) => {
    await client.post(`/assets/${id}/archive`); // 204
  },

  // Employee
  myAssets: async () => {
    const { data } = await client.get(`/assets/my`);
    return data as EmployeeAssetResponseDTO[];
  },
  confirm: async (id: number, req: AssetConfirmRequestDTO = {}) => {
    const { data } = await client.post(`/assets/${id}/confirm`, req);
    return data as AssetResponseDTO;
  },
  requestReturn: async (id: number, req: AssetReturnRequestDTO) => {
    const { data } = await client.post(`/assets/${id}/request-return`, req);
    return data as AssetResponseDTO;
  },
  cancelReturnRequest: async (id: number) => {
    const { data } = await client.post(`/assets/${id}/cancel-return-request`);
    return data as AssetResponseDTO;
  },
  // Report Issue: MAINTENANCE / LOST / RETIRE_REQUESTED
  reportIssue: async (id: number, req: AssetIssueReportRequestDTO) => {
    const { data } = await client.post(`/assets/${id}/report-issue`, req);
    return data as AssetResponseDTO;
  },
  // Undo for MAINTENANCE/LOST (never for RETIRED/RETIRE_REQUESTED)
  cancelIssueReport: async (id: number) => {
    const { data } = await client.post(`/assets/${id}/cancel-issue-report`);
    return data as AssetResponseDTO;
  },
};
