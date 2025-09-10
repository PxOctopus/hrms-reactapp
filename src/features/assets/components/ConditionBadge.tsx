import React from "react";
import { AssetCondition } from "../../../lib/assetApi";

// badge renkleri satır pastellerinden daha koyu
const mapStyle: Record<AssetCondition, string> = {
  NEW: "bg-emerald-200 text-emerald-900 border-emerald-300",
  USED: "bg-slate-200 text-slate-900 border-slate-300",
  DAMAGED: "bg-red-200 text-red-900 border-red-300",
};

const pretty: Record<AssetCondition, string> = {
  NEW: "New",
  USED: "Used",
  DAMAGED: "Damaged",
};

export const ConditionBadge: React.FC<{ condition: AssetCondition; className?: string }> = ({
  condition,
  className,
}) => {
  const style = mapStyle[condition] ?? "bg-gray-200 text-gray-800 border-gray-300";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${style} ${
        className ?? ""
      }`}
    >
      {pretty[condition] ?? condition}
    </span>
  );
};
