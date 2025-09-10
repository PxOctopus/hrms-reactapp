import React, { useEffect, useState } from "react";
import {
  assetApi,
  type EmployeeAssetResponseDTO, // SLIM DTO for /assets/my
  type AssetConfirmRequestDTO,
  type AssetReturnRequestDTO,
} from "../../lib/assetApi";

/**
 * Employee-facing page that lists the current user's assets
 * and allows actions: Confirm, Request Return, Report Issue.
 * NOTE: List uses the SLIM DTO (EmployeeAssetResponseDTO).
 * Actions return FULL DTO on the wire but we only reload the list.
 */
const MyAssets: React.FC = () => {
  const [items, setItems] = useState<EmployeeAssetResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // local UI state for issue reporting
  const [issueText, setIssueText] = useState("");
  const [issueAssetId, setIssueAssetId] = useState<number | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await assetApi.myAssets(); // returns EmployeeAssetResponseDTO[]
      setItems(data);
    } catch (e: any) {
      console.error(e);
      setErr(e?.response?.data?.message ?? "Failed to load assets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch
    void load();
  }, []);

  // Confirm that the employee has received the asset
  const confirm = async (id: number) => {
    setSubmittingId(id);
    try {
      const body: AssetConfirmRequestDTO = {}; // note is optional
      await assetApi.confirm(id, body); // returns FULL DTO (ignored here)
      await load();
    } catch (e) {
      console.error(e);
      alert("Failed to confirm asset.");
    } finally {
      setSubmittingId(null);
    }
  };

  // Request returning the asset to inventory
  const requestReturn = async (id: number) => {
    setSubmittingId(id);
    try {
      const body: AssetReturnRequestDTO = { reason: "User requested return" };
      await assetApi.requestReturn(id, body); // returns FULL DTO (ignored here)
      await load();
    } catch (e) {
      console.error(e);
      alert("Failed to request return.");
    } finally {
      setSubmittingId(null);
    }
  };

  // Report an issue/loss/damage for the asset
  const reportIssue = async (id: number, description: string) => {
    setSubmittingId(id);
    try {
      await assetApi.reportIssue(id, { issueType: "ISSUE", description }); // returns FULL DTO
      await load();
      setIssueAssetId(null);
      setIssueText("");
    } catch (e) {
      console.error(e);
      alert("Failed to report issue.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Assets</h1>
        <button
          className="px-3 py-2 rounded-lg border"
          onClick={load}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-600">You have no assigned assets.</div>
      ) : (
        <div className="grid gap-3">
          {items.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-sm text-gray-600">{a.description ?? "-"}</div>
              </div>

              <div className="flex gap-2">
                {/* Confirm: keep UI simple; backend guards invalid states */}
                <button
                  onClick={() => confirm(a.id)}
                  className="px-3 py-2 rounded-md border hover:bg-gray-50"
                  disabled={submittingId === a.id}
                  title="Confirm you received this asset"
                >
                  {submittingId === a.id ? "Working…" : "Confirm"}
                </button>

                {/* Request Return */}
                <button
                  onClick={() => requestReturn(a.id)}
                  className="px-3 py-2 rounded-md border hover:bg-gray-50"
                  disabled={submittingId === a.id}
                  title="Request returning the asset to inventory"
                >
                  Request Return
                </button>

                {/* Report Issue (inline input toggles) */}
                {issueAssetId === a.id ? (
                  <div className="flex gap-2">
                    <input
                      className="border rounded-md px-2 py-1"
                      placeholder="Describe the issue"
                      value={issueText}
                      onChange={(e) => setIssueText(e.target.value)}
                    />
                    <button
                      className="px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
                      onClick={() => reportIssue(a.id, issueText)}
                      disabled={!issueText.trim() || submittingId === a.id}
                    >
                      Send
                    </button>
                    <button
                      className="px-3 py-2 rounded-md border"
                      onClick={() => {
                        setIssueAssetId(null);
                        setIssueText("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIssueAssetId(a.id)}
                    className="px-3 py-2 rounded-md border hover:bg-gray-50"
                    title="Report a problem with this asset"
                    disabled={submittingId === a.id}
                  >
                    Report Issue
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAssets;
