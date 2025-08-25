import React from "react";
import { Link } from "react-router-dom";
import Brand from "./Brand";


export default function PeopleaLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Brand />
          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="#features" className="hover:text-indigo-700">
              Features
            </a>
            <a href="#pricing" className="hover:text-indigo-700">
              Pricing
            </a>
            <a href="#about" className="hover:text-indigo-700">
              About
            </a>
            <a href="#blog" className="hover:text-indigo-700">
              Blog
            </a>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Sign Up Now
            </Link>
          </div>
          <button className="md:hidden rounded-xl border px-3 py-2 text-sm">
            Menu
          </button>
        </div>
      </header>

      <section className="relative isolate overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop"
          alt="Abstract HR technology background"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-slate-900/60" />
        <div className="mx-auto max-w-5xl px-4 py-24 text-center text-white md:py-28">
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Transform Your <span className="text-indigo-300">HR</span> Management
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-200">
            Streamline recruitment, employee management, and HR processes with a
            comprehensive platform designed for modern businesses.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-indigo-700"
            >
              Start Free Trial
            </Link>
            <a
              href="#features"
              className="rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/20"
            >
              Explore Features
            </a>
          </div>
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-200">
            <span className="flex items-center gap-2">Secure & Compliant</span>
            <span className="flex items-center gap-2">
              10,000+ Companies Trust Us
            </span>
            <span className="flex items-center gap-2">24/7 Support</span>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">
            Everything you need to manage people and processes
          </h2>
          <p className="mt-3 text-gray-600">
            A single, coherent system that reduces admin and increases visibility
            across your organization.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              t: "Recruiting",
              d: "Create roles, publish listings, and track applicants end-to-end.",
            },
            {
              t: "Onboarding",
              d: "Automated checklists, document collection, and guided setup.",
            },
            {
              t: "Employee Records",
              d: "Central profiles, roles, compensation, and history.",
            },
            {
              t: "Time & Attendance",
              d: "Policy-driven tracking with exports for payroll.",
            },
            {
              t: "Leave Management",
              d: "Configurable policies, approvals, and real-time balances.",
            },
            {
              t: "Performance",
              d: "Reviews, goals, and feedback to drive growth.",
            },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border bg-white p-6">
              <div className="text-base font-semibold">{f.t}</div>
              <p className="mt-2 text-sm text-gray-600">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Pricing</h2>
          <p className="mt-3 text-gray-600">
            Simple plans that scale with your team.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Starter", price: "$0", note: "Free trial, core features" },
            { name: "Growth", price: "$49", note: "Advanced features and support" },
            { name: "Scale", price: "$99", note: "All features and priority support" },
          ].map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border bg-white p-6 text-center"
            >
              <div className="text-lg font-semibold">{p.name}</div>
              <div className="mt-2 text-3xl font-bold">{p.price}</div>
              <div className="mt-2 text-sm text-gray-600">{p.note}</div>
              <Link
                to="/register"
                className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Choose
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">About Peoplea</h2>
            <p className="mt-3 text-gray-600">
              Peoplea is built to simplify HR for modern teams. The platform
              consolidates workflows so leaders can focus on people and outcomes.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/register"
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="rounded-xl border px-5 py-2 text-sm hover:bg-gray-50"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1600&auto=format&fit=crop"
              alt="Team collaboration"
              className="h-72 w-full rounded-2xl object-cover"
            />
          </div>
        </div>
      </section>

      <section id="blog" className="mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Insights</h2>
          <p className="mt-3 text-gray-600">
            Practical guidance on people operations and growth.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Designing an onboarding that works",
              img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop",
            },
            {
              title: "Building a culture of feedback",
              img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop",
            },
            {
              title: "Measuring performance with clarity",
              img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop",
            },
          ].map((b) => (
            <div
              key={b.title}
              className="overflow-hidden rounded-2xl border bg-white"
            >
              <img
                src={b.img}
                alt={b.title}
                className="h-40 w-full object-cover"
              />
              <div className="p-5">
                <div className="text-base font-semibold">{b.title}</div>
                <a
                  href="/blog"
                  className="mt-2 inline-block text-sm text-indigo-700 hover:underline"
                >
                  Read more
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="rounded-2xl border bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white md:p-10">
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold">
                Launch your workspace in minutes
              </h3>
              <p className="mt-2 text-indigo-100">
                No setup fees, no long-term contracts. Get value from day one.
              </p>
            </div>
            <div className="flex gap-3 md:justify-end">
              <Link
                to="/register"
                className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-medium text-white hover:bg-white/20"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-4">
          <div>
            <Brand />
            <p className="mt-3 text-sm text-gray-600">
              Modern HR software to onboard, organize, and grow your team.
            </p>
          </div>
          <div>
            <div className="font-semibold">Product</div>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <a href="#features" className="hover:text-indigo-700">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-indigo-700">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-indigo-700">
                  About
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/login" className="hover:text-indigo-700">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-700">
                  Get started
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Newsletter</div>
            <form className="mt-3 flex gap-2">
              <input
                type="email"
                placeholder="Work email"
                className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
              />
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Peoplea. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
