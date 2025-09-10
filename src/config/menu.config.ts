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

// Define the structure of each menu item
export type MenuItem = {
  key: string; // unique key for reliable matching (e.g., "shifts")
  label: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles: Role[]; // roles allowed to see this item
  children?: MenuItem[];
};

// Central MENU configuration
export const MENU: MenuItem[] = [
  // Dashboard is visible to all roles
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  },

  // Employees: visible only to managers
  {
    key: "employees",
    label: "Employees",
    path: "/employees",
    icon: Users,
    roles: ["MANAGER"],
  },

  // Leave section (role-specific children)
  {
    key: "leave",
    label: "Leave",
    path: "/leaves",
    icon: Umbrella,
    roles: ["MANAGER", "EMPLOYEE"],
    children: [
      // Employee: can only request leave
      {
        key: "leave-request",
        label: "Request Leave",
        path: "/leaves",
        icon: CalendarDays,
        roles: ["EMPLOYEE"],
      },
      // Manager: can assign or review leaves
      {
        key: "leave-assign",
        label: "Assign Leave",
        path: "/leaves",
        icon: CalendarDays,
        roles: ["MANAGER"],
      },
      {
        key: "leave-pending",
        label: "Pending Leaves",
        path: "/pending-leaves",
        icon: CalendarDays,
        roles: ["MANAGER"],
      },
    ],
  },

  // Shifts: key is important, Shell will override path based on role
  {
    key: "shifts", // used in Shell to redirect MANAGER -> /shifts, EMPLOYEE -> /my-shifts
    label: "Shifts",
    path: "/shifts", // default path (managers); employees will be redirected in Shell
    icon: CalendarClock,
    roles: ["MANAGER", "EMPLOYEE"],
  },

  {
    key: "manager-assets",
    label: "Assets",
    path: "/manager/assets",
    icon: Package,
    roles: ["MANAGER"],
  },
  {
    key: "employee-assets",
    label: "Assets",
    path: "/my-assets",
    icon: Package,
    roles: ["EMPLOYEE"],
  },

  {
    key: "expenses",
    label: "Expenses",
    path: "/expenses",
    icon: Wallet,
    roles: ["MANAGER", "EMPLOYEE"],
  },

  {
    key: "reviews",
    label: "Reviews",
    path: "/reviews",
    icon: MessageSquare,
    roles: ["MANAGER"],
  },

  // Admin section: only visible to admins
  {
    key: "admin",
    label: "Admin",
    path: "/admin",
    icon: ShieldCheck,
    roles: ["ADMIN"],
    children: [
      {
        key: "admin-pending-managers",
        label: "Pending Managers",
        path: "/admin/pending-managers",
        icon: ShieldCheck,
        roles: ["ADMIN"],
      },
      {
        key: "admin-pending-reviews",
        label: "Pending Reviews",
        path: "/admin/pending-reviews",
        icon: ShieldCheck,
        roles: ["ADMIN"],
      },
    ],
  },
];
