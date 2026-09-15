"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FaMapMarkedAlt,
  FaHistory,
  FaUserAlt,
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaBus,
  FaSignOutAlt,
} from "react-icons/fa";
import { HiOutlineCalendar, HiOutlineCash } from "react-icons/hi";

import { useAuth } from "@/context/AuthContext";
import { usePersonnelSchedule } from "@/hooks/vehicles/usePersonalSchedules";
import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments";
import { AssignmentStatus } from "@/types/vehicles/vehicle.type";

function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateKey(value: string | Date): string {
  if (typeof value === "string") return value.slice(0, 10);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
    <div className="group mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs transition-all duration-300 hover:border-blue-300 hover:shadow-lg">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FaCalendarAlt className="text-base" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Jadwal Saat Ini
            </h2>
            <p className="text-xs text-gray-400">
              Sinkronisasi status penugasan kondektur secara real-time
            </p>
          </div>
        </div>
        <span className="self-start sm:self-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-600 border border-blue-100">
          ● {schedule.status}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gray-50/60 border border-gray-100 p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              RUTE AKTIF
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
          href={`/conductor/dashboard/now/${schedule.assignmentId}`}
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
      <div className="mb-3 flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wide text-gray-400">
        <span>MENU UTAMA</span>
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
              className="group flex items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
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

export default function ConductorDashboardPage({ user, logout }: any) {
  const { user: authUser, logout: authLogout } = useAuth();
  const currentUser = user || authUser;
  const handleLogout = logout || authLogout;

  const {
    historySchedule,
    fetchConductorTripHistory: fetchPersonnelTripHistory,
  } = usePersonnelSchedule() as any;

  // Menggunakan method khusus kondektur dari useVehicleAssignments (atau fallback universal jika ada)
  const assignmentHook = useVehicleAssignments({ fetchOnMount: false }) as any;
  const fetchAssignmentHistory =
    assignmentHook.fetchConductorTripHistory ||
    assignmentHook.fetchDriverTripHistory;
  const historyData =
    assignmentHook.conductorHistory ||
    assignmentHook.driverHistory ||
    assignmentHook.history;

  useEffect(() => {
    if (currentUser?.id) {
      const numericId = Number(currentUser.id);
      if (typeof fetchPersonnelTripHistory === "function") {
        void fetchPersonnelTripHistory(numericId);
      }
      if (typeof fetchAssignmentHistory === "function") {
        fetchAssignmentHistory(numericId);
      }
    }
  }, [currentUser?.id, fetchPersonnelTripHistory, fetchAssignmentHistory]);

  const upcomingCount = useMemo(() => {
    const list = historyData ?? historySchedule ?? [];
    const today = getTodayDateKey();

    return list.filter((item: any) => {
      return (
        getDateKey(item.date) >= today &&
        (item.status === AssignmentStatus.SCHEDULED ||
          item.status === "ONGOING")
      );
    }).length;
  }, [historyData, historySchedule]);

  const tripSummary = useMemo(() => {
    const list = historyData ?? [];
    const completed = list.filter(
      (t: any) => t.status === AssignmentStatus.COMPLETED,
    ).length;
    const cancelled = list.filter(
      (t: any) => t.status === AssignmentStatus.CANCELLED,
    ).length;
    const totalIncome = list.reduce(
      (sum: number, t: any) => sum + Number(t.totalAmount ?? 0),
      0,
    );

    return {
      total: list.length,
      completed,
      cancelled,
      totalIncome,
    };
  }, [historyData]);

  // Membersihkan nama agar jika tertulis "Driver X" secara keliru dari state login, otomatis diganti menjadi Kondektur
  const rawName = currentUser?.name || "Kondektur 1";
  const displayName = rawName.toLowerCase().includes("driver")
    ? rawName.replace(/driver/gi, "Kondektur")
    : rawName;
  const displayInitial = displayName ? displayName.charAt(0) : "C";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col justify-between">
      <div className="mx-auto w-full max-w-310 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            SISTEM OPERASIONAL KRU LAPANGAN
          </div>
          <div className="text-xs font-medium text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-xs">
            Portal Resmi Tugas Armada
          </div>
        </div>

        {/* Main Grid Layout (Sidebar + Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Profile Card Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="rounded-3xl bg-linear-to-b from-[#102a5c] to-[#0d234d] p-6 text-white shadow-xl flex flex-col justify-between space-y-6 border border-blue-900/50">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white font-bold text-xl border border-white/10 shadow-inner">
                    {displayInitial}
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>{" "}
                    Siap Operasional
                  </span>
                </div>

                <div>
                  <p className="text-xs text-blue-300 font-medium">
                    Selamat Datang Kondektur
                  </p>
                  <h1 className="text-2xl font-black mt-1 tracking-tight text-white">
                    {displayName}
                  </h1>
                </div>

                {/* Widget 1: Agenda Trip Mendatang */}
                <div className="pt-1">
                  <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-xs text-blue-100 border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <HiOutlineCalendar className="h-4 w-4 text-blue-300" />
                      <span>Agenda Trip Mendatang</span>
                    </div>
                    <span className="font-bold text-white bg-blue-600/60 px-2 py-0.5 rounded-md">
                      {upcomingCount} Agenda
                    </span>
                  </div>
                </div>

                {/* Widget 2: Total Pendapatan Bersih */}
                <div className="rounded-2xl bg-blue-950/40 border border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                        TOTAL PENDAPATAN BERSIH
                      </p>
                      <p className="text-lg font-black text-white mt-0.5">
                        Rp {tripSummary.totalIncome.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                      <HiOutlineCash className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-white/10 text-center">
                    <div>
                      <p className="text-[9px] text-blue-200 font-semibold">
                        Total
                      </p>
                      <p className="text-xs font-bold text-white">
                        {tripSummary.total}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-emerald-300 font-semibold">
                        Selesai
                      </p>
                      <p className="text-xs font-bold text-emerald-300">
                        {tripSummary.completed}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-rose-300 font-semibold">
                        Batal
                      </p>
                      <p className="text-xs font-bold text-rose-300">
                        {tripSummary.cancelled}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Logout Terpisah Di Bawah */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#ea384c] hover:bg-rose-600 py-3 text-xs font-semibold text-white transition-all duration-300 shadow-md cursor-pointer"
            >
              <FaSignOutAlt />
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
