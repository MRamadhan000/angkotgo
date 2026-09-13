"use client";

import { useEffect, useMemo } from "react";
import {
  FaArrowRight,
  FaBus,
  FaCalendarAlt,
  FaClock,
  FaMapMarkedAlt,
  FaRoute,
  FaUserAlt,
  FaArrowLeft,
} from "react-icons/fa";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/common/DashboardHeader";
import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments";
import {
  AssignmentStatus,
  DirectionType,
  VehicleType,
} from "@/types/vehicles/vehicle.type";
import { TripHistoryItem } from "@/types/vehicles/trip-history.type";
import {
  FiAlertCircle,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiStar,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiShield,
} from "react-icons/fi";
import {
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineTruck,
} from "react-icons/hi";

function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateKey(value: string | Date): string {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string | Date): string {
  const dateKey = getDateKey(value);
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const DIRECTION_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  [DirectionType.FORWARD]: {
    label: "Berangkat",
    icon: FaArrowRight,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  [DirectionType.RETURN]: {
    label: "Pulang",
    icon: FaArrowLeft,
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
};

const VEHICLE_TYPE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  [VehicleType.PREMIUM]: {
    label: "Premium",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  [VehicleType.REGULER]: {
    label: "Reguler",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

function DirectionBadge({ direction }: { direction: string }) {
  const config = DIRECTION_CONFIG[direction] ?? {
    label: direction,
    icon: FaArrowRight,
    className: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export default function ConductorUpcomingPage() {
  const { user, isLoading: authLoading } = useAuth();

  const {
    conductorHistory,
    conductorHistoryLoading,
    conductorHistoryError,
    fetchConductorTripHistory,
  } = useVehicleAssignments();

  useEffect(() => {
    if (!user?.id) return;

    void fetchConductorTripHistory(Number(user.id)).catch(() => {
      // Error is handled by the hook
    });
  }, [user?.id, fetchConductorTripHistory]);

  const upcomingSchedules = useMemo(() => {
    const today = getTodayDateKey();

    return (conductorHistory ?? [])
      .filter((item: TripHistoryItem) => {
        return (
          getDateKey(item.date) > today &&
          (item.status === AssignmentStatus.SCHEDULED ||
            item.status === "ONGOING")
        );
      })
      .sort((first, second) => {
        const dateComparison = getDateKey(first.date).localeCompare(
          getDateKey(second.date),
        );

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return first.startTime.localeCompare(second.startTime);
      });
  }, [conductorHistory]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <FiRefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-gray-500">
            Memuat sesi pengguna...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="flex w-full max-w-md items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 text-center text-sm text-amber-800 shadow-xs">
          <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>
            Silakan masuk terlebih dahulu untuk melihat jadwal mendatang Anda.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden flex flex-col justify-between">
      <div className="mx-auto w-full max-w-[1240px] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/conductor/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-blue-600 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md hover:ring-2 hover:ring-blue-50 cursor-pointer"
          >
            ← Kembali
          </Link>
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-xs transition-all duration-300 hover:border-blue-200 hover:shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            SISTEM KRU LAPANGAN
          </div>
          <div className="text-xs font-medium text-gray-500 border border-gray-200 bg-white px-4 py-1.5 rounded-full shadow-xs transition-all duration-300 hover:border-blue-200 hover:shadow-sm">
            Portal Resmi Tugas Armada
          </div>
        </div>

        {/* Main Grid Layout (Sidebar Profil + Content Jadwal Mendatang) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Profile Card Sidebar (Konsisten dengan Dashboard Kondektur) */}
          <div className="group/sidebar lg:col-span-4 rounded-3xl bg-blue-600 p-6 text-white shadow-lg flex flex-col justify-between space-y-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-4 hover:ring-blue-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 font-black text-xl shadow-inner transition-transform duration-300 group-hover/sidebar:scale-105">
                  {user?.name ? user.name.charAt(0) : "C"}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/40 px-3 py-1 text-xs font-medium text-white border border-blue-400/30 transition-colors duration-300 group-hover/sidebar:bg-blue-500">
                  <FiCheckCircle className="text-[10px] text-emerald-300" />{" "}
                  Siap Operasional
                </span>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-blue-200 font-medium">
                  Profil Kondektur
                </p>
                <h1 className="text-2xl font-black mt-1 tracking-tight">
                  {user.name}
                </h1>
                <p className="text-xs text-blue-100 mt-0.5">
                  Kru ID: {user?.id ? `C${user.id}-OPS-2024` : "C1-OPS-2024"}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2.5 rounded-xl bg-blue-700/50 px-4 py-2.5 text-xs text-blue-100 border border-blue-500/30 transition-all duration-300 hover:bg-blue-700 hover:border-blue-300">
                  <FiUser className="text-blue-300" />
                  <span className="truncate">Kondektur Bertugas</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-blue-700/50 px-4 py-2.5 text-xs text-blue-100 border border-blue-500/30 transition-all duration-300 hover:bg-blue-700 hover:border-blue-300">
                  <FiShield className="text-blue-300" />
                  <span className="truncate">
                    {user?.email || "email belum tersedia"}
                  </span>
                </div>
              </div>
            </div>

            {/* Ringkasan Cepat Jadwal Mendatang di Sidebar */}
            <div className="rounded-2xl bg-blue-700/50 border border-blue-400/30 p-4 transition-all duration-300 group-hover/sidebar:bg-blue-700">
              <p className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">
                Total Penugasan Aktif
              </p>
              <p className="text-lg font-black text-white mt-0.5">
                {upcomingSchedules.length} Agenda Trip
              </p>
              <p className="text-[11px] text-blue-100 mt-1">
                Pantau jadwal perjalanan armada mendatang secara real-time.
              </p>
            </div>
          </div>

          {/* Right Column: Content Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Info Widget dengan efek hover interaktif */}
            <div className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:ring-4 hover:ring-blue-50 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                    <FaCalendarAlt className="text-base" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                      Jadwal Mendatang
                    </h2>
                    <p className="text-xs text-gray-400">
                      Halaman ini menampilkan jadwal penugasan kondektur setelah
                      hari ini.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Notifikasi"
                  className="relative inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-gray-600 border border-gray-200 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer"
                >
                  <HiOutlineBell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-extrabold text-white">
                    1
                  </span>
                </button>
              </div>
            </div>

            {/* List / Table Section */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <FaMapMarkedAlt className="text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Daftar Jadwal Mendatang
                </h2>
              </div>

              {conductorHistoryLoading && (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                </div>
              )}

              {!conductorHistoryLoading && conductorHistoryError && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{conductorHistoryError}</span>
                </div>
              )}

              {!conductorHistoryLoading &&
                !conductorHistoryError &&
                upcomingSchedules.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                    <HiOutlineTruck className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">
                      Belum ada jadwal mendatang.
                    </p>
                  </div>
                )}

              {!conductorHistoryLoading &&
                !conductorHistoryError &&
                upcomingSchedules.length > 0 && (
                  <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-xs">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-blue-50/50 text-xs uppercase text-slate-500">
                        <tr>
                          <th scope="col" className="px-4 py-3 font-semibold">
                            Tanggal
                          </th>
                          <th scope="col" className="px-4 py-3 font-semibold">
                            Rute
                          </th>
                          <th scope="col" className="px-4 py-3 font-semibold">
                            Waktu / Armada
                          </th>
                          <th scope="col" className="px-4 py-3 font-semibold">
                            Driver
                          </th>
                          <th scope="col" className="px-4 py-3 font-semibold">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {upcomingSchedules.map((assignment) => {
                          const vehicleTypeConfig =
                            VEHICLE_TYPE_CONFIG[
                              assignment.vehicle?.type as string
                            ];

                          return (
                            <tr
                              key={assignment.assignmentId}
                              className="hover:bg-slate-50/50 transition duration-150"
                            >
                              <td className="px-4 py-4 align-top">
                                <p className="font-semibold text-slate-800">
                                  {formatDate(assignment.date)}
                                </p>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <p className="font-bold text-slate-900">
                                  {assignment.routeName || "-"}
                                </p>
                                <p className="text-xs font-semibold text-blue-600">
                                  {assignment.routeCode || "-"}
                                </p>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <p className="font-semibold text-slate-800">
                                  {assignment.startTime || "-"} -{" "}
                                  {assignment.endTime || "-"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {assignment.vehicle?.plateNumber || "-"} (
                                  {assignment.vehicle?.vehicleCode || "-"})
                                </p>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <p className="font-medium text-slate-700">
                                  {assignment.driver?.name || "Tidak ada"}
                                </p>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-col items-start gap-1.5">
                                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 tracking-wide">
                                    {assignment.status}
                                  </span>
                                  <DirectionBadge
                                    direction={assignment.direction}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Konsisten */}
      <div className="border-t border-gray-200 bg-white py-4 px-6 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-8">
        <span>Portal Operasional Terintegrasi • Mode Website Responsif</span>
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Koneksi
          Aman Lapangan
        </span>
      </div>
    </div>
  );
}
