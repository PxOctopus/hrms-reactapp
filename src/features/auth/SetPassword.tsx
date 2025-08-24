import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "../../lib/axios";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function SetPassword() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await axios.post("/auth/set-password", { newPassword: data.password });
      setUser({ ...user!, mustChangePassword: false });
      setMessage("Your password has been changed. You can now log in with your new password.");
      setError(null);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update password.");
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

          <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
          <p className="mt-1 text-sm text-slate-600">
            For security, choose a strong password you don’t use elsewhere.
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
              <label className="mb-1 block text-sm text-slate-700">New Password</label>
              <input
                type="password"
                {...register("password")}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-700">Confirm Password</label>
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Set Password"}
            </button>
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
