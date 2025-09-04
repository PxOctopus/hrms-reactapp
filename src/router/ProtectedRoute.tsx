// src/router/ProtectedRoute.tsx
import { ReactElement, ReactNode } from "react";
import { Navigate, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";

type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

interface ProtectedRouteProps {
  /** Optional wrapper usage: <ProtectedRoute><Child/></ProtectedRoute> */
  children?: ReactElement | ReactNode;
  /** Optional role guard: any of these roles is allowed */
  roles?: ReadonlyArray<Role>;
}

/** Normalize role safely without hooks */
function normalizeRole(val: unknown): Role | undefined {
  const up = String(val ?? "").toUpperCase();
  return up === "ADMIN" || up === "MANAGER" || up === "EMPLOYEE" ? (up as Role) : undefined;
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

  // 4) Role normalization + optional guard (no hooks used here)
  const role = normalizeRole((user as any)?.role);

  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 5) Pending gates (set-password is allowed even if pending)
  const isSetPasswordRoute = location.pathname === "/set-password";

  // Manager is pending until companyApproved explicitly becomes true
  const isManagerPending = role === "MANAGER" && user.companyApproved === false;

  // Employee is pending until manager explicitly approves (strict false unlocks)
  const isEmployeePending =
    role === "EMPLOYEE" && user.pendingApprovalByManager !== false;

  const isPending =
    !isSetPasswordRoute && role !== "ADMIN" && (isManagerPending || isEmployeePending);

  if (isPending) {
    const handleLogout = async () => {
      try {
        await api.post("/auth/logout").catch(() => {});
      } finally {
        localStorage.removeItem("token");
        setUser?.(null);
        navigate("/", { replace: true });
      }
    };

    const handleRefresh = async () => {
      try {
        // avoid global /login redirect if this 401s due to race
        const { data } = await api.get("/employees/me", { skipAuthRedirect: true });

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
        // optional: show a toast
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

  // 6) Pass-through to the protected area (supports both wrapper and outlet styles)
  return <>{children ?? <Outlet />}</>;
};

export default ProtectedRoute;
