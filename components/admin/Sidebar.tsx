"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Dapatkan profil user jika login, atau default ke Super Administrator
  const adminName = user?.name || "Super Admin";
  const adminRole =
    user?.role === "admin"
      ? "Super Administrator"
      : user?.role
      ? String(user.role).toUpperCase()
      : "Super Administrator";
  const badgeLabel = "Administrator Pusat";

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("auth");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      window.location.href = "/admin/auth/login";
    }
  };

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      href: "/admin/dashboard/users",
      label: "Pengguna",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      href: "/admin/dashboard/driver",
      label: "Pengemudi",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      href: "/admin/dashboard/conductor",
      label: "Kondektur",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      href: "/admin/dashboard/vehicle",
      label: "Kendaraan",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4l4-4v-4h-8v8z"
          />
        </svg>
      ),
    },
    {
      href: "/admin/dashboard/route",
      label: "Route",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      ),
    },
    {
      href: "/admin/dashboard/schedule-templates",
      label: "Template Jadwal",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm3-7h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01M16 17h.01"
          />
        </svg>
      ),
    },
    {
      href: "/admin/dashboard/schedules",
      label: "Monitoring Jadwal",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      href: "/admin/dashboard/assignments",
      label: "Penugasan (Roster)",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      href: "/admin/dashboard/tarif",
      label: "Tarif (Biaya)",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`w-[210px] h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-30 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo Section */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 17H5a2 2 0 01-2-2V6a2 2 0 012-2h13a2 2 0 012 2v3M9 17h6M9 17v2m6-2v2M3 11h18M9 11V9m6 2V9"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">
            Angkot<span className="text-blue-600">Go</span>
          </span>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors md:hidden"
          aria-label="Close sidebar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Nav Link List dengan Interactive Hover Motion */}
      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {navItems.map((item) => {
          const active =
            item.href === "/admin/dashboard"
              ? pathname === "/admin/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200/60 translate-x-1"
                  : "text-gray-600 hover:bg-blue-50/80 hover:text-blue-700 hover:translate-x-1.5 hover:shadow-xs"
              }`}
            >
              <span
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  active ? "text-white" : "text-gray-400 group-hover:text-blue-600"
                }`}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin / Superadmin Profile dengan Interactive Card Hover Action */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="group p-3 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 hover:from-blue-50/70 hover:to-indigo-50/40 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs flex items-center justify-center font-bold text-sm tracking-wider group-hover:scale-105 group-hover:shadow transition-all duration-200">
                {adminName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "SA"}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full group-hover:scale-110 transition-transform"
                title="Online / Aktif"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-900 transition-colors">
                {adminName}
              </p>
              <p className="text-xs text-blue-600 font-semibold truncate group-hover:text-blue-700">
                {adminRole}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white text-blue-700 border border-blue-200/90 text-[11px] font-semibold rounded-full group-hover:border-blue-400 group-hover:bg-blue-100/60 shadow-2xs transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              {badgeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Keluar dengan Hover Slide Motion */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          type="button"
          className="group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 hover:translate-x-1.5 hover:shadow-xs transition-all duration-200 cursor-pointer"
        >
          <svg
            className="w-5 h-5 text-red-500 group-hover:scale-110 group-hover:-translate-x-0.5 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Keluar
        </button>
      </div>
    </aside>
  );
}
