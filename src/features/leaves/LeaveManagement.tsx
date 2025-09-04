// src/features/leaves/LeaveManagement.tsx
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  getMyLeaves,
  requestLeave,
  getLeaveDefinitions,
  checkLeaveOverlap,
  checkLeaveQuota,
  getMyAllocations, // fetch employee's own allocations
} from "../../lib/leaveApi";
import { getAllEmployees } from "../../lib/employeeApi";
import { useAuth } from "../../context/AuthContext";
import { Leave } from "../../types/Leave";
import { Employee } from "../../types/Employee";
import { LeaveDefinition } from "../../types/LeaveDefinition";
import { toast } from "react-toastify";
import LeaveChips from "./components/LeaveChips";

function formatRange(a: string, b: string) {
  try {
    const s = new Date(a).toLocaleDateString();
    const e = new Date(b).toLocaleDateString();
    return `${s} – ${e}`;
  } catch {
    return `${a} – ${b}`;
  }
}

// Inclusive calendar-day count (replace with business-day calc if needed)
function daysBetweenInclusive(a: string, b: string): number {
  if (!a || !b) return 0;
  const d1 = new Date(a + "T00:00:00Z").getTime();
  const d2 = new Date(b + "T00:00:00Z").getTime();
  if (Number.isNaN(d1) || Number.isNaN(d2)) return 0;
  const start = Math.min(d1, d2);
  const end = Math.max(d1, d2);
  return Math.floor((end - start) / (24 * 3600 * 1000)) + 1;
}

