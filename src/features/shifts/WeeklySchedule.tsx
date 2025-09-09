// src/features/shifts/WeeklySchedule.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import type { EmployeeLite, ShiftAssignment } from "../../types/shift";
import type { Leave } from "../../types/Leave";
import { eachDay } from "../../utils/dateRange";
import { getIsoWeekBounds, computeWeeklyHours } from "../../utils/hours";
import { shiftApi } from "../../lib/shiftApi";
import { toast } from "react-toastify";

type Props = {
  employees: EmployeeLite[];
  // Optional start date (YYYY-MM-DD); defaults to current week
  startDate?: string;
};

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
};

export default function WeeklySchedule({ employees, startDate }: Props) {
  // Compute the Monday of the visible ISO week
  const [weekStart, setWeekStart] = useState<string>(() => {
    const today = startDate ?? new Date().toISOString().slice(0, 10);
    return getIsoWeekBounds(today).weekStart;
  });

  const { weekEnd } = useMemo(() => getIsoWeekBounds(weekStart), [weekStart]);
  const days = useMemo(() => eachDay(weekStart, weekEnd), [weekStart, weekEnd]);

  // Map: employeeId -> assignments / approved leaves
  const [items, setItems] = useState<Record<number, ShiftAssignment[]>>({});
  const [leaves, setLeaves] = useState<Record<number, Leave[]>>({});
  const [loading, setLoading] = useState(false);

  // Fetch assignments and approved leaves for all employees for the visible week
  const refresh = useCallback(async () => {
    const res: Record<number, ShiftAssignment[]> = {};
    const lvs: Record<number, Leave[]> = {};
    await Promise.all(
      employees.map(async (e) => {
        const [a, ls] = await Promise.all([
          shiftApi.listAssignmentsInRange(e.id, weekStart, weekEnd),
          shiftApi.listApprovedLeaves(e.id, weekStart, weekEnd),
        ]);
        res[e.id] = a;
        lvs[e.id] = ls;
      })
    );
    setItems(res);
    setLeaves(lvs);
  }, [employees, weekStart, weekEnd]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  // Sum weekly hours per employee (uses denormalized start/end from range API)
  const hoursOf = (eId: number) =>
    computeWeeklyHours(
      (items[eId] ?? []).map((a: any) => ({
        shiftDate: a.shiftDate,
        startTime: a.startTime,
        endTime: a.endTime,
      }))
    );

  // Week navigation
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d.toISOString().slice(0, 10));
  };
  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d.toISOString().slice(0, 10));
  };

  // Cancel (soft delete) with optimistic UI + 5s Undo toast
  const handleCancel = (assignmentId: number) => {
    // Optimistically remove from UI
    const snapshot = items;
    const next: typeof items = {};
    for (const [key, list] of Object.entries(snapshot)) {
      next[+key] = list.filter((a) => a.id !== assignmentId);
    }
    setItems(next);

    let undone = false;

    const content = (
      <div className="flex items-center justify-between gap-4">
        <span>Shift cancelled</span>
        <button
          onClick={() => {
            undone = true;      // mark undone
            toast.dismiss();    // close the toast
            setItems(snapshot); // restore previous UI state
          }}
          className="rounded border px-2 py-1 text-xs"
        >
          Undo
        </button>
      </div>
    );

    toast.info(content, {
      autoClose: 5000,
      closeOnClick: false,
      draggable: false,
      position: "top-right",
      // When toast closes: if NOT undone, call backend to persist the delete
      onClose: async () => {
        if (undone) return;
        try {
          await shiftApi.removeAssignment(assignmentId); // DELETE /employee-shifts/{id}
        } catch {
          toast.error("Failed to cancel shift on server");
          // Re-sync from server so UI reflects actual state after error
          await refresh();
        }
      },
    });
  };

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-base font-semibold">Weekly schedule</h2>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50">
            ◀
          </button>
          <span className="text-sm text-gray-600">
            {weekStart} – {weekEnd}
          </span>
          <button onClick={nextWeek} className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50">
            ▶
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Employee</th>
              {days.map((d) => (
                <th key={d} className="px-3 py-2 text-left">
                  {dayLabel(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.map((e) => {
              const weekly = hoursOf(e.id);
              const warning = weekly > 40;
              return (
                <tr key={e.id} className={e.status === "INACTIVE" ? "opacity-50" : ""}>
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium">{e.label}</div>
                    <div
                      className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                        warning ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {weekly.toFixed(1)} hours this week
                    </div>
                  </td>

                  {days.map((d) => {
                    const todaysLeave = (leaves[e.id] ?? []).find(
                      (lv) => d >= lv.startDate && d <= (lv.endDate ?? lv.startDate)
                    );
                    const todays = (items[e.id] ?? []).filter((a) => a.shiftDate === d);

                    return (
                      <td key={d} className="px-3 py-2">
                        {todaysLeave ? (
                          // Approved leave badge inside the day cell
                          <div className="inline-flex flex-col gap-1">
                            <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs">
                              On leave
                            </span>
                            {todaysLeave.reason && (
                              <span className="text-[11px] text-amber-700">{todaysLeave.reason}</span>
                            )}
                          </div>
                        ) : todays.length > 0 ? (
                          // Assigned shift(s) + Cancel action
                          <div className="flex flex-col gap-1">
                            {todays.map((a) => (
                              <div key={a.id} className="flex items-center gap-1">
                                <span className="rounded-full bg-gray-100 text-gray-800 px-2 py-0.5 text-xs">
                                  {(a as any).startTime}–{(a as any).endTime}
                                </span>
                                <button
                                  onClick={() => handleCancel(a.id)}
                                  className="text-[11px] text-rose-600 underline"
                                >
                                  Cancel
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Empty day
                          <span className="text-[11px] text-gray-400">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {loading && <div className="p-3 text-xs text-gray-500">Loading…</div>}
    </div>
  );
}
