import api from "./axios";

/* =========================
 * Enums
 * ========================= */
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
  // Backend'de varsa açarsın:
  // REFURBISHED = "REFURBISHED",
}

/* =========================
 * Response DTOs
 * ========================= */

/** FULL DTO (manager/admin listeleri & aksiyon dönüşleri) */
export interface AssetResponseDTO {
  id: number;
  assetName: string;
  serialNumber?: string | null;
  category?: string | null;
  description?: string | null;

  status: AssetStatus;
  condition?: AssetCondition | null;

  employeeId?: number | null;
  employeeName?: string | null;
  managerId?: number | null;
  companyId?: number | null;

  assignedDate?: string | null; // ISO date (yyyy-mm-dd)
  confirmed: boolean;

  location?: string | null;
  createdAt: string;            // ISO datetime
  updatedAt: string;            // ISO datetime
}

/** SLIM DTO (employee /assets/my için) */
export interface EmployeeAssetResponseDTO {
  id: number;
  name: string;
  description?: string | null;

  serialNumber?: string | null;
  status: AssetStatus;
  confirmed: boolean;
  assignedDate?: string | null; // ISO date
}

export interface AssetEventResponseDTO {
  id: number;
  assetId: number;
  type: string;
  actorUserId?: number | null;
  metadataJson?: string | null;
  createdAt: string; // ISO datetime
}

export interface AssetMaintenanceResponseDTO {
  id: number;
  assetId: number;
  vendorName?: string | null;
  ticketNumber?: string | null;
  status: string; // "OPEN" | "DONE"
  notes?: string | null;
  openedDate: string; // ISO date
  closedDate?: string | null;
}

/* =========================
 * Request DTOs
 * ========================= */
export interface AssetCreateRequestDTO {
  assetName: string;
  serialNumber: string;
  category?: string | null;
  description?: string | null;
  condition?: AssetCondition | null;
  location?: string | null;
}

export interface AssetUpdateRequestDTO {
  assetName?: string;
  category?: string | null;
  description?: string | null;
  condition?: AssetCondition | null;
  location?: string | null;
}

export interface AssetAssignRequestDTO {
  employeeId: number;
  note?: string | null;
}

export interface AssetChangeStatusRequestDTO {
  status: AssetStatus;
  note?: string | null;
}

export interface AssetConfirmRequestDTO {
  note?: string | null;
}

export interface AssetReturnRequestDTO {
  reason?: string | null;
}

export interface MaintenanceOpenRequestDTO {
  vendorName?: string | null;
  notes?: string | null;
}

export interface MaintenanceCloseRequestDTO {
  notes?: string | null;
  restoreToAssigned: boolean;
}

/* =========================
 * API
 * ========================= */
export const assetApi = {
  // ------- Manager endpoints -------
  create: (body: AssetCreateRequestDTO) =>
    api.post<AssetResponseDTO>("/assets", body).then((r) => r.data),

  update: (id: number, body: AssetUpdateRequestDTO) =>
    api.put<AssetResponseDTO>(`/assets/${id}`, body).then((r) => r.data),

  list: (status?: AssetStatus) =>
    api.get<AssetResponseDTO[]>("/assets", { params: { status } }).then((r) => r.data),

  assign: (id: number, body: AssetAssignRequestDTO) =>
    api.post<AssetResponseDTO>(`/assets/${id}/assign`, body).then((r) => r.data),

  changeStatus: (id: number, body: AssetChangeStatusRequestDTO) =>
    api.post<AssetResponseDTO>(`/assets/${id}/status`, body).then((r) => r.data),

  approveReturn: (id: number) =>
    api.post<AssetResponseDTO>(`/assets/${id}/approve-return`, {}).then((r) => r.data),

  openMaintenance: (id: number, body: MaintenanceOpenRequestDTO) =>
    api.post<AssetMaintenanceResponseDTO>(`/assets/${id}/maintenance`, body).then((r) => r.data),

  // ------- Employee endpoints -------
  myAssets: () =>
    api.get<EmployeeAssetResponseDTO[]>("/assets/my").then((r) => r.data),

  confirm: (id: number, body: AssetConfirmRequestDTO) =>
    api.post<AssetResponseDTO>(`/assets/${id}/confirm`, body).then((r) => r.data),

  requestReturn: (id: number, body: AssetReturnRequestDTO) =>
    api.post<AssetResponseDTO>(`/assets/${id}/request-return`, body).then((r) => r.data),

  reportIssue: (id: number, body: { issueType: string; description?: string | null }) =>
    api.post<AssetResponseDTO>(`/assets/${id}/report-issue`, body).then((r) => r.data),

  // ------- Common -------
  events: (id: number) =>
    api.get<AssetEventResponseDTO[]>(`/assets/${id}/events`).then((r) => r.data),
};

/* =========================
 * React Query keys (opsiyonel)
 * ========================= */
export const assetKeys = {
  all: ["assets"] as const,
  list: (status?: AssetStatus) => [...assetKeys.all, "list", status] as const,
  my: () => [...assetKeys.all, "my"] as const,
  events: (id: number) => [...assetKeys.all, "events", id] as const,
};
