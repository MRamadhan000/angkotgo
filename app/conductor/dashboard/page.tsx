"use client";

import Link from "next/link";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiChevronRight,
  FiLogOut,
  FiCheckCircle,
} from "react-icons/fi";

import { useAuth } from "@/context/AuthContext";

export default function ConductorDashboardPage() {
  const { user, logout } = useAuth();

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
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased">
      <div className="mx-auto w-full max-w-[1200px] space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8">
        {/* HEADER */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Identity */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white sm:h-14 sm:w-14">
                <FiUser className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-gray-500">Selamat Datang 👋</p>
                <h1 className="mt-0.5 truncate text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
                  {user?.name}
                </h1>
                <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">
                  Role : {user?.role}
                </p>
              </div>
            </div>

            {/* Status + Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:px-4 sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">Siap Bertugas</span>
                <FiCheckCircle className="h-4 w-4 sm:hidden" />
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-rose-600 sm:px-4 sm:text-sm"
              >
                <FiLogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* SHORTCUT GRID */}
        <div>
          <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wide text-gray-400 sm:mb-4">
            Menu Utama
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {shortcuts.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md sm:flex-col sm:items-stretch sm:justify-between sm:rounded-3xl sm:p-6 ${item.ring}`}
                >
                  {/* Top row: icon + arrow (arrow hidden on mobile, shown on sm+) */}
                  <div
                    className={`flex-shrink-0 rounded-2xl p-3 sm:p-3.5 ${item.iconBg}`}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>

                  <div className="hidden items-center justify-end sm:flex">
                    <span className="rounded-xl bg-gray-50 p-2 text-gray-400 transition-colors group-hover:bg-gray-900 group-hover:text-white">
                      <FiChevronRight className="h-4 w-4" />
                    </span>
                  </div>

                  {/* Text content */}
                  <div className="min-w-0 flex-1 sm:mt-4 sm:flex-none">
                    <h3 className="truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-blue-600 sm:text-base lg:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1 hidden text-xs leading-relaxed text-gray-500 sm:block">
                      {item.description}
                    </p>
                  </div>

                  {/* Mobile-only chevron */}
                  <FiChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-gray-500 sm:hidden" />

                  {/* Footer link (desktop only) */}
                  <div className="mt-6 hidden items-center justify-between border-t border-gray-50 pt-4 text-xs font-bold text-gray-600 group-hover:text-gray-900 sm:flex">
                    <span>Akses Menu</span>
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
