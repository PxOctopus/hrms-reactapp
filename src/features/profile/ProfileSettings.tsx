import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, updateUserProfile } from "../../lib/userApi";
import { PendingManager, UserProfile } from "../../types/User";
import {
  getPendingManagers,
  approveManagerCompany,
  rejectManagerCompany,
} from "../../lib/adminApi";
import {
  getPendingEmployees,
  approveEmployee,
  rejectEmployee,
} from "../../lib/employeeApi";
import { Employee } from "../../types/Employee";
import { toast } from "react-toastify";
import ProfileInfo from "../../components/profile/ProfileInfo";
import ProfileUpdateForm from "../../components/profile/ProfileUpdateForm";

const ProfileSettings = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pendingManagers, setPendingManagers] = useState<PendingManager[]>([]);
  const [pendingEmployees, setPendingEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);

        if (userData.role === "ADMIN") {
          const managers = await getPendingManagers();
          setPendingManagers(managers);
        } else if (userData.role === "MANAGER") {
          const employees = await getPendingEmployees();
          setPendingEmployees(employees);
        }
      } catch (error) {
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveManager = async (userId: number) => {
    try {
      await approveManagerCompany(userId);
      toast.success("Manager approved successfully.");
      const updated = await getPendingManagers();
      setPendingManagers(updated);
    } catch (error) {
      toast.error("Manager approval failed.");
    }
  };

  const handleRejectManager = async (userId: number) => {
    try {
      await rejectManagerCompany(userId);
      toast.success("Manager rejected.");
      const updated = await getPendingManagers();
      setPendingManagers(updated);
    } catch (error) {
      toast.error("Manager rejection failed.");
    }
  };

  const handleApproveEmployee = async (id: number) => {
    try {
      await approveEmployee(id);
      toast.success("Employee approved successfully.");
      const updated = await getPendingEmployees();
      setPendingEmployees(updated);
    } catch (error) {
      toast.error("Employee approval failed.");
    }
  };

  const handleRejectEmployee = async (id: number) => {
    try {
      await rejectEmployee(id);
      toast.success("Employee rejected.");
      const updated = await getPendingEmployees();
      setPendingEmployees(updated);
    } catch (error) {
      toast.error("Employee rejection failed.");
    }
  };

  if (loading) {
    return <p className="text-center mt-8 text-gray-500">Loading profile...</p>;
  }

  if (!user) {
    return (
      <p className="text-center mt-8 text-red-500">Failed to load profile.</p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-10">
      <div className="bg-white shadow p-6 rounded space-y-6">
        <h2 className="text-xl font-bold mb-2">Your Profile</h2>
        <ProfileInfo user={user} />
        <ProfileUpdateForm user={user} onUpdate={setUser} />
      </div>

      {(user.role === "EMPLOYEE" || user.role === "MANAGER") && (
        <div className="flex justify-end">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
            onClick={() => navigate("/leaves")}
          >
            Manage Leave Requests
          </button>
        </div>
      )}

      {user.role === "MANAGER" && user.companyApproved && (
        <div className="flex justify-end space-x-4">
          <button
            className="bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-700 transition"
            onClick={() => navigate("/employees")}
          >
            Manage Employees
          </button>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
            onClick={() => navigate("/pending-leaves")}
          >
            View Leaves
          </button>
        </div>
      )}

      {user.role === "ADMIN" && (
        <div className="bg-white p-6 shadow rounded">
          <h2 className="text-xl font-bold mb-4">Pending Manager Approvals</h2>
          {pendingManagers.length === 0 ? (
            <p className="text-gray-500">No pending managers.</p>
          ) : (
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border-b">Full Name</th>
                  <th className="p-2 border-b">Email</th>
                  <th className="p-2 border-b">Pending Company</th>
                  <th className="p-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingManagers.map((manager) => (
                  <tr key={manager.userId} className="border-t">
                    <td className="p-2">{manager.fullName}</td>
                    <td className="p-2">{manager.email}</td>
                    <td className="p-2">{manager.pendingCompanyName}</td>
                    <td className="p-2 space-x-2">
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        onClick={() => handleApproveManager(manager.userId)}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleRejectManager(manager.userId)}
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
      )}

      {user.role === "MANAGER" && (
        <div className="bg-white p-6 shadow rounded">
          <h2 className="text-xl font-bold mb-4">Pending Employee Approvals</h2>
          <p className="mb-2 text-gray-600 text-sm">
            The employees awaiting your approval are listed below.
          </p>
          {pendingEmployees.length === 0 ? (
            <p className="text-gray-500">No pending employees.</p>
          ) : (
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border-b">Full Name</th>
                  <th className="p-2 border-b">Email</th>
                  <th className="p-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingEmployees.map((emp) => (
                  <tr key={emp.id} className="border-t">
                    <td className="p-2">{emp.fullName}</td>
                    <td className="p-2">{emp.email}</td>
                    <td className="p-2 space-x-2">
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        onClick={() => handleApproveEmployee(emp.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleRejectEmployee(emp.id)}
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
      )}
    </div>
  );
};

export default ProfileSettings;
