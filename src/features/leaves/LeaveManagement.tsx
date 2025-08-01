import { useEffect, useState, useCallback } from "react";
import {
  getMyLeaves,
  requestLeave,
  getLeaveDefinitions,
} from "../../lib/leaveApi";
import { getAllEmployees } from "../../lib/employeeApi";
import { useAuth } from "../../context/AuthContext";
import { Leave } from "../../types/Leave";
import { Employee } from "../../types/Employee";
import { LeaveDefinition } from "../../types/LeaveDefinition";
import { toast } from "react-toastify";

const LeaveManagement = () => {
  const { user } = useAuth(); // Access the logged-in user from context

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveDefinitions, setLeaveDefinitions] = useState<LeaveDefinition[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch leave records only for employees
  const fetchLeaves = useCallback(async () => {
    if (user?.role === "EMPLOYEE") {
      setLoading(true);
      try {
        const data = await getMyLeaves();
        setLeaves(data);
      } finally {
        setLoading(false);
      }
    }
  }, [user?.role]);

  // Fetch employees and leave definitions based on user role
  useEffect(() => {
    const init = async () => {
      if (!user) return;

      if (user.role === "MANAGER") {
        const [employeeList, definitions] = await Promise.all([
          getAllEmployees(),
          getLeaveDefinitions(),
        ]);
        setEmployees(employeeList);
        setLeaveDefinitions(definitions.filter((def) => def.active));
      } else {
        const defs = await getLeaveDefinitions();
        setLeaveDefinitions(defs.filter((def) => def.active));
      }
    };

    init();
  }, [user]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Handle leave form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form input
    if (!leaveType) return setError("Please select a leave type.");
    if (!startDate || !endDate) return setError("Please enter both dates.");
    if (user?.role === "MANAGER" && !selectedEmployeeId)
      return setError("Please select an employee.");

    setError(null);
    try {
      // Send leave request
      await requestLeave({
        leaveDefinitionId: Number(leaveType),
        startDate,
        endDate,
        reason,
        ...(user?.role === "MANAGER" && { employeeId: Number(selectedEmployeeId) }),
      });

      // Reset form fields
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      setSelectedEmployeeId("");
      fetchLeaves();

      // Show success toast
      if (user?.role === "MANAGER") {
        toast.success("Leave assigned successfully to employee.");
      } else {
        toast.success("Your leave request has been sent to your manager.");
      }
    } catch (err) {
      setError("Failed to submit leave request.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {user?.role === "EMPLOYEE" ? "Request Leave" : "Assign Leave to Employee"}
      </h2>

      {/* Leave history for employees */}
      {user?.role === "EMPLOYEE" && loading ? (
        <div>Loading...</div>
      ) : user?.role === "EMPLOYEE" ? (
        <table className="w-full mb-8 border">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Type</th>
              <th className="py-2 px-4 text-left">Dates</th>
              <th className="py-2 px-4 text-left">Reason</th>
              <th className="py-2 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="py-2 px-4">{l.leaveDefinitionName}</td>
                <td className="py-2 px-4">
                  {l.startDate} - {l.endDate}
                </td>
                <td className="py-2 px-4">{l.reason}</td>
                <td className="py-2 px-4">{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {/* Display form errors */}
      {error && <div className="text-red-600 mb-4 font-medium">{error}</div>}

      {/* Leave request/assignment form */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mt-8">
        {/* Show employee selection only for managers */}
        {user?.role === "MANAGER" && (
          <div>
            <label className="block mb-1 font-medium">Select employee</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Leave type dropdown */}
        <div>
          <label className="block mb-1 font-medium">Select leave type</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            required
          >
            <option value="">Select leave type</option>
            {leaveDefinitions.map((def) => (
              <option key={def.id} value={def.id}>
                {def.name}
              </option>
            ))}
          </select>
        </div>

        {/* Leave dates */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
        </div>

        {/* Reason (optional) */}
        <div>
          <label className="block mb-1 font-medium">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason (optional)"
            className="border rounded px-3 py-2 w-full min-h-[40px]"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded mt-2"
        >
          {user?.role === "EMPLOYEE" ? "Request Leave" : "Assign Leave"}
        </button>
      </form>
    </div>
  );
};

export default LeaveManagement;
