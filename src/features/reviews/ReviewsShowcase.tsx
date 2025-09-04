import { useEffect, useMemo, useState } from "react";
import axios from "../../lib/axios";

// Updated Review shape with rating
type Review = {
  id: number;
  managerName: string;
  content: string;
  createdAt: string;
  rating?: number; // optional, default 5
};

export default function ReviewsShowcase({ limit = 6 }: { limit?: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<Review[]>("/api/reviews/public")
      .then((res) => setReviews(res.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const items = useMemo(
    () => (limit ? reviews.slice(0, limit) : reviews),
    [reviews, limit]
  );

  const initialsOf = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "∎";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Render star row
  const StarRow = ({ rating = 5 }: { rating?: number }) => {
    const safe = Math.max(1, Math.min(5, Math.round(rating)));
    return (
      <div className="flex items-center gap-0.5" aria-label={`Rating ${safe} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>{i < safe ? "⭐" : "☆"}</span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">What managers say</h2>
          <p className="mt-2 text-sm text-gray-600">
            Real experiences from HR leaders using our platform.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-white shadow-sm animate-pulse"
            >
              <div className="h-28 w-full rounded-t-2xl bg-gray-200" />
              <div className="p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-11/12 rounded bg-gray-200" />
                  <div className="h-3 w-10/12 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">What managers say</h2>
        <p className="mt-3 text-gray-600">
          Real experiences from HR leaders using our platform.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 text-center text-sm text-gray-500">No reviews yet.</div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <article
              key={r.id}
              className="group rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Decorative header */}
              <div className="relative h-28 w-full overflow-hidden rounded-t-2xl">
                <div className="h-full w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
                <div className="absolute -bottom-5 left-4 h-12 w-12 rounded-full border-2 border-white bg-gray-900 text-white grid place-items-center text-sm font-semibold">
                  {initialsOf(r.managerName)}
                </div>
              </div>

              <div className="p-4 pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">{r.managerName}</div>
                  <span className="text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* ⭐ rating row */}
                <div className="mt-2">
                  <StarRow rating={r.rating} />
                </div>

                {/* Review content */}
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  “{r.content}”
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
