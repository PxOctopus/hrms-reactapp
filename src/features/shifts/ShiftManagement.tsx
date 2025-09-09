import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import RoleGuard from "../../components/common/RoleGuard";
import ShiftDrawer, { ShiftInput } from "./ShiftDrawer";
import AssignShiftDrawer from "./AssignShiftDrawer";
import WeeklySchedule from "./WeeklySchedule"; // ✅ add weekly grid for managers
import { shiftApi } from "../../lib/shiftApi";
import { Shift, EmployeeLite } from "../../types/shift";

export default function ShiftManagement() {
  const { user, loading } = useAuth();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<EmployeeLite[]>([]);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);

  const [openAssign, setOpenAssign] = useState(false);
  const [assignForId, setAssignForId] = useState<number | undefined>(undefined);

  // force re-mount of WeeklySchedule after an assignment to refetch data
  const [refreshTick, setRefreshTick] = useState(0);

  // Backend derives company from auth; no companyId needed on FE
  const refresh = async () => {
    const [ss, emps] = await Promise.all([shiftApi.list(), shiftApi.listEmployeesLite()]);
    setShifts(ss);
    setEmployees(emps);
  };

  useEffect(() => {
    if (user) void refresh();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center p-8 text-sm text-gray-600">Loading…</div>;
  }
  if (!user) {
    return <div className="p-4 text-sm text-gray-600">You must be signed in.</div>;
  }

  const onCreate = async (d: ShiftInput) => {
    await shiftApi.create(d);
    await refresh();
    setOpenForm(false);
  };

  const onUpdate = async (d: ShiftInput) => {
    if (!editing) return;
    await shiftApi.update(editing.id, d as any);
    await refresh();
    setOpenForm(false);
    setEditing(null);
  };

  const onDelete = async (id: number) => {
    // use window.confirm to satisfy eslint(no-restricted-globals)
    if (!window.confirm("Delete this shift?")) return;
    await shiftApi.remove(id);
    await refresh();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shift Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user.role === "MANAGER" ? "Create, edit, and assign shifts to employees." : "View company shifts."}
          </p>
        </div>
        <RoleGuard allow={["MANAGER"]}>
          <button
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
          >
            + New Shift
          </button>
        </RoleGuard>
      </header>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold">Shifts</h2>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Hours</th>
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
                  <td className="px-3 py-2 text-right space-x-3">
                    <RoleGuard allow={["MANAGER"]} fallback={<span className="text-gray-400">—</span>}>
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => {
                          setEditing(s);
                          setOpenForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-emerald-600 hover:underline"
                        onClick={() => {
                          setAssignForId(s.id);
                          setOpenAssign(true);
                        }}
                      >
                        Assign
                      </button>
                      <button className="text-rose-600 hover:underline" onClick={() => onDelete(s.id)}>
                        Delete
                      </button>
                    </RoleGuard>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shifts.length === 0 && <div className="p-6 text-center text-sm text-gray-500">No shifts yet.</div>}
        </div>
      </div>

      {/* Manager weekly grid */}
      <RoleGuard allow={["MANAGER"]}>
        <div className="mt-6">
          {/* key changes → remount → WeeklySchedule re-fetches after assignment */}
          <WeeklySchedule key={refreshTick} employees={employees} />
        </div>
      </RoleGuard>

      {/* Drawers */}
      <RoleGuard allow={["MANAGER"]}>
        <ShiftDrawer
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setEditing(null);
          }}
          initial={editing}
          onSubmit={editing ? onUpdate : onCreate}
        />
        <AssignShiftDrawer
          open={openAssign}
          onClose={() => {
            setOpenAssign(false);
            // re-render WeeklySchedule after a successful assign
            setRefreshTick((t) => t + 1);
          }}
          shifts={shifts}
          employees={employees}
          initialShiftId={assignForId}
        />
      </RoleGuard>
    </div>
  );
}
