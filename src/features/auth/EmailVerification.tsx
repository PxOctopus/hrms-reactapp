import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../../lib/authApi";
import type { UserProfile } from "../../types/User";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    // Call backend to verify email token
    verifyEmail({ token })
      .then((response: any) => {
        // If your API returns the user object, you can safely set it here
        if (response?.user) {
          setUser(response.user as UserProfile);
        }
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <div className="relative w-full max-w-md">
        {/* Brand accent bar */}
        <div className="absolute -top-1 inset-x-0 h-1 rounded-t-2xl bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400" />

        <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/70">
          {/* Icon header */}
          <div className="mb-6 flex items-center justify-center">
            {status === "loading" && (
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" aria-hidden />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden />
            )}
            {status === "error" && <XCircle className="h-10 w-10 text-rose-600" aria-hidden />}
          </div>

          {/* Loading */}
          {status === "loading" && (
            <div className="text-center" aria-live="polite">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                Verifying your email…
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                This will only take a moment.
              </p>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="text-center" aria-live="polite">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Your account has been verified{user?.fullName ? `, ${user.fullName}` : ""}!
              </h1>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                You can now log in to your account.
              </p>

              <Link
                to="/login"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Go to Login
              </Link>

              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                Need help? Contact Peoplea Support.
              </p>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="text-center" aria-live="assertive">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Invalid or expired verification link.
              </h1>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Please request a new one or contact support.
              </p>

              <Link
                to="/login"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:focus:ring-offset-slate-900"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
