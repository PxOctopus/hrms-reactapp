// src/features/asset/components/Pagination.tsx
import React from "react";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
};

const btnBase =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed";
const btnGhost =
  "border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 focus:ring-gray-300";

const Pagination: React.FC<Props> = ({ page, pageSize, total, onPageChange }) => {
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < maxPage;

  return (
    <div className="mt-4 flex items-center justify-end gap-3 text-sm">
      <div className="text-gray-600">
        Page <span className="font-medium">{page}</span> / {maxPage} •{" "}
        <span className="font-medium">{total}</span> items
      </div>

      <div className="flex items-center gap-2">
        <button
          className={`${btnBase} ${btnGhost}`}
          onClick={() => onPageChange(1)}
          disabled={!canPrev}
          title="First page"
        >
          «
        </button>
        <button
          className={`${btnBase} ${btnGhost}`}
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          title="Previous"
        >
          ‹ Prev
        </button>
        <button
          className={`${btnBase} ${btnGhost}`}
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          title="Next"
        >
          Next ›
        </button>
        <button
          className={`${btnBase} ${btnGhost}`}
          onClick={() => onPageChange(maxPage)}
          disabled={!canNext}
          title="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;
