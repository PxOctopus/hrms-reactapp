import React, { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactElement;
  roles?: string[]; // Optional role-based access
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in or no token
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // User must change password but trying to access other routes
  if (user.mustChangePassword && location.pathname !== "/set-password") {
    return <Navigate to="/set-password" replace />;
  }

  // User already changed password but trying to access /set-password
  if (!user.mustChangePassword && location.pathname === "/set-password") {
    return <Navigate to="/profile" replace />;
  }

  // Logged in but not authorized by role
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
