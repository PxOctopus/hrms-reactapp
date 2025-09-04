// Simple, responsive strip to show social proof metrics
export default function StatsStrip() {
  const items = [
    { value: "2,000+", label: "Customers" },
    { value: "500,000+", label: "Users" },
    { value: "50+", label: "Countries" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <div className="grid gap-6 rounded-2xl border bg-white p-6 shadow-sm md:grid-cols-3">
        {items.map((it) => (
          <div key={it.label} className="text-center">
            <div className="text-2xl font-semibold">{it.value}</div>
            <div className="mt-1 text-sm text-gray-500">{it.label}</div>
          </div>
        ))}
        <div className="md:col-span-3">
          <div className="mt-2 flex items-center justify-center gap-3">
            {/* ratings row; replace with real logos if you have them */}
            <div className="flex items-center gap-1" aria-label="Average rating 4.5 out of 5">
              <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>☆</span>
            </div>
            <div className="text-sm text-gray-600">4.5+ average ratings on global review platforms</div>
          </div>
        </div>
      </div>
    </section>
  );
}
