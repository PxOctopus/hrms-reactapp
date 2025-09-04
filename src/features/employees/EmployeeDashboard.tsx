import { useEffect, useMemo, useState } from "react";
import axios from "../../lib/axios";
import { Link } from "react-router-dom";
import { Umbrella, CalendarClock, Package, ClipboardList } from "lucide-react";

// Local metric card (simple shared card)
function MetricCard({ title, value, hint }: { title: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

// Types for your employee overview
type EmployeeOverview = {
  remainingLeaves: number;     // e.g., 12
  pendingRequests: number;     // e.g., 1
  myAssetsCount: number;       // e.g., 3
  nextShiftLabel: string;      // e.g., "Mon 09:00–17:00"
};

export default function EmployeeDashboard() {
  const [ov, setOv] = useState<EmployeeOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const nf = useMemo(() => new Intl.NumberFormat(), []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get<EmployeeOverview>("/employee/overview")
          .catch(() => ({
            // Fallback demo data if backend not ready
            data: {
              remainingLeaves: 11,
              pendingRequests: 1,
              myAssetsCount: 2,
              nextShiftLabel: "Tomorrow 09:00–17:00",
            } as EmployeeOverview,
          }));
        if (!alive) return;
        setOv(res.data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-6">
      {/* Grid: 4 metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Remaining Leaves"
          value={loading ? "—" : nf.format(ov?.remainingLeaves ?? 0)}
          hint="Year to date"
        />
        <MetricCard
          title="Pending Requests"
          value={loading ? "—" : nf.format(ov?.pendingRequests ?? 0)}
          hint="Awaiting approval"
        />
        <MetricCard
          title="My Assets"
          value={loading ? "—" : nf.format(ov?.myAssetsCount ?? 0)}
          hint="Assigned to you"
        />
        <MetricCard
          title="Next Shift"
          value={loading ? "—" : (ov?.nextShiftLabel ?? "—")}
          hint="Scheduled"
        />
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="mb-3 text-sm font-semibold text-slate-700">Quick Actions</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            to="/leaves"
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Umbrella className="h-4 w-4" />
            Request Leave
          </Link>
          <Link
            to="/shifts"
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            <CalendarClock className="h-4 w-4" />
            View Shifts
          </Link>
          <Link
            to="/assets"
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Package className="h-4 w-4" />
            My Assets
          </Link>
          <Link
            to="/expenses"
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            <ClipboardList className="h-4 w-4" />
            Submit Expense
          </Link>
        </div>
      </div>
    </div>
  );
}
