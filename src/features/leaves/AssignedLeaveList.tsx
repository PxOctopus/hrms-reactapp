import { useEffect, useState } from "react";
import { getLeavesAssignedByManager } from "../../lib/leaveApi";
import { Leave } from "../../types/Leave";

export default function AssignedLeavesList() {
  const [rows, setRows] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLeavesAssignedByManager();
        setRows(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-semibold">Assigned by Me</h2>

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-gray-500">No assigned leaves.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-4 py-3">{l.employeeFullName}</td>
                  <td className="px-4 py-3">{l.leaveDefinitionName}</td>
                  <td className="px-4 py-3">
                    {l.startDate} – {l.endDate}
                  </td>
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
    </section>
  );
}
