import React, { useMemo, useState } from "react";
import { ExpenseResponseDTO } from "../../../types/expense";

const pill: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-yellow-100 text-yellow-800",
};

type SortKey = "expenseDate" | "category" | "amount" | "status";
type SortDir = "asc" | "desc";

const Th: React.FC<{
  label: string;
  col?: SortKey;
  activeKey?: SortKey;
  dir?: SortDir;
  onSort?: (k: SortKey) => void;
  align?: "left" | "center" | "right";
}> = ({ label, col, activeKey, dir, onSort, align = "left" }) => {
  const isActive = col && activeKey === col;
  const aria = col && isActive ? (dir === "asc" ? "ascending" : "descending") : "none";
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
          <span className="text-[10px]">{isActive ? (dir === "asc" ? "▲" : "▼") : "⋯"}</span>
        </button>
      ) : (
        <span>{label}</span>
      )}
    </th>
  );
};

export default function ExpenseTable({
  data,
  loading,
  // employee actions
  onEdit, onSubmit, onWithdraw, onDelete,
  // manager actions
  onApprove, onReject, onMarkPaid, onInspect,
  // optional columns
  showPayrollColumn,
}: {
  data: ExpenseResponseDTO[];
  loading?: boolean;

  // employee
  onEdit?: (row: ExpenseResponseDTO) => void;
  onSubmit?: (id: number) => void;
  onWithdraw?: (id: number) => void;
  onDelete?: (id: number) => void;

  // manager
  onApprove?: (id: number) => void;
  onReject?: (row: ExpenseResponseDTO) => void;
  onMarkPaid?: (row: ExpenseResponseDTO) => void;
  onInspect?: (row: ExpenseResponseDTO) => void;

  showPayrollColumn?: boolean;
}) {
  // default: latest first (date desc)
  const [sortKey, setSortKey] = useState<SortKey>("expenseDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const sorted = useMemo(() => {
    const norm = (row: ExpenseResponseDTO, key: SortKey): number | string => {
      if (key === "amount") {
        const v = Number(row.netAmount ?? row.grossAmount ?? 0);
        return Number.isNaN(v) ? 0 : v;
      }
      if (key === "expenseDate") {
        const t = Date.parse(String(row.expenseDate ?? ""));
        return Number.isNaN(t) ? 0 : t;
      }
      if (key === "status") return row.status ?? "";
      return (row.category ?? "").toString();
    };
    const arr = [...data];
    arr.sort((a, b) => {
      const va = norm(a, sortKey);
      const vb = norm(b, sortKey);
      if (va === vb) return 0;
      const res = va > vb ? 1 : -1;
      return sortDir === "asc" ? res : -res;
    });
    return arr;
  }, [data, sortKey, sortDir]);

  const baseCols = 5; // Date, Category, Amount, Status, Actions
  const extraCols = (onInspect ? 1 : 0) + (showPayrollColumn ? 1 : 0);
  const colSpan = baseCols + extraCols;

  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            {/* Manager için Inspect ikonu (satır başında) */}
            {onInspect && <Th label="" />}
            <Th label="Date"     col="expenseDate" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="Category" col="category"    activeKey={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="Amount"   col="amount"      activeKey={sortKey} dir={sortDir} onSort={handleSort} />
            <Th label="Status"   col="status"      activeKey={sortKey} dir={sortDir} onSort={handleSort} />
            {showPayrollColumn && <Th label="PAYROLL" />}
            <Th label="Actions" align="right" />
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colSpan} className="px-4 py-6 text-center text-gray-500">Loading…</td>
            </tr>
          ) : sorted.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="px-4 py-6 text-center text-gray-500">No expenses</td>
            </tr>
          ) : (
            sorted.map((x) => {
              const amount = Number(x.netAmount ?? x.grossAmount ?? 0);

              const payrollChip =
                x.status === "APPROVED"
                  ? (x.paidAt
                      ? <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800" title={new Date(x.paidAt).toLocaleDateString()}>PAID</span>
                      : <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">QUEUED</span>)
                  : <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">—</span>;

              const rejectedTooltip = x.status === "REJECTED" && x.managerDecisionNote
                ? `Reason: ${x.managerDecisionNote}`
                : undefined;

              return (
                <tr key={x.id} className="border-t hover:bg-gray-50/80">
                  {/* Inspect (manager) */}
                  {onInspect && (
                    <td className="px-2 py-2 w-10">
                      <button
                        type="button"
                        onClick={() => onInspect(x)}
                        title="Inspect"
                        className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="7" />
                          <path d="M21 21l-4.35-4.35" />
                        </svg>
                      </button>
                    </td>
                  )}

                  <td className="px-4 py-2">
                    {x.expenseDate ? new Date(String(x.expenseDate)).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2">{x.category}</td>
                  <td className="px-4 py-2">{amount} {x.currency ?? "TRY"}</td>
                  <td className="px-4 py-2">
                    <div className="inline-flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${pill[x.status] || pill.DRAFT}`}>
                        {x.status}
                      </span>
                      {rejectedTooltip && (
                        <span
                          title={rejectedTooltip}
                          className="inline-grid place-items-center h-4 w-4 rounded-full border border-gray-300 text-gray-600 text-[10px] cursor-help"
                          aria-label="Rejection reason"
                        >
                          ?
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Payroll (manager) */}
                  {showPayrollColumn && <td className="px-4 py-2">{payrollChip}</td>}

                  {/* Actions */}
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      {/* Employee actions */}
                      {x.allowedActions?.includes("EDIT") && onEdit && (
                        <button className="px-3 py-1 rounded-lg border hover:bg-gray-50" onClick={() => onEdit(x)}>Edit</button>
                      )}
                      {x.allowedActions?.includes("SUBMIT") && onSubmit && (
                        <button className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500" onClick={() => onSubmit(x.id)}>Submit</button>
                      )}
                      {x.allowedActions?.includes("WITHDRAW") && onWithdraw && (
                        <button className="px-3 py-1 rounded-lg border hover:bg-gray-50" onClick={() => onWithdraw(x.id)}>Withdraw</button>
                      )}
                      {x.allowedActions?.includes("DELETE") && onDelete && (
                        <button className="px-3 py-1 rounded-lg border text-red-600 hover:bg-red-50" onClick={() => onDelete(x.id)}>Delete</button>
                      )}

                      {/* Manager actions */}
                      {onApprove && x.status === "SUBMITTED" && (
                        <button className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-500" onClick={() => onApprove(x.id)}>Approve</button>
                      )}
                      {onReject && x.status === "SUBMITTED" && (
                        <button className="px-3 py-1 rounded-lg border text-red-600 hover:bg-red-50" onClick={() => onReject(x)}>Reject</button>
                      )}
                      {onMarkPaid && x.status === "APPROVED" && !x.paidAt && (
                        <button className="px-3 py-1 rounded-lg border hover:bg-gray-50" onClick={() => onMarkPaid(x)}>
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
