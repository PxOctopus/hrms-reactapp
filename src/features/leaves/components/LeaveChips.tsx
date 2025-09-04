import React from "react";

type Mode = "request" | "assign";

type LeaveChipsProps = {
  hasOverlap?: boolean;
  remainingDays?: number | null;
  selectedDays?: number | null;
  afterDays?: number | null;
  mode?: Mode;
  className?: string;
};

const fmt = (n?: number | null) =>
  typeof n === "number" ? `${n}d` : undefined;

export default function LeaveChips({
  hasOverlap,
  remainingDays,
  selectedDays,
  afterDays,
  mode = "request",
  className = "",
}: LeaveChipsProps) {
  const afterLabel = mode === "assign" ? "after assign" : "after request";

  return (
    <div className={`mt-3 flex flex-wrap gap-3 ${className}`}>
      {hasOverlap && (
        <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-rose-100 text-rose-700 ring-1 ring-rose-200">
          Dates overlap with an existing leave
        </span>
      )}

      {typeof remainingDays === "number" && (
        <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          Annual quota (remaining: {fmt(remainingDays)})
        </span>
      )}

      {typeof selectedDays === "number" && typeof afterDays === "number" && (
        <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          Selected: {fmt(selectedDays)} → {afterLabel}: {fmt(afterDays)}
        </span>
      )}
    </div>
  );
}
