// src/features/common/RoleAwareDashboard.tsx
import { useAuth } from "../../context/AuthContext";
import AdminDashboard from "../admin/AdminDashboard";
import ManagerDashboard from "../manager/ManagerDashboard";
import EmployeeDashboard from "../employees/EmployeeDashboard";

export default function RoleAwareDashboard() {
  const { user } = useAuth();

  // Render dashboard based on the authenticated user's role
  if (user?.role === "ADMIN") return <AdminDashboard />;
  if (user?.role === "MANAGER") return <ManagerDashboard />;

  // Fallback to employee dashboard
  return <EmployeeDashboard />;
}
