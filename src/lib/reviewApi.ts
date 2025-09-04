// src/lib/reviewApi.ts
import axios from "./axios";

export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Review = {
  id: number;
  title?: string | null;
  content: string;
  rating?: number | null;        // 1..5
  authorId: number;
  authorRole: Role;
  status: ReviewStatus;
  createdAt: string;             // ISO
  publishedAt?: string | null;   // ISO
  managerName?: string | null;   // bazı listelerde gösteriliyor
};

/* ---------- create (MANAGER) ---------- */
// Manager review gönderimi: her zaman PENDING olarak kaydedilir.
export async function createManagerReview(payload: {
  title?: string;
  content: string;
  rating?: number;               // 1..5
}): Promise<void> {
  await axios.post("/reviews", { ...payload, status: "PENDING" });
}

/* ---------- admin: pending (only MANAGER authored) ---------- */
export async function fetchPendingManagerReviews(): Promise<Review[]> {
  const { data } = await axios.get<Review[]>("/admin/reviews/pending", {
    params: { role: "MANAGER" },
  });
  return data ?? [];
}

export async function approveReview(id: number): Promise<void> {
  await axios.patch(`/admin/reviews/${id}/approve`);
}

export async function rejectReview(id: number): Promise<void> {
  await axios.patch(`/admin/reviews/${id}/reject`);
}

/* ---------- public (landing) ---------- */
export async function fetchPublicReviews(limit = 6): Promise<Review[]> {
  const { data } = await axios.get<Review[]>("/reviews/public", {
    params: { limit },
  });
  return data ?? [];
}

/* ---------- (opsiyonel) şirket içi listeleme için ---------- */
export type ReviewsListResponse = {
  items: Review[];
  total: number;
  page: number;
  pageSize: number;
};

export async function fetchCompanyReviews(params: {
  companyId?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  page?: number;
  pageSize?: number;
}): Promise<ReviewsListResponse> {
  const { data } = await axios.get<ReviewsListResponse>("/reviews", {
    params,
  });
  return (
    data ?? { items: [], total: 0, page: params.page ?? 1, pageSize: params.pageSize ?? 10 }
  );
}
