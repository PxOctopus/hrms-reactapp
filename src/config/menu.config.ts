// config/menu.config.ts
import {
  LayoutDashboard, Users, CalendarDays, Umbrella, CalendarClock,
  Package, Wallet, MessageSquare, ShieldCheck, Settings as SettingsIcon
} from "lucide-react";

export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";
export type MenuItem = {
  label: string; path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles: Role[]; children?: MenuItem[];
};

export const MENU: MenuItem[] = [
  
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN","MANAGER","EMPLOYEE"] },

  
  { label: "Employees", path: "/employees", icon: Users, roles: ["MANAGER"] },
 

  // Leave section (role-specific children)
  {
    label: "Leave",
    path: "/leaves",
    icon: Umbrella,
    roles: ["MANAGER","EMPLOYEE"],
    children: [
      // EMPLOYEE sees only "Request Leave" (same /leaves route, employee modu)
      { label: "Request Leave", path: "/leaves", icon: CalendarDays, roles: ["EMPLOYEE"] },

      // MANAGER sees "Assign Leave" (+ optional manager pages)
      { label: "Assign Leave", path: "/leaves", icon: CalendarDays, roles: ["MANAGER"] },
      { label: "Pending Leaves", path: "/pending-leaves", icon: CalendarDays, roles: ["MANAGER"] },
    ],
  },

  { label: "Shifts",   path: "/shifts",   icon: CalendarClock, roles: ["MANAGER","EMPLOYEE"] },
  { label: "Assets",   path: "/assets",   icon: Package,       roles: ["MANAGER","EMPLOYEE"] },
  { label: "Expenses", path: "/expenses", icon: Wallet,        roles: ["MANAGER","EMPLOYEE"] },
  { label: "Reviews",  path: "/reviews",  icon: MessageSquare, roles: ["MANAGER"] },

  { label: "Admin", path: "/admin", icon: ShieldCheck, roles: ["ADMIN"], children: [
    { label: "Pending Managers", path: "/admin/pending-managers", icon: ShieldCheck, roles: ["ADMIN"] },
    { label: "Pending Reviews",  path: "/admin/pending-reviews",  icon: ShieldCheck, roles: ["ADMIN"] },
  ]},

  
];
