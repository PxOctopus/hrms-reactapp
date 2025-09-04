import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Badge from "../../components/ui/Badge";

const base = z.object({
  shiftId: z.number().min(1, "Shift is required"),
  employeeId: z.number().min(1, "Employee is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
});
const schema = base.refine(
  (v) => {
    if (!v.endDate) return true;
    const s = new Date(v.startDate), e = new Date(v.endDate);
    return !isNaN(s.getTime()) && !isNaN(e.getTime()) && s.getTime() <= e.getTime();
  },
  { message: "End date must be on or after start date", path: ["endDate"] }
);

export type AssignShiftInput = z.infer<typeof schema>;
type Option = { id: number; label: string };
type EmployeeOption = { id: number; label: string; status: "ACTIVE" | "INACTIVE" };

export default function AssignShiftDrawer({
  open, onClose, onSubmit, shiftOptions, employeeOptions, initialShiftId,
}: {
  open: boolean; onClose: () => void; onSubmit: (d: AssignShiftInput) => void;
  shiftOptions: Option[]; employeeOptions: EmployeeOption[]; initialShiftId?: number;
}) {
  const { register, handleSubmit, reset, setValue, formState: { errors }, watch } =
    useForm<AssignShiftInput>({
      resolver: zodResolver(schema),
      defaultValues: { shiftId: initialShiftId ?? 0, employeeId: 0, startDate: "", endDate: "" },
    });

  useEffect(() => {
    if (!open) reset();
    if (open && initialShiftId) setValue("shiftId", initialShiftId);
  }, [open, reset, initialShiftId, setValue]);

  if (!open) return null;

  const selectedEmployeeId = watch("employeeId");
  const selectedEmployee = employeeOptions.find(e => e.id === Number(selectedEmployeeId));

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold">Assign Shift</h3>
          <button onClick={onClose} className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50">Close</button>
        </div>

        <form className="space-y-4 p-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium">Shift</label>
            <select {...register("shiftId", { valueAsNumber: true })} className="w-full rounded-lg border px-3 py-2 text-sm">
              <option value={0}>Select</option>
              {shiftOptions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            {errors.shiftId && <p className="mt-1 text-xs text-rose-600">{errors.shiftId.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Employee</label>
            <select {...register("employeeId", { valueAsNumber: true })} className="w-full rounded-lg border px-3 py-2 text-sm">
              <option value={0}>Select</option>
              {employeeOptions.map(e => (
                <option key={e.id} value={e.id} disabled={e.status === "INACTIVE"}>
                  {e.label} {e.status === "INACTIVE" ? "(inactive)" : ""}
                </option>
              ))}
            </select>
            {errors.employeeId && <p className="mt-1 text-xs text-rose-600">{errors.employeeId.message}</p>}
            {selectedEmployee && (
              <div className="mt-2">
                {selectedEmployee.status === "ACTIVE" ? <Badge text="Active" tone="green" /> : <Badge text="Inactive" tone="red" />}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">Inactive employees are visible but cannot be assigned.</p>
          </div>

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

          <div className="flex gap-2 pt-2">
            <button type="submit" className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-black/90">Save</button>
            <button type="button" onClick={onClose} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
