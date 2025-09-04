import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllEmployees,
  approveEmployee,
  rejectEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
} from "../../lib/employeeApi";
import { Employee } from "../../types/Employee";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "PENDING";

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = user?.role === "MANAGER";

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getAllEmployees();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      toast.error("Failed to fetch employees.");
      console.error("fetchEmployees error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local filter & search
  useEffect(() => {
    let filtered = employees;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((emp) => emp.fullName.toLowerCase().includes(q));
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((emp) => {
        if (statusFilter === "ACTIVE") return emp.isActive && !emp.pendingApprovalByManager;
        if (statusFilter === "INACTIVE") return !emp.isActive && !emp.pendingApprovalByManager;
        if (statusFilter === "PENDING") return !!emp.pendingApprovalByManager;
        return true;
      });
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, employees]);

  const handleApprove = async (id: number) => {
    try {
      await approveEmployee(id);
      toast.success("Employee approved.");
      fetchEmployees();
    } catch (err) {
      toast.error("Approval failed.");
      console.error(err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectEmployee(id);
      toast.info("Employee rejected.");
      fetchEmployees();
    } catch (err) {
      toast.error("Rejection failed.");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await deleteEmployee(id);
      toast.success("Employee deleted.");
      fetchEmployees();
    } catch (err) {
      toast.error("Deletion failed.");
      console.error(err);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleEmployeeStatus(id);
      fetchEmployees();
    } catch (err) {
      toast.error("Status update failed.");
      console.error(err);
    }
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="px-1">
        <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search, filter, and manage your team members.
        </p>
      </header>

      {/* Filters / actions card */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name…"
              className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="w-40 rounded-lg border px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {isManager && (
            <button
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              onClick={() => navigate("/employees/new")}
            >
              Add New Employee
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : currentEmployees.length === 0 ? (
          <div className="text-sm text-gray-500">No employees found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.map((emp) => (
                  <tr key={emp.id} className="border-t align-top">
                    <td className="px-4 py-3">{emp.fullName}</td>
                    <td className="px-4 py-3">{emp.email}</td>
                    <td className="px-4 py-3">{emp.position || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border px-2 py-0.5 text-xs">
                        {emp.pendingApprovalByManager
                          ? "Pending"
                          : emp.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {emp.pendingApprovalByManager ? (
                          isManager && (
                            <>
                              <button
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                                onClick={() => handleApprove(emp.id)}
                              >
                                Approve
                              </button>
                              <button
                                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                                onClick={() => handleReject(emp.id)}
                              >
                                Reject
                              </button>
                            </>
                          )
                        ) : (
                          isManager && (
                            <>
                              <button
                                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
                                onClick={() => navigate(`/employees/${emp.id}/edit`)}
                              >
                                Edit
                              </button>

                              {emp.isActive ? (
                                <button
                                  className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                                  onClick={() => handleToggleStatus(emp.id)}
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                                  onClick={() => handleToggleStatus(emp.id)}
                                >
                                  Activate
                                </button>
                              )}

                              <button
                                className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600"
                                onClick={() => handleDelete(emp.id)}
                              >
                                Delete
                              </button>
                            </>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
