import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  days: z.array(z.number().min(1).max(7)).min(1, "Select at least one day"),
});

export type NewShiftInput = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewShiftInput) => void;
};

const DAYS = [
  { id: 1, label: "Mon" }, { id: 2, label: "Tue" }, { id: 3, label: "Wed" },
  { id: 4, label: "Thu" }, { id: 5, label: "Fri" }, { id: 6, label: "Sat" },
  { id: 7, label: "Sun" },
];

export default function NewShiftDrawer({ open, onClose, onSubmit }: Props) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
    useForm<NewShiftInput>({
      resolver: zodResolver(schema),
      defaultValues: { name: "", startTime: "08:00", endTime: "16:00", days: [1,2,3,4,5] },
    });

  useEffect(() => { if (!open) reset(); }, [open, reset]);
  if (!open) return null;

  const selectedDays = watch("days") ?? [];

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold">New Shift</h3>
          <button onClick={onClose} className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50">Close</button>
        </div>

        <form className="space-y-4 p-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input {...register("name")} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g., Morning" />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Start time</label>
              <input type="time" {...register("startTime")} className="w-full rounded-lg border px-3 py-2 text-sm" />
              {errors.startTime && <p className="mt-1 text-xs text-rose-600">{errors.startTime.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">End time</label>
              <input type="time" {...register("endTime")} className="w-full rounded-lg border px-3 py-2 text-sm" />
              {errors.endTime && <p className="mt-1 text-xs text-rose-600">{errors.endTime.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(d => {
                const active = selectedDays.includes(d.id);
                return (
                  <button
                    key={d.id} type="button"
                    onClick={() => {
                      const next = active ? selectedDays.filter(x => x !== d.id) : [...selectedDays, d.id];
                      setValue("days", next, { shouldValidate: true });
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-sm ${active ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-50"}`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            {errors.days && <p className="mt-1 text-xs text-rose-600">{errors.days.message as string}</p>}
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
