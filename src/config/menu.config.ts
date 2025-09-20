// src/config/menu.config.ts
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
  key: string;               // unique stable key
  label: string;             // text in sidebar
  path: string;              // absolute navigation path
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles: Role[];             // who can see this item
  children?: MenuItem[];     // optional nested items
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
      // Employee entry
      { key: "leave-request", label: "Request Leave", path: "/leaves", icon: CalendarDays, roles: ["EMPLOYEE"] },
      // Manager entries
      { key: "leave-assign",  label: "Assign Leave",  path: "/leaves", icon: CalendarDays, roles: ["MANAGER"] },
      { key: "leave-pending", label: "Pending Leaves", path: "/pending-leaves", icon: CalendarDays, roles: ["MANAGER"] },
    ],
  },

  // Shifts (shell may redirect by role to /shifts or /my-shifts)
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
  // - EMPLOYEE: /expenses (My Expenses)
  // - MANAGER: /expenses + child: Review Expenses
  {
    key: "expenses",
    label: "Expenses",
    path: "/expenses",
    icon: Wallet,
    roles: ["MANAGER", "EMPLOYEE"],
    children: [
      { key: "manager-expenses-review", label: "Review Expenses", path: "/expenses/review", icon: Wallet, roles: ["MANAGER"] },
    ],
  },

  // Reviews (manager-only)
  { key: "reviews", label: "Reviews", path: "/reviews", icon: MessageSquare, roles: ["MANAGER"] },

  // Admin (admin-only)
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
