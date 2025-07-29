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
import "react-toastify/dist/ReactToastify.css";

// Initialize toast
import { ToastContainer } from "react-toastify";

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch employees from API
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

  // Filter employees by name and status
  useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter((employee) =>
        employee.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((employee) => {
        if (statusFilter === "ACTIVE") return employee.isActive && !employee.isPendingApprovalByManager;
        if (statusFilter === "INACTIVE") return !employee.isActive && !employee.isPendingApprovalByManager;
        if (statusFilter === "PENDING") return employee.isPendingApprovalByManager;
        return true;
      });
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, employees]);

  // Approve employee
  const handleApprove = async (id: number) => {
    try {
      await approveEmployee(id);
      toast.success("Employee approved successfully.");
      await fetchEmployees();
    } catch (error) {
      toast.error("Approval failed.");
      console.error("Approval error:", error);
    }
  };

  // Reject employee
  const handleReject = async (id: number) => {
    try {
      await rejectEmployee(id);
      toast.info("Employee rejected.");
      await fetchEmployees();
    } catch (error) {
      toast.error("Rejection failed.");
      console.error("Rejection error:", error);
    }
  };

  // Delete employee
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await deleteEmployee(id);
      toast.success("Employee deleted successfully.");
      await fetchEmployees();
    } catch (error) {
      toast.error("Deletion failed.");
      console.error("Delete error:", error);
    }
  };

  // Toggle active/passive status
  const handleToggleStatus = async (id: number) => {
    try {
      await toggleEmployeeStatus(id);
      toast.success("Employee status updated.");
      await fetchEmployees();
    } catch (error) {
      toast.error("Failed to update employee status.");
      console.error("Toggle error:", error);
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Employee List</h2>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search by name..."
        className="mb-2 px-4 py-2 border border-gray-300 rounded w-full max-w-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Status filter */}
      <select
        className="ml-2 mb-4 px-4 py-2 border border-gray-300 rounded"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="ALL">All</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="PENDING">Pending</option>
      </select>

      <button
        className="ml-4 mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => navigate("/employees/new")}
      >
        Add New Employee
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : currentEmployees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <>
          <table className="w-full border-collapse border border-gray-300">
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
              {currentEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td className="border p-2">{employee.fullName}</td>
                  <td className="border p-2">{employee.email}</td>
                  <td className="border p-2">{employee.position}</td>
                  <td className="border p-2">
                    {employee.isPendingApprovalByManager
                      ? "Pending"
                      : employee.isActive
                      ? "Active"
                      : "Inactive"}
                  </td>
                  <td className="border p-2 space-x-2">
                    {!employee.isActive && (
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                        onClick={() => navigate(`/employees/edit/${employee.id}`)}
                      >
                        Edit
                      </button>
                    )}

                    {employee.isPendingApprovalByManager && (
                      <>
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded"
                          onClick={() => handleApprove(employee.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded"
                          onClick={() => handleReject(employee.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {!employee.isPendingApprovalByManager && (
                      <button
                        className={`px-3 py-1 text-white rounded ${
                          employee.isActive ? "bg-gray-500" : "bg-green-600"
                        }`}
                        onClick={() => handleToggleStatus(employee.id)}
                      >
                        {employee.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}

                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      onClick={() => handleDelete(employee.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="mt-4 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default EmployeeList;
