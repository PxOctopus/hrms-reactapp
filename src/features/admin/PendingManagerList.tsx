import { useEffect, useState } from "react";
import {
  getPendingManagers,
  approveManagerCompany,
  rejectManagerCompany,
} from "../../lib/adminApi";
import { toast } from "react-toastify";
import { PendingManager } from "../../types/User"; 

const PendingManagerList = () => {
  const [managers, setManagers] = useState<PendingManager[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingManagers = async () => {
    setLoading(true);
    try {
      const data = await getPendingManagers();
      setManagers(data);
    } catch (error) {
      toast.error("Failed to fetch pending managers.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      await approveManagerCompany(userId);
      toast.success("Manager approved and company created.");
      fetchPendingManagers();
    } catch (error) {
      toast.error("Failed to approve manager.");
    }
  };

  const handleReject = async (userId: number) => {
    try {
      await rejectManagerCompany(userId);
      toast.success("Manager rejected and deleted.");
      fetchPendingManagers();
    } catch (error) {
      toast.error("Failed to reject manager.");
    }
  };

  useEffect(() => {
    fetchPendingManagers();
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Pending Company Approvals</h2>
      {loading ? (
        <p>Loading...</p>
      ) : managers.length === 0 ? (
        <p>No pending approvals.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Full Name</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Company Name</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {managers.map((manager) => (
              <tr key={manager.userId}>
                <td className="border p-2">{manager.fullName}</td>
                <td className="border p-2">{manager.email}</td>
                <td className="border p-2">{manager.pendingCompanyName}</td>
                <td className="border p-2 space-x-2">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() => handleApprove(manager.userId)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleReject(manager.userId)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingManagerList;
