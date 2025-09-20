import React from "react";

export default function Modal({
  open, onClose, title, children, maxWidth = 560
}: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode; maxWidth?: number }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[92vw]"
           style={{ maxWidth }}>
        <div className="bg-white rounded-2xl shadow-xl border">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold">{title}</h3>
            <button className="rounded-lg border px-2 py-1 text-sm" onClick={onClose}>Close</button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}