"use client";

import Link from "next/link";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";

import { useAuth } from "@/context/AuthContext";

export const COLORS = {
  primary: "#1E40AF",
  accent: "#2563EB",
  textDark: "#0F172A",
  textSecondary: "#475569",
  white: "#FFFFFF",
} as const;

function DashboardHeader({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2.5 min-w-0 flex-1">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">
              Selamat Datang 👋
            </p>
            <h1 className="mt-0.5 text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 break-words leading-snug">
              {user?.name || "-"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className="inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-white shadow-xs uppercase tracking-wider"
              style={{ backgroundColor: COLORS.primary }}
            >
              Role: {user?.role ? String(user.role).toUpperCase() : "-"}
            </span>

            {/* Badge Siap Bertugas */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-emerald-600 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Siap Bertugas</span>
            </div>
          </div>
        </div>

        <div className="flex items-center pt-2 sm:pt-0 border-t border-gray-100 sm:border-t-0 sm:self-center">
          <button
            onClick={onLogout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs sm:text-sm font-bold text-red-600 border-2 border-red-500 shadow-sm transition-all hover:bg-red-100 cursor-pointer"
          >
            <FiLogOut className="h-4 w-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardBody() {
  const shortcuts = [
    {
      title: "Jadwal Mendatang",
      description:
        "Lihat dan pantau penugasan trip aktif atau yang akan datang.",
      href: "/conductor/dashboard/now",
      icon: FiCalendar,
      iconBg: "bg-amber-50 text-amber-600",
      ring: "group-hover:ring-amber-100",
    },
    {
      title: "Riwayat Trip",
      description:
        "Arsip perjalanan dan tugas operasional yang telah diselesaikan.",
      href: "/conductor/dashboard/history",
      icon: FiClock,
      iconBg: "bg-green-50 text-green-600",
      ring: "group-hover:ring-green-100",
    },
    {
      title: "Profil Saya",
      description: "Kelola informasi data diri, kontak, dan status akun Anda.",
      href: "/conductor/dashboard/profile",
      icon: FiUser,
      iconBg: "bg-blue-50 text-blue-600",
      ring: "group-hover:ring-blue-100",
    },
  ];

  return (
    <div>
      <h2 className="mb-3 px-1 text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-400 sm:mb-4">
        Menu Utama
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {shortcuts.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs ring-1 ring-transparent transition-all hover:-translate-y-1 hover:border-gray-200 hover:shadow-md sm:flex-col sm:items-center sm:text-center sm:p-7 ${item.ring}`}
            >
              <div
                className={`flex-shrink-0 rounded-2xl p-3 sm:p-4 sm:mb-2 ${item.iconBg}`}
              >
                <Icon className="h-5 w-5 sm:h-8 sm:w-8" />
              </div>

              <div className="min-w-0 flex-1 sm:flex-none sm:w-full">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 break-words">
                  {item.title}
                </h3>
                <p className="mt-0.5 sm:mt-1 text-xs leading-relaxed text-gray-500 break-words hidden sm:block sm:px-2">
                  {item.description}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-gray-500 break-words sm:hidden">
                  {item.description}
                </p>
              </div>

              <FiChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-gray-500 sm:hidden" />

              {/* Footer link / Action (desktop only) */}
              <div className="mt-4 hidden w-full items-center justify-center border-t border-gray-50 pt-3 text-xs font-bold text-blue-600 group-hover:text-blue-700 sm:flex">
                <span>Akses Menu</span>
                <span className="ml-1.5 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function ConductorDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1200px] space-y-4 sm:space-y-6 p-3 sm:p-6 lg:p-8">
        <DashboardHeader user={user} onLogout={logout} />
        <DashboardBody />
      </div>
    </div>
  );
}