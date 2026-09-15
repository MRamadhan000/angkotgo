"use client";

import { useAuth } from "@/context/AuthContext";
import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments";
import { useReviewsByVehicleAssignmentId } from "@/hooks/useReview";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineCalendar,
  HiOutlineTruck,
  HiOutlineBell,
  HiOutlineCash,
} from "react-icons/hi";
import {
  FiAlertCircle,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiArrowLeft,
  FiStar,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiClock,
  FiX,
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
  {
    label: string;
    icon: React.ElementType;
    className: string;
    dot: string;
    pill: string;
  }
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

function formatDate(value: string | Date): string {
  const dateKey =
    typeof value === "string"
      ? value.slice(0, 10)
      : new Date(value).toISOString().slice(0, 10);
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

function ReviewModal({
  assignmentId,
  onClose,
}: {
  assignmentId: number;
  onClose: () => void;
}) {
  const { data, isLoading, isError } =
    useReviewsByVehicleAssignmentId(assignmentId);
  const reviews = data?.data ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Feedback perjalanan
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-900">
              Komentar penumpang
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Penugasan #{assignmentId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup komentar"
          >
            <FiX />
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <FiRefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            Memuat komentar...
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 py-10 text-sm text-rose-600">
            <FiAlertCircle className="h-5 w-5 shrink-0" />
            Gagal memuat komentar perjalanan.
          </div>
        )}

        {!isLoading && !isError && reviews.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">
            Belum ada komentar untuk perjalanan ini.
          </div>
        )}

        {!isLoading && !isError && reviews.length > 0 && (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <article key={review.id} className="py-4 first:pt-5 last:pb-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {review.user?.name || "Penumpang"}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-0.5 text-amber-400"
                    aria-label={`${review.rating} dari 5 bintang`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`h-3.5 w-3.5 ${star <= review.rating ? "fill-current" : "text-slate-200"}`}
                      />
                    ))}
                  </div>
                </div>
                {review.description && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {review.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConductorHistoryPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const {
    fetchConductorTripHistory,
    conductorHistory,
    conductorHistoryLoading,
    conductorHistoryError,
  } = useVehicleAssignments();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (user?.id) {
      fetchConductorTripHistory(user.id);
    }
  }, [user, fetchConductorTripHistory]);

  const filteredAndSortedHistory = useMemo(() => {
    const today = getTodayDateKey();

    let result = conductorHistory.filter((trip) => {
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
  }, [conductorHistory, statusFilter, sortOrder]);

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

    return {
      total: filteredAndSortedHistory.length,
      completed,
      cancelled,
      totalIncome: filteredAndSortedHistory.reduce(
        (sum, trip) => sum + Number(trip.totalAmount ?? 0),
        0,
      ),
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
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden flex flex-col justify-between">
      <div className="mx-auto w-full max-w-[1240px] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-blue-600 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md hover:ring-2 hover:ring-blue-50 cursor-pointer"
          >
            ← Kembali
          </button>
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-xs transition-all duration-300 hover:border-blue-200 hover:shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            SISTEM KRU LAPANGAN
          </div>
          <div className="text-xs font-medium text-gray-500 border border-gray-200 bg-white px-4 py-1.5 rounded-full shadow-xs transition-all duration-300 hover:border-blue-200 hover:shadow-sm">
            Portal Resmi Tugas Armada
          </div>
        </div>

        {/* Main Grid Layout (Sidebar Profil + Content Riwayat Kondektur) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Profile Card Sidebar (Konsisten dengan Dashboard Kondektur) */}
          <div className="group/sidebar lg:col-span-4 rounded-3xl border border-blue-900/50 bg-linear-to-b from-[#102a5c] to-[#0d234d] p-6 text-white shadow-xl flex flex-col justify-between space-y-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-black text-white shadow-inner transition-transform duration-300 group-hover/sidebar:scale-105">
                  {user?.name ? user.name.charAt(0) : "C"}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                  <FiCheckCircle className="text-[10px] text-emerald-300" />{" "}
                  Siap Operasional
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Profil Kondektur
                </p>
                <h1 className="text-2xl font-black mt-1 tracking-tight">
                  {user.name}
                </h1>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 group-hover/sidebar:bg-white/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                    Total Pendapatan Bersih
                  </p>
                  <p className="mt-1 text-lg font-black text-white">
                    Rp {summary.totalIncome.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                  <HiOutlineCash className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
                <div>
                  <p className="text-[9px] font-semibold text-blue-200">
                    Total
                  </p>
                  <p className="text-xs font-bold text-white">
                    {summary.total}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-emerald-300">
                    Selesai
                  </p>
                  <p className="text-xs font-bold text-emerald-300">
                    {summary.completed}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-rose-300">
                    Batal
                  </p>
                  <p className="text-xs font-bold text-rose-300">
                    {summary.cancelled}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: History List & Controls */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header / Filter Section dengan efek hover interaktif */}
            <div className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:ring-4 hover:ring-blue-50 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                    <HiOutlineCalendar className="text-base" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                      Riwayat Trip Kondektur
                    </h2>
                    <p className="text-xs text-gray-400">
                      Arsip perjalanan dan tugas operasional masa lalu
                    </p>
                  </div>
                </div>
              </div>

              {/* Filter & Sort Bar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <FiFilter className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  {STATUS_FILTERS.map((filter) => {
                    const isActive = statusFilter === filter.key;
                    const isCancelled =
                      filter.key === AssignmentStatus.CANCELLED;
                    return (
                      <button
                        key={filter.key}
                        onClick={() => setStatusFilter(filter.key)}
                        className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 cursor-pointer ${
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
                  className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer"
                >
                  <HiOutlineCalendar className="h-3.5 w-3.5 text-gray-400" />
                  <span>{sortOrder === "desc" ? "Terbaru" : "Terlama"}</span>
                  <FiChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {conductorHistoryLoading && (
              <div className="space-y-3 p-4 bg-white rounded-3xl border border-gray-100">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-2xl bg-gray-100"
                  />
                ))}
              </div>
            )}

            {/* Error State */}
            {conductorHistoryError && (
              <div className="flex items-center gap-2 rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{conductorHistoryError}</span>
              </div>
            )}

            {/* Empty State */}
            {!conductorHistoryLoading &&
              !conductorHistoryError &&
              filteredAndSortedHistory.length === 0 && (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
                  <HiOutlineTruck className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">
                    Tidak ada riwayat trip ditemukan.
                  </p>
                </div>
              )}

            {/* Daftar Riwayat Grouped per Tanggal */}
            {!conductorHistoryLoading && groupedHistory.length > 0 && (
              <div className="space-y-4">
                {groupedHistory.map(({ dateKey, trips }) => {
                  const isCollapsed = collapsedDates[dateKey];
                  return (
                    <div
                      key={dateKey}
                      className="group/date overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xs transition-all duration-300 hover:border-blue-300 hover:shadow-md"
                    >
                      <button
                        onClick={() => toggleDate(dateKey)}
                        className="flex w-full items-center justify-between gap-2 bg-gray-50/70 px-6 py-3.5 text-left transition-colors hover:bg-blue-50/50 cursor-pointer"
                      >
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-700 sm:text-sm">
                          {formatDate(dateKey)}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
                            {trips.length} trip
                          </span>
                          {isCollapsed ? (
                            <FiChevronDown className="h-4 w-4 text-slate-500" />
                          ) : (
                            <FiChevronUp className="h-4 w-4 text-slate-500" />
                          )}
                        </span>
                      </button>

                      {!isCollapsed && (
                        <div className="divide-y divide-gray-100">
                          {trips.map((trip) => {
                            const vehicleTypeConfig =
                              VEHICLE_TYPE_CONFIG[trip.vehicle?.type as string];
                            return (
                              <div
                                key={trip.assignmentId}
                                className="group/item space-y-3 p-5 transition-colors hover:bg-blue-50/30"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 text-sm sm:text-base group-hover/item:text-blue-600 transition-colors">
                                      {trip.routeName || "-"}
                                    </p>
                                    <p className="text-xs font-semibold text-blue-600 mt-0.5">
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

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-gray-50/80 border border-gray-100 p-3 text-xs">
                                  <div>
                                    <p className="text-gray-400 text-[10px] uppercase font-semibold">
                                      Waktu Operasional
                                    </p>
                                    <p className="font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
                                      <FiClock className="text-gray-400 h-3 w-3" />
                                      {trip.startTime || "-"} -{" "}
                                      {trip.endTime || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400 text-[10px] uppercase font-semibold">
                                      Armada Kendaraan
                                    </p>
                                    <p className="font-semibold text-slate-700 mt-0.5">
                                      {trip.vehicle?.plateNumber || "-"} (
                                      {trip.vehicle?.vehicleCode || "-"})
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400 text-[10px] uppercase font-semibold">
                                      Driver Bertugas
                                    </p>
                                    <p className="flex items-center gap-1 font-semibold text-slate-700 mt-0.5">
                                      <FiUser className="h-3 w-3 text-gray-400" />
                                      {trip.driver?.name || "Tidak ada"}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedAssignmentId(trip.assignmentId)
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                                >
                                  <FiStar className="h-3.5 w-3.5" />
                                  Lihat komentar
                                </button>
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

      {selectedAssignmentId !== null && (
        <ReviewModal
          assignmentId={selectedAssignmentId}
          onClose={() => setSelectedAssignmentId(null)}
        />
      )}

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
