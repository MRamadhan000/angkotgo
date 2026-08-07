"use client";

import Link from "next/link";
import {
  FaMapMarkedAlt,
  FaHistory,
  FaUserAlt,
  FaArrowRight,
} from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/common/DashboardHeader";

function DashboardBody() {
  const shortcuts = [
    {
      title: "Jadwal Mendatang",
      description:
        "Lihat dan pantau penugasan trip aktif atau yang akan datang.",
      href: "/conductor/dashboard/now",
      icon: FaMapMarkedAlt,
    },
    {
      title: "Riwayat Trip",
      description:
        "Arsip perjalanan dan tugas operasional yang telah diselesaikan.",
      href: "/conductor/dashboard/history",
      icon: FaHistory,
    },
    {
      title: "Profil Saya",
      description: "Kelola informasi data diri, kontak, dan status akun Anda.",
      href: "/conductor/dashboard/profile",
      icon: FaUserAlt,
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
              className="group relative flex items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition-all hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-lg sm:flex-col sm:items-center sm:text-center sm:p-8"
            >
              {/* Ikon Bulat */}
              <div className="flex-shrink-0 rounded-full bg-blue-50 p-3.5 sm:p-5 sm:mb-3 text-blue-700 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105">
                <Icon className="h-5 w-5 sm:h-8 sm:w-8" />
              </div>

              {/* Teks Judul & Deskripsi */}
              <div className="min-w-0 flex-1 sm:flex-none sm:w-full">
                <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-700 break-words">
                  {item.title}
                </h3>
                <p className="mt-0.5 sm:mt-1.5 text-xs sm:text-sm leading-relaxed text-gray-500 break-words hidden sm:block sm:px-2">
                  {item.description}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-gray-500 break-words sm:hidden">
                  {item.description}
                </p>
              </div>

              {/* Panah Indikator (Mobile & Desktop) */}
              <div className="flex-shrink-0 text-gray-300 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-blue-600 sm:absolute sm:bottom-5 sm:right-5">
                <FaArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
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