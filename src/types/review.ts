export type ReviewStatus = "PENDING" | "PUBLISHED" | "REJECTED";

export type Review = {
  id: number;
  title?: string | null;
  content: string;
  rating?: number | null;        // 1..5
  managerName?: string | null;   // shown in public/dashboard lists
  status?: ReviewStatus;         // optional in some DTOs (e.g., public)
  createdAt: string;             // ISO timestamp
  publishedAt?: string | null;   // ISO timestamp (only when PUBLISHED)
  rejectionReason?: string | null; // present when REJECTED (if backend includes it)
};

export type ReviewsListResponse = {
  items: Review[];
  total: number;
  page: number;
  pageSize: number;
};
