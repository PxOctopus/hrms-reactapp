import React, { useEffect, useState } from "react";
import {
  assetApi,
  type EmployeeAssetResponseDTO,
  type AssetConfirmRequestDTO,
  type AssetReturnRequestDTO,
} from "../../lib/assetApi";
import { StatusBadge } from "../assets/components/StatusBadge";

const MyAssets: React.FC = () => {
  const [items, setItems] = useState<EmployeeAssetResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [issueText, setIssueText] = useState("");
  const [issueAssetId, setIssueAssetId] = useState<number | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

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

  useEffect(() => {
    void load();
  }, []);

  const flash = (type: "success" | "error", text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 2000);
  };

  const confirm = async (id: number) => {
    setSubmittingId(id);
    try {
      const body: AssetConfirmRequestDTO = {};
      await assetApi.confirm(id, body);
      flash("success", "Confirmed. Manager notified.");
      await load();
    } catch {
      flash("error", "Failed to confirm.");
    } finally {
      setSubmittingId(null);
    }
  };

  const requestReturn = async (id: number) => {
    setSubmittingId(id);
    try {
      const body: AssetReturnRequestDTO = { reason: "Return requested by employee" };
      await assetApi.requestReturn(id, body);
      flash("success", "Return request sent to manager.");
      await load();
    } catch {
      flash("error", "Failed to request return.");
    } finally {
      setSubmittingId(null);
    }
  };

  const reportIssue = async (id: number, description: string) => {
    setSubmittingId(id);
    try {
      await assetApi.reportIssue(id, { issueType: "ISSUE", description });
      flash("success", "Issue reported to manager.");
      await load();
      setIssueAssetId(null);
      setIssueText("");
    } catch {
      flash("error", "Failed to report issue.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Assets</h1>
        <button className="px-3 py-2 rounded-lg border" onClick={load} disabled={loading}>
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
            return (
              <div
                key={a.id}
                className="rounded-xl border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-sm text-gray-600">
                    {a.serialNumber ? `SN: ${a.serialNumber}` : "-"}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={a.status as any} />
                    {a.confirmed && <span className="text-xs text-green-600">confirmed</span>}
                    {a.assignedDate && (
                      <span className="text-xs text-gray-500">
                        • assigned {new Date(a.assignedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => confirm(a.id)}
                    className={`px-3 py-2 rounded-md text-white ${
                      canConfirm ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 cursor-not-allowed"
                    }`}
                    disabled={!canConfirm || submittingId === a.id}
                    title="Confirm you received this asset"
                  >
                    {submittingId === a.id ? "Working…" : "Confirm"}
                  </button>

                  <button
                    onClick={() => requestReturn(a.id)}
                    className="px-3 py-2 rounded-md text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                    disabled={submittingId === a.id}
                    title="Request returning the asset to inventory"
                  >
                    Request Return
                  </button>

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
                      className="px-3 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      disabled={submittingId === a.id}
                      title="Report a problem with this asset"
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
