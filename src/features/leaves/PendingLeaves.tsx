import { useCallback, useEffect, useState } from "react";
import {
  getPendingLeaves,
  getLeavesAssignedByManager,
  getLeavesApprovedByManager, // ✅ yeni API fonksiyonu
  approveOrRejectLeave,
} from "../../lib/leaveApi";
import { Leave } from "../../types/Leave";
import { toast } from "react-toastify";

const PendingLeaves = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"pending" | "assigned" | "approved">("pending");

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        view === "pending"
          ? await getPendingLeaves()
          : view === "assigned"
          ? await getLeavesAssignedByManager()
          : await getLeavesApprovedByManager(); // ✅ yeni durum
      setLeaves(data);
    } catch (error) {
      toast.error("Failed to fetch leave requests");
      console.error(error);
    }
    setLoading(false);
  }, [view]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleDecision = async (leaveId: number, approved: boolean) => {
    try {
      await approveOrRejectLeave(leaveId, approved);
      toast.success(`Leave ${approved ? "approved" : "rejected"} successfully`);
      fetchLeaves();
    } catch (error) {
      toast.error("Failed to update leave status");
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Leave Requests</h2>

      {/* View Switch Buttons */}
      <div className="mb-4 space-x-2">
        <button
          className={`px-4 py-2 rounded ${
            view === "pending" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setView("pending")}
        >
          Pending Approvals
        </button>
        <button
          className={`px-4 py-2 rounded ${
            view === "assigned" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setView("assigned")}
        >
          Leaves I Assigned
        </button>
        <button
          className={`px-4 py-2 rounded ${
            view === "approved" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setView("approved")}
        >
          Leaves I Approved
        </button>
      </div>

      {/* Leave Table */}
      {loading ? (
        <p>Loading...</p>
      ) : leaves.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Employee</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Start</th>
              <th className="p-2 border">End</th>
              <th className="p-2 border">Reason</th>
              {view === "pending" && <th className="p-2 border">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id}>
                <td className="p-2 border">{leave.employeeFullName}</td>
                <td className="p-2 border">{leave.leaveDefinitionName}</td>
                <td className="p-2 border">{leave.startDate}</td>
                <td className="p-2 border">{leave.endDate}</td>
                <td className="p-2 border">{leave.reason}</td>
                {view === "pending" && (
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => handleDecision(leave.id, true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecision(leave.id, false)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingLeaves;
