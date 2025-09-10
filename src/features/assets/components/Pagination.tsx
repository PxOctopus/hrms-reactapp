import React from "react";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<Props> = ({ page, pageSize, total, onPageChange }) => {
  const max = Math.max(1, Math.ceil(total / pageSize));

  const go = (p: number) => {
    const next = Math.min(Math.max(1, p), max);
    onPageChange(next);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="text-sm text-gray-600">
        Page {page} / {max} • {total} items
      </div>
      <button className="px-3 py-1 rounded-lg border" onClick={() => go(1)} disabled={page <= 1}>
        ⏮
      </button>
      <button className="px-3 py-1 rounded-lg border" onClick={() => go(page - 1)} disabled={page <= 1}>
        ‹ Prev
      </button>
      <button className="px-3 py-1 rounded-lg border" onClick={() => go(page + 1)} disabled={page >= max}>
        Next ›
      </button>
      <button className="px-3 py-1 rounded-lg border" onClick={() => go(max)} disabled={page >= max}>
        ⏭
      </button>
    </div>
  );
};

export default Pagination;
