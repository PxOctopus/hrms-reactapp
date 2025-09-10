import React from "react";
import { AssetCondition } from "../../../lib/assetApi";

type Props = {
  condition?: AssetCondition | null;  // <- nullable kabul et
  className?: string;
};

const LABELS: Record<AssetCondition, string> = {
  NEW: "New",
  USED: "Used",
};

const COLORS: Record<AssetCondition, string> = {
  NEW: "bg-emerald-100 text-emerald-800",
  USED: "bg-slate-100 text-slate-800",
};

export const ConditionBadge: React.FC<Props> = ({ condition, className }) => {
  // Backend bazen null/undefined gönderebilir → “-” göster
  if (!condition) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-500 ${className ?? ""}`}
      >
        -
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${COLORS[condition]} ${className ?? ""}`}
    >
      {LABELS[condition]}
    </span>
  );
};

export default ConditionBadge;
