import React from "react";
import { AssetResponseDTO, AssetStatus } from "../../../lib/assetApi";
import { StatusBadge } from "../components/StatusBadge";
import { ConditionBadge } from "../components/ConditionBadge";

type Props = {
  data: AssetResponseDTO[];
  loading?: boolean;
  sortKey?: keyof AssetResponseDTO;
  sortDir?: "asc" | "desc";
  onSort?: (key: keyof AssetResponseDTO) => void;
  onAssignClick?: (assetId: number) => void;
};

// row background mapping by status (pastel row colors)
const rowBg: Partial<Record<AssetStatus, string>> = {
  IN_STOCK: "bg-white",
  ASSIGNED: "bg-yellow-50",
  ASSIGNED_CONFIRMED: "bg-green-50",
  RETURN_REQUESTED: "bg-orange-50",
  MAINTENANCE: "bg-blue-50",
  LOST: "bg-rose-50",
  RETIRED: "bg-zinc-50",
};

const Th: React.FC<{
  label: string;
  col: keyof AssetResponseDTO;
  sortKey?: keyof AssetResponseDTO;
  sortDir?: "asc" | "desc";
  onSort?: (k: keyof AssetResponseDTO) => void;
}> = ({ label, col, sortKey, sortDir, onSort }) => {
  const aria =
    sortKey === col ? (sortDir === "asc" ? "ascending" : "descending") : "none";

  return (
    <th className="px-4 py-2 text-left" aria-sort={aria as any}>
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:underline"
        onClick={() => onSort?.(col)}
        title="Sort"
      >
        {label}
        <span className="text-[10px]">
          {sortKey === col ? (sortDir === "asc" ? "▲" : "▼") : "⋯"}
        </span>
      </button>
    </th>
  );
};

const AssetTable: React.FC<Props> = ({
  data,
  loading,
  sortKey,
  sortDir,
  onSort,
  onAssignClick,
}) => {
  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <Th label="#" col="id" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Name" col="assetName" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Serial" col="serialNumber" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="State" col="status" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Assigned To" col="employeeName" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Updated" col="updatedAt" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="px-4 py-6 text-center" colSpan={7}>
                Loading…
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center" colSpan={7}>
                No assets
              </td>
            </tr>
          ) : (
            data.map((a) => {
              const canAssign = a.status === AssetStatus.IN_STOCK;
              return (
                <tr
                  key={a.id}
                  className={`border-t ${rowBg[a.status] ?? "bg-white"} hover:bg-gray-100/60 transition-colors`}
                >
                  <td className="px-4 py-2">{a.id}</td>
                  <td className="px-4 py-2">{a.assetName}</td>
                  <td className="px-4 py-2">{a.serialNumber ?? "-"}</td>

                  {/* State (Status + Condition) */}
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={a.status} className="cursor-default" />
                      <span className="text-gray-300">•</span>
                      <ConditionBadge condition={a.condition} className="cursor-default" />
                    </div>
                  </td>

                  <td className="px-4 py-2">{a.employeeName ?? "-"}</td>
                  <td className="px-4 py-2">
                    {a.updatedAt ? new Date(a.updatedAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => canAssign && onAssignClick?.(a.id)}
                      disabled={!canAssign}
                      className={`px-3 py-1 rounded-lg border transition-colors ${
                        canAssign
                          ? "hover:bg-gray-50"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      title={canAssign ? "Assign this asset" : "Only IN_STOCK assets can be assigned"}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssetTable;