export default function LeaveManagement() {
  const { user } = useAuth();

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveDefinitions, setLeaveDefinitions] = useState<LeaveDefinition[]>([]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState(""); // definition id as string
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Live checks state
  const [overlap, setOverlap] = useState<boolean | null>(null);
  const [quotaOk, setQuotaOk] = useState<boolean | null>(null);
  const [remainingDays, setRemainingDays] = useState<number | undefined>(undefined);
  const [checking, setChecking] = useState(false);
  const lastCheckId = useRef(0);

  const isEmployee = user?.role === "EMPLOYEE";
  const title = isEmployee ? "Request Leave" : "Assign Leave to Employee";

  // --- Allocations (employee's assigned quotas) ---
  const [allocations, setAllocations] = useState<
    { leaveDefinitionId: number; totalDays: number; usedDays: number }[]
  >([]);

  const fetchAllocations = useCallback(async () => {
    if (!isEmployee) return;
    try {
      const data = await getMyAllocations();
      setAllocations(data ?? []);
    } catch {
      setAllocations([]); // treat as none
    }
  }, [isEmployee]);

  // Employee: load own leaves
  const fetchLeaves = useCallback(async () => {
    if (isEmployee) {
      setLoading(true);
      try {
        const data = await getMyLeaves();
        setLeaves(data);
      } finally {
        setLoading(false);
      }
    }
  }, [isEmployee]);

  // Bootstrap: manager → employees+defs; employee → defs+allocations
  useEffect(() => {
    const init = async () => {
      if (!user) return;

      if (user.role === "MANAGER") {
        const [employeeList, definitions] = await Promise.all([
          getAllEmployees(),
          getLeaveDefinitions(),
        ]);
        setEmployees(employeeList);
        setLeaveDefinitions(definitions.filter((d) => d.active));
      } else {
        const defs = await getLeaveDefinitions();
        setLeaveDefinitions(defs.filter((d) => d.active));
        fetchAllocations();
      }
    };
    init();
  }, [user, fetchAllocations]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Also refetch allocations if tab regains focus (manager may assign while open)
  useEffect(() => {
    if (!isEmployee) return;
    const onFocus = () => fetchAllocations();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isEmployee, fetchAllocations]);

  // Identify the "Annual Leave" definition robustly (by localized name)
  const annualDef = useMemo(() => {
    const norm = (s?: string) => String(s ?? "").trim().toLowerCase();
    return leaveDefinitions.find((d) => {
      const name = norm(d.name);
      return name.includes("annual") || name.includes("yıllık");
    });
  }, [leaveDefinitions]);

  const annualDefId = annualDef?.id;

  const myAnnualAlloc = useMemo(() => {
    if (!annualDefId) return undefined;
    return allocations.find((a) => a.leaveDefinitionId === Number(annualDefId));
  }, [allocations, annualDefId]);

  const hasAnnualAssigned = Boolean(myAnnualAlloc && myAnnualAlloc.totalDays > 0);
  const isAnnualSelected =
    !!annualDefId && Number(leaveType) === Number(annualDefId);

  // Selected days (live)
  const selectedDays = useMemo(
    () => daysBetweenInclusive(startDate, endDate),
    [startDate, endDate]
  );

  // Derive a display value for "remaining" that works even before server pre-check returns:
  // - Prefer server `remainingDays` from checkLeaveQuota
  // - Fallback to allocation: total - used
  const annualRemainingDisplay = useMemo(() => {
    if (!isAnnualSelected || !hasAnnualAssigned || !myAnnualAlloc) return undefined;
    const base = Math.max(myAnnualAlloc.totalDays - myAnnualAlloc.usedDays, 0);
    return typeof remainingDays === "number" ? remainingDays : base;
  }, [isAnnualSelected, hasAnnualAssigned, myAnnualAlloc, remainingDays]);

  // NEW: Neutral remaining chip sadece sunucu kararı gelmeden önce gösterilsin
  const shouldShowNeutralRemaining =
    isAnnualSelected &&
    annualRemainingDisplay !== undefined &&
    (quotaOk === null || typeof remainingDays !== "number");

  // If employee picks Annual without an allocation, reset selection (guard)
  useEffect(() => {
    if (isEmployee && isAnnualSelected && !hasAnnualAssigned) {
      setLeaveType("");
    }
  }, [isEmployee, isAnnualSelected, hasAnnualAssigned]);

  // Live pre-checks (debounced)
  useEffect(() => {
    if (!leaveType || !startDate || !endDate) {
      setOverlap(null);
      setQuotaOk(null);
      setRemainingDays(undefined);
      return;
    }
    if (user?.role === "MANAGER" && !selectedEmployeeId) {
      setOverlap(null);
      setQuotaOk(null);
      setRemainingDays(undefined);
      return;
    }

    const current = ++lastCheckId.current;
    setChecking(true);

    const timer = setTimeout(async () => {
      try {
        const payload = {
          employeeId: user?.role === "MANAGER" ? Number(selectedEmployeeId) : undefined,
          leaveDefinitionId: Number(leaveType),
          startDate,
          endDate,
        };

        const [ov, quota] = await Promise.all([
          checkLeaveOverlap(payload),
          checkLeaveQuota(payload),
        ]);

        if (current !== lastCheckId.current) return; // ignore stale
        setOverlap(Boolean(ov));
        setQuotaOk(Boolean(quota?.ok));
        setRemainingDays(quota?.remainingDays);
      } catch {
        setOverlap(null);
        setQuotaOk(null);
        setRemainingDays(undefined);
      } finally {
        if (current === lastCheckId.current) setChecking(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [leaveType, startDate, endDate, selectedEmployeeId, user?.role]);

  // Client validation
  const validate = () => {
    if (!leaveType) return "Please select a leave type.";
    if (!startDate || !endDate) return "Please enter both start and end dates.";
    if (new Date(endDate) < new Date(startDate))
      return "End date cannot be earlier than start date.";
    if (user?.role === "MANAGER" && !selectedEmployeeId)
      return "Please select an employee.";
    if (isEmployee && isAnnualSelected && !hasAnnualAssigned)
      return "You don't have an annual leave allocation from your manager.";
    return null;
  };

  const resetForm = () => {
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setSelectedEmployeeId("");
    setOverlap(null);
    setQuotaOk(null);
    setRemainingDays(undefined);
    setError(null);
  };

  // Extra client-side guard: prevent submit if selection exceeds display remaining
  const exceedsAnnual =
    isAnnualSelected &&
    typeof annualRemainingDisplay === "number" &&
    selectedDays > annualRemainingDisplay;

  // Allow submit when: valid, no overlap error, quota ok (or unknown), and not exceeding client preview
  const canSubmit =
    !submitting &&
    !validate() &&
    (overlap === false || overlap === null) &&
    (quotaOk === true || quotaOk === null) &&
    !exceedsAnnual;

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);

    setError(null);
    setSubmitting(true);
    try {
      await requestLeave({
        leaveDefinitionId: Number(leaveType),
        startDate,
        endDate,
        reason,
        ...(user?.role === "MANAGER" && { employeeId: Number(selectedEmployeeId) }),
      });

      // Optimistically reflect Annual usage in UI (employee & annual only)
      if (isEmployee && isAnnualSelected && hasAnnualAssigned && myAnnualAlloc) {
        const usedInc = selectedDays;
        setAllocations((prev) =>
          (prev ?? []).map((a) =>
            a.leaveDefinitionId === Number(annualDefId)
              ? { ...a, usedDays: a.usedDays + usedInc }
              : a
          )
        );
      }

      resetForm();
      await fetchLeaves();

      toast.success(
        user?.role === "MANAGER"
          ? "Leave assigned successfully."
          : "Your leave request has been sent."
      );
    } catch (err: any) {
      const status = err?.response?.status as number | undefined;
      const apiMsg = err?.response?.data?.message as string | undefined;
      const fallback5xx = "Something went wrong on our side. Please try again later.";
      const fallback4xx = "Could not submit the leave. Please check dates and remaining quota.";
      toast.error(apiMsg || (status && status >= 500 ? fallback5xx : fallback4xx));
      setError(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="px-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to {isEmployee ? "request" : "assign"} time off.
        </p>
      </header>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-white p-4 shadow-sm space-y-4 max-w-2xl"
      >
        {user?.role === "MANAGER" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Select employee</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              required
            >
              <option value="">Choose employee…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">Leave type</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            required
          >
            <option value="">Choose leave type…</option>
            {leaveDefinitions.map((def) => {
              const isAnnual = annualDef && Number(def.id) === Number(annualDef.id);

              if (isEmployee && isAnnual && !hasAnnualAssigned) {
                // Informative disabled row if Annual is not assigned to this employee
                return (
                  <option key={def.id} value="ANNUAL_UNAVAILABLE" disabled>
                    No annual leave assigned by your manager
                  </option>
                );
              }

              return (
                <option key={def.id} value={def.id}>
                  {def.name}
                </option>
              );
            })}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              required
              min={startDate || undefined}
            />
          </div>
        </div>

       {/* Live feedback row (ONLY the 3 chips) */}
{startDate && endDate && leaveType && (
  <LeaveChips
    hasOverlap={overlap === true}
    remainingDays={
      // sadece Annual seçiliyken göster
      isAnnualSelected
        ? (
            // Employee: allocation tabanlı ön-önizleme + server remaining
            isEmployee
              ? (typeof annualRemainingDisplay === "number" ? annualRemainingDisplay : undefined)
              // Manager: server checkLeaveQuota döndüyse göster
              : (typeof remainingDays === "number" ? remainingDays : undefined)
          )
        : undefined
    }
    selectedDays={isAnnualSelected ? selectedDays : undefined}
    afterDays={
      isAnnualSelected
        ? (() => {
            const base = isEmployee
              ? (typeof annualRemainingDisplay === "number" ? annualRemainingDisplay : undefined)
              : (typeof remainingDays === "number" ? remainingDays : undefined);
            return typeof base === "number" && selectedDays > 0
              ? Math.max(base - selectedDays, 0)
              : undefined;
          })()
        : undefined
    }
    mode={isEmployee ? "request" : "assign"}
  />
)}

        <div>
          <label className="mb-1 block text-sm font-medium">Reason (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Add a short note…"
            className="w-full rounded-lg border px-3 py-2 text-sm min-h-[44px]"
          />
        </div>

        {error && <div className="text-rose-600 text-sm font-medium">{error}</div>}

        <div className="pt-1">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting
              ? isEmployee
                ? "Submitting…"
                : "Assigning…"
              : isEmployee
                ? "Request Leave"
                : "Assign Leave"}
          </button>
        </div>
      </form>

      {/* Employee History Card */}
      {isEmployee && (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-3 font-semibold">My Leave Requests</div>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : leaves.length === 0 ? (
            <div className="text-sm text-gray-500">No leave requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="px-4 py-3">{l.leaveDefinitionName}</td>
                      <td className="px-4 py-3">{formatRange(l.startDate, l.endDate)}</td>
                      <td className="px-4 py-3">{l.reason || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border px-2 py-0.5 text-xs">
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
