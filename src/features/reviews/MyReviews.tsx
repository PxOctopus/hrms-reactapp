import { useMemo, useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { fetchMyReviews } from "../../lib/reviewApi";
import type { Review, ReviewsListResponse } from "../../types/review";
import WriteReviewForm from "./WriteReviewForm";

// mui rating
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";

export default function MyReviews() {
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError } = useQuery<ReviewsListResponse>({
    queryKey: ["my-reviews", { page, pageSize }],
    queryFn: () => fetchMyReviews({ page, pageSize }),
    placeholderData: keepPreviousData,
  });

  const rows: Review[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const handleSubmitted = () => {
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["my-reviews"] });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">My Reviews</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create and track your reviews. Submissions are published on the landing page{" "}
          <span className="font-medium">after admin approval</span>.
        </p>
      </header>

      <div className="flex items-center justify-end">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Write a Review
        </button>
      </div>

      <div className="rounded-2xl border bg-white">
        <div className="p-4">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : isError ? (
            <div className="text-sm text-rose-600">Failed to load.</div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-500">
              You haven't submitted any reviews yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {rows.map((r) => (
                <li key={r.id} className="rounded-xl border bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{r.title ?? "Untitled"}</div>
                      <p className="mt-1 text-sm text-gray-700">{r.content}</p>
                      <div className="mt-1 text-xs text-gray-500">
                        Status:{" "}
                        <span
                          className={
                            "inline-flex rounded-full px-2 py-0.5 " +
                            (r.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-700"
                              : r.status === "REJECTED"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-gray-100 text-gray-700")
                          }
                        >
                          {r.status ?? "PENDING"}
                        </span>{" "}
                        • {new Date(r.createdAt).toLocaleString()}
                        {r.status === "REJECTED" && r.rejectionReason ? (
                          <span className="ml-2 text-rose-600">Reason: {r.rejectionReason}</span>
                        ) : null}
                      </div>
                    </div>

                    {/* MUI Rating for display (read-only) */}
                    <Rating
                      name="read-only"
                      value={r.rating ?? 5}
                      precision={0.5}
                      readOnly
                      emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 pb-4 text-sm">
          <button
            className="rounded-lg border px-2 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
          >
            Prev
          </button>
          <span className="text-gray-600">Page {page} / {totalPages}</span>
          <button
            className="rounded-lg border px-2 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
          >
            Next
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
              <div>
                <h2 id="drawer-title" className="text-lg font-semibold">Write a Review</h2>
                <p className="text-xs text-gray-500">Your review will be published after admin approval.</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
                Close
              </button>
            </div>
            <div className="p-5">
              <WriteReviewForm onSubmitted={handleSubmitted} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
