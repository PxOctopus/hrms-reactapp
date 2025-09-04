import { useCallback, useEffect, useState } from "react";
import {
  getPendingLeaves,
  getLeavesAssignedByManager,
  getLeavesApprovedByManager,
  approveOrRejectLeave,
} from "../../lib/leaveApi";
import { Leave } from "../../types/Leave";
import { toast } from "react-toastify";

type View = "pending" | "assigned" | "approved";

export default function PendingLeaves() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("pending");

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        view === "pending"
          ? await getPendingLeaves()
          : view === "assigned"
          ? await getLeavesAssignedByManager()
          : await getLeavesApprovedByManager();
      setLeaves(data);
    } catch (error) {
      toast.error("Failed to fetch leave requests.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const onDecision = async (leaveId: number, approved: boolean) => {
    try {
      await approveOrRejectLeave(leaveId, approved);
      toast.success(`Leave ${approved ? "approved" : "rejected"}.`);
      fetchLeaves();
    } catch (error) {
      toast.error("Failed to update leave status.");
      console.error(error);
    }
  };

  return (
    <section className="space-y-4">
      <header className="px-2">
        <h1 className="text-2xl font-semibold tracking-tight">Leave Activity Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review, approve, or reject time off requests.
        </p>
      </header>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        {/* Tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { key: "pending", label: "Pending" },
            { key: "assigned", label: "Assigned by Me" },
            { key: "approved", label: "Approved by Me" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setView(t.key as View)}
              className={`rounded-xl px-4 py-2 text-sm ${
                view === t.key ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table / Empty / Loading */}
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : leaves.length === 0 ? (
          <div className="text-sm text-gray-500">No leave requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">End</th>
                  <th className="px-4 py-3">Reason</th>
                  {view === "pending" && <th className="px-4 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map((lv) => (
                  <tr key={lv.id} className="border-t">
                    <td className="px-4 py-3">{lv.employeeFullName}</td>
                    <td className="px-4 py-3">{lv.leaveDefinitionName}</td>
                    <td className="px-4 py-3">{lv.startDate}</td>
                    <td className="px-4 py-3">{lv.endDate}</td>
                    <td className="px-4 py-3">{lv.reason || "—"}</td>
                    {view === "pending" && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onDecision(lv.id, true)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onDecision(lv.id, false)}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
