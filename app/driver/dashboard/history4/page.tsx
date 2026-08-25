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

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    className: string;
    dot: string;
    pill: string;
  }
> = {
  [AssignmentStatus.SCHEDULED]: {
    label: "Terjadwal",
    icon: HiOutlineCalendar,
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    pill: "text-blue-600",
  },
  [AssignmentStatus.ONGOING]: {
    label: "Berlangsung",
    icon: FiLoader,
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    pill: "text-amber-600",
  },
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

function DetailRow({
  icon: Icon,
  iconClassName,
  label,
  value,
  truncate = false,
  className = "",
}: {
  icon: React.ElementType;
  iconClassName: string;
  label: string;
  value: React.ReactNode;
  truncate?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 text-xs sm:text-sm ${className}`}>
      <span
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${iconClassName}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className={truncate ? "min-w-0 truncate" : ""}>
        <strong className="font-medium text-gray-500">{label}:</strong>{" "}
        <span className="font-medium text-gray-800">{value}</span>
      </span>
    </div>
  );
}

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: AssignmentStatus.SCHEDULED, label: "Terjadwal" },
  { key: AssignmentStatus.ONGOING, label: "Berlangsung" },
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
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (user?.id) {
      fetchDriverTripHistory(user.id);
    }
  }, [user, fetchDriverTripHistory]);

  // Filter & Sort Data
  const filteredAndSortedHistory = useMemo(() => {
    let result = [...driverHistory];

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

  // Grouping berdasarkan Tanggal (Date)
  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof filteredAndSortedHistory> = {};
    filteredAndSortedHistory.forEach((trip) => {
      const dateKey = String(trip.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(trip);
    });
    return groups;
  }, [filteredAndSortedHistory]);

  const toggleDate = (date: string) => {
    setCollapsedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

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
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
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

          {/* Daftar Riwayat Trip dengan Grouping Tanggal */}
          {!driverHistoryLoading && filteredAndSortedHistory.length > 0 && (
            <div className="space-y-6">
              {Object.entries(groupedByDate).map(([date, trips]) => {
                const isCollapsed = collapsedDates[date];
                return (
                  <div key={date} className="space-y-3">
                    {/* Header Tanggal */}
                    <button
                      type="button"
                      onClick={() => toggleDate(date)}
                      className="sticky top-0 z-10 flex w-full items-center gap-2 bg-white/95 py-2 backdrop-blur-xs cursor-pointer"
                    >
                      <HiOutlineCalendar className="h-4 w-4 text-blue-600" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {date}
                      </h2>
                      <span className="text-xs font-normal text-gray-400">
                        ({trips.length} Perjalanan)
                      </span>
                      <span className="ml-auto text-gray-400">
                        {isCollapsed ? (
                          <FiChevronDown className="h-4 w-4" />
                        ) : (
                          <FiChevronUp className="h-4 w-4" />
                        )}
                      </span>
                    </button>

                    {/* Cards dalam Tanggal tersebut */}
                    {!isCollapsed && (
                      <div className="space-y-3">
                        {trips.map((trip) => {
                          const statusConfig =
                            STATUS_CONFIG[trip.status] ??
                            STATUS_CONFIG[AssignmentStatus.SCHEDULED];

                          return (
                            <div
                              key={trip.assignmentId}
                              className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs transition-all hover:border-blue-300 hover:shadow-md sm:p-5"
                            >
                              {/* Aksen garis status di kiri */}
                              <span
                                className={`absolute left-0 top-0 h-full w-1.5 ${statusConfig.dot}`}
                              />

                              <div className="flex flex-col gap-3 pl-2">
                                {/* Baris Atas: Avatar Rute, Nama Rute & Badges */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <RouteAvatar code={trip.routeCode || ""} />
                                    <span className="truncate text-sm sm:text-base font-bold text-gray-900">
                                      {trip.routeCode || "-"} —{" "}
                                      {trip.routeName || "-"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <StatusBadge status={trip.status} />
                                    <DirectionBadge
                                      direction={trip.direction}
                                    />
                                    {trip.vehicle?.type && (
                                      <VehicleTypeBadge
                                        type={trip.vehicle.type}
                                      />
                                    )}
                                  </div>
                                </div>

                                {/* Baris Tengah: Detail Informasi */}
                                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-1">
                                  <DetailRow
                                    icon={HiOutlineClock}
                                    iconClassName="bg-blue-50 text-blue-600"
                                    label="Jam"
                                    value={`${trip.startTime} - ${trip.endTime}`}
                                  />
                                  <DetailRow
                                    icon={HiOutlineTruck}
                                    iconClassName="bg-indigo-50 text-indigo-600"
                                    label="Armada"
                                    value={`${trip.vehicle?.vehicleCode || ""} (${trip.vehicle?.plateNumber || "-"})`}
                                    truncate
                                  />
                                  <DetailRow
                                    icon={HiOutlineUser}
                                    iconClassName="bg-sky-50 text-sky-600"
                                    label="Driver"
                                    value={trip.driver?.name || "-"}
                                    truncate
                                  />
                                  <DetailRow
                                    icon={HiOutlineTicket}
                                    iconClassName="bg-blue-50 text-blue-700"
                                    label="Kondektur"
                                    value={trip.conductor?.name || "-"}
                                    truncate
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
