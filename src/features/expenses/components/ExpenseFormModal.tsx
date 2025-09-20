import React, { useEffect, useState } from "react";
import { ExpenseCategory, ExpenseCreateDTO, ExpenseUpdateDTO, PaymentMethod, ReceiptType } from "../../../types/expense";

export default function ExpenseFormModal({
  open, onClose, onSubmit, initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ExpenseCreateDTO | ExpenseUpdateDTO) => Promise<void> | void;
  initial?: Partial<ExpenseUpdateDTO>;
}) {
  const [form, setForm] = useState<ExpenseCreateDTO>({
    category: "OTHER",
    currency: "TRY",
    grossAmount: "",
    expenseDate: new Date().toISOString().slice(0,10),
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        category: (initial?.category ?? "OTHER") as ExpenseCategory,
        currency: initial?.currency ?? "TRY",
        grossAmount: (initial?.grossAmount ?? "") as string,
        vatAmount: (initial?.vatAmount ?? "") as any,
        tipAmount: (initial?.tipAmount ?? "") as any,
        paymentMethod: initial?.paymentMethod as PaymentMethod,
        receiptType: initial?.receiptType as ReceiptType,
        expenseDate: initial?.expenseDate ?? new Date().toISOString().slice(0,10),
        location: initial?.location ?? "",
        note: initial?.note ?? "",
        receiptFiles: initial?.receiptFiles ?? [],
      });
      setSaving(false); setErr(null);
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = async () => {
    setSaving(true); setErr(null);
    try { await onSubmit(form); onClose(); }
    catch (e:any) { setErr(e?.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/20 grid place-items-center p-4 z-50">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{initial ? "Edit Expense" : "New Expense"}</h2>
          <button onClick={onClose} className="rounded-lg border px-3 py-1">Close</button>
        </div>

        {err && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Category
            <select className="mt-1 w-full border rounded-lg p-2" value={form.category}
              onChange={e=>setForm({...form, category: e.target.value as ExpenseCategory})}>
              {["BUSINESS_MEAL","CONGRESS_PARTICIPATION","AIR_FARE","ACCOMMODATION","GROUND_TRANSPORT","MILEAGE","OFFICE_SUPPLIES","OTHER"]
                .map(c => <option key={c}>{c}</option>)}
            </select>
          </label>

          <label className="text-sm">Date
            <input type="date" className="mt-1 w-full border rounded-lg p-2"
              value={form.expenseDate} onChange={e=>setForm({...form, expenseDate: e.target.value})}/>
          </label>

          <label className="text-sm">Amount (TRY)
            <input type="number" step="0.01" className="mt-1 w-full border rounded-lg p-2"
              value={form.grossAmount} onChange={e=>setForm({...form, grossAmount: e.target.value})}/>
          </label>

          <label className="text-sm">VAT
            <input type="number" step="0.01" className="mt-1 w-full border rounded-lg p-2"
              value={form.vatAmount ?? ""} onChange={e=>setForm({...form, vatAmount: e.target.value || null})}/>
          </label>

          <label className="text-sm">Tip
            <input type="number" step="0.01" className="mt-1 w-full border rounded-lg p-2"
              value={form.tipAmount ?? ""} onChange={e=>setForm({...form, tipAmount: e.target.value || null})}/>
          </label>

          <label className="text-sm">Payment (opt.)
            <select className="mt-1 w-full border rounded-lg p-2"
              value={form.paymentMethod ?? ""} onChange={e=>setForm({...form, paymentMethod: (e.target.value || null) as any})}>
              <option value="">-</option>
              <option value="COMPANY_CARD">COMPANY_CARD</option>
              <option value="PERSONAL_CARD">PERSONAL_CARD</option>
              <option value="CASH">CASH</option>
            </select>
          </label>

          <label className="col-span-2 text-sm">Location (opt.)
            <input className="mt-1 w-full border rounded-lg p-2" value={form.location ?? ""} onChange={e=>setForm({...form, location: e.target.value})}/>
          </label>

          <label className="col-span-2 text-sm">Note (opt.)
            <textarea className="mt-1 w-full border rounded-lg p-2" rows={3}
              value={form.note ?? ""} onChange={e=>setForm({...form, note: e.target.value})}/>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !form.grossAmount}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
