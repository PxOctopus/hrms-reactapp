import React, { useEffect, useState, useMemo } from "react";
import { assetApi, AssetCondition, type AssetResponseDTO, type AssetCreateRequest } from "../../../lib/assetApi";

const btnBase =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
const btnPrimary = "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-300";
const btnGhost = "border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 focus:ring-gray-300";

type Props = {
  open: boolean;
  asset: AssetResponseDTO | null;
  onClose: () => void;
  onUpdated: () => void;
};

const EditAssetDrawer: React.FC<Props> = ({ open, asset, onClose, onUpdated }) => {
  const [assetName, setAssetName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [condition, setCondition] = useState<AssetCondition>(AssetCondition.NEW);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open && asset) {
      setAssetName(asset.assetName ?? "");
      setSerialNumber(asset.serialNumber ?? "");
      setCondition((asset.condition as AssetCondition) ?? AssetCondition.NEW);
      setCategory(asset.category ?? "");
      setDescription((asset as any).description ?? ""); // Description DTO’da yoksa mapper’a eklenebilir
      setLocation(asset.location ?? "");
      setErr(null);
      setSaving(false);
    }
    if (!open) setSaving(false);
  }, [open, asset]);

  const canSave = useMemo(() => {
    if (!asset) return false;
    const requiredOk = assetName.trim().length > 0 && serialNumber.trim().length > 0;
    const changed =
      assetName !== (asset.assetName ?? "") ||
      serialNumber !== (asset.serialNumber ?? "") ||
      condition !== (asset.condition as AssetCondition) ||
      (category || "") !== (asset.category ?? "") ||
      (description || "") !== ((asset as any).description ?? "") ||
      (location || "") !== (asset.location ?? "");
    return requiredOk && changed && !saving;
  }, [asset, assetName, serialNumber, condition, category, description, location, saving]);

  if (!open || !asset) return null;

  const onSave = async () => {
    const payload: Partial<AssetCreateRequest> = {
      assetName: assetName.trim(),
      serialNumber: serialNumber.trim(), // EDITABLE
      condition,
      category: category.trim() || null,
      description: description.trim() || null,
      location: location.trim() || null,
    };

    setSaving(true);
    setErr(null);
    try {
      await assetApi.update(asset.id, payload);
      onUpdated();
      onClose();
    } catch (e: any) {
      console.error(e);
      const status = e?.response?.status;
      const raw = e?.response?.data?.message || e?.response?.data?.error || "";
      const looksLikeDuplicate = status === 409 || /duplicate|unique|seri|serial/i.test(raw);
      if (looksLikeDuplicate) {
        setErr(
          "This serial number already exists. The item might be in Archive; please check your archived/warehouse records and verify the serial number."
        );
      } else {
        setErr(raw || "Failed to update asset.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-[460px] bg-white shadow-xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Update Asset</h2>
          <button className={`${btnBase} ${btnGhost}`} onClick={onClose} disabled={saving}>Close</button>
        </div>

        {err && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <label className="mt-6 block text-sm font-medium">
          Name
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="e.g. Dell Latitude"
            disabled={saving}
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Serial Number
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="e.g. PROD-QLN3-WX98"
            disabled={saving}
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Condition
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
            value={condition}
            onChange={(e) => setCondition(e.target.value as AssetCondition)}
            disabled={saving}
          >
            {Object.values(AssetCondition).map((c) => (
              <option key={c} value={c}>
                {c[0] + c.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm font-medium">
          Category <span className="text-gray-400 font-normal">(optional)</span>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Laptop"
            disabled={saving}
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Description <span className="text-gray-400 font-normal">(optional)</span>
          <textarea
            className="mt-1 w-full rounded-lg border px-3 py-2 min-h-[84px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes about this asset"
            disabled={saving}
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Location <span className="text-gray-400 font-normal">(optional)</span>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Storage A / Shelf 3"
            disabled={saving}
          />
        </label>

        <div className="mt-6 flex items-center gap-2">
          <button className={`${btnBase} ${btnPrimary}`} onClick={onSave} disabled={!canSave}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button className={`${btnBase} ${btnGhost}`} onClick={onClose} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAssetDrawer;
