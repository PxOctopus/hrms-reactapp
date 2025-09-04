// src/features/auth/Login.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "../../lib/authApi";
import { LoginRequest } from "../../types/Auth";
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Brand from "../common/Brand";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { refreshUser } = useAuth(); // <-- use refreshUser from AuthContext
  const [errorMessage, setErrorMessage] = useState("");

  // Where to go after login if user came from a protected route
  const from = location?.state?.from?.pathname || "/dashboard"; // default to dashboard (or "/profile" if you prefer)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: LoginRequest) => {
    try {
      setErrorMessage("");

      // 1) Authenticate to get a token (JWT or session)
      const response = await login(data); // expected: { accessToken, mustChangePassword? }
      localStorage.setItem("token", response.accessToken);

      // 2) Immediately refresh the user snapshot:
      //    - pulls /auth/me
      //    - if EMPLOYEE, also pulls /employees/me
      //    - merges pendingApprovalByManager so ProtectedRoute won't show "Pending"
      await refreshUser();

      // 3) If backend says password must be changed, force that flow first
      if (response?.mustChangePassword) {
        toast.info("Please set a new password before accessing your workspace.");
        navigate("/set-password", { replace: true, state: { from } });
        return;
      }

      // 4) Otherwise go to the intended page (or dashboard)
      navigate(from, { replace: true });
    } catch (error: any) {
      // Show a friendly error
      setErrorMessage(
        error?.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <Brand withMargin />

          <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome back. Enter your credentials to access your workspace.
          </p>

          {errorMessage && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-700">Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-700">Password</label>
              <input
                type="password"
                {...register("password")}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-indigo-700 hover:underline">
                Forgot password?
              </Link>
              <span className="text-slate-600">
                No account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-indigo-700 hover:underline"
                >
                  Create one
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden md:flex md:min-h-screen md:items-center md:justify-center bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop')] bg-center bg-cover">
        <div className="bg-slate-900/50 px-8 py-6 rounded-2xl">
          <h2 className="text-5xl font-extrabold tracking-tight text-white">Peoplea</h2>
          <p className="mt-2 text-slate-200">Human Resource Management System</p>
        </div>
      </div>
    </div>
  );
}
