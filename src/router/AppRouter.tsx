// src/router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Shell from "../app/Shell";

// Auth
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import EmailVerification from "../features/auth/EmailVerification";
import ResetPassword from "../features/auth/ResetPassword";
import ForgotPassword from "../features/auth/ForgotPassword";
import SetPassword from "../features/auth/SetPassword";

// Profile
import ProfileSettings from "../features/profile/ProfileSettings";
import UpdateManagerProfile from "../features/profile/UpdateManagerProfile";
import UpdateEmployeeProfile from "../features/profile/UpdateEmployeeProfile";

// Company / Employees / Leaves
import CompanyList from "../features/companies/CompanyList";
import EmployeeList from "../features/employees/EmployeeList";
import EmployeeForm from "../features/employees/EmployeeForm";
import LeaveManagement from "../features/leaves/LeaveManagement";
import AssignedLeavesList from "../features/leaves/AssignedLeaveList";
import PendingLeaves from "../features/leaves/PendingLeaves";

// Reviews
import ReviewsPage from "../features/reviews/ReviewsPage"; // PUBLIC landing list (no Shell)
import MyReviews from "../features/reviews/MyReviews";     // MANAGER page (list + drawer)

// Shifts
import ShiftManagement from "../features/shifts/ShiftManagement";
import MyShifts from "../features/shifts/MyShifts";

// Assets
import MyAssets from "../features/employee/MyAssets";
import ManagerAssetList from "../features/assets/pages/ManagerAssetList";

// Admin
import PendingManagerList from "../features/admin/PendingManagerList";
import AdminPendingReviews from "../features/admin/AdminPendingReviews";

// Common
import Unauthorized from "../features/common/Unauthorized";
import PeopleaLanding from "../features/landing/PeopleaLanding";

// Dashboards
import AdminDashboard from "../features/admin/AdminDashboard";
import ManagerDashboard from "../features/manager/ManagerDashboard";
import EmployeeDashboard from "../features/employees/EmployeeDashboard";

// Expenses
import MyExpensesPage from "../features/expenses/pages/MyExpensesPage";
import ManagerReviewPage from "../features/expenses/pages/ManagerReviewPage";

function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === "ADMIN") return <AdminDashboard />;
  if (user?.role === "MANAGER") return <ManagerDashboard />;
  return <EmployeeDashboard />;
}

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC: Landing */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <PeopleaLanding />} />

        {/* PUBLIC: Auth */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/verify" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* SEMI-PROTECTED: Set password */}
        <Route
          path="/set-password"
          element={
            <ProtectedRoute>
              <SetPassword />
            </ProtectedRoute>
          }
        />

        {/* PUBLIC: Reviews landing (no Shell) */}
        <Route path="/reviews" element={<ReviewsPage />} />

        {/* PRIVATE APP SHELL (sidebar/layout) */}
        <Route
          element={
            <ProtectedRoute>
              <Shell />
            </ProtectedRoute>
          }
        >
          {/* Dashboards */}
          <Route path="/dashboard" element={<RoleDashboard />} />

          {/* Profile */}
          <Route path="/profile" element={<ProfileSettings />} />
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

          {/* Companies / Employees */}
          <Route path="/companies" element={<CompanyList />} />
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

          {/* Leaves */}
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

          {/* Shifts */}
          <Route
            path="/shifts"
            element={
              <ProtectedRoute roles={["MANAGER"]}>
                <ShiftManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-shifts"
            element={
              <ProtectedRoute roles={["EMPLOYEE"]}>
                <MyShifts />
              </ProtectedRoute>
            }
          />

          {/* Assets */}
          <Route
            path="/assets"
            element={
              <ProtectedRoute roles={["MANAGER", "EMPLOYEE"]}>
                {user?.role === "MANAGER" ? <Navigate to="/manager/assets" replace /> : <Navigate to="/my-assets" replace />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/assets"
            element={
              <ProtectedRoute roles={["MANAGER"]}>
                <ManagerAssetList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-assets"
            element={
              <ProtectedRoute roles={["EMPLOYEE"]}>
                <MyAssets />
              </ProtectedRoute>
            }
          />

          {/* Expenses (tek menü item; içeride role'e göre sayfa) */}
          <Route
            path="/expenses"
            element={
              <ProtectedRoute roles={["MANAGER", "EMPLOYEE"]}>
                {user?.role === "MANAGER" ? <Navigate to="/expenses/review" replace /> : <MyExpensesPage />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses/review"
            element={
              <ProtectedRoute roles={["MANAGER"]}>
                <ManagerReviewPage />
              </ProtectedRoute>
            }
          />
          <Route path="/manager/expenses" element={<Navigate to="/expenses/review" replace />} />

          {/* Admin */}
          <Route
            path="/admin/pending-managers"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <PendingManagerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pending-reviews"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminPendingReviews />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/pending-reviews" replace />} />

          {/* Manager: My Reviews (list + drawer) */}
          <Route
            path="/manager/reviews"
            element={
              <ProtectedRoute roles={["MANAGER"]}>
                <MyReviews />
              </ProtectedRoute>
            }
          />

          {/* App içinden /reviews/* tıklanırsa role'e göre yönlendir */}
          <Route
            path="/reviews/*"
            element={
              user?.role === "MANAGER" ? (
                <Navigate to="/manager/reviews" replace />
              ) : (
                <Navigate to="/admin/pending-reviews" replace />
              )
            }
          />

          {/* Legacy */}
          <Route path="/reviews/mine" element={<Navigate to="/manager/reviews" replace />} />
        </Route>

        {/* Legacy redirects */}
        <Route path="/dashboard-new/*" element={<Navigate to="/dashboard" replace />} />

        {/* Fallbacks */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
