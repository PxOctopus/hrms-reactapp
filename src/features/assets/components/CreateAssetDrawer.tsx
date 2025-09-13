// src/features/asset/components/CreateAssetDrawer.tsx
import React, { useState, useEffect } from "react";
import { assetApi, AssetCondition } from "../../../lib/assetApi";

type Props = { open: boolean; onClose: () => void; onCreated: () => void; };

const CreateAssetDrawer: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [assetName, setAssetName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState<AssetCondition>(AssetCondition.NEW);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // NEW: clear fields every time the drawer opens
  useEffect(() => {
    if (open) {
      setAssetName("");
      setSerialNumber("");
      setCategory("");
      setDescription("");
      setLocation("");
      setCondition(AssetCondition.NEW);
      setErr(null);
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      await assetApi.create({
        assetName: assetName.trim(),
        serialNumber: serialNumber.trim(),
        category: category.trim() || null,
        description: description.trim() || null,
        condition,
        location: location.trim() || null,
      });
      onCreated();
      onClose();
    } catch (e: any) {
      console.error(e);
      const status = e?.response?.status;
      const raw = e?.response?.data?.message || e?.response?.data?.error || "";
      const looksLikeDuplicate = status === 409 || /duplicate|unique|seri|serial/i.test(raw);

      // NEW: manager-focused hint about archived items
      if (looksLikeDuplicate) {
        setErr(
          "Bu seri numarası sistemde zaten kayıtlı. Eklemek istediğiniz ürün 'Archive' altında olabilir; lütfen arşiv/depo kayıtlarını ve seri numarasını kontrol edin."
        );
      } else {
        setErr(raw || "Failed to create asset.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20">
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-5 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">New Asset</div>
          <button className="rounded-md border px-3 py-1" onClick={onClose} disabled={saving}>Close</button>
        </div>

        {err && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            Name
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="e.g. Dell Latitude"
            />
          </label>

          <label className="block text-sm">
            Serial Number
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="e.g. PROD-7J3M-K9X2"
            />
          </label>

          <label className="block text-sm">
            Condition
            <select
              className="mt-1 w-full rounded border px-3 py-2"
              value={condition}
              onChange={(e) => setCondition(e.target.value as AssetCondition)}
            >
              <option value={AssetCondition.NEW}>New</option>
              <option value={AssetCondition.USED}>Used</option>
            </select>
          </label>

          <label className="block text-sm">
            Category (optional)
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Laptop"
            />
          </label>

          <label className="block text-sm">
            Description (optional)
            <textarea
              className="mt-1 w-full rounded border px-3 py-2"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes about this asset"
            />
          </label>

          <label className="block text-sm">
            Location (optional)
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Storage A / Shelf 3"
            />
          </label>

          <div className="pt-2 flex gap-2">
            <button
              className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
              onClick={save}
              disabled={saving || !assetName.trim() || !serialNumber.trim()}
            >
              {saving ? "Saving…" : "Create"}
            </button>
            <button className="px-3 py-2 rounded border" onClick={onClose} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAssetDrawer;
