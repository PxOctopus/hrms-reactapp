import { useEffect, useMemo, useState } from "react";
import axios from "../../lib/axios";
import { Users, Umbrella, MessageSquare, CalendarDays } from "lucide-react";

function MetricCard({ title, value, hint }: { title: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

type ManagerOverview = {
  teamSize: number;
  onLeaveToday: number;
  pendingLeaveRequests: number;
  openReviews: number;
};

export default function ManagerDashboard() {
  const [ov, setOv] = useState<ManagerOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const nf = useMemo(() => new Intl.NumberFormat(), []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get<ManagerOverview>("/api/manager/overview")
          .catch(() => ({
            data: {
              teamSize: 18,
              onLeaveToday: 2,
              pendingLeaveRequests: 3,
              openReviews: 4,
            } as ManagerOverview,
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Team Size" value={loading ? "—" : nf.format(ov?.teamSize ?? 0)} />
        <MetricCard title="On Leave Today" value={loading ? "—" : nf.format(ov?.onLeaveToday ?? 0)} />
        <MetricCard title="Pending Leaves" value={loading ? "—" : nf.format(ov?.pendingLeaveRequests ?? 0)} />
        <MetricCard title="Open Reviews" value={loading ? "—" : nf.format(ov?.openReviews ?? 0)} />
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <div className="mb-3 text-sm font-semibold text-slate-700">Shortcuts</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <a href="/employees" className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
            <Users className="h-4 w-4" /> Employees
          </a>
          <a href="/leaves" className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
            <Umbrella className="h-4 w-4" /> Approve Leaves
          </a>
          <a href="/reviews" className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
            <MessageSquare className="h-4 w-4" /> Reviews
          </a>
          <a href="/calendar" className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
            <CalendarDays className="h-4 w-4" /> Calendar
          </a>
        </div>
      </div>
    </div>
  );
}
