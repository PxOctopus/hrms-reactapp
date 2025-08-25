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
import UpdateManagerProfile from "../features/profile/UpdateManagerProfile";
import UpdateEmployeeProfile from "../features/profile/UpdateEmployeeProfile";
import DashboardNew from "../features/common/DashboardNew";

// Landing page
import PeopleaLanding from "../features/common/PeopleaLanding";

import { useAuth } from "../context/AuthContext";

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Root: Landing first */}
        <Route
          path="/"
          element={user ? <Navigate to="/profile" replace /> : <PeopleaLanding />}
        />

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

        {/* Must-change-password flow */}
        <Route
          path="/set-password"
          element={
            <ProtectedRoute>
              <SetPassword />
            </ProtectedRoute>
          }
        />

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
          path="/profile/update-manager"
          element={
            <ProtectedRoute roles={["MANAGER"]}>
              <UpdateManagerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/update-employee"
          element={
            <ProtectedRoute roles={["EMPLOYEE"]}>
              <UpdateEmployeeProfile />
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

        {/* Admin-only */}
        <Route
          path="/admin/pending-managers"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <PendingManagerList />
            </ProtectedRoute>
          }
        />

        {/* New dashboard (protected) */}
        <Route
          path="/dashboard-new"
          element={
            <ProtectedRoute>
              <DashboardNew />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Catch-all → Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
