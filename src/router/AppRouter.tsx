import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import EmailVerification from "../features/auth/EmailVerification";
import ResetPassword from "../features/auth/ResetPassword";
import ForgotPassword from "../features/auth/ForgotPassword";
import ProfileSettings from "../features/profile/ProfileSettings";
import CompanyList from "../features/companies/CompanyList";
import EmployeeList from "../features/employees/EmployeeList";
import LeaveManagement from "../features/leaves/LeaveManagement";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

export default function AppRouter() {
  const { user } = useAuth(); // Access user from context

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with redirect if already logged in */}
        <Route
          path="/login"
          element={user ? <Navigate to="/profile" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/profile" replace /> : <Register />}
        />
        <Route path="/verify" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <ProtectedRoute>
              <CompanyList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <LeaveManagement />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
