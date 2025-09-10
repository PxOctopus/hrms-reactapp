import React, { useEffect, useState } from "react";
import { getAssignableEmployees, type EmployeeLite } from "../../../lib/employeeApi";
import { assetApi } from "../../../lib/assetApi";

interface AssignDrawerProps {
  open: boolean;
  assetId: number | null;
  onClose: () => void;
  onAssigned: () => void;
  /** Optional injection; defaults to employeeApi.getAssignableEmployees */
  loadAssignable?: () => Promise<EmployeeLite[]>;
}

const AssignDrawer: React.FC<AssignDrawerProps> = ({
  open,
  assetId,
  onClose,
  onAssigned,
  loadAssignable,
}) => {
  const [employees, setEmployees] = useState<EmployeeLite[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // reset local state when closing
  useEffect(() => {
    if (!open) {
      setEmployees([]);
      setSelectedEmployee("");
      setLoading(false);
      setSubmitting(false);
      setErrorMsg(null);
    }
  }, [open]);

  // Load employees when drawer opens
  useEffect(() => {
    if (!open) return;
    const fetchEmployees = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const data = loadAssignable
          ? await loadAssignable()
          : await getAssignableEmployees();
        setEmployees(data);
      } catch (e: any) {
        console.error(e);
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Failed to load employees.";
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [open, loadAssignable]);

  const handleAssign = async () => {
    if (!assetId || selectedEmployee === "") return; // ← empty guard
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await assetApi.assign(assetId, { employeeId: Number(selectedEmployee) });
      onAssigned(); // refresh parent list
      onClose();
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Failed to assign asset.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div className="w-96 bg-white p-6 shadow-xl flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Assign Asset</h2>
          <button
            onClick={onClose}
            className="rounded-md border px-3 py-1"
            disabled={submitting}
          >
            Close
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-gray-500">Loading employees…</p>
        ) : errorMsg ? (
          <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        ) : (
          <>
            <label className="mt-4 block text-sm">
              Employee
              <select
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={selectedEmployee === "" ? "" : String(selectedEmployee)} // ← keep "" as ""
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedEmployee(v === "" ? "" : Number(v)); // ← "" → "" (not 0)
                }}
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.display} ({emp.email})
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={handleAssign}
              disabled={submitting || selectedEmployee === ""} // ← correct disable
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
            >
              {submitting ? "Assigning…" : "Assign"}
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-600 hover:underline"
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AssignDrawer;
