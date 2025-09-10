import React from "react";
import { AssetResponseDTO, AssetStatus, AssetCondition } from "../../../lib/assetApi";
import { StatusBadge } from "../components/StatusBadge";
import { ConditionBadge } from "../components/ConditionBadge";

type Props = {
  data: AssetResponseDTO[];
  loading?: boolean;
  sortKey?: keyof AssetResponseDTO;
  sortDir?: "asc" | "desc";
  onSort?: (key: keyof AssetResponseDTO) => void;

  // Actions
  onAssignClick?: (assetId: number) => void;
  onConfirmReturn?: (assetId: number) => void;
  onConfirmIssue?: (assetId: number, status: AssetStatus) => void;
  onMarkInStock?: (assetId: number) => void;
};

// Row pastel backgrounds
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
  col?: keyof AssetResponseDTO;
  sortKey?: keyof AssetResponseDTO;
  sortDir?: "asc" | "desc";
  onSort?: (k: keyof AssetResponseDTO) => void;
  align?: "left" | "center" | "right";
}> = ({ label, col, sortKey, sortDir, onSort, align = "left" }) => {
  const aria = col && sortKey === col ? (sortDir === "asc" ? "ascending" : "descending") : "none";
  return (
    <th className={`px-4 py-2 text-${align}`} aria-sort={aria as any}>
      {col ? (
        <button
          type="button"
          className="inline-flex items-center gap-1 hover:underline"
          onClick={() => onSort?.(col)}
          title="Sort"
        >
          {label}
          <span className="text-[10px]">{sortKey === col ? (sortDir === "asc" ? "▲" : "▼") : "⋯"}</span>
        </button>
      ) : (
        <span>{label}</span>
      )}
    </th>
  );
};

// Peoplea-ish ghost buttons
const btnBase =
  "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
const btnGhost =
  "border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 focus:ring-gray-300";

const AssetTable: React.FC<Props> = ({
  data,
  loading,
  sortKey,
  sortDir,
  onSort,
  onAssignClick,
  onConfirmReturn,
  onConfirmIssue,
  onMarkInStock,
}) => {
  // visibility helpers
  const isReturnReq = (s: AssetStatus) => s === AssetStatus.RETURN_REQUESTED;
  const isIssueState = (s: AssetStatus) =>
    s === AssetStatus.MAINTENANCE || s === AssetStatus.LOST || s === AssetStatus.RETIRED;
  const isMarkableToStock = (s: AssetStatus) => s === AssetStatus.MAINTENANCE || s === AssetStatus.LOST;
  const isAssignable = (s: AssetStatus) => s === AssetStatus.IN_STOCK;

  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <Th label="#" col="id" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Category" col="category" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Name" col="assetName" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Serial" col="serialNumber" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="State" col="status" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Assigned To" col="employeeName" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            {/* Actions BEFORE Updated; centered */}
            <Th label="Actions" align="center" />
            <Th label="Updated" col="updatedAt" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td className="px-4 py-6 text-center" colSpan={8}>
                Loading…
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center" colSpan={8}>
                No assets
              </td>
            </tr>
          ) : (
            data.map((a) => {
              // Optional BE flag for single-confirm UX
              const issueConfirmable =
                (a as any).issueConfirmable !== undefined
                  ? Boolean((a as any).issueConfirmable)
                  : isIssueState(a.status);

              return (
                <tr
                  key={a.id}
                  className={`border-t ${rowBg[a.status] ?? "bg-white"} hover:bg-gray-100/60 transition-colors`}
                >
                  <td className="px-4 py-2">{a.id}</td>
                  <td className="px-4 py-2">{a.category ?? "-"}</td>
                  <td className="px-4 py-2">{a.assetName}</td>
                  <td className="px-4 py-2">{a.serialNumber ?? "-"}</td>

                  {/* State (Status + Condition) */}
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={a.status} className="cursor-default" />
                      <span className="text-gray-300">•</span>
                      <ConditionBadge condition={a.condition as AssetCondition | null} className="cursor-default" />
                    </div>
                  </td>

                  <td className="px-4 py-2">{a.employeeName ?? "-"}</td>

                  {/* Contextual actions */}
                  <td className="px-4 py-2">
                    <div className="flex justify-center items-center gap-2">
                      {/* RETURN_REQUESTED → Approve Return */}
                      {isReturnReq(a.status) && (
                        <button
                          onClick={() => onConfirmReturn?.(a.id)}
                          className={`${btnBase} ${btnGhost}`}
                          title="Approve return (set IN_STOCK)"
                        >
                          Approve Return
                        </button>
                      )}

                      {/* MAINTENANCE/LOST/RETIRED → Confirm Issue */}
                      {isIssueState(a.status) && (
                        <button
                          onClick={() => issueConfirmable && onConfirmIssue?.(a.id, a.status)}
                          disabled={!issueConfirmable}
                          className={`${btnBase} ${btnGhost}`}
                          title={issueConfirmable ? "Confirm reported issue" : "Already confirmed"}
                        >
                          Confirm Issue
                        </button>
                      )}

                      {/* ONLY MAINTENANCE/LOST → Mark In Stock (render ONLY here) */}
                      {isMarkableToStock(a.status) && (
                        <button
                          onClick={() => onMarkInStock?.(a.id)}
                          className={`${btnBase} ${btnGhost}`}
                          title="Mark as IN_STOCK"
                        >
                          Mark In Stock
                        </button>
                      )}

                      {/* ONLY IN_STOCK → Assign (render ONLY here) */}
                      {isAssignable(a.status) && (
                        <button
                          onClick={() => onAssignClick?.(a.id)}
                          className={`${btnBase} ${btnGhost}`}
                          title="Assign"
                        >
                          Assign
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-2">{a.updatedAt ? new Date(a.updatedAt).toLocaleString() : "-"}</td>
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
