// src/app/Shell.tsx
import { Outlet, NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { MENU } from "../config/menu.config";
import { Settings as SettingsIcon, LogOut as LogOutIcon } from "lucide-react";

/* =========================
   Helpers
   ========================= */
// Extract domain from email (e.g., "manager@acme-corp.com" -> "acme-corp.com")
function domainFromEmail(email?: string | null) {
  if (!email) return "";
  const i = email.indexOf("@");
  return i > -1 ? email.slice(i + 1).trim() : "";
}

// Build a brand from the first label of the domain and UPPERCASE (EN)
function brandFromDomainEnglishUpper(domain: string) {
  if (!domain) return "";
  const firstLabel = domain.split(".")[0] || domain;
  const spaced = firstLabel.replace(/[-_]+/g, " ");
  return spaced.toLocaleUpperCase("en-US");
}

// Initials for the badge avatar (also uppercased EN)
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "∎";
  if (parts.length === 1) return (parts[0][0] ?? "∎").toLocaleUpperCase("en-US");
  return (parts[0][0] + parts[parts.length - 1][0]).toLocaleUpperCase("en-US");
}

export default function Shell() {
  const { user, logout } = useAuth();
  const role = (user?.role ?? "EMPLOYEE") as "ADMIN" | "MANAGER" | "EMPLOYEE";
  const [collapsed, setCollapsed] = useState(false);

  // Build menu items filtered and adjusted by role
  const items = useMemo(() => {
    return MENU.map((i) => {
      const visible = i.roles.includes(role);
      if (!visible) return null;

      // Special handling for "shifts" menu
      const isShifts = i.key === "shifts";
      const path = isShifts
        ? role === "MANAGER" || role === "ADMIN"
          ? "/shifts"
          : "/my-shifts"
        : i.path;

      const children = (i.children ?? []).filter((c) => c.roles.includes(role));

      return { ...i, path, children };
    }).filter(Boolean) as any[];
  }, [role]);

  const handleLogout = () => {
    logout?.();
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const sideLinkBase =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex ${
          collapsed ? "w-20" : "w-64"
        } flex-col border-r bg-white p-4 transition-all`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-8 w-8 rounded-lg bg-indigo-600" />
          {!collapsed && <span className="font-semibold">Peoplea</span>}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="ml-auto rounded-lg px-2 py-1 text-sm hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-6 space-y-1">
          {items.map((item) => (
            <SidebarItem key={item.key} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Footer actions */}
        <div className="mt-auto space-y-1">
          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${sideLinkBase} ${
                isActive ? "bg-gray-100 text-indigo-700 font-medium" : ""
              }`
            }
          >
            <SettingsIcon className="h-5 w-5" />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          {/* Logout */}
          <button onClick={handleLogout} className={`${sideLinkBase} w-full text-left`}>
            <LogOutIcon className="h-5 w-5" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1">
        <Topbar />
        <div className="mx-auto max-w-7xl p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ item, collapsed }: { item: any; collapsed: boolean }) {
  const [open, setOpen] = useState(true);
  const hasChildren = item.children?.length > 0;
  const Icon = item.icon;

  return (
    <div className="mb-1">
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 ${
            isActive ? "bg-gray-100 text-indigo-700 font-medium" : ""
          }`
        }
        onClick={
          hasChildren
            ? (e) => {
                if (!open) e.preventDefault();
                setOpen((o) => !o);
              }
            : undefined
        }
      >
        <Icon className="h-5 w-5" />
        {!collapsed && <span>{item.label}</span>}
        {hasChildren && !collapsed && (
          <span className="ml-auto">{open ? "▾" : "▸"}</span>
        )}
      </NavLink>

      {hasChildren && open && !collapsed && (
        <div className="ml-9 mt-1 space-y-1">
          {item.children.map((c: any) => (
            <NavLink
              key={c.path}
              to={c.path}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm hover:bg-gray-100 ${
                  isActive ? "bg-gray-100 text-indigo-700 font-medium" : ""
                }`
              }
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function Topbar() {
  const { user } = useAuth();

  // Build brand strictly from email domain and uppercase (EN)
  const emailDomain = domainFromEmail(user?.email);
  const companyBrand = brandFromDomainEnglishUpper(emailDomain);

  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="text-sm">
          <div className="font-semibold">
            {user?.role === "ADMIN"
              ? "Welcome, Admin"
              : `Welcome back, ${user?.fullName ?? user?.email ?? ""}`}
          </div>
        </div>

        {/* Non-clickable company badge */}
        {companyBrand && user?.role !== "ADMIN" && (
          <div
            role="group"
            aria-label="Company"
            className="inline-flex items-center rounded-xl border bg-white px-3 py-2 shadow-sm cursor-default select-none"
          >
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white text-sm font-semibold">
              {initials(companyBrand)}
            </div>
            <div className="ml-3 leading-tight">
              <div className="text-[10px] uppercase tracking-wide text-gray-500">
                Company
              </div>
              <div className="text-sm font-medium text-gray-900">
                {companyBrand}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
