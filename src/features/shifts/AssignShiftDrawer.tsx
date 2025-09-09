import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Badge from "../../components/ui/Badge";
import { Shift, EmployeeLite } from "../../types/shift";
import type { Leave } from "../../types/Leave";
import { eachDay } from "../../utils/dateRange";
import { getIsoWeekBounds, computeWeeklyHours } from "../../utils/hours";
import { shiftApi } from "../../lib/shiftApi";
import { toast } from "react-toastify"; // kullanıyorsan; yoksa kaldır

const base = z.object({
  shiftId: z.number().min(1, "Shift is required"),
  employeeId: z.number().min(1, "Employee is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
});
const schema = base.refine(
  (v) => !v.endDate || new Date(v.startDate) <= new Date(v.endDate),
  { message: "End date must be on or after start date", path: ["endDate"] }
);

export type AssignShiftInput = z.infer<typeof schema>;

type ConflictState = {
  approvedDates: string[];  // only APPROVED coverage
  pendingDates: string[];   // only PENDING coverage
  leaves: Leave[];          // raw (all statuses)
} | null;

export default function AssignShiftDrawer({
  open,
  onClose,
  shifts,
  employees,
  initialShiftId,
}: {
  open: boolean;
  onClose: () => void;
  shifts: Shift[];
  employees: EmployeeLite[];
  initialShiftId?: number;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssignShiftInput>({
    resolver: zodResolver(schema),
    defaultValues: { shiftId: initialShiftId ?? 0, employeeId: 0, startDate: "", endDate: "" },
  });

  const [conflict, setConflict] = useState<ConflictState>(null);
  const [weeklyHours, setWeeklyHours] = useState<{ current: number; added: number; total: number } | null>(null);
  const wShiftId = watch("shiftId");
  const wEmployeeId = watch("employeeId");
  const wStart = watch("startDate");
  const wEnd = watch("endDate");

  // stable lookups to satisfy hooks lint
  const selectedShift = useMemo(
    () => shifts.find((s) => s.id === Number(wShiftId)),
    [shifts, wShiftId]
  );
  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === Number(wEmployeeId)),
    [employees, wEmployeeId]
  );

  useEffect(() => {
    if (!open) {
      reset();
      setConflict(null);
      setWeeklyHours(null);
      return;
    }
    if (open && initialShiftId) setValue("shiftId", initialShiftId);
  }, [open, reset, initialShiftId, setValue]);

  // Inclusive date expander
  const expandLeaveDates = (leave: Leave): string[] => {
    const start = leave.startDate!;
    const end = leave.endDate ?? leave.startDate!;
    return eachDay(start, end);
  };

  // Fetch leaves (APPROVED + PENDING) and weekly hours whenever inputs change
  useEffect(() => {
    const empId = Number(wEmployeeId);
    const start = wStart;
    if (!open || !empId || !start || !selectedShift) {
      setConflict(null);
      setWeeklyHours(null);
      return;
    }

    const end = wEnd || start;
    const dates = eachDay(start, end);
    const { weekStart, weekEnd } = getIsoWeekBounds(start);

    (async () => {
      try {
        // ask for ALL leaves so we can split approved vs pending
        const [allLeaves, weekItems] = await Promise.all([
          shiftApi.listLeaves(empId, start, end), // returns any status
          shiftApi.listAssignmentsInRange(empId, weekStart, weekEnd),
        ]);

        const approvedSet = new Set<string>();
        const pendingSet = new Set<string>();

        for (const lv of allLeaves) {
          const covered = expandLeaveDates(lv);
          if (lv.status === "APPROVED") covered.forEach((d) => approvedSet.add(d));
          else if (lv.status === "PENDING") covered.forEach((d) => pendingSet.add(d));
        }

        const approvedDates = dates.filter((d) => approvedSet.has(d));
        const pendingDates = dates.filter((d) => pendingSet.has(d));

        setConflict(
          approvedDates.length || pendingDates.length
            ? { approvedDates, pendingDates, leaves: allLeaves }
            : null
        );

        // hours: current week (from API) + added (this form)
        const current = computeWeeklyHours(
          weekItems.map((a: any) => ({
            shiftDate: a.shiftDate,
            startTime: a.startTime,
            endTime: a.endTime,
          }))
        );

        const added = dates.reduce((sum) => {
          const [sh, sm] = selectedShift.startTime.split(":").map(Number);
          const [eh, em] = selectedShift.endTime.split(":").map(Number);
          const mins = ((eh * 60 + em) - (sh * 60 + sm) + 24 * 60) % (24 * 60);
          return sum + mins / 60;
        }, 0);

        setWeeklyHours({ current, added, total: current + added });
      } catch {
        // silent; UI stays without conflict/hours if request fails
      }
    })();
  }, [open, wEmployeeId, wStart, wEnd, selectedShift]);

  if (!open) return null;

  const onSave = handleSubmit(async (d) => {
    try {
      const dates = eachDay(d.startDate, d.endDate || undefined);
      for (const day of dates) {
        await shiftApi.assignOneDay({
          employeeId: d.employeeId,
          shiftId: d.shiftId,
          shiftDate: day,
          active: true,
        });
      }
      onClose();
      toast?.success?.("Shift assigned"); // opsiyonel
    } catch (err: any) {
      // Show backend validation/business messages instead of crashing the UI
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Could not assign the shift.";
      toast?.error?.(msg);
    }
  });

  // Save disabled when:
  // - 40h aşımı olacaksa, ya da
  // - employee INACTIVE ise, ya da
  // - seçilen aralıkta PENDING izin çakışması varsa
  const hasPendingOverlap = !!conflict?.pendingDates?.length;
  const over40 = !!weeklyHours && weeklyHours.total > 40;
  const saveDisabled =
    over40 || selectedEmployee?.status === "INACTIVE" || hasPendingOverlap;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold">Assign Shift</h3>
          <button onClick={onClose} className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50">Close</button>
        </div>

        <form className="space-y-4 p-4" onSubmit={onSave}>
          {/* Shift */}
          <div>
            <label className="mb-1 block text-sm font-medium">Shift</label>
            <select
              {...register("shiftId", { valueAsNumber: true })}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value={0}>Select</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime}-{s.endTime})
                </option>
              ))}
            </select>
            {errors.shiftId && <p className="mt-1 text-xs text-rose-600">{errors.shiftId.message}</p>}
          </div>

          {/* Employee */}
          <div>
            <label className="mb-1 block text-sm font-medium">Employee</label>
            <select
              {...register("employeeId", { valueAsNumber: true })}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value={0}>Select</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id} disabled={e.status === "INACTIVE"}>
                  {e.label} {e.status === "INACTIVE" ? "(inactive)" : ""}
                </option>
              ))}
            </select>
            {errors.employeeId && <p className="mt-1 text-xs text-rose-600">{errors.employeeId.message}</p>}
            {selectedEmployee && (
              <div className="mt-2">
                {selectedEmployee.status === "ACTIVE" ? (
                  <Badge text="Active" tone="green" />
                ) : (
                  <Badge text="Inactive" tone="red" />
                )}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">Inactive employees are visible but cannot be assigned.</p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Start date</label>
              <input type="date" {...register("startDate")} className="w-full rounded-lg border px-3 py-2 text-sm" />
              {errors.startDate && <p className="mt-1 text-xs text-rose-600">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">End date (optional)</label>
              <input type="date" {...register("endDate")} className="w-full rounded-lg border px-3 py-2 text-sm" />
              {errors.endDate && <p className="mt-1 text-xs text-rose-600">{errors.endDate.message as string}</p>}
            </div>
          </div>

          {/* Hours chip */}
          {weeklyHours && (
            <div className="text-xs">
              <span
                className={`inline-flex items-center gap-2 px-2 py-1 rounded-full ${
                  weeklyHours.total > 40 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-800"
                }`}
              >
                Weekly total: <strong>{weeklyHours.total.toFixed(1)} h</strong> / 40 h
              </span>
              {weeklyHours.added > 0 && (
                <span className="ml-2 text-gray-500">(+{weeklyHours.added.toFixed(1)} h)</span>
              )}
            </div>
          )}

          {/* Leave banners */}
          {conflict?.approvedDates?.length ? (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
              On leave: {conflict.approvedDates.join(", ")}
            </div>
          ) : null}

          {conflict?.pendingDates?.length ? (
            <div className="text-xs text-gray-700 bg-gray-100 border border-gray-200 rounded-lg p-2">
              Leave request pending on: {conflict.pendingDates.join(", ")} — assigning is blocked until it’s approved or rejected.
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saveDisabled}
              className={`rounded-lg px-3 py-2 text-sm text-white ${
                saveDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-black hover:bg-black/90"
              }`}
            >
              Save
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
