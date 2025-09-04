import { useEffect, useState } from "react";
import {
  getPendingManagers,
  approveManagerCompany,
  rejectManagerCompany,
} from "../../lib/adminApi";
import { toast } from "react-toastify";
import { PendingManager } from "../../types/User";
import { Check, X, Loader2 } from "lucide-react";

type ActionState = { id: number | null; kind: "approve" | "reject" | null };

const PendingManagerList = () => {
  const [managers, setManagers] = useState<PendingManager[]>([]);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<ActionState>({ id: null, kind: null });

  const fetchPendingManagers = async () => {
    setLoading(true);
    try {
      const data = await getPendingManagers();
      setManagers(data);
    } catch {
      toast.error("Failed to fetch pending managers.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    setAction({ id: userId, kind: "approve" });
    try {
      await approveManagerCompany(userId);
      toast.success("Manager approved and company created.");
      fetchPendingManagers();
    } catch {
      toast.error("Failed to approve manager.");
    } finally {
      setAction({ id: null, kind: null });
    }
  };

  const handleReject = async (userId: number) => {
    if (!window.confirm("Reject this manager application?")) return;

    setAction({ id: userId, kind: "reject" });
    try {
      await rejectManagerCompany(userId);
      toast.success("Manager rejected and deleted.");
      fetchPendingManagers();
    } catch {
      toast.error("Failed to reject manager.");
    } finally {
      setAction({ id: null, kind: null });
    }
  };

  useEffect(() => {
    fetchPendingManagers();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
        <h2 className="text-xl font-semibold text-gray-900">
          Pending Company Approvals
        </h2>
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {loading ? "…" : managers.length} pending
        </span>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading…</span>
          </div>
        ) : managers.length === 0 ? (
          <div className="text-center text-gray-600">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gray-100" />
            <p className="text-sm">No pending approvals.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Full Name</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Email</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Company Name</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {managers.map((m, idx) => {
                  const isRowLoading = action.id === m.userId;
                  return (
                    <tr
                      key={m.userId}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <td className="px-4 py-3 text-gray-900">{m.fullName}</td>
                      <td className="px-4 py-3 text-gray-700">{m.email}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {m.pendingCompanyName}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(m.userId)}
                            disabled={isRowLoading}
                            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60"
                          >
                            {isRowLoading && action.kind === "approve" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            Approve
                          </button>

                          <button
                            onClick={() => handleReject(m.userId)}
                            disabled={isRowLoading}
                            className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-60"
                          >
                            {isRowLoading && action.kind === "reject" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingManagerList;
