// src/routes/ProtectedRoute.tsx
import React, { ReactElement } from "react";
import { Navigate, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../lib/axios";

type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

interface ProtectedRouteProps {
  children?: ReactElement;
  roles?: ReadonlyArray<Role>;
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const { user, loading, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1) Wait for auth bootstrap to finish to avoid flicker/wrong redirects
  if (loading) {
    return <p className="mt-10 text-center text-gray-500">Loading...</p>;
  }

  // 2) Not authenticated → go to login and preserve "from"
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3) Force set-password flow when required
  if (user.mustChangePassword && location.pathname !== "/set-password") {
    return <Navigate to="/set-password" replace state={{ from: location }} />;
  }
  if (!user.mustChangePassword && location.pathname === "/set-password") {
    return <Navigate to="/profile" replace />;
  }

  // 4) Optional per-route role guard
  const role = String(user.role || "").toUpperCase() as Role;
  if (roles && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 5) Pending gates (set-password is allowed even if pending)
  const isSetPasswordRoute = location.pathname === "/set-password";

  const isManagerPending = role === "MANAGER" && user.companyApproved === false;

  // Employees are allowed ONLY when flag is explicitly false (approved).
  const isEmployeePending =
    role === "EMPLOYEE" && user.pendingApprovalByManager !== false;

  const isPending =
    !isSetPasswordRoute && role !== "ADMIN" && (isManagerPending || isEmployeePending);

  if (isPending) {
    const handleLogout = async () => {
      try {
        await axios.post("/auth/logout").catch(() => {});
      } finally {
        localStorage.removeItem("token");
        setUser?.(null);
        navigate("/", { replace: true });
      }
    };

    // Optional: allow manual refetch if approval happens while this screen is open
    const handleRefresh = async () => {
      try {
        const { data } = await axios.get("/employees/me");
        const pending =
          data?.pendingApprovalByManager ??
          (data as any)?.isPendingApprovalByManager ??
          (data as any)?.is_pending_approval_by_manager ??
          true;

        setUser?.((prev) =>
          prev ? { ...prev, pendingApprovalByManager: pending } : prev
        );

        if (pending === false) {
          navigate("/dashboard", { replace: true });
        }
      } catch {
        // silent; you can add a toast here
      }
    };

    const message = isManagerPending
      ? "Your company registration is still pending admin approval."
      : "Your account is still pending manager approval.";

    return (
      <div className="min-h-[60vh] grid place-items-center px-4">
        <div className="max-w-lg w-full rounded-2xl border bg-white p-6 text-center shadow-sm">
          <h2 className="text-2xl font-semibold">Pending Approval</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={handleRefresh}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Refresh Status
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Log out
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            After approval, you can sign in again to access your workspace.
          </p>
        </div>
      </div>
    );
  }

  // 6) Pass-through to the protected area
  return children ?? <Outlet />;
};

export default ProtectedRoute;
