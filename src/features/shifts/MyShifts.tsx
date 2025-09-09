// src/features/shifts/MyShifts.tsx
import { useEffect, useMemo, useState } from "react";
import { eachDay } from "../../utils/dateRange";
import { getIsoWeekBounds } from "../../utils/hours";
import { shiftApi } from "../../lib/shiftApi";
// NOTE: We don't need EmployeeLite here; remove to avoid eslint warnings.
import type { ShiftAssignment } from "../../types/shift";

export default function MyShifts() {
  // NOTE: No need for user in this view; backend resolves "me" via auth.
  // const { user } = useAuth();

  const [weekStart, setWeekStart] = useState<string>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return getIsoWeekBounds(today).weekStart;
  });

  const { weekEnd } = useMemo(() => getIsoWeekBounds(weekStart), [weekStart]);
  const days = useMemo(() => eachDay(weekStart, weekEnd), [weekStart, weekEnd]);

  const [items, setItems] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch my assignments for the selected ISO week
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await shiftApi.listMyAssignmentsInRange(weekStart, weekEnd);
        if (!cancelled) setItems(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [weekStart, weekEnd]);

  // Navigation helpers
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

  const labelOf = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
    });

  // Optional: group assignments by date for O(1) lookups
  const byDate = useMemo(() => {
    const map = new Map<string, ShiftAssignment[]>();
    for (const a of items) {
      const arr = map.get(a.shiftDate) ?? [];
      arr.push(a);
      map.set(a.shiftDate, arr);
    }
    return map;
  }, [items]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Shifts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your assigned shifts for this week.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50"
          >
            ◀
          </button>
          <span className="text-sm text-gray-600">
            {weekStart} – {weekEnd}
          </span>
          <button
            onClick={nextWeek}
            className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50"
          >
            ▶
          </button>
        </div>
      </header>

      <div className="rounded-2xl border bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {days.map((d) => (
                <th key={d} className="px-3 py-2 text-left">
                  {labelOf(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {days.map((d) => {
                const todays = byDate.get(d) ?? [];
                return (
                  <td key={d} className="px-3 py-2 align-top">
                    {todays.length ? (
                      <div className="flex flex-wrap gap-1">
                        {todays.map((a, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-gray-100 text-gray-800 px-2 py-0.5 text-xs"
                          >
                            {
                              // Range endpoint returns denormalized times:
                              // startTime / endTime come in payload even if not in ShiftAssignment type
                              (a as any).startTime
                            }
                            –
                            {(a as any).endTime}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>

        {loading && (
          <div className="p-3 text-xs text-gray-500">Loading…</div>
        )}
      </div>
    </div>
  );
}
