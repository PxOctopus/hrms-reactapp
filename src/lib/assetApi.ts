// src/lib/assetApi.ts
import client from "./axios";

// Lifecycle/status enums (must match backend)
export enum AssetStatus {
  IN_STOCK = "IN_STOCK",
  ASSIGNED = "ASSIGNED",
  ASSIGNED_CONFIRMED = "ASSIGNED_CONFIRMED",
  RETURN_REQUESTED = "RETURN_REQUESTED",
  MAINTENANCE = "MAINTENANCE",
  LOST = "LOST",
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

  // (optional) may be provided by BE enrichment; used as a UI guard
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

// Create/update payloads
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

// FE → BE minimal payload (issueType = target status)
export type AssetIssueReportRequestDTO = { issueType: AssetStatus };

export const assetApi = {
  // ---------- Manager ----------
  list: async (status?: AssetStatus): Promise<AssetResponseDTO[]> => {
    const q = status ? `?status=${status}` : "";
    const { data } = await client.get(`/assets${q}`);
    return data;
  },

  create: async (payload: AssetCreateRequest): Promise<AssetResponseDTO> => {
    const { data } = await client.post(`/assets`, payload);
    return data;
  },

  update: async (id: number, payload: Partial<AssetCreateRequest>): Promise<AssetResponseDTO> => {
    const { data } = await client.put(`/assets/${id}`, payload);
    return data;
  },

  assign: async (id: number, payload: { employeeId: number; note?: string }): Promise<AssetResponseDTO> => {
    const { data } = await client.post(`/assets/${id}/assign`, payload);
    return data;
  },

  approveReturn: async (id: number): Promise<AssetResponseDTO> => {
    const { data } = await client.post(`/assets/${id}/approve-return`);
    return data;
  },

  changeStatus: async (id: number, req: AssetChangeStatusRequestDTO): Promise<AssetResponseDTO> => {
    const { data } = await client.post(`/assets/${id}/status`, req);
    return data;
  },

  // NEW: archive (soft delete) — backend returns 204 No Content
  archive: async (id: number): Promise<void> => {
    await client.post(`/assets/${id}/archive`);
  },

  // ---------- Employee ----------
  myAssets: async (): Promise<EmployeeAssetResponseDTO[]> => {
    const { data } = await client.get(`/assets/my`);
    return data;
  },

  confirm: async (id: number, req: AssetConfirmRequestDTO = {}): Promise<AssetResponseDTO> => {
    const { data } = await client.post(`/assets/${id}/confirm`, req);
    return data;
  },

  requestReturn: async (id: number, req: AssetReturnRequestDTO): Promise<AssetResponseDTO> => {
    const { data } = await client.post(`/assets/${id}/request-return`, req);
    return data;
  },

  // Undo return request
  cancelReturnRequest: async (id: number): Promise<AssetResponseDTO> => {
    const { data } = await client.post(`/assets/${id}/cancel-return-request`);
    return data;
  },

  // Report Issue (MAINTENANCE / LOST / RETIRED)
  reportIssue: async (id: number, req: AssetIssueReportRequestDTO): Promise<AssetResponseDTO> => {
    const { data } = await client.post(`/assets/${id}/report-issue`, req);
    return data;
  },

  // Undo issue report (BE rule: allowed for MAINTENANCE & LOST; never for RETIRED)
  cancelIssueReport: async (id: number): Promise<AssetResponseDTO> => {
    const { data } = await client.post(`/assets/${id}/cancel-issue-report`);
    return data;
  },
};
