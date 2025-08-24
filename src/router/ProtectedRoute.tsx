import React, { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactElement;     // children is required -> no Outlet in this version
  roles?: string[];           // optional role-based restriction
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until auth state is resolved
  if (loading) {
    return <p className="mt-10 text-center text-gray-500">Loading...</p>;
  }

  // Redirect to login if no token or user
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Enforce password change if required
  if (user.mustChangePassword && location.pathname !== "/set-password") {
    return <Navigate to="/set-password" replace state={{ from: location }} />;
  }
  if (!user.mustChangePassword && location.pathname === "/set-password") {
    return <Navigate to="/profile" replace />;
  }

  // Check if user has one of the allowed roles
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Block access if company is not approved (except for admin)
  if (user.role !== "ADMIN" && user.companyApproved === false) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        <div className="p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold">Pending Approval</h2>
          <p>Your company registration is still pending admin approval.</p>
        </div>
      </div>
    );
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;
