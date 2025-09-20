// src/app/Shell.tsx
import { Outlet, NavLink, useLocation } from "react-router-dom";
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
    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600";
  const sideLinkIdle = "text-gray-700 hover:bg-gray-100";
  const sideLinkActive = "bg-gray-900 text-white shadow-sm";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex ${collapsed ? "w-20" : "w-64"} flex-col border-r bg-white p-4 transition-all`}
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
            <SidebarItem
              key={item.key}
              item={item}
              collapsed={collapsed}
              sideLinkBase={sideLinkBase}
              sideLinkIdle={sideLinkIdle}
              sideLinkActive={sideLinkActive}
            />
          ))}
        </nav>

        {/* Footer actions */}
        <div className="mt-auto space-y-1">
          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${sideLinkBase} ${isActive ? sideLinkActive : sideLinkIdle}`
            }
            aria-label="Settings"
          >
            <SettingsIcon className="h-5 w-5" />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`${sideLinkBase} ${sideLinkIdle} w-full text-left`}
            aria-label="Log out"
          >
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

function SidebarItem({
  item,
  collapsed,
  sideLinkBase,
  sideLinkIdle,
  sideLinkActive,
}: {
  item: any;
  collapsed: boolean;
  sideLinkBase: string;
  sideLinkIdle: string;
  sideLinkActive: string;
}) {
  const { pathname } = useLocation();
  const hasChildren = item.children?.length > 0;
  const Icon = item.icon;

  // parent is active if its path matches OR a child path matches
  const childActive =
    hasChildren && item.children.some((c: any) => pathname.startsWith(c.path));
  const parentActive = pathname === item.path || childActive;

const [open, setOpen] = useState<boolean>(childActive); // auto-open if a child is active

  if (hasChildren) {
    return (
      <div className="mb-1">
        {/* Group header as a button, not a NavLink */}
       <button
  type="button"
  onClick={() => setOpen((prev) => !prev)}   // implicit any çözümü
  className={`${sideLinkBase} ${parentActive ? sideLinkActive : sideLinkIdle} w-full text-left`}
  aria-expanded={open}
  aria-controls={`menu-group-${item.key}`}
>
  <Icon className="h-5 w-5" />
  {!collapsed && <span>{item.label}</span>}
  {!collapsed && (
    <span className="ml-auto select-none">{open ? "▾" : "▸"}</span>
  )}
</button>

        {/* Children */}
        {open && !collapsed && (
          <div id={`menu-group-${item.key}`} className="ml-9 mt-1 space-y-1">
            {item.children.map((c: any) => (
              <NavLink
                key={c.path}
                to={c.path}
                className={({ isActive }) =>
                  `block ${sideLinkBase} ${isActive ? sideLinkActive : sideLinkIdle}`
                }
              >
                <span>{c.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  // simple leaf link
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `${sideLinkBase} ${isActive ? sideLinkActive : sideLinkIdle}`
      }
    >
      <Icon className="h-5 w-5" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
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
