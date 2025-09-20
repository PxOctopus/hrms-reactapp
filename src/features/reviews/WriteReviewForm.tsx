import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createManagerReview } from "../../lib/reviewApi";

// MUI Rating (half-star support)
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";

const MAX_CONTENT = 600;
const isHalfStep = (v: number) =>
  Number.isFinite(v) && Math.abs(v * 2 - Math.round(v * 2)) < 1e-8;

const schema = z.object({
  title: z.string().max(100, "Max 100 characters").optional(),
  content: z
    .string()
    .min(10, "Please write at least 10 characters")
    .max(MAX_CONTENT, `Max ${MAX_CONTENT} characters`),
  rating: z
    .number({ required_error: "Rating is required" })
    .min(1, "Minimum is 1")
    .max(5, "Maximum is 5")
    .refine(isHalfStep, "Use 0.5 steps (e.g., 3.0, 3.5, 4.0)"),
});
type FormValues = z.infer<typeof schema>;

const labels: Record<number, string> = {
  0.5: "Useless",
  1: "Useless+",
  1.5: "Poor",
  2: "Poor+",
  2.5: "Ok",
  3: "Ok+",
  3.5: "Good",
  4: "Good+",
  4.5: "Excellent",
  5: "Excellent+",
};
function getLabelText(value: number) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value] ?? ""}`;
}

export default function WriteReviewForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5, title: "", content: "" },
  });

  const contentVal = watch("content") ?? "";

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await createManagerReview(values); // BE, PENDING olarak kaydeder
      reset({ title: "", content: "", rating: 5 });
      onSubmitted?.();
      // toast.success("Review submitted for approval");
    } catch (e) {
      console.error(e);
      // toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium">Title (optional)</label>
        <input
          {...register("title")}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="e.g., Streamlined our HR workflows"
        />
        {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
      </div>

      {/* Rating via MUI (0.5 precision) */}
      <div>
        <label className="mb-1 block text-sm font-medium">Rating</label>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <Box sx={{ width: 220, display: "flex", alignItems: "center" }}>
              <Rating
                name="review-rating"
                value={field.value}
                precision={0.5}
                getLabelText={getLabelText}
                onChange={(_, newValue) => field.onChange(typeof newValue === "number" ? newValue : 5)}
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
              />
              <Box sx={{ ml: 2 }} className="text-sm text-gray-600">
                {labels[field.value] ?? `${field.value}/5`}
              </Box>
            </Box>
          )}
        />
        {errors.rating && <p className="mt-1 text-xs text-rose-600">{errors.rating.message as string}</p>}
      </div>

      {/* Content with max length + counter */}
      <div>
        <div className="flex items-center justify-between">
          <label className="mb-1 block text-sm font-medium">Your Review</label>
          <span className="text-xs text-gray-500">{contentVal.length}/{MAX_CONTENT}</span>
        </div>
        <textarea
          {...register("content")}
          rows={8}
          maxLength={MAX_CONTENT}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Write about your experience…"
        />
        {errors.content && <p className="mt-1 text-xs text-rose-600">{errors.content.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
        <button
          type="button"
          onClick={() => reset({ title: "", content: "", rating: 5 })}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
