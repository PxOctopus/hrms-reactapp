import React, { useState, useEffect } from "react";

export default function RejectReasonModal({
  open, onClose, onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (open) { setReason(""); setLoading(false); } }, [open]);
  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 grid place-items-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4">
        <div className="text-lg font-semibold">Reject Expense</div>
        <textarea className="w-full border rounded-lg p-2" rows={4}
          placeholder="Reason…" value={reason} onChange={e=>setReason(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={loading || !reason.trim()}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-50">
            {loading ? "Submitting…" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
