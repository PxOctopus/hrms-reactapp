// src/features/expenses/pages/ManagerReviewPage.tsx
import { useEffect, useMemo, useState } from "react";
import { expensesApi } from "../../../lib/expensesApi";
import { ExpenseResponseDTO } from "../../../types/expense";
import ExpenseTable from "../components/ExpenseTable";
import Pagination from "../../assets/components/Pagination";
import Modal from "../../../components/Modal";

type StatusOpt = "ALL" | "SUBMITTED" | "APPROVED" | "REJECTED";
const PAGE_SIZE = 10;

export default function ManagerReviewPage() {
  const [status, setStatus] = useState<StatusOpt>("ALL");   // <-- default ALL
  const [paidOnly, setPaidOnly] = useState(false);
  const [data, setData] = useState<ExpenseResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [inspectOpen, setInspectOpen] = useState(false);
  const [inspectRow,    setInspectRow]    = useState<ExpenseResponseDTO | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const s = status === "ALL" ? undefined : status;
      const res = await expensesApi.reviewQueue(s as any, 0, 500);
      setData(res.data.content ?? []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); setPage(1); }, [status, paidOnly]);

  const base = useMemo(() => {
    if (status !== "APPROVED" || !paidOnly) return data;
    return data.filter((x) => x.paidAt);
  }, [data, status, paidOnly]);

  const total = base.length;
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, maxPage);
  const start = (safePage - 1) * PAGE_SIZE;
  const paged = base.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Review Expenses</h1>

        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusOpt)}
            title="Filter by status"
          >
            <option value="ALL">All</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-indigo-600"
              checked={paidOnly}
              onChange={(e) => setPaidOnly(e.target.checked)}
              disabled={status !== "APPROVED"}
            />
            Paid only
          </label>

          <button className="ml-2 rounded-lg border px-3 py-2" onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <ExpenseTable
        data={paged}
        loading={loading}
        showPayrollColumn
        onInspect={(row) => { setInspectRow(row); setInspectOpen(true); }}
        onApprove={async (id) => { await expensesApi.approve(id); await load(); }}
        onReject={async (row) => {
          const reason = window.prompt("Reason for rejection?")?.trim();
          if (!reason) return;
          await expensesApi.reject(row.id, reason);
          await load();
        }}
        onMarkPaid={async (row) => { await expensesApi.markPaid(row.id); await load(); }}
      />

      <Pagination page={safePage} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      {/* Inspect modal */}
      <Modal open={inspectOpen} onClose={() => setInspectOpen(false)} title={`Expense #${inspectRow?.id || ""}`}>
        {inspectRow && (
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-500">Date:</span> {inspectRow.expenseDate}</div>
            <div><span className="text-gray-500">Employee:</span> {inspectRow.employeeName ?? "—"}</div>
            <div><span className="text-gray-500">Category:</span> {inspectRow.category}</div>
            <div><span className="text-gray-500">Payment:</span> {inspectRow.paymentMethod ?? "—"}</div>
           {/* <div><span className="text-gray-500">Receipt:</span> {inspectRow.receiptType ?? "—"}</div> */} 
            <div><span className="text-gray-500">Location:</span> {inspectRow.location ?? "—"}</div>
            {inspectRow.note && <div><span className="text-gray-500">Note:</span> {inspectRow.note}</div>}
            {inspectRow.receiptFiles?.length ? (
              <div>
                <div className="text-gray-500">Files:</div>
                <ul className="list-disc pl-5">
                  {inspectRow.receiptFiles.map((k, i) => <li key={i}>{k}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
}
