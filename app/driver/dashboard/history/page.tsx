"use client";

import { useAuth } from "@/context/AuthContext";
import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlineTicket,
  HiOutlineBell,
} from "react-icons/hi";
import {
  FiAlertCircle,
  FiRefreshCw,
  FiCheckCircle,
  FiLoader,
  FiXCircle,
  FiArrowRight,
  FiArrowLeft,
  FiStar,
  FiArrowLeft as FiBackIcon,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  AssignmentStatus,
  DirectionType,
  VehicleType,
} from "@/types/vehicles/vehicle.type";

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


const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; className: string; dot: string; pill: string }
> = {
  [AssignmentStatus.COMPLETED]: {
    label: "Selesai",
    icon: FiCheckCircle,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    pill: "text-emerald-600",
  },
  [AssignmentStatus.CANCELLED]: {
    label: "Dibatalkan",
    icon: FiXCircle,
    className: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    pill: "text-rose-600",
  },
};

const DIRECTION_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  [DirectionType.FORWARD]: {
    label: "Berangkat",
    icon: FiArrowRight,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  [DirectionType.RETURN]: {
    label: "Pulang",
    icon: FiArrowLeft,
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

function RouteAvatar({ code }: { code: string }) {
  const initials = (code || "?").slice(0, 3).toUpperCase();
  return (
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-[11px] font-bold text-white shadow-xs">
      {initials}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    icon: HiOutlineCalendar,
    className: "bg-gray-50 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.className}`}
    >
      <Icon
        className={`h-3.5 w-3.5 ${status === AssignmentStatus.ONGOING ? "animate-spin" : ""}`}
      />
      {config.label}
    </span>
  );
}

function DirectionBadge({ direction }: { direction: string }) {
  const config = DIRECTION_CONFIG[direction] ?? {
    label: direction,
    icon: FiArrowRight,
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

function VehicleTypeBadge({ type }: { type?: string }) {
  if (!type) return null;
  const config = VEHICLE_TYPE_CONFIG[type] ?? {
    label: type,
    className: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${config.className}`}
    >
      {type === VehicleType.PREMIUM && <FiStar className="h-2.5 w-2.5" />}
      {config.label}
    </span>
  );
}

function formatDate(value: string | Date): string {
  const dateKey = typeof value === "string" ? value.slice(0, 10) : new Date(value).toISOString().slice(0, 10);
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: AssignmentStatus.COMPLETED, label: "Selesai" },
  { key: AssignmentStatus.CANCELLED, label: "Dibatalkan" },
];

export default function DriverHistoryPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const {
    fetchDriverTripHistory,
    driverHistory,
    driverHistoryLoading,
    driverHistoryError,
  } = useVehicleAssignments();

  // State untuk Filter & Sort
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  // State untuk collapse per tanggal (default semua terbuka)
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.id) {
      fetchDriverTripHistory(user.id);
    }
  }, [user, fetchDriverTripHistory]);

  // Filter & Sort Data
  const filteredAndSortedHistory = useMemo(() => {
    const today = getTodayDateKey();

    let result = driverHistory.filter((trip) => {
      // Hanya biarkan lewat jika datanya STRICTLY di masa lalu sebelum jadwal hari ini!
      return getDateKey(trip.date) < today;
    });

    if (statusFilter !== "ALL") {
      result = result.filter((trip) => trip.status === statusFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [driverHistory, statusFilter, sortOrder]);

  // Data is inherently parsed and sorted without grouping


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
            Silakan masuk terlebih dahulu untuk melihat riwayat trip Anda.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1200px] space-y-4 sm:space-y-6 p-3 sm:p-6 lg:p-8">

        {/* Header Biru Utama */}
        <div className="relative overflow-hidden rounded-2xl bg-blue-900 p-5 shadow-md sm:rounded-3xl sm:p-8">
          {/* Background Accent Gradient Effect */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-600/30 blur-2xl"></div>

          <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-6 min-w-0">
              {/* Tombol Kembali */}
              <button
                onClick={() => router.back()}
                className="flex-shrink-0 flex items-center justify-center rounded-2xl bg-blue-800/80 p-3 sm:p-4 text-white border border-blue-700/60 shadow-inner transition-all hover:bg-blue-800 cursor-pointer"
                title="Kembali"
              >
                <FiBackIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </button>

              {/* Informasi Judul */}
              <div className="min-w-0 space-y-1 sm:space-y-2">
                <div>
                  <p className="text-[11px] sm:text-sm font-medium text-blue-200">
                    Arsip Perjalanan
                  </p>
                  <h1 className="mt-0.5 text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-white truncate leading-snug">
                    Riwayat Trip Driver
                  </h1>
                </div>
                <p className="text-xs text-blue-100 truncate">
                  Akun: <span className="font-semibold">{user.name}</span>
                </p>
              </div>
            </div>

            {/* Tombol Notifikasi di Header */}
            <button
              type="button"
              aria-label="Notifikasi"
              className="relative flex-shrink-0 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-800/80 text-white border border-blue-700/60 shadow-inner hover:bg-blue-800 transition-colors cursor-pointer"
            >
              <HiOutlineBell className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                1
              </span>
            </button>
          </div>
        </div>

        {/* Konten Utama */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-8 space-y-5">

          {/* Filter & Sort Control Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            {/* Filter Status */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <FiFilter className="h-4 w-4 text-gray-400 flex-shrink-0" />
              {STATUS_FILTERS.map((filter) => {
                const isActive = statusFilter === filter.key;
                const isCancelled = filter.key === AssignmentStatus.CANCELLED;
                return (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${isActive
                      ? isCancelled
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-blue-600 text-white shadow-xs"
                      : isCancelled
                        ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Sort Order */}
            <button
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <HiOutlineCalendar className="h-3.5 w-3.5 text-gray-400" />
              <span>{sortOrder === "desc" ? "Terbaru" : "Terlama"}</span>
              <FiChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </div>

          {/* Loading State */}
          {driverHistoryLoading && (
            <div className="p-12 text-center">
              <FiRefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-gray-500">
                Memuat riwayat trip...
              </p>
            </div>
          )}

          {/* Error State */}
          {driverHistoryError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{driverHistoryError}</span>
            </div>
          )}

          {/* Empty State */}
          {!driverHistoryLoading &&
            !driverHistoryError &&
            filteredAndSortedHistory.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <p className="text-sm font-medium text-gray-500">
                  Tidak ada riwayat trip ditemukan.
                </p>
              </div>
            )}

          {/* Daftar Riwayat Trip dengan Format Tabel */}
          {!driverHistoryLoading && filteredAndSortedHistory.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-blue-50/50 text-xs uppercase text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Tanggal</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Rute</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Waktu / Armada</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Kondektur</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredAndSortedHistory.map((trip) => {
                    return (
                      <tr
                        key={trip.assignmentId}
                        className="hover:bg-slate-50/50 transition duration-150"
                      >
                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-slate-800">
                            {formatDate(trip.date)}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-bold text-slate-900">
                            {trip.routeName || "-"}
                          </p>
                          <p className="text-xs font-semibold text-blue-600">
                            {trip.routeCode || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-slate-800">
                            {trip.startTime || "-"} -{" "}
                            {trip.endTime || "-"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {trip.vehicle?.plateNumber || "-"} (
                            {trip.vehicle?.vehicleCode || "-"})
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-medium text-slate-700">
                            {trip.conductor?.name || "Tidak ada"}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col items-start gap-1.5">
                            <StatusBadge status={trip.status} />
                            <DirectionBadge direction={trip.direction} />
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
  );
}