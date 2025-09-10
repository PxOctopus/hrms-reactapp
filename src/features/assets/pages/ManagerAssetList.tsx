// src/features/asset/pages/ManagerAssetList.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { assetApi, type AssetResponseDTO, AssetStatus } from "../../../lib/assetApi";
import AssetTable from "../components/AssetTable";
import Pagination from "../components/Pagination";
import CreateAssetDrawer from "../components/CreateAssetDrawer";
import AssignDrawer from "../components/AssignDrawer";

const PAGE_SIZE = 10;

type SortableKeys =
  | "id"
  | "assetName"
  | "serialNumber"
  | "employeeName"
  | "status"
  | "condition"
  | "updatedAt"
  | "createdAt"
  | "category";

const ManagerAssetList: React.FC = () => {
  const [raw, setRaw] = useState<AssetResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AssetStatus | "">("");
  const [sortKey, setSortKey] = useState<SortableKeys>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [openCreate, setOpenCreate] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignId, setAssignId] = useState<number | null>(null);

  // FETCH: keep status filter in deps so list refreshes when dropdown changes
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await assetApi.list(status === "" ? undefined : (status as AssetStatus));
      setRaw(list);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  // Text filter against multiple fields
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter((a) =>
      (a.assetName ?? "").toLowerCase().includes(q) ||
      (a.serialNumber ?? "").toLowerCase().includes(q) ||
      (a.employeeName ?? "").toLowerCase().includes(q) ||
      (a.category ?? "").toLowerCase().includes(q) ||
      (a.location ?? "").toLowerCase().includes(q)
    );
  }, [raw, query]);

  // Generic normalizer for sorting
  const norm = (val: unknown) => {
    if (val == null) return "";
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      const t = Date.parse(val);
      return Number.isNaN(t) ? String(val).toLowerCase() : t;
    }
    if (val instanceof Date) return val.getTime();
    if (typeof val === "number") return val;
    return String(val).toLowerCase();
  };

  // Sort current filtered set
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((x, y) => {
      const a = norm(x[sortKey as keyof AssetResponseDTO]);
      const b = norm(y[sortKey as keyof AssetResponseDTO]);
      if (a === b) return 0;
      return sortDir === "asc" ? (a > b ? 1 : -1) : (a < b ? 1 : -1);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // Pagination calc
  const total = sorted.length;
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageSafe = Math.min(page, maxPage);
  const start = (pageSafe - 1) * PAGE_SIZE;
  const paged = sorted.slice(start, start + PAGE_SIZE);

  // Sort toggler
  const handleSort = (key: SortableKeys) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setQuery("");
    setStatus("");
    setSortKey("createdAt");
    setSortDir("desc");
    setPage(1);
    setAssignOpen(false);
    setAssignId(null);
    void load();
  };

  // ACTIONS: Manager ops wired to backend rules
  const handleConfirmReturn = async (assetId: number) => {
    // Manager approves return → IN_STOCK (controller maps to changeStatus)
    await assetApi.approveReturn(assetId);
    await load();
  };

  const handleConfirmIssue = async (assetId: number, status: AssetStatus) => {
    // Manager confirms MAINTENANCE/LOST/RETIRED → same status, only an audit event is recorded
    await assetApi.changeStatus(assetId, { status, note: "Issue confirmed" });
    await load();
  };

  const handleMarkInStock = async (assetId: number) => {
    // Mark back to stock allowed for LOST/MAINTENANCE (and RETURN_REQUESTED via approveReturn)
    await assetApi.changeStatus(assetId, { status: AssetStatus.IN_STOCK, note: "Manager set to IN_STOCK" });
    await load();
  };

  // Keep pagination stable when inputs change
  useEffect(() => { setPage(1); }, [query, status, sortKey, sortDir]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
        <div className="flex gap-2">
          <input
            placeholder="Search name/serial/employee…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border rounded-lg px-3 py-2 w-64"
          />
          <select
            className="border rounded-lg px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="">All statuses</option>
            {Object.values(AssetStatus).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Peoplea primary button */}
          <button className="px-3 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  onClick={() => setOpenCreate(true)}>
            + New Asset
          </button>

          <button className="px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
          <button className="px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      <AssetTable
        data={paged}
        loading={loading}
        sortKey={sortKey as keyof AssetResponseDTO}
        sortDir={sortDir}
        onSort={(k) => handleSort(k as SortableKeys)}
        onAssignClick={(id) => { setAssignId(id); setAssignOpen(true); }}
        onConfirmReturn={handleConfirmReturn}
        onConfirmIssue={handleConfirmIssue}
        onMarkInStock={handleMarkInStock}
      />

      <Pagination page={pageSafe} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      <CreateAssetDrawer
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={() => {
          setOpenCreate(false);
          void load();
        }}
      />

      <AssignDrawer
        open={assignOpen}
        assetId={assignId}
        onClose={() => {
          setAssignOpen(false);
          setAssignId(null);
        }}
        onAssigned={() => void load()}
      />
    </div>
  );
};

export default ManagerAssetList;
