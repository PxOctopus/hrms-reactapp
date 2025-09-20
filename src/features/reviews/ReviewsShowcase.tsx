// src/features/reviews/ReviewsShowcase.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../lib/axios";

// MUI Rating
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";

type ApiItem = {
  id: number;
  managerName?: string | null;
  authorName?: string | null;
  companyName?: string | null;             // <-- BE doğrudan döndürürse
  company?: { name?: string | null } | null; // <-- ya da nested gelirse
  content: string;
  createdAt: string;
  rating?: number | string | null;         // BigDecimal/string olabilir
};

type Review = {
  id: number;
  managerName: string;
  companyName: string;   // banner’da göstereceğiz
  content: string;
  createdAt: string;
  rating: number;        // 1..5, 0.5 adımlı
};

const toHalf = (n: number) => Math.round(n * 2) / 2;

function normalize(item: ApiItem): Review {
  const name = (item.managerName || item.authorName || "Manager").trim();
  const brand =
    (item.companyName ?? item.company?.name ?? "").toString().trim();

  const raw = item.rating;
  const n =
    typeof raw === "number" ? raw : raw != null ? Number(raw) : 5;
  const v = toHalf(isNaN(n) ? 5 : n);
  const clamped = Math.min(5, Math.max(1, v));

  return {
    id: item.id,
    managerName: name || "Manager",
    companyName: brand || "YOUR COMPANY",
    content: item.content ?? "",
    createdAt: item.createdAt,
    rating: clamped,
  };
}

export default function ReviewsShowcase({ limit = 6 }: { limit?: number }) {
  const { data, isLoading, isError, error } = useQuery<Review[]>({
    queryKey: ["reviews", "public"],
    queryFn: async () => {
      const res = await axios.get<ApiItem[]>("/reviews/public");
      const list = (res.data ?? []).map(normalize);
      return typeof limit === "number" ? list.slice(0, limit) : list;
    },
  });

  const items = useMemo(() => data ?? [], [data]);

  const getLabelText = (value: number) =>
    `${value} Star${value !== 1 ? "s" : ""}`;

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Header />
        <SkeletonGrid />
      </section>
    );
  }

  if (isError) {
    console.error("Failed to load public reviews:", error);
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Header />
        <p className="mt-8 text-center text-gray-600">
          We couldn’t load reviews right now.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <Header />

      {items.length === 0 ? (
        <div className="mt-10 text-center text-sm text-gray-500">
          No reviews yet.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <article
              key={r.id}
              className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
            >
              {/* COMPANY BANNER (üst yarı) */}
              <div className="relative h-28 w-full bg-gradient-to-r from-indigo-600 to-violet-600">
                {/* Hafif nokta deseni */}
                <svg aria-hidden className="absolute inset-0 h-full w-full opacity-15">
                  <defs>
                    <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
                      <circle cx="1" cy="1" r="1" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>

                <div className="absolute inset-0 flex items-center px-5">
                  <div className="truncate text-xl font-black tracking-widest text-white/95">
                    {r.companyName.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* İçerik */}
              <div className="p-5">
                <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
                  <span className="font-medium text-gray-800">{r.managerName}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>

                {/* MUI Rating (read-only, 0.5 precision) */}
                <Rating
                  name={`public-rating-${r.id}`}
                  value={r.rating}
                  precision={0.5}
                  readOnly
                  getLabelText={getLabelText}
                  emptyIcon={<StarIcon style={{ opacity: 0.35 }} fontSize="inherit" />}
                />

                <p className="mt-3 text-sm leading-6 text-gray-700">“{r.content}”</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- Helpers ---------- */

function Header() {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold tracking-tight">What managers say</h2>
      <p className="mt-3 text-gray-600">
        Real experiences from HR leaders using our platform.
      </p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="h-28 w-full animate-pulse bg-gray-200" />
          <div className="p-4">
            <div className="mb-3 h-4 w-36 animate-pulse rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-11/12 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-9/12 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
