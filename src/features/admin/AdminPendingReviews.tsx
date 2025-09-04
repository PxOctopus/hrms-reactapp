// src/features/admin/AdminPendingReviews.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approveReview, rejectReview, fetchPendingManagerReviews } from "../../lib/reviewApi";

export default function AdminPendingReviews() {
  const qc = useQueryClient();

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["reviews","pending","manager"],
    queryFn: fetchPendingManagerReviews,
  });

  const approve = useMutation({
    mutationFn: (id: number) => approveReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews","pending","manager"] });
      qc.invalidateQueries({ queryKey: ["reviews","public"] }); // landing yenilensin
    },
  });

  const reject = useMutation({
    mutationFn: (id: number) => rejectReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews","pending","manager"] }),
  });

  if (isLoading) return <p className="p-4 text-gray-500">Loading…</p>;
  if (isError)   return <p className="p-4 text-red-500">Failed to load.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pending Reviews (Managers)</h2>

      {data.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-center text-gray-500">
          No pending manager reviews.
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map(r => (
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
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reject.mutate(r.id)}
                    className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700 disabled:opacity-50"
                    disabled={reject.isPending}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
