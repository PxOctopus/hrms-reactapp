import React from "react";
import { AssetStatus } from "../../../lib/assetApi";

// Slightly darker badges to stand out on pastel rows
const mapStyle: Record<AssetStatus, string> = {
  IN_STOCK: "bg-gray-200 text-gray-800 border-gray-300",
  ASSIGNED: "bg-yellow-200 text-yellow-900 border-yellow-300",
  ASSIGNED_CONFIRMED: "bg-green-200 text-green-900 border-green-300",
  RETURN_REQUESTED: "bg-orange-200 text-orange-900 border-orange-300",
  MAINTENANCE: "bg-blue-200 text-blue-900 border-blue-300",
  LOST: "bg-rose-200 text-rose-900 border-rose-300",
  RETIRE_REQUESTED: "bg-amber-200 text-amber-900 border-amber-300", // NEW
  RETIRED: "bg-zinc-200 text-zinc-800 border-zinc-300",
};

const pretty: Record<AssetStatus, string> = {
  IN_STOCK: "In Stock",
  ASSIGNED: "Assigned",
  ASSIGNED_CONFIRMED: "Confirmed",
  RETURN_REQUESTED: "Return Req.",
  MAINTENANCE: "Maintenance",
  LOST: "Lost",
  RETIRE_REQUESTED: "Retirement Req.", // NEW
  RETIRED: "Retired",
};

export const StatusBadge: React.FC<{ status: AssetStatus; className?: string }> = ({ status, className }) => {
  const style = mapStyle[status] ?? "bg-gray-200 text-gray-800 border-gray-300";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${style} ${className ?? ""}`}>
      {pretty[status] ?? status}
    </span>
  );
};
