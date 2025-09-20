import { useEffect, useMemo, useState } from "react";
import axios from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";

/**
 * Table to list company reviews on the dashboard (authenticated area).
 * - Reads reviews by current user's company
 * - Supports status filter and simple pagination
 * - Read-only by default; writing is at /reviews/write (MANAGER only)
 */

type ReviewRow = {
  id: number;
  title?: string | null;
  content: string;
  rating?: number | null;     // 1..5
  managerName: string;
  status?: "PUBLISHED" | "PENDING" | "REJECTED";
  createdAt: string;
};

type ApiResponse = {
  items: ReviewRow[];
  total: number;
  page: number;
  pageSize: number;
};

export default function ReviewsTable() {
  const { user } = useAuth();
  const companyId = user?.company?.id ?? 0; // ADMIN'de null olabilir, bu yüzden güvenli

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [total, setTotal] = useState(0);

  // simple controls
  const [status, setStatus] = useState<"" | "PUBLISHED" | "PENDING" | "REJECTED">("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // fetch on filter/page change
  useEffect(() => {
    let ignore = false;
    setLoading(true);

    // Example API: /api/reviews?companyId=1&status=PUBLISHED&page=1&pageSize=10
    axios
      .get<ApiResponse>("/reviews", {
        params: {
          companyId: companyId || undefined,
          status: status || undefined,
          page,
          pageSize,
        },
      })
      .then((res) => {
        if (ignore) return;
        setRows(res.data.items ?? []);
        setTotal(res.data.total ?? 0);
      })
      .catch(() => {
        if (ignore) return;
        setRows([]);
        setTotal(0);
      })
      .finally(() => {
        if (ignore) return;
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [companyId, status, page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total]
  );

  return (
    <div className="rounded-2xl border bg-white">
      <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="font-semibold">Company Reviews</div>
        <div className="flex items-center gap-2">
          {/* status filter */}
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as any);
            }}
            className="rounded-lg border px-2 py-1 text-sm"
          >
            <option value="">All</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* pagination */}
          <div className="ml-2 flex items-center gap-2 text-sm">
            <button
              className="rounded-lg border px-2 py-1 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Prev
            </button>
            <span className="text-gray-600">
              Page {page} / {totalPages}
            </span>
            <button
              className="rounded-lg border px-2 py-1 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-sm text-gray-500">Loading reviews...</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-gray-500">No reviews found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Content</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t align-top">
                    <td className="px-4 py-3">{r.title || "—"}</td>
                    <td className="px-4 py-3">
                      <p className="line-clamp-3 max-w-[500px] text-gray-700">
                        {r.content}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {/* simple stars */}
                      <div aria-label={`Rating ${r.rating ?? 5} out of 5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < (r.rating ?? 5) ? "⭐" : "☆"}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">{r.managerName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border px-2 py-0.5 text-xs">
                        {r.status || "PUBLISHED"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
