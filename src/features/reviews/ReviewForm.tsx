// src/features/reviews/ReviewForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createManagerReview } from "../../lib/reviewApi";

const schema = z.object({
  title: z.string().max(100).optional(),
  content: z.string().min(10, "Please write at least 10 characters"),
  rating: z.coerce.number().min(1).max(5),
});
type FormValues = z.infer<typeof schema>;

export default function ReviewForm() {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5 },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      // manager review -> backend'de status=PENDING olarak kaydedilir
      await createManagerReview(values);
      // toast.success("Review submitted for approval");
      reset({ title: "", content: "", rating: 5 });
    } catch (e) {
      // toast.error("Failed to submit review");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Write a Review</h1>
        <p className="mt-1 text-sm text-gray-500">
          Share your experience with the platform. Your review will be published on the landing page <b>after admin approval</b>.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border bg-white p-4 shadow-sm space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">Title (optional)</label>
          <input
            {...register("title")}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g., Streamlined our HR workflows"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Your Review</label>
          <textarea
            {...register("content")}
            rows={5}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Write about your experience..."
          />
          {errors.content && (
            <p className="mt-1 text-xs text-rose-600">{errors.content.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Rating</label>
          <select
            {...register("rating")}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            {[5, 4, 3, 2, 1].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          {errors.rating && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.rating.message as string}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">5 is the highest rating.</p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-black/90 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
