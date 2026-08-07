"use client";

import { useAuth } from "@/context/AuthContext";
import { useVehicleAssignments } from "@/hooks/vehicles/useVehicleAssignments";
import React, { useEffect } from "react";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlineTicket,
  HiOutlineIdentification,
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
} from "react-icons/fi";
import { AssignmentStatus, DirectionType, VehicleType } from "@/types/vehicles/vehicle.type";
import { Type } from "lucide-react";


const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; className: string; dot: string }
> = {
  [AssignmentStatus.SCHEDULED]: {
    label: "Terjadwal",
    icon: HiOutlineCalendar,
    className: "bg-sky-50 text-sky-700 border-sky-200/60",
    dot: "bg-sky-500",
  },
  [AssignmentStatus.ONGOING]: {
    label: "Berlangsung",
    icon: FiLoader,
    className: "bg-amber-50 text-amber-700 border-amber-200/60",
    dot: "bg-amber-500",
  },
  [AssignmentStatus.COMPLETED]: {
    label: "Selesai",
    icon: FiCheckCircle,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    dot: "bg-emerald-500",
  },
  [AssignmentStatus.CANCELLED]: {
    label: "Dibatalkan",
    icon: FiXCircle,
    className: "bg-rose-50 text-rose-700 border-rose-200/60",
    dot: "bg-rose-500",
  },
};

const DIRECTION_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  [DirectionType.FORWARD]: {
    label: "Berangkat",
    icon: FiArrowRight,
    className: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  },
  [DirectionType.RETURN]: {
    label: "Pulang",
    icon: FiArrowLeft,
    className: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/60",
  },
};

const VEHICLE_TYPE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  [VehicleType.PREMIUM]: {
    label: "Premium",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200/60",
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
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
      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${config.className}`}
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
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className={truncate ? "min-w-0 truncate" : ""}>
        <strong className="font-semibold text-gray-700">{label}:</strong>{" "}
        <span className="text-gray-600">{value}</span>
      </span>
    </div>
  );
}

export default function ConductorHistoryPage() {
  const { user, isLoading: authLoading } = useAuth();

  const {
    conductorHistory,
    conductorHistoryLoading,
    conductorHistoryError,
    fetchConductorTripHistory,
  } = useVehicleAssignments();

  useEffect(() => {
    if (user?.id) {
      fetchConductorTripHistory(user.id);
    }
  }, [user, fetchConductorTripHistory]);

  // Tampilkan loading saat session auth sedang dicek
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <FiRefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-gray-500">
            Memuat sesi pengguna...
          </p>
        </div>
      </div>
    );
  }

  // Jika user belum login atau tidak ditemukan
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="flex w-full max-w-md items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 text-center text-sm text-amber-800 shadow-sm">
          <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>
            Silakan masuk terlebih dahulu untuk melihat riwayat trip Anda.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6">
        {/* Header Section */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Riwayat Trip Kondektur
          </h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Menampilkan daftar riwayat penugasan perjalanan untuk akun:{" "}
            <span className="font-semibold text-gray-800">{user.name}</span>
          </p>
        </div>

        {/* Kondisi Loading Fetch Data */}
        {conductorHistoryLoading && (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <FiRefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-gray-500">
              Memuat riwayat trip...
            </p>
          </div>
        )}

        {/* Kondisi Error */}
        {conductorHistoryError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
            <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{conductorHistoryError}</span>
          </div>
        )}

        {/* Kondisi Data Kosong */}
        {!conductorHistoryLoading &&
          !conductorHistoryError &&
          conductorHistory.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Tidak ada riwayat trip ditemukan untuk akun ini.
              </p>
            </div>
          )}

        {/* Daftar Riwayat Trip */}
        {!conductorHistoryLoading && conductorHistory.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {conductorHistory.map((trip) => {
              const statusConfig =
                STATUS_CONFIG[trip.status] ??
                STATUS_CONFIG[AssignmentStatus.SCHEDULED];

              return (
                <div
                  key={trip.assignmentId}
                  className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6"
                >
                  {/* Left accent bar mengikuti warna status */}
                  <span
                    className={`absolute left-0 top-0 h-full w-1 ${statusConfig.dot}`}
                  />

                  <div className="flex flex-col gap-4 pl-2 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1 space-y-2.5">
                      {/* Judul + badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-gray-900">
                          {trip.routeCode} — {trip.routeName}
                        </span>
                        <StatusBadge status={trip.status} />
                        <DirectionBadge direction={trip.direction} />
                        {trip.vehicle?.type && (
                          <VehicleTypeBadge type={trip.vehicle.type} />
                        )}
                      </div>

                      {/* Detail info */}
                      <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-xs sm:grid-cols-2 sm:text-sm">
                        <DetailRow
                          icon={HiOutlineCalendar}
                          iconClassName="bg-blue-50 text-blue-500"
                          label="Tanggal"
                          value={String(trip.date)}
                        />
                        <DetailRow
                          icon={HiOutlineClock}
                          iconClassName="bg-purple-50 text-purple-500"
                          label="Jam"
                          value={`${trip.startTime} - ${trip.endTime}`}
                        />
                        <DetailRow
                          icon={HiOutlineTruck}
                          iconClassName="bg-orange-50 text-orange-500"
                          label="Kendaraan"
                          value={`${trip.vehicle?.vehicleCode} (${trip.vehicle?.plateNumber})`}
                          truncate
                        />
                        <DetailRow
                          icon={HiOutlineUser}
                          iconClassName="bg-teal-50 text-teal-500"
                          label="Driver"
                          value={trip.driver?.name || "-"}
                          truncate
                        />
                        <DetailRow
                          icon={HiOutlineTicket}
                          iconClassName="bg-pink-50 text-pink-500"
                          label="Kondektur"
                          value={trip.conductor?.name || "-"}
                          className="sm:col-span-2"
                        />
                      </div>
                    </div>

                    {/* ID assignment */}
                    <div className="flex items-center justify-between border-t border-gray-50 pt-3 md:flex-col md:items-end md:justify-start md:border-t-0 md:pt-0">
                      <div className="flex items-center gap-1 text-xs font-medium text-gray-400">
                        <HiOutlineIdentification className="h-3.5 w-3.5" />
                        <span>#{trip.assignmentId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
