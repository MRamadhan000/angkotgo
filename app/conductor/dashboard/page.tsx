"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  FaMapMarkedAlt,
  FaHistory,
  FaUserAlt,
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaBus,
  FaRoute,
} from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/common/DashboardHeader";
import { usePersonnelSchedule } from "@/hooks/vehicles/usePersonalSchedules";

function CurrentScheduleWidget({ userId }: { userId: string | number }) {
  const {
    activeSchedule,
    activeLoading,
    activeError,
    fetchActiveScheduleByPersonnel,
  } = usePersonnelSchedule();

  useEffect(() => {
    if (userId) {
      const getTodayDateString = () => new Date().toISOString().split("T")[0];
      fetchActiveScheduleByPersonnel({
        targetDate: getTodayDateString(),
        conductorId: Number(userId),
      });
    }
  }, [userId, fetchActiveScheduleByPersonnel]);

  if (activeLoading) {
    return (
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse flex items-center justify-center text-sm text-gray-500">
        Memuat jadwal saat ini...
      </div>
    );
  }

  if (activeError) {
    return (
      <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-600">
        {activeError}
      </div>
    );
  }

  const schedule = activeSchedule && activeSchedule.length > 0 ? activeSchedule[0] : null;

  if (!schedule) {
    return (
      <div className="mb-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-sm font-medium text-gray-400">
        Tidak ada jadwal penugasan aktif untuk hari ini.
      </div>
    );
  }

  return (
    <div className="mb-6 sm:mb-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-xs transition-shadow hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base">
          <FaCalendarAlt className="text-blue-600" />
          Jadwal Saat Ini
        </h2>
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 sm:text-xs">
          {schedule.status}
        </span>
      </div>

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-4">
          <div>
            <div className="text-[11px] font-medium text-gray-400 sm:text-xs">
              Rute Perjalanan
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-slate-900 sm:text-base">
              <FaRoute className="shrink-0 text-blue-500 text-xs sm:text-sm" />
              <span className="truncate">
                {schedule.routeCode} - {schedule.routeName}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-gray-50 pt-3 text-xs text-gray-600 sm:text-sm">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FaClock className="text-xs" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 sm:text-[10px]">
                  Waktu
                </div>
                <span className="block truncate text-xs font-semibold text-slate-700 sm:text-sm">
                  {schedule.startTime} - {schedule.endTime}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FaBus className="text-xs" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 sm:text-[10px]">
                  Kendaraan
                </div>
                <span className="block truncate text-xs font-semibold text-slate-700 sm:text-sm">
                  {schedule.vehicle?.plateNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Link
          href={`/conductor/dashboard/now/${schedule.assignmentId}`}
          className="flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 sm:px-6 sm:py-3 sm:text-sm"
        >
          Lihat Detail
          <FaArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Link>
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
      href: "/conductor/dashboard/upcoming",
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
        {user?.id && <CurrentScheduleWidget userId={user.id} />}
        <DashboardBody />
      </div>
    </div>
  );
}