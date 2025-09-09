import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shift } from "../../types/shift";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});
export type ShiftInput = z.infer<typeof schema>;

export default function ShiftDrawer({
  open,
  onClose,
  initial,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Shift | null;
  onSubmit: (d: ShiftInput) => Promise<void> | void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShiftInput>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? { name: initial.name, startTime: initial.startTime, endTime: initial.endTime }
      : { name: "", startTime: "08:00", endTime: "16:00" },
  });

  // keep form in sync when drawer opens or `initial` changes
  useEffect(() => {
    if (!open) return;
    reset(
      initial
        ? { name: initial.name, startTime: initial.startTime, endTime: initial.endTime }
        : { name: "", startTime: "08:00", endTime: "16:00" }
    );
  }, [open, initial, reset]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold">{initial ? "Edit Shift" : "New Shift"}</h3>
          <button
            onClick={onClose}
            className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50"
            type="button"
          >
            Close
          </button>
        </div>

        <form className="space-y-4 p-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              {...register("name")}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g., Morning"
              autoFocus
            />
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

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-lg px-3 py-2 text-sm text-white ${
                isSubmitting ? "bg-gray-300 cursor-not-allowed" : "bg-black hover:bg-black/90"
              }`}
            >
              {isSubmitting ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
