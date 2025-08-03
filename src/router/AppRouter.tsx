import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import EmailVerification from "../features/auth/EmailVerification";
import ResetPassword from "../features/auth/ResetPassword";
import ForgotPassword from "../features/auth/ForgotPassword";
import ProfileSettings from "../features/profile/ProfileSettings";
import CompanyList from "../features/companies/CompanyList";
import EmployeeList from "../features/employees/EmployeeList";
import EmployeeForm from "../features/employees/EmployeeForm";
import LeaveManagement from "../features/leaves/LeaveManagement";
import AssignedLeavesList from "../features/leaves/AssignedLeaveList";
import PendingLeaves from "../features/leaves/PendingLeaves";
import PendingManagerList from "../features/admin/PendingManagerList";
import Unauthorized from "../features/common/Unauthorized";
import ProtectedRoute from "./ProtectedRoute";
import SetPassword from "../features/auth/SetPassword";
import { useAuth } from "../context/AuthContext";

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
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
            <ProtectedRoute roles={["MANAGER"]}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/new"
          element={
            <ProtectedRoute roles={["MANAGER"]}>
              <EmployeeForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:id/edit"
          element={
            <ProtectedRoute roles={["MANAGER"]}>
              <EmployeeForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaves"
          element={
            <ProtectedRoute roles={["EMPLOYEE", "MANAGER"]}>
              <LeaveManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assigned-leaves"
          element={
            <ProtectedRoute roles={["MANAGER"]}>
              <AssignedLeavesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pending-leaves"
          element={
            <ProtectedRoute roles={["MANAGER"]}>
              <PendingLeaves />
            </ProtectedRoute>
          }
        />

        {/* Admin-only route */}
        <Route
          path="/admin/pending-managers"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <PendingManagerList />
            </ProtectedRoute>
          }
        />

        {/* Set password page after first login */}
        <Route
          path="/set-password"
          element={
              <SetPassword />
          }
        />

        {/* Unauthorized fallback */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
