"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  FaMapMarkedAlt,
  FaHistory,
  FaUserAlt,
  FaArrowRight,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { HiOutlineCalendar, HiOutlineCash } from "react-icons/hi";

import { useAuth } from "@/context/AuthContext";
import { useUpcomingVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments2";
import { AssignmentStatus } from "@/types/vehicles/vehicle.type";
import {
  PersonnelAssignmentRole,
  UpcomingVehicleAssignment,
} from "@/types/vehicles/vehicle-assignments.type";

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

function TodayScheduleWidget({
  schedules,
  isLoading,
  error,
}: {
  schedules: UpcomingVehicleAssignment[];
  isLoading: boolean;
  error: Error | null;
}) {
  const sortedSchedules = useMemo(
    () => [...schedules].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [schedules],
  );

  if (isLoading) {
    return (
      <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs animate-pulse text-sm text-gray-400">
        Memuat jadwal hari ini...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 rounded-3xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-600">
        {error.message}
      </div>
    );
  }

  if (sortedSchedules.length === 0) {
    return (
      <div className="mb-6 rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm font-medium text-gray-400">
        Tidak ada jadwal penugasan untuk hari ini.
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FaCalendarAlt className="text-base" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Jadwal Hari Ini
            </h2>
            <p className="text-xs text-gray-400">
              Jadwal penugasan dan status perjalanan Anda
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedSchedules.map((schedule) => (
          <div
            key={schedule.id}
            className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <p className="font-bold text-slate-900">
                {schedule.route?.name || "Rute belum ditentukan"}
              </p>
              <p className="text-xs text-gray-500">
                {schedule.route?.code || "-"} · {schedule.startTime} ·{" "}
                {schedule.vehicle?.plateNumber || "Kendaraan belum ditentukan"}
                {schedule.vehicle?.vehicleCode
                  ? ` (${schedule.vehicle.vehicleCode})`
                  : ""}
              </p>
            </div>
            <span
              className={`self-start rounded-full border px-3 py-1 text-xs font-bold sm:self-auto ${
                schedule.status === AssignmentStatus.SCHEDULED
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : schedule.status === AssignmentStatus.ONGOING
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : schedule.status === AssignmentStatus.COMPLETED
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {schedule.status}
            </span>
          </div>
        ))}
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

  const assignmentRole: PersonnelAssignmentRole | null =
    currentUser?.role === "driver"
      ? "DRIVER"
      : currentUser?.role === "conductor"
        ? "CONDUCTOR"
        : null;
  const {
    data: upcomingAssignments = [],
    isLoading: upcomingLoading,
    error: upcomingError,
  } = useUpcomingVehicleAssignments(currentUser?.id, assignmentRole);
  const todayAssignments = useMemo(() => {
    const today = getTodayDateKey();
    return upcomingAssignments.filter(
      (assignment) => getDateKey(assignment.assignmentDate) === today,
    );
  }, [upcomingAssignments]);

  // Data dummy sementara untuk statistik pendapatan & trip
  const tripSummary = useMemo(() => {
    return {
      total: 18,
      completed: 15,
      cancelled: 3,
      totalIncome: 2450000,
    };
  }, []);

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
                      {todayAssignments.length} Agenda
                    </span>
                  </div>
                </div>

                {/* Widget 2: Total Pendapatan Bersih (Dummy Data) */}
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
            <TodayScheduleWidget
              schedules={todayAssignments}
              isLoading={upcomingLoading}
              error={upcomingError}
            />
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