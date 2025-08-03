import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllEmployees,
  getPendingEmployees,
  approveEmployee,
  rejectEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
} from "../../lib/employeeApi";
import { Employee } from "../../types/Employee";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // Access current user info

  // Fetch all employees from API
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getAllEmployees();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      toast.error("Failed to fetch employees.");
      console.error("Fetch error:", error);
    }
    setLoading(false);
  };

  // Apply search and filter
  useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter((emp) =>
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((emp) => {
        if (statusFilter === "ACTIVE") return emp.active && !emp.pendingApprovalByManager;
        if (statusFilter === "INACTIVE") return !emp.active && !emp.pendingApprovalByManager;
        if (statusFilter === "PENDING") return emp.pendingApprovalByManager;
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
      await fetchEmployees();
    } catch (err) {
      toast.error("Approval failed.");
      console.error(err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectEmployee(id);
      toast.info("Employee rejected.");
      await fetchEmployees();
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
      await fetchEmployees();
    } catch (err) {
      toast.error("Deletion failed.");
      console.error(err);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleEmployeeStatus(id);
      toast.success("Employee status updated.");
      await fetchEmployees();
    } catch (err) {
      toast.error("Status update failed.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Employee List</h2>

      <div className="flex flex-wrap gap-4 items-center mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          className="px-4 py-2 border border-gray-300 rounded w-full max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="px-4 py-2 border border-gray-300 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="PENDING">Pending</option>
        </select>

        {user?.role === "MANAGER" && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate("/employees/new")}
          >
            Add New Employee
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : currentEmployees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <>
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Position</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td className="border p-2">{emp.fullName}</td>
                  <td className="border p-2">{emp.email}</td>
                  <td className="border p-2">{emp.position}</td>
                  <td className="border p-2">
                    {emp.pendingApprovalByManager
                      ? "Pending"
                      : emp.active
                        ? "Active"
                        : "Inactive"}
                  </td>
                  <td className="border p-2 space-x-2">
                    {emp.pendingApprovalByManager ? (
                      <>
                        {user?.role === "MANAGER" && (
                          <>
                            <button
                              className="px-3 py-1 bg-green-600 text-white rounded"
                              onClick={() => handleApprove(emp.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="px-3 py-1 bg-red-600 text-white rounded"
                              onClick={() => handleReject(emp.id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {user?.role === "MANAGER" && (
                          <>
                            <button
                              className="px-3 py-1 bg-yellow-500 text-white rounded"
                              onClick={() => navigate(`/employees/${emp.id}/edit`)}
                            >
                              Edit
                            </button>

                            <button
                              className={`px-3 py-1 text-white rounded ${emp.active ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"}`}
                              onClick={() => handleToggleStatus(emp.id)}
                            >
                              {emp.active ? "Deactivate" : "Activate"}
                            </button>

                            <button
                              className="px-3 py-1 bg-red-500 text-white rounded"
                              onClick={() => handleDelete(emp.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-black"
                  }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default EmployeeList;
