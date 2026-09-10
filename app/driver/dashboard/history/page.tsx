"use client";

import { useAuth } from "@/context/AuthContext";
import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineCalendar,
  HiOutlineTruck,
  HiOutlineBell,
} from "react-icons/hi";
import {
  FiAlertCircle,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiArrowLeft,
  FiArrowLeft as FiBackIcon,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiUser,
} from "react-icons/fi";
import {
  AssignmentStatus,
  DirectionType,
  VehicleType,
} from "@/types/vehicles/vehicle.type";

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
  {
    label: string;
    icon: React.ElementType;
    className: string;
    dot: string;
  }
> = {
  [AssignmentStatus.COMPLETED]: {
    label: "Selesai",
    icon: FiCheckCircle,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  [AssignmentStatus.CANCELLED]: {
    label: "Dibatalkan",
    icon: FiXCircle,
    className: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

const DIRECTION_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
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
  {
    label: string;
    className: string;
  }
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
      <Icon className="h-3.5 w-3.5" />
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

function formatDateShort(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
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
  } = useVehicleAssignments({ fetchOnMount: false });

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (user?.id) {
      fetchDriverTripHistory(user.id);
    }
  }, [user, fetchDriverTripHistory]);

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

  // Group per tanggal supaya bisa di-collapse & lebih rapi di mobile
  const groupedHistory = useMemo(() => {
    const groups = new Map<string, typeof filteredAndSortedHistory>();
    for (const trip of filteredAndSortedHistory) {
      const key = getDateKey(trip.date);
      const existing = groups.get(key);
      if (existing) {
        existing.push(trip);
      } else {
        groups.set(key, [trip]);
      }
    }
    return Array.from(groups.entries()).map(([dateKey, trips]) => ({
      dateKey,
      trips,
    }));
  }, [filteredAndSortedHistory]);

  const summary = useMemo(() => {
    const completed = filteredAndSortedHistory.filter(
      (t) => t.status === AssignmentStatus.COMPLETED,
    ).length;
    const cancelled = filteredAndSortedHistory.filter(
      (t) => t.status === AssignmentStatus.CANCELLED,
    ).length;
    // Total pendapatan hanya dihitung dari trip yang statusnya Selesai,
    // karena trip yang Dibatalkan tidak menghasilkan pendapatan.
    const totalIncome = filteredAndSortedHistory
      .reduce((sum, t) => sum + Number(t.totalAmount ?? 0), 0);

    return {
      total: filteredAndSortedHistory.length,
      completed,
      cancelled,
      totalIncome,
    };
  }, [filteredAndSortedHistory]);

  const toggleDate = (dateKey: string) => {
    setCollapsedDates((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }));
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
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden pb-8">
      <div className="mx-auto w-full max-w-[1200px] space-y-4 p-3 sm:space-y-6 sm:p-6 lg:p-8">
        {/* Header Biru Utama */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-5 shadow-2xl sm:p-8 border border-slate-800">
          {/* Modern Glow Effects - Gojek Inspired */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-green-600/15 blur-3xl" />

          {/* Top Header Navigation */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3.5 sm:gap-5">
              <button
                onClick={() => router.back()}
                className="flex flex-shrink-0 items-center justify-center rounded-2xl bg-slate-800/80 p-3 text-slate-200 border border-slate-700/60 shadow-lg backdrop-blur-md transition-all hover:bg-slate-700 hover:text-white active:scale-95"
                title="Kembali"
              >
                <FiBackIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400 sm:text-xs">
                    Driver Hub
                  </p>
                </div>
                <h1 className="truncate text-lg font-black tracking-tight text-white sm:text-2xl lg:text-3xl">
                  Riwayat Perjalanan
                </h1>
                <p className="truncate text-xs text-slate-400">
                  Driver:{" "}
                  <span className="font-semibold text-slate-200">
                    {user.name}
                  </span>
                </p>
              </div>
            </div>

            {/* Notification Badge */}
            <button
              type="button"
              aria-label="Notifikasi"
              className="relative inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-200 border border-slate-700/60 shadow-lg backdrop-blur-md transition-all hover:bg-slate-700 hover:text-white active:scale-95"
            >
              <HiOutlineBell className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-slate-950 ring-4 ring-slate-900">
                1
              </span>
            </button>
          </div>

          {/* Main Stats Cards (Gojek E-Wallet Style) */}
          <div className="relative z-10 mt-6 space-y-3">
            {/* Highlighted Income Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 p-4 sm:p-5 text-white shadow-lg shadow-emerald-950/40">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                <svg className="h-32 w-32 fill-current" viewBox="0 0 24 24">
                  <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              </div>

              <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                Total Pendapatan Bersih
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tight sm:text-4xl">
                  Rp {summary.totalIncome.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {/* Total Trip */}
              <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-3 backdrop-blur-md">
                <p className="text-[10px] font-medium text-slate-400 sm:text-xs">
                  Total Order
                </p>
                <p className="mt-1 text-base font-black text-white sm:text-2xl">
                  {summary.total}
                </p>
              </div>

              {/* Selesai */}
              <div className="rounded-2xl bg-slate-800/60 border border-emerald-500/20 p-3 backdrop-blur-md">
                <p className="text-[10px] font-medium text-emerald-400 sm:text-xs">
                  Selesai
                </p>
                <p className="mt-1 text-base font-black text-emerald-400 sm:text-2xl">
                  {summary.completed}
                </p>
              </div>

              {/* Dibatalkan */}
              <div className="rounded-2xl bg-slate-800/60 border border-rose-500/20 p-3 backdrop-blur-md">
                <p className="text-[10px] font-medium text-rose-400 sm:text-xs">
                  Batal
                </p>
                <p className="mt-1 text-base font-black text-rose-400 sm:text-2xl">
                  {summary.cancelled}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Konten Utama */}
        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
          {/* Filter & Sort Control Bar — sticky biar tetap kelihatan pas scroll di HP */}
          <div className="sticky top-0 z-10 -mx-3 flex flex-col gap-2.5 border-b border-gray-100 bg-white/95 px-3 pb-3 pt-1 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:px-0 sm:pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <FiFilter className="h-4 w-4 flex-shrink-0 text-gray-400" />
              {STATUS_FILTERS.map((filter) => {
                const isActive = statusFilter === filter.key;
                const isCancelled = filter.key === AssignmentStatus.CANCELLED;
                return (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key)}
                    className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
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

            <button
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
              className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 self-start rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:self-auto"
            >
              <HiOutlineCalendar className="h-3.5 w-3.5 text-gray-400" />
              <span>{sortOrder === "desc" ? "Terbaru" : "Terlama"}</span>
              <FiChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </div>

          {/* Loading State */}
          {driverHistoryLoading && (
            <div className="space-y-3 p-2 sm:p-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
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
              <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center sm:p-12">
                <HiOutlineTruck className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">
                  Tidak ada riwayat trip ditemukan.
                </p>
              </div>
            )}

          {/* Daftar Riwayat — grouped per tanggal */}
          {!driverHistoryLoading && groupedHistory.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              {groupedHistory.map(({ dateKey, trips }) => {
                const isCollapsed = collapsedDates[dateKey];
                return (
                  <div
                    key={dateKey}
                    className="overflow-hidden rounded-xl border border-gray-100 shadow-sm"
                  >
                    {/* Header tanggal — clickable untuk collapse */}
                    <button
                      onClick={() => toggleDate(dateKey)}
                      className="flex w-full items-center justify-between gap-2 bg-blue-50/60 px-4 py-2.5 text-left transition-colors hover:bg-blue-50"
                    >
                      <span className="text-xs font-bold uppercase tracking-wide text-blue-900 sm:text-sm">
                        {formatDateShort(dateKey)}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          {trips.length} trip
                        </span>
                        {isCollapsed ? (
                          <FiChevronDown className="h-4 w-4 text-blue-700" />
                        ) : (
                          <FiChevronUp className="h-4 w-4 text-blue-700" />
                        )}
                      </span>
                    </button>

                    {!isCollapsed && (
                      <>
                        {/* MOBILE: card list (md ke bawah) */}
                        <div className="divide-y divide-gray-100 md:hidden">
                          {trips.map((trip) => {
                            const vehicleTypeConfig =
                              VEHICLE_TYPE_CONFIG[trip.vehicle?.type as string];
                            return (
                              <div
                                key={trip.assignmentId}
                                className="space-y-3 bg-white p-4"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate font-bold text-slate-900">
                                      {trip.routeName || "-"}
                                    </p>
                                    <p className="text-xs font-semibold text-blue-600">
                                      {trip.routeCode || "-"}
                                    </p>
                                  </div>
                                  <StatusBadge status={trip.status} />
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                  <DirectionBadge direction={trip.direction} />
                                  {vehicleTypeConfig && (
                                    <span
                                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${vehicleTypeConfig.className}`}
                                    >
                                      {vehicleTypeConfig.label}
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-2.5 text-xs">
                                  <div>
                                    <p className="text-gray-400">Waktu</p>
                                    <p className="font-semibold text-slate-700">
                                      {trip.startTime || "-"} -{" "}
                                      {trip.endTime || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Armada</p>
                                    <p className="font-semibold text-slate-700">
                                      {trip.vehicle?.plateNumber || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Kondektur</p>
                                    <p className="flex items-center gap-1 font-semibold text-slate-700">
                                      <FiUser className="h-3 w-3 text-gray-400" />
                                      {trip.conductor?.name || "Tidak ada"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Total</p>
                                    <p className="font-bold text-slate-900">
                                      Rp{" "}
                                      {Number(
                                        trip.totalAmount ?? 0,
                                      ).toLocaleString("id-ID")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* DESKTOP: table (md ke atas) */}
                        <div className="hidden overflow-x-auto md:block">
                          <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-gray-50 text-xs uppercase text-slate-500">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-4 py-2.5 font-semibold"
                                >
                                  Rute
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-2.5 font-semibold"
                                >
                                  Waktu / Armada
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-2.5 font-semibold"
                                >
                                  Total
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-2.5 font-semibold"
                                >
                                  Kondektur
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-2.5 font-semibold"
                                >
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {trips.map((trip) => (
                                <tr
                                  key={trip.assignmentId}
                                  className="transition duration-150 hover:bg-slate-50/50"
                                >
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
                                    <p className="mt-1 text-xs text-gray-500">
                                      {trip.vehicle?.plateNumber || "-"} (
                                      {trip.vehicle?.vehicleCode || "-"})
                                    </p>
                                  </td>
                                  <td className="px-4 py-4 align-top">
                                    <p className="font-semibold text-slate-800">
                                      Rp{" "}
                                      {Number(
                                        trip.totalAmount ?? 0,
                                      ).toLocaleString("id-ID")}
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
                                      <DirectionBadge
                                        direction={trip.direction}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
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
