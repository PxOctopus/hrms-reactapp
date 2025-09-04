import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import RoleGuard from "../../components/common/RoleGuard";
import Badge from "../../components/ui/Badge";
import NewShiftDrawer, { NewShiftInput } from "./NewShiftDrawer";
import AssignShiftDrawer, { AssignShiftInput } from "./AssignShiftDrawer";
import { Shift } from "../../types/shift";

/**
 * ShiftManagement
 * - Only MANAGER can create/edit/assign/delete.
 * - EMPLOYEE can view (read-only).
 * - Drawers for "New Shift" and "Assign Shift".
 * - Inactive employees are visible but disabled for assignment.
 */
export default function ShiftManagement() {
  // 1) Hooks must be at the top level (before any return)
  const { user, loading } = useAuth();

  // drawer states
  const [openNew, setOpenNew] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [assignForShiftId, setAssignForShiftId] = useState<number | undefined>(undefined);

  // shifts state (start empty; fill when user is available)
  const [shifts, setShifts] = useState<Shift[]>([]);

  // options for drawers (normally fetched via API)
  const [employeeOptions] = useState([
    { id: 101, label: "Alice Brown", status: "ACTIVE" as const },
    { id: 102, label: "John Smith", status: "INACTIVE" as const },
  ]);

  // 2) When user arrives, seed mock data (or fetch from API)
  useEffect(() => {
    if (!user) return;
    const companyId = user.company?.id ?? 0;
    setShifts([
      {
        id: 1,
        name: "Morning",
        startTime: "08:00",
        endTime: "16:00",
        days: [1, 2, 3, 4, 5],
        companyId,
      },
    ]);
  }, [user]);

  // derive shift options for the Assign drawer
  const shiftOptions = shifts.map((s) => ({
    id: s.id,
    label: `${s.name} (${s.startTime}-${s.endTime})`,
  }));

  // 3) Early returns are OK now (after all hooks)
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-gray-600">
        Loading...
      </div>
    );
  }
  if (!user) {
    return <div className="p-4 text-sm text-gray-600">You must be signed in to view this page.</div>;
  }

  // handlers
  const handleCreateShift = (data: NewShiftInput) => {
    const companyId = user.company?.id ?? 0;
    const next: Shift = { id: Date.now(), companyId, ...data };
    setShifts((prev) => [next, ...prev]);
    setOpenNew(false);
  };

  const handleAssignShift = (data: AssignShiftInput) => {
    // TODO: call API here
    console.log("Assign shift payload:", data);
    setOpenAssign(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shift Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user.role === "MANAGER"
              ? "Create, edit, and assign shifts to employees."
              : "View company shifts."}
          </p>
        </div>
        <RoleGuard allow={["MANAGER"]}>
          <button
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => setOpenNew(true)}
          >
            + New Shift
          </button>
        </RoleGuard>
      </header>

      {/* Table */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold">Shifts</h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Hours</th>
                  <th className="px-3 py-2">Days</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {shifts.map((s) => (
                  <tr key={s.id}>
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2">
                      {s.startTime}–{s.endTime}
                    </td>
                    <td className="px-3 py-2">{s.days.join(", ")}</td>
                    <td className="px-3 py-2">
                      <Badge text={`#${s.companyId}`} />
                    </td>
                    <td className="px-3 py-2 text-right space-x-3">
                      <RoleGuard allow={["MANAGER"]} fallback={<span className="text-gray-400">—</span>}>
                        <button className="text-blue-600 hover:underline">Edit</button>
                        <button
                          className="text-emerald-600 hover:underline"
                          onClick={() => {
                            setAssignForShiftId(s.id);
                            setOpenAssign(true);
                          }}
                        >
                          Assign
                        </button>
                        <button className="text-rose-600 hover:underline">Delete</button>
                      </RoleGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shifts.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">No shifts yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Drawers (MANAGER only) */}
      <RoleGuard allow={["MANAGER"]}>
        <NewShiftDrawer open={openNew} onClose={() => setOpenNew(false)} onSubmit={handleCreateShift} />
        <AssignShiftDrawer
          open={openAssign}
          onClose={() => setOpenAssign(false)}
          onSubmit={handleAssignShift}
          shiftOptions={shiftOptions}
          employeeOptions={employeeOptions}
          initialShiftId={assignForShiftId}
        />
      </RoleGuard>
    </div>
  );
}
