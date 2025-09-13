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

  onAssignClick?: (assetId: number) => void;
  onConfirmReturn?: (assetId: number) => void;
  onConfirmIssue?: (assetId: number, status: AssetStatus) => void;
  onMarkInStock?: (assetId: number) => void;
  onApproveRetirement?: (assetId: number) => void;

  onEdit?: (asset: AssetResponseDTO) => void;
  onArchive?: (assetId: number) => void;

  startIndex?: number;
};

const rowBg: Partial<Record<AssetStatus, string>> = {
  IN_STOCK: "bg-white",
  ASSIGNED: "bg-yellow-50",
  ASSIGNED_CONFIRMED: "bg-green-50",
  RETURN_REQUESTED: "bg-orange-50",
  MAINTENANCE: "bg-blue-50",
  LOST: "bg-rose-50",
  RETIRE_REQUESTED: "bg-zinc-50",
  RETIRED: "bg-zinc-100",
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

const btnBase =
  "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
const btnGhost = "border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 focus-visible:ring-gray-300";
const iconBtn =
  "h-9 w-9 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300";
const chipMuted =
  "inline-flex items-center rounded-full border border-gray-200 bg-gray-100 text-gray-500 px-3 py-1.5 text-xs cursor-default";

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
  onApproveRetirement,
  onEdit,
  onArchive,
  startIndex = 0,
}) => {
  const isReturnReq = (s: AssetStatus) => s === AssetStatus.RETURN_REQUESTED;
  const isRetireReq = (s: AssetStatus) => s === AssetStatus.RETIRE_REQUESTED;
  // RETIRED hariç: Confirm Issue/Mark In Stock sadece bu iki durumda
  const isIssueState = (s: AssetStatus) => s === AssetStatus.MAINTENANCE || s === AssetStatus.LOST;
  const canMarkInStock = (s: AssetStatus) => s === AssetStatus.MAINTENANCE || s === AssetStatus.LOST;
  const canAssign = (s: AssetStatus) => s === AssetStatus.IN_STOCK;

  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <Th label="" align="left" />
            <Th label="#" />
            <Th label="Category" col="category" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Name" col="assetName" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Serial" col="serialNumber" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="State" col="status" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Assigned To" col="employeeName" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th label="Actions" align="center" />
            <Th label="Updated" col="updatedAt" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td className="px-4 py-6 text-center" colSpan={9}>Loading…</td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center" colSpan={9}>No assets</td>
            </tr>
          ) : (
            data.map((a, idx) => {
              const rowNo = startIndex + idx + 1;

              // BE true/false gelirse kullan; yoksa status'a göre varsayım
              const rawFlag = (a as any).issueConfirmable;
              const issueConfirmable =
                rawFlag === false
                  ? false
                  : isIssueState(a.status) || a.status === AssetStatus.RETIRED;

              return (
                <tr key={a.id} className={`border-t ${rowBg[a.status] ?? "bg-white"} hover:bg-gray-100/60 transition-colors`}>
                  {/* Leading icons */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={iconBtn}
                        title="Edit"
                        onClick={(e) => { (e.currentTarget as HTMLButtonElement).blur(); onEdit?.(a); }}
                        aria-label="Edit asset"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16.862 3.487a2.1 2.1 0 1 1 2.97 2.97L8.44 17.85l-4.24 1.27 1.27-4.24L16.862 3.487z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        className={iconBtn}
                        title="Archive"
                        onClick={(e) => { (e.currentTarget as HTMLButtonElement).blur(); onArchive?.(a.id); }}
                        aria-label="Archive asset"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 7h18" />
                          <path d="M7 7V4h10v3" />
                          <path d="M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
                          <path d="M10 11h4" />
                        </svg>
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-2">{rowNo}</td>
                  <td className="px-4 py-2">{a.category ?? "-"}</td>
                  <td className="px-4 py-2">{a.assetName}</td>
                  <td className="px-4 py-2">{a.serialNumber ?? "-"}</td>

                  <td className="px-4 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={a.status} className="cursor-default" />
                      <span className="text-gray-300">•</span>
                      <ConditionBadge condition={a.condition as AssetCondition} className="cursor-default" />
                    </div>
                  </td>

                  <td className="px-4 py-2">{a.employeeName ?? "-"}</td>

                  <td className="px-4 py-2">
                    <div className="flex justify-center items-center gap-2">
                      {isReturnReq(a.status) && (
                        <button
                          onClick={() => onConfirmReturn?.(a.id)}
                          className={`${btnBase} ${btnGhost}`}
                          title="Approve return (set IN_STOCK)"
                        >
                          Approve Return
                        </button>
                      )}

                      {isRetireReq(a.status) ? (
                        <button
                          onClick={() => onApproveRetirement?.(a.id)}
                          className={`${btnBase} ${btnGhost}`}
                          title="Approve retirement (set RETIRED)"
                        >
                          Approve Retirement
                        </button>
                      ) : a.status === AssetStatus.RETIRED ? (
                        <span className={chipMuted} title="No further actions available">
                          No further actions
                        </span>
                      ) : (
                        isIssueState(a.status) && (
                          <>
                            <button
                              onClick={() => issueConfirmable && onConfirmIssue?.(a.id, a.status)}
                              disabled={!issueConfirmable}
                              className={`${btnBase} ${btnGhost}`}
                              title={issueConfirmable ? "Confirm reported issue" : "Already confirmed"}
                            >
                              Confirm Issue
                            </button>

                            {canMarkInStock(a.status) && (
                              <button
                                onClick={() => onMarkInStock?.(a.id)}
                                className={`${btnBase} ${btnGhost}`}
                                title="Mark as IN_STOCK"
                              >
                                Mark In Stock
                              </button>
                            )}
                          </>
                        )
                      )}

                      {canAssign(a.status) && (
                        <button
                          onClick={() => onAssignClick?.(a.id)}
                          className={`${btnBase} ${btnGhost}`}
                          title="Assign this asset"
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
