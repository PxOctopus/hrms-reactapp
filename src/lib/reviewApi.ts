// src/lib/reviewApi.ts
// NOTE: Ensure axios baseURL is "/api" so calls hit the backend routes.

import axios from "./axios";
import type { Review, ReviewStatus, ReviewsListResponse } from "../types/review";

/* ------------------------------------------------------------------ */
/* CREATE (MANAGER)                                                   */
/* ------------------------------------------------------------------ */

/**
 * Submit a review as a manager.
 * Backend will always persist it with status = PENDING.
 */
export async function createManagerReview(payload: {
  title?: string;
  content: string;
  rating?: number; // 1..5
}): Promise<void> {
  await axios.post("/reviews", payload); // no need to send status
}

/* ------------------------------------------------------------------ */
/* ADMIN ACTIONS                                                      */
/* ------------------------------------------------------------------ */

/** Approve (publish) a review. */
export async function approveReview(id: number): Promise<void> {
  await axios.patch(`/admin/reviews/${id}/approve`);
}

/**
 * Reject a review with a reason.
 * Backend expects `{ reason: string }` in the request body.
 */
export async function rejectReview(id: number, reason: string): Promise<void> {
  await axios.patch(`/admin/reviews/${id}/reject`, { reason });
}

/* ------------------------------------------------------------------ */
/* PUBLIC (LANDING)                                                   */
/* ------------------------------------------------------------------ */

/**
 * Fetch public (published) reviews for the landing page.
 * The API returns up to Top N items (server-side); we optionally slice on client.
 */
export async function fetchPublicReviews(limit = 6): Promise<Review[]> {
  const { data } = await axios.get<Review[]>("/reviews/public");
  const list = data ?? [];
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

/* ------------------------------------------------------------------ */
/* DASHBOARD LISTING (ADMIN/MANAGER)                                  */
/* ------------------------------------------------------------------ */

/**
 * Generic listing used by admin/manager dashboards.
 * - Supports optional companyId (admin may browse all companies)
 * - Supports status filter: PENDING | PUBLISHED | REJECTED
 * - Uses server-side pagination via page/pageSize
 */
export async function fetchCompanyReviews(params: {
  companyId?: number;
  status?: ReviewStatus;
  page?: number;
  pageSize?: number;
}): Promise<ReviewsListResponse> {
  const { data } = await axios.get<ReviewsListResponse>("/reviews", { params });
  return (
    data ?? {
      items: [],
      total: 0,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    }
  );
}

/* ------------------------------------------------------------------ */
/* MANAGER: MY REVIEWS                                                */
/* ------------------------------------------------------------------ */

/**
 * Fetch reviews authored by the current manager (identified by auth token).
 * Useful for showing status and (if provided by backend) rejection reasons.
 */
export async function fetchMyReviews(params?: {
  page?: number;
  pageSize?: number;
}): Promise<ReviewsListResponse> {
  const { data } = await axios.get<ReviewsListResponse>("/reviews/mine", {
    params: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 10 },
  });
  return data ?? { items: [], total: 0, page: 1, pageSize: 10 };
}
