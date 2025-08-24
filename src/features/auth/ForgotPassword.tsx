import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPassword } from "../../lib/authApi";
import { useState } from "react";
import { Link } from "react-router-dom";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await forgotPassword(data);
      setMessage(response.message || "Password reset link has been sent to your email.");
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
      setMessage(null);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white">
              <span className="text-base font-bold">S</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-800">
              Staffora
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter your work email and we’ll send you a reset link.
          </p>

          {message && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-700">Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link to="/login" className="text-indigo-700 hover:underline">
                Back to login
              </Link>
              <span className="text-slate-600">
                New here?{" "}
                <Link to="/register" className="font-medium text-indigo-700 hover:underline">
                  Create account
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Right: hero image */}
      <div className="hidden md:flex md:min-h-screen md:items-center md:justify-center bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop')] bg-center bg-cover">
        <div className="bg-slate-900/50 px-8 py-6 rounded-2xl">
          <h2 className="text-5xl font-extrabold tracking-tight text-white">Staffora</h2>
          <p className="mt-2 text-slate-200">Human Resource Management System</p>
        </div>
      </div>
    </div>
  );
}
