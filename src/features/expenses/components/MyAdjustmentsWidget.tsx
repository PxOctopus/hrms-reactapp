// src/features/expenses/components/MyAdjustmentsWidget.tsx
import { useEffect, useMemo, useState } from "react";
import { expensesApi } from "../../../lib/expensesApi";
import type { PayrollAdjustment } from "../../../types/payroll";

type Props = {
  pageSize?: number;       // items per page (default 5)
  onSeeAll?: () => void;   // optional: navigate to full page
};

type PageResp<T> = {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number; // current page (0-based)
  size?: number;
};

export default function MyAdjustmentsWidget({ pageSize = 5, onSeeAll }: Props) {
  const [rows, setRows] = useState<PayrollAdjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // pagination state (server-side)
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [totalElements, setTotalElements] = useState<number | undefined>(undefined);

  // number formatter
  const fmt = useMemo(
    () =>
      new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const load = async (p = page) => {
    setLoading(true);
    setErr(null);
    try {
      const res = (await expensesApi.myAdjustments(p, pageSize)) as {
        data: PageResp<PayrollAdjustment>;
      };
      const data = res.data ?? ({} as PageResp<PayrollAdjustment>);
      setRows(data.content ?? []);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(0);
    setPage(0);
  }, [pageSize]);

  useEffect(() => {
    void load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Infer next/prev availability when server doesn't send totals
  const hasPrev = page > 0;
  const hasNext =
    (typeof totalPages === "number" && page + 1 < totalPages) ||
    (typeof totalPages !== "number" && rows.length === pageSize); // guess

  // Loading skeleton
  if (loading && !rows.length) {
    return (
      <div className="rounded-xl border p-4 bg-white">
        <Header onSeeAll={onSeeAll} />
        <ul className="space-y-2">
          {Array.from({ length: pageSize }).map((_, i) => (
            <li key={i} className="flex items-center justify-between">
              <div className="h-3 w-40 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
            </li>
          ))}
        </ul>
        <PaginationBar
          page={page}
          totalPages={totalPages}
          hasPrev={hasPrev}
          hasNext={true}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => p + 1)}
          onGoto={(p) => setPage(p)}
        />
      </div>
    );
  }

  // Hide entirely if empty and no error
  if (!rows.length && !err) return null;

  return (
    <div className="rounded-xl border p-4 bg-white">
      <Header onSeeAll={onSeeAll} />

      {err ? (
        <div className="text-sm text-red-600">Error: {err}</div>
      ) : (
        <>
          <ul className="space-y-1 text-sm">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{formatDate(r.effectiveDate)}</span>
                  <TypeBadge type={r.type} />
                </div>
                <span className="font-medium tabular-nums">
                  {safeFormat(fmt, r.amount)} {r.currency ?? "TRY"}
                </span>
              </li>
            ))}
          </ul>

          <PaginationBar
            page={page}
            totalPages={totalPages}
            hasPrev={hasPrev}
            hasNext={hasNext}
            totalElements={totalElements}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => p + 1)}
            onGoto={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function Header({ onSeeAll }: { onSeeAll?: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="font-medium">My Adjustments</div>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="text-xs rounded-lg border px-2 py-1 hover:bg-gray-50"
        >
          See all
        </button>
      )}
    </div>
  );
}

/** Compact, modern pagination (different look than My Expenses): ghost pills + ellipsis */
function PaginationBar({
  page,
  totalPages,
  hasPrev,
  hasNext,
  totalElements,
  onPrev,
  onNext,
  onGoto,
}: {
  page: number; // 0-based
  totalPages?: number;
  hasPrev: boolean;
  hasNext: boolean;
  totalElements?: number;
  onPrev: () => void;
  onNext: () => void;
  onGoto: (p: number) => void;
}) {
  // Build a compact page list like: [1] … 4 5 6 … 10 (1-based for users)
  const items = buildCompactPages(page, totalPages);

  return (
    <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
      <div>
        {typeof totalElements === "number" && (
          <span className="hidden sm:inline">
            {totalElements} item{totalElements === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          className="rounded-full border px-2 py-1 hover:bg-gray-50 disabled:opacity-40"
          onClick={onPrev}
          disabled={!hasPrev}
          title="Previous"
        >
          ‹
        </button>

        {items.map((it, idx) =>
          it.kind === "page" ? (
            <button
              key={idx}
              className={`rounded-full px-3 py-1 border transition ${
                it.index === page
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => onGoto(it.index)}
              aria-current={it.index === page ? "page" : undefined}
            >
              {it.label}
            </button>
          ) : (
            <span key={idx} className="px-1">
              …
            </span>
          )
        )}

        <button
          className="rounded-full border px-2 py-1 hover:bg-gray-50 disabled:opacity-40"
          onClick={onNext}
          disabled={!hasNext}
          title="Next"
        >
          ›
        </button>
      </div>
    </div>
  );
}

// Build a compact pagination model
function buildCompactPages(current: number, totalPages?: number) {
  // If we don't know totals, just show current page and next slot
  if (typeof totalPages !== "number" || totalPages <= 1) {
    return [{ kind: "page" as const, index: current, label: current + 1 }];
  }

  const pages: Array<{ kind: "page"; index: number; label: number } | { kind: "dots" }> = [];
  const last = totalPages - 1;

  const pushPage = (i: number) =>
    pages.push({ kind: "page", index: i, label: i + 1 });
  const pushDots = () => pages.push({ kind: "dots" });

  // Always include first
  pushPage(0);

  // Left gap
  if (current > 2) pushDots();

  // Middle window
  for (let i = Math.max(1, current - 1); i <= Math.min(last - 1, current + 1); i++) {
    pushPage(i);
  }

  // Right gap
  if (current < last - 2) pushDots();

  // Always include last
  if (last > 0) pushPage(last);

  // De-duplicate if overlaps when near ends
  return dedupePages(pages);
}

function dedupePages(
  items: Array<{ kind: "page"; index: number; label: number } | { kind: "dots" }>
) {
  const out: typeof items = [];
  let prevKey = "";
  for (const it of items) {
    const key = it.kind === "page" ? `p${it.index}` : "dots";
    if (key === prevKey) continue;
    out.push(it);
    prevKey = key;
  }
  return out;
}

/** Small colored pill for adjustment type */
function TypeBadge({ type }: { type?: string | null }) {
  const t = (type ?? "Adjustment").toUpperCase();
  const styles: Record<string, string> = {
    BONUS: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    DEDUCTION: "bg-rose-50 text-rose-700 ring-rose-200",
    CORRECTION: "bg-amber-50 text-amber-700 ring-amber-200",
    ADJUSTMENT: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  };
  const cls = styles[t] ?? "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ring-1 ${cls}`} title={t}>
      {toTitleCase(t)}
    </span>
  );
}

/** Robust amount formatting when API returns string amounts */
function safeFormat(fmt: Intl.NumberFormat, amount?: number | string | null) {
  if (amount == null || amount === "") return "—";
  const num = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(num)) return String(amount);
  return fmt.format(num);
}

/** Safe date formatting; accepts ISO or yyyy-mm-dd */
function formatDate(s?: string | null) {
  if (!s) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return new Intl.DateTimeFormat("tr-TR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function toTitleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
