import React, { useEffect, useState } from "react";
import {
  assetApi,
  type EmployeeAssetResponseDTO,
  type AssetConfirmRequestDTO,
  type AssetReturnRequestDTO,
  type AssetIssueReportRequestDTO,
  AssetStatus,
} from "../../lib/assetApi";
import { StatusBadge } from "../assets/components/StatusBadge";

const btnBase =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
const btnGhost =
  "border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 focus:ring-gray-300";
const btnPrimary =
  "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-300";
const btnWarn =
  "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-300";
const btnInfo =
  "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-300";

const MyAssets: React.FC = () => {
  const [items, setItems] = useState<EmployeeAssetResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Issue flow state
  const [issueAssetId, setIssueAssetId] = useState<number | null>(null);
  const [issueType, setIssueType] = useState<AssetStatus | "">("");

  // Single busy flag per-asset
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await assetApi.myAssets();
      setItems(data);
    } catch (e: any) {
      setBanner({ type: "error", text: e?.response?.data?.message ?? "Failed to load assets." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const flash = (type: "success" | "error", text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 2000);
  };

  const confirm = async (id: number) => {
    setBusyId(id);
    try {
      const body: AssetConfirmRequestDTO = {};
      await assetApi.confirm(id, body);
      flash("success", "Confirmed. Manager notified.");
      await load();
    } catch {
      flash("error", "Failed to confirm.");
    } finally {
      setBusyId(null);
    }
  };

  const requestReturn = async (id: number) => {
    setBusyId(id);
    try {
      const body: AssetReturnRequestDTO = { reason: "Return requested by employee" };
      await assetApi.requestReturn(id, body);
      flash("success", "Return request sent to manager.");
      await load();
    } catch {
      flash("error", "Failed to request return.");
    } finally {
      setBusyId(null);
    }
  };

  // NEW: Undo return request
  const cancelReturnRequest = async (id: number) => {
    setBusyId(id);
    try {
      await assetApi.cancelReturnRequest(id);
      flash("success", "Return request canceled.");
      await load();
    } catch {
      flash("error", "Failed to cancel return request.");
    } finally {
      setBusyId(null);
    }
  };

  const reportIssue = async (id: number, type: AssetStatus) => {
    setBusyId(id);
    try {
      const payload: AssetIssueReportRequestDTO = { issueType: type };
      await assetApi.reportIssue(id, payload);
      flash("success", "Issue reported to manager.");
      await load();
      setIssueAssetId(null);
      setIssueType("");
    } catch {
      flash("error", "Failed to report issue.");
    } finally {
      setBusyId(null);
    }
  };

  // NEW: Undo issue report (BE rule: allowed for MAINTENANCE/LOST, NOT for RETIRED)
  const cancelIssueReport = async (id: number) => {
    setBusyId(id);
    try {
      await assetApi.cancelIssueReport(id);
      flash("success", "Issue report canceled.");
      await load();
    } catch {
      flash("error", "Failed to cancel issue report.");
    } finally {
      setBusyId(null);
    }
  };

  const isIssueState = (s: string | AssetStatus) =>
    s === AssetStatus.MAINTENANCE || s === AssetStatus.LOST || s === AssetStatus.RETIRED;

  const canUndoIssue = (s: string | AssetStatus) =>
    s === AssetStatus.MAINTENANCE || s === AssetStatus.LOST; // RETIRED => terminal → undo yok

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Assets</h1>
        <button className={`${btnBase} ${btnGhost}`} onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      {banner && (
        <div
          className={`rounded-lg px-4 py-2 text-sm border ${
            banner.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {banner.text}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-600">You have no assigned assets.</div>
      ) : (
        <div className="grid gap-3">
          {items.map((a) => {
            const canConfirm = a.status === "ASSIGNED" && !a.confirmed;
            const isRetired = a.status === "RETIRED";
            const isBusy = busyId === a.id;
            const isReturnRequested = a.status === "RETURN_REQUESTED";
            const issueState = isIssueState(a.status);
            const undoIssue = canUndoIssue(a.status);

            return (
              <div
                key={a.id}
                className="rounded-2xl border bg-white p-4 shadow-sm md:flex md:items-center md:justify-between gap-3"
              >
                {/* LEFT: meta */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {a.category && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 border text-gray-700">
                        {a.category}
                      </span>
                    )}
                    <div className="font-semibold">{a.name}</div>
                  </div>
                  <div className="text-sm text-gray-600">{a.serialNumber ? `SN: ${a.serialNumber}` : "-"}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={a.status as any} />
                    {a.confirmed && <span className="text-xs text-green-600">confirmed</span>}
                    {a.assignedDate && (
                      <span className="text-xs text-gray-500">
                        • assigned {new Date(a.assignedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {isRetired && (
                    <div className="mt-1 text-xs text-gray-500">
                      Status is <span className="font-medium">RETIRED</span>. Further changes are disabled.
                    </div>
                  )}
                </div>

                {/* RIGHT: actions */}
                <div className="mt-3 md:mt-0 flex flex-wrap gap-2 md:items-center">
                  {/* Confirm */}
                  <button
                    onClick={() => confirm(a.id)}
                    className={`${btnBase} ${canConfirm ? btnPrimary : "bg-gray-200 text-gray-500"}`}
                    disabled={!canConfirm || isBusy || isRetired}
                    title="Confirm you received this asset"
                    aria-disabled={!canConfirm || isBusy || isRetired}
                  >
                    {isBusy && canConfirm ? "Working…" : "Confirm"}
                  </button>

                  {/* Request Return / Undo Return */}
                  {isReturnRequested ? (
                    <button
                      onClick={() => cancelReturnRequest(a.id)}
                      className={`${btnBase} ${btnGhost}`}
                      disabled={isBusy || isRetired}
                      title="Cancel return request"
                    >
                      {isBusy ? "Working…" : "Undo Return Request"}
                    </button>
                  ) : (
                    <button
                      onClick={() => requestReturn(a.id)}
                      className={`${btnBase} ${btnWarn}`}
                      disabled={isBusy || isRetired}
                      title="Request returning the asset to inventory"
                      aria-disabled={isBusy || isRetired}
                    >
                      {isBusy ? "Working…" : "Request Return"}
                    </button>
                  )}

                  {/* Issue flow:
                      - Eğer issue state'te DEĞİLSE → Report Issue açılır (select + Send)
                      - Eğer issue state'teyse:
                          - MAINTENANCE/LOST → Undo Issue Report
                          - RETIRED → terminal; sadece disabled rozet göstermek istersen burada buton koyma/disabled tut
                  */}
                  {issueState ? (
                    undoIssue ? (
                      <button
                        onClick={() => cancelIssueReport(a.id)}
                        className={`${btnBase} ${btnGhost}`}
                        disabled={isBusy}
                        title="Cancel issue report"
                      >
                        {isBusy ? "Working…" : "Undo Issue Report"}
                      </button>
                    ) : (
                      // RETIRED: undo yok; istersen tamamen gizleyebilirsin
                      <button className={`${btnBase} ${btnGhost}`} disabled aria-disabled="true" title="Not allowed">
                        Issue Reported
                      </button>
                    )
                  ) : issueAssetId === a.id ? (
                    <div className="flex flex-wrap gap-2 items-center">
                      <select
                        className="rounded-full border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value as AssetStatus)}
                        disabled={isBusy}
                        aria-label="Select issue type"
                      >
                        <option value="">Select issue type…</option>
                        <option value={AssetStatus.MAINTENANCE}>Maintenance</option>
                        <option value={AssetStatus.LOST}>Lost</option>
                        <option value={AssetStatus.RETIRED}>Retired</option>
                      </select>

                      <button
                        className={`${btnBase} ${btnInfo}`}
                        onClick={() => issueType && reportIssue(a.id, issueType as AssetStatus)}
                        disabled={!issueType || isBusy}
                      >
                        {isBusy ? "Sending…" : "Send"}
                      </button>

                      <button
                        className={`${btnBase} ${btnGhost}`}
                        onClick={() => {
                          setIssueAssetId(null);
                          setIssueType("");
                        }}
                        disabled={isBusy}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIssueAssetId(a.id)}
                      className={`${btnBase} ${btnInfo}`}
                      disabled={isBusy || isRetired}
                      title="Report a problem with this asset"
                      aria-disabled={isBusy || isRetired}
                    >
                      Report Issue
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAssets;
