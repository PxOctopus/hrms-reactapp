import React, { ReactElement } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Get the token from localStorage
  const token = localStorage.getItem("token");

  // If no token is found, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected component
  return children;
};

export default ProtectedRoute;