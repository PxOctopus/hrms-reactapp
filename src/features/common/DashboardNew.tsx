import React from "react";
import { Link } from "react-router-dom";

export default function DashboardNew() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white p-4">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-8 w-8 rounded-lg bg-indigo-600" />
          <span className="font-semibold">Pagedone</span>
        </div>

        {/* Main nav */}
        <nav className="mt-6 space-y-1">
          <Link
            to="/dashboard-new"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link
            to="/employees"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
          >
            Employees
          </Link>
          <Link
            to="/leaves"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
          >
            Leaves
          </Link>
          <Link
            to="/companies"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
          >
            Companies
          </Link>
        </nav>

        {/* Bottom nav */}
        <div className="mt-auto space-y-1">
          <Link
            to="/profile"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
          >
            Settings
          </Link>
          <Link
            to="/unauthorized"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
          >
            Help & Support
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="text-sm">
              <span className="text-gray-500">Welcome back, </span>
              <span className="font-semibold text-indigo-700">Ronald!</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
                Attendance
              </button>
              <button className="rounded-xl bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700">
                + Add Employee
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-7xl p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left content */}
          <div className="xl:col-span-2 space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "New Employee", value: "1012", delta: "+30%", positive: true },
                { label: "Resign Employee", value: "102", delta: "-22%", positive: false },
                { label: "Employee on Leave", value: "23", delta: "+18%", positive: true },
                { label: "New Application", value: "200", delta: "-30%", positive: false },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border bg-white p-4">
                  <div className="text-sm text-gray-500">{s.label}</div>
                  <div className="mt-2 flex items-end justify-between">
                    <div className="text-2xl font-semibold">{s.value}</div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        s.positive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {s.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Employee Tracker (chart placeholder) */}
            <div className="rounded-2xl border bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">Employee Tracker</div>
                <select className="rounded-lg border px-2 py-1 text-sm">
                  <option>This week</option>
                  <option>This month</option>
                  <option>This year</option>
                </select>
              </div>
              <div className="h-56 rounded-xl border border-dashed flex items-center justify-center text-gray-400">
                Chart placeholder
              </div>
            </div>

            {/* Employees Table */}
            <div className="rounded-2xl border bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="font-semibold">Employees Status</div>
                <input
                  placeholder="Search here"
                  className="w-56 rounded-xl border px-3 py-2 text-sm"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Full Name & Email</th>
                      <th className="px-4 py-3 font-medium">Department</th>
                      <th className="px-4 py-3 font-medium">Join Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Floyd Miles", email: "floyd@pagedone.io", dep: "Design", date: "Jun 24, 2023", status: "Active" },
                      { name: "Savannah Nguyen", email: "savannah@pagedone.io", dep: "Research", date: "Feb 23, 2023", status: "Inactive" },
                      { name: "Cameron Williamson", email: "cameron@pagedone.io", dep: "Development", date: "Oct 23, 2023", status: "Onboarding" },
                    ].map((r) => (
                      <tr key={r.email} className="border-t">
                        <td className="px-4 py-3">
                          <div className="font-medium">{r.name}</div>
                          <div className="text-gray-500">{r.email}</div>
                        </td>
                        <td className="px-4 py-3">{r.dep}</td>
                        <td className="px-4 py-3">{r.date}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              r.status === "Active"
                                ? "bg-green-50 text-green-700"
                                : r.status === "Inactive"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="rounded-xl border px-2 py-1 text-xs hover:bg-gray-50">View</button>
                            <button className="rounded-xl border px-2 py-1 text-xs hover:bg-gray-50">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border bg-white p-4">
              <div className="mb-2 font-semibold">Upcoming Schedule</div>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <div>
                    <div className="font-medium">Team Briefing</div>
                    <div className="text-gray-500">09:00 - 09:30</div>
                  </div>
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">Critical</span>
                </li>
                <li className="flex justify-between">
                  <div>
                    <div className="font-medium">Compensation Review</div>
                    <div className="text-gray-500">10:30 - 12:00</div>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">Urgent</span>
                </li>
                <li className="flex justify-between">
                  <div>
                    <div className="font-medium">Administrative Tasks</div>
                    <div className="text-gray-500">12:00 - 13:00</div>
                  </div>
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">Routine</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-semibold">Announcement</div>
                <button className="text-sm text-indigo-700">See all</button>
              </div>
              <ul className="space-y-3 text-sm">
                {[
                  "Outing schedule for every department",
                  "Meeting HR Department",
                  "IT Department need more talents",
                ].map((t) => (
                  <li key={t} className="flex items-start justify-between">
                    <span>{t}</span>
                    <span className="text-gray-400">11:30 AM</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
