// src/features/expenses/pages/MyExpensesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { expensesApi } from "../../../lib/expensesApi";
import {
  ExpenseResponseDTO,
  ExpenseCreateDTO,
  ExpenseUpdateDTO,
} from "../../../types/expense";
import ExpenseTable from "../components/ExpenseTable";
import ExpenseFormModal from "../components/ExpenseFormModal";
import MyAdjustmentsWidget from "../components/MyAdjustmentsWidget"; // OPTIONAL widget
import Pagination from "../../assets/components/Pagination"; // <-- added

const PAGE_SIZE = 10; // <-- same page size as ManagerReviewPage

export default function MyExpensesPage() {
  const [data, setData] = useState<ExpenseResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState<ExpenseResponseDTO | null>(null);

  // pagination state
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await expensesApi.listMy();
      setData(res.data.content ?? []);
      setPage(1); // reset to first page after reload
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async (p: ExpenseCreateDTO) => {
    await expensesApi.create(p);
    await load();
  };

  const update = async (p: ExpenseUpdateDTO) => {
    if (!editRow) return;
    await expensesApi.update(editRow.id, p);
    await load();
  };

  // --- Pagination calculations (mirrors ManagerReviewPage) ---
  // Use a memo so slicing doesn't re-run unnecessarily
  const total = data.length;
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, maxPage); // clamp page if dataset shrinks
  const start = (safePage - 1) * PAGE_SIZE;

  const paged = useMemo(
    () => data.slice(start, start + PAGE_SIZE),
    [data, start]
  );
  // -----------------------------------------------------------

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Expenses</h1>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl px-4 py-2 bg-indigo-600 text-white shadow hover:bg-indigo-500"
        >
          New Expense
        </button>
      </div>

      <ExpenseTable
        data={paged}                // <-- use paged data
        loading={loading}
        onEdit={(r) => {
          setEditRow(r);
          setOpen(true);
        }}
        onSubmit={async (id) => {
          await expensesApi.submit(id);
          await load();
        }}
        onWithdraw={async (id) => {
          await expensesApi.withdraw(id);
          await load();
        }}
        onDelete={async (id) => {
          if (window.confirm("Delete this expense?")) {
            await expensesApi.remove(id);
            await load();
          }
        }}
      />

      {/* Pagination (same component & look as ManagerReviewPage) */}
      <Pagination
        page={safePage}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />

      <MyAdjustmentsWidget />

      <ExpenseFormModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditRow(null);
        }}
        onSubmit={editRow ? update : create}
        initial={editRow ?? undefined}
      />
    </div>
  );
}
