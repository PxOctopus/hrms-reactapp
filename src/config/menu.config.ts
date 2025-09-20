import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Umbrella,
  CalendarClock,
  Package,
  Wallet,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export type MenuItem = {
  key: string;
  label: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles: Role[];
  children?: MenuItem[];
};

export const MENU: MenuItem[] = [
  // Dashboard (all roles)
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  },

  // Employees (manager-only)
  {
    key: "employees",
    label: "Employees",
    path: "/employees",
    icon: Users,
    roles: ["MANAGER"],
  },

  // Leave (role-specific children)
  {
    key: "leave",
    label: "Leave",
    path: "/leaves",
    icon: Umbrella,
    roles: ["MANAGER", "EMPLOYEE"],
    children: [
      { key: "leave-request", label: "Request Leave", path: "/leaves", icon: CalendarDays, roles: ["EMPLOYEE"] },
      { key: "leave-assign",  label: "Assign Leave",  path: "/leaves", icon: CalendarDays, roles: ["MANAGER"] },
      { key: "leave-pending", label: "Pending Leaves", path: "/pending-leaves", icon: CalendarDays, roles: ["MANAGER"] },
    ],
  },

  // Shifts
  {
    key: "shifts",
    label: "Shifts",
    path: "/shifts",
    icon: CalendarClock,
    roles: ["MANAGER", "EMPLOYEE"],
  },

  // Assets
  { key: "manager-assets",  label: "Assets", path: "/manager/assets", icon: Package, roles: ["MANAGER"] },
  { key: "employee-assets", label: "Assets", path: "/my-assets",       icon: Package, roles: ["EMPLOYEE"] },

  // Expenses
  {
  key: "expenses",
  label: "Expenses",
  path: "/expenses",   // manager da employee de buraya gider
  icon: Wallet,
  roles: ["MANAGER", "EMPLOYEE"],
},

  // My Reviews (manager-only) — single item
  {
    key: "manager-my-reviews",
    label: "My Reviews",
    path: "/manager/reviews",
    icon: MessageSquare,
    roles: ["MANAGER"],
  },

  // Admin
  {
    key: "admin",
    label: "Admin",
    path: "/admin",
    icon: ShieldCheck,
    roles: ["ADMIN"],
    children: [
      { key: "admin-pending-managers", label: "Pending Managers", path: "/admin/pending-managers", icon: ShieldCheck, roles: ["ADMIN"] },
      { key: "admin-pending-reviews",  label: "Pending Reviews",  path: "/admin/pending-reviews",  icon: ShieldCheck, roles: ["ADMIN"] },
    ],
  },
];
