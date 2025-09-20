// src/features/admin/AdminPendingReviews.tsx
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { approveReview, rejectReview, fetchCompanyReviews } from "../../lib/reviewApi";
import type { Review, ReviewsListResponse } from "../../types/review";
import { useMemo, useState } from "react";

type HistoryStatus = "ALL" | "PUBLISHED" | "REJECTED";
type SortKey = "title" | "managerName" | "rating" | "status" | "createdAt";
type SortDir = "asc" | "desc";

export default function AdminPendingReviews() {
  const qc = useQueryClient();

  /* -------------------- Pending (top list) -------------------- */
  const [pagePending, setPagePending] = useState(1);
  const pageSizePending = 10;

  const { data: pendingData, isLoading: loadingPending, isError: errorPending } =
    useQuery<ReviewsListResponse>({
      queryKey: ["reviews", "pending", { page: pagePending, pageSizePending }],
      queryFn: () =>
        fetchCompanyReviews({ status: "PENDING", page: pagePending, pageSize: pageSizePending }),
      placeholderData: keepPreviousData,
    });

  /* -------------------- History (bottom table) -------------------- */
  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>("PUBLISHED");
  const [pageHistory, setPageHistory] = useState(1);
  const pageSizeHistory = 10;

  const { data: historyData, isLoading: loadingHistory, isError: errorHistory } =
    useQuery<ReviewsListResponse>({
      queryKey: ["reviews", "history", { historyStatus, pageHistory, pageSizeHistory }],
      queryFn: () =>
        fetchCompanyReviews({
          status: historyStatus === "ALL" ? undefined : historyStatus,
          page: pageHistory,
          pageSize: pageSizeHistory,
        }),
      placeholderData: keepPreviousData,
    });

  /* -------------------- Mutations -------------------- */
  const qcRefresh = () => {
    qc.invalidateQueries({ queryKey: ["reviews", "pending"] });
    qc.invalidateQueries({ queryKey: ["reviews", "history"] });
    qc.invalidateQueries({ queryKey: ["reviews", "public"] });
  };

  const approve = useMutation({
    mutationFn: (id: number) => approveReview(id),
    onSuccess: qcRefresh,
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectReview(id, reason),
    onSuccess: () => {
      setOpenReject(false);
      setRejectId(null);
      setReason("");
      qc.invalidateQueries({ queryKey: ["reviews", "pending"] });
      qc.invalidateQueries({ queryKey: ["reviews", "history"] });
    },
  });

  /* -------------------- Reject modal state -------------------- */
  const [openReject, setOpenReject] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const openRejectModal = (id: number) => {
    setRejectId(id);
    setReason("");
    setOpenReject(true);
  };
  const submitReject = () => {
    if (!rejectId) return;
    const msg = reason.trim();
    if (!msg) return;
    reject.mutate({ id: rejectId, reason: msg });
  };

  /* -------------------- Derived values -------------------- */
  const pendingRows: Review[] = pendingData?.items ?? [];
  const pendingTotal = pendingData?.total ?? 0;
  const pendingTotalPages = Math.max(1, Math.ceil(pendingTotal / pageSizePending));

  const historyRows: Review[] = historyData?.items ?? [];
  const historyTotal = historyData?.total ?? 0;
  const historyTotalPages = Math.max(1, Math.ceil(historyTotal / pageSizeHistory));

  /* -------------------- Sorting (client-side) -------------------- */
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    setPageHistory(1);
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedHistory = useMemo(() => {
    const rows = [...historyRows];
    rows.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const va =
        sortKey === "managerName"
          ? (a.managerName ?? "")
          : sortKey === "title"
          ? (a.title ?? "")
          : sortKey === "rating"
          ? (a.rating ?? 0)
          : sortKey === "status"
          ? (a.status ?? "")
          : a.createdAt;
      const vb =
        sortKey === "managerName"
          ? (b.managerName ?? "")
          : sortKey === "title"
          ? (b.title ?? "")
          : sortKey === "rating"
          ? (b.rating ?? 0)
          : sortKey === "status"
          ? (b.status ?? "")
          : b.createdAt;

      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      if (sa < sb) return -1 * dir;
      if (sa > sb) return 1 * dir;
      return 0;
    });
    return rows;
  }, [historyRows, sortKey, sortDir]);

  const SortBtn = ({ label, k }: { label: string; k: SortKey }) => {
    const active = sortKey === k;
    const arrow = !active ? "↕" : sortDir === "asc" ? "▲" : "▼";
    return (
      <button type="button" onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:underline">
        <span>{label}</span>
        <span className="text-xs">{arrow}</span>
      </button>
    );
  };

  /* -------------------- Render -------------------- */
  return (
    <div className="space-y-8">
      {/* Pending header + pagination */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pending Reviews</h2>

          <div className="flex items-center gap-2 text-sm">
            <button
              className="rounded-lg border px-2 py-1 disabled:opacity-50"
              onClick={() => setPagePending((p) => Math.max(1, p - 1))}
              disabled={pagePending <= 1 || loadingPending}
            >
              Prev
            </button>
            <span className="text-gray-600">Page {pagePending} / {pendingTotalPages}</span>
            <button
              className="rounded-lg border px-2 py-1 disabled:opacity-50"
              onClick={() => setPagePending((p) => Math.min(pendingTotalPages, p + 1))}
              disabled={pagePending >= pendingTotalPages || loadingPending}
            >
              Next
            </button>
          </div>
        </div>

        {loadingPending ? (
          <div className="rounded-xl border bg-white p-6 text-gray-500">Loading…</div>
        ) : errorPending ? (
          <div className="rounded-xl border bg-white p-6 text-rose-600">Failed to load.</div>
        ) : pendingRows.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 border border-gray-200" />
            <p className="mt-3 text-gray-600">No pending reviews.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {pendingRows.map((r) => (
              <li key={r.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{r.title ?? "Untitled"}</div>
                    <p className="mt-1 text-sm text-gray-700">{r.content}</p>
                    <div className="mt-1 text-xs text-gray-500">
                      Author: {r.managerName ?? "Manager"} • {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approve.mutate(r.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
                      disabled={approve.isPending}
                      title="Publish this review"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(r.id)}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700 disabled:opacity-50"
                      disabled={reject.isPending}
                      title="Reject with a reason"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* History filter + table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">History</h3>

        <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Status</label>
            <select
              className="rounded-lg border px-2 py-1 text-sm"
              value={historyStatus}
              onChange={(e) => {
                setHistoryStatus(e.target.value as HistoryStatus);
                setPageHistory(1);
              }}
            >
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
              <option value="ALL">All</option>
            </select>

            <div className="flex items-center gap-2 text-sm">
              <button
                className="rounded-lg border px-2 py-1 disabled:opacity-50"
                onClick={() => setPageHistory((p) => Math.max(1, p - 1))}
                disabled={pageHistory <= 1 || loadingHistory}
              >
                Prev
              </button>
              <span className="text-gray-600">Page {pageHistory} / {historyTotalPages}</span>
              <button
                className="rounded-lg border px-2 py-1 disabled:opacity-50"
                onClick={() => setPageHistory((p) => Math.min(historyTotalPages, p + 1))}
                disabled={pageHistory >= historyTotalPages || loadingHistory}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <th className="px-4 py-3">
                  <SortBtn label="Title" k="title" />
                </th>
                <th className="px-4 py-3">User Review</th>
                <th className="px-4 py-3">
                  <SortBtn label="Author" k="managerName" />
                </th>
                <th className="px-4 py-3">
                  <SortBtn label="Rating" k="rating" />
                </th>
                <th className="px-4 py-3">
                  <SortBtn label="Status" k="status" />
                </th>
                <th className="px-4 py-3">
                  <SortBtn label="Created" k="createdAt" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingHistory ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-gray-500">Loading…</td>
                </tr>
              ) : errorHistory ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-rose-600">Failed to load history.</td>
                </tr>
              ) : sortedHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-gray-500">No records.</td>
                </tr>
              ) : (
                sortedHistory.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{r.title ?? "—"}</td>

                    {/* Review column (2-line clamp + tooltip with full text) */}
                    <td className="px-4 py-3 max-w-[420px]">
                      <span title={r.content ?? ""} className="block overflow-hidden text-ellipsis line-clamp-2">
                        {r.content ?? "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3">{r.managerName ?? "Manager"}</td>
                    <td className="px-4 py-3">{r.rating ?? 5}</td>

                    {/* Status with tooltip + small info dot on REJECTED */}
                    <td className="px-4 py-3">
                      <span
                        title={
                          r.status === "REJECTED" && r.rejectionReason
                            ? `Reason: ${r.rejectionReason}`
                            : r.status ?? ""
                        }
                        aria-label={
                          r.status === "REJECTED" && r.rejectionReason
                            ? `Reason: ${r.rejectionReason}`
                            : r.status ?? ""
                        }
                        className={
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium " +
                          (r.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-700"
                            : r.status === "REJECTED"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-gray-100 text-gray-700")
                        }
                      >
                        {r.status ?? "—"}
                        {r.status === "REJECTED" && r.rejectionReason ? (
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                        ) : null}
                      </span>
                    </td>

                    <td className="px-4 py-3">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reject Modal */}
      {openReject && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Reject Review</h3>
            <p className="mt-1 text-sm text-gray-600">Please enter a reason for rejection. The manager will see this note.</p>

            <textarea
              className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
              rows={4}
              placeholder="Reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpenReject(false)} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={reject.isPending || !reason.trim()}
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {reject.isPending ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
