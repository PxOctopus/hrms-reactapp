// src/components/common/RoleGuard.tsx
import { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export default function RoleGuard({
  allow,
  children,
  fallback = null,
}: {
  allow: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      <span className="ml-2 text-sm text-gray-500">Loading...</span>
    </div>
  );
}         
  if (!user) return null;
  return allow.includes(user.role as Role) ? <>{children}</> : <>{fallback}</>;
}
