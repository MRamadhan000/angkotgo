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
  FaSignOutAlt,
  FaUser,
  FaEnvelope,
  FaCheckCircle,
} from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
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
        driverId: Number(userId),
      });
    }
  }, [userId, fetchActiveScheduleByPersonnel]);

  if (activeLoading) {
    return (
      <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs animate-pulse text-sm text-gray-400">
        Memuat jadwal saat ini...
      </div>
    );
  }

  if (activeError) {
    return (
      <div className="mb-6 rounded-3xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-600">
        {activeError}
      </div>
    );
  }

  const schedule =
    activeSchedule && activeSchedule.length > 0 ? activeSchedule[0] : null;

  if (!schedule) {
    return (
      <div className="mb-6 rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm font-medium text-gray-400">
        Tidak ada jadwal penugasan aktif untuk hari ini.
      </div>
    );
  }

  return (
    <div className="group mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:ring-4 hover:ring-blue-50">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
            <FaCalendarAlt className="text-base" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
              Jadwal Saat Ini
            </h2>
            <p className="text-xs text-gray-400">
              Sinkronisasi status penugasan armada secara real-time
            </p>
          </div>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-600 border border-blue-100 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
          ● {schedule.status}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gray-50/60 border border-gray-100 p-4 transition-all duration-300 group-hover:bg-blue-50/30 group-hover:border-blue-100">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Rute Aktif
            </span>
            <span className="text-sm font-bold text-slate-900">
              {schedule.routeCode} - {schedule.routeName}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <FaClock className="text-gray-400" /> Waktu: {schedule.startTime}{" "}
              - {schedule.endTime}
            </span>
            <span className="flex items-center gap-1.5">
              <FaBus className="text-gray-400" /> Kendaraan:{" "}
              {schedule.vehicle?.plateNumber || "-"}
            </span>
          </div>
        </div>

        <Link
          href={`/driver/dashboard/now/${schedule.assignmentId}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-md"
        >
          Lihat Detail
          <FaArrowRight className="text-[10px] transition-transform duration-300 group-hover:translate-x-1" />
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
      href: "/driver/dashboard/upcoming",
      icon: FaMapMarkedAlt,
    },
    {
      title: "Riwayat Trip",
      description:
        "Arsip perjalanan dan tugas operasional yang telah diselesaikan.",
      href: "/driver/dashboard/history",
      icon: FaHistory,
    },
    {
      title: "Profil Saya",
      description: "Kelola informasi data diri, kontak, dan status akun Anda.",
      href: "/driver/dashboard/profile",
      icon: FaUserAlt,
    },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wide text-gray-400">
        <span>Menu Utama</span>
        <span className="text-[11px] font-normal normal-case text-gray-400">
          Pilih akses tugas
        </span>
      </div>
      <div className="space-y-3">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-xl hover:ring-4 hover:ring-blue-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-100 text-gray-300 transition-all duration-300 group-hover:translate-x-1 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                <FaArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function DriverDashboardPage({ user, logout }: any) {
  const { user: authUser, logout: authLogout } = useAuth();
  const currentUser = user || authUser;
  const handleLogout = logout || authLogout;

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased flex flex-col justify-between">
      <div className="mx-auto w-full max-w-[1240px] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-blue-600 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md hover:ring-2 hover:ring-blue-50"
          >
            ← Kembali ke Dashboard
          </Link>
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-xs transition-all duration-300 hover:border-blue-200 hover:shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            SISTEM KRU LAPANGAN
          </div>
          <div className="text-xs font-medium text-gray-500 border border-gray-200 bg-white px-4 py-1.5 rounded-full shadow-xs transition-all duration-300 hover:border-blue-200 hover:shadow-sm">
            Portal Resmi Tugas Armada
          </div>
        </div>

        {/* Main Grid Layout (Sidebar + Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Profile Card Sidebar */}
          <div className="group/sidebar lg:col-span-4 rounded-3xl bg-blue-600 p-6 text-white shadow-lg flex flex-col justify-between space-y-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-4 hover:ring-blue-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 font-black text-xl shadow-inner transition-transform duration-300 group-hover/sidebar:scale-105">
                  {currentUser?.name ? currentUser.name.charAt(0) : "D"}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/40 px-3 py-1 text-xs font-medium text-white border border-blue-400/30 transition-colors duration-300 group-hover/sidebar:bg-blue-500">
                  <FaCheckCircle className="text-[10px] text-emerald-300" />{" "}
                  Siap Operasional
                </span>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-blue-200 font-medium">
                  Profil Pengemudi
                </p>
                <h1 className="text-2xl font-black mt-1 tracking-tight">
                  {currentUser?.name || "Driver 1"}
                </h1>
                <p className="text-xs text-blue-100 mt-0.5">
                  Kru ID:{" "}
                  {currentUser?.employeeId || currentUser?.id
                    ? `D${currentUser.id}-OPS-2024`
                    : "D1-OPS-2024"}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2.5 rounded-xl bg-blue-700/50 px-4 py-2.5 text-xs text-blue-100 border border-blue-500/30 transition-all duration-300 hover:bg-blue-700 hover:border-blue-300">
                  <FaUser className="text-blue-300" />
                  <span className="truncate">Kondektur Bertugas</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-blue-700/50 px-4 py-2.5 text-xs text-blue-100 border border-blue-500/30 transition-all duration-300 hover:bg-blue-700 hover:border-blue-300">
                  <FaEnvelope className="text-blue-300" />
                  <span className="truncate">
                    {currentUser?.email || "email belum tersedia"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-700/60 hover:bg-rose-600 border border-blue-400/30 hover:border-rose-400 py-3 text-xs font-semibold text-white transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <FaSignOutAlt className="transition-transform duration-300 group-hover/sidebar:-translate-x-1" />
              Logout
            </button>
          </div>

          {/* Right Column: Active Schedule & Main Menu */}
          <div className="lg:col-span-8 space-y-6">
            {currentUser?.id && (
              <CurrentScheduleWidget userId={currentUser.id} />
            )}
            <DashboardBody />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white py-4 px-6 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Portal Operasional Terintegrasi • Mode Website Responsif</span>
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Koneksi
          Aman Lapangan
        </span>
      </div>
    </div>
  );
}
