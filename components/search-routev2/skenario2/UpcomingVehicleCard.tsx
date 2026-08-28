"use client";

import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiUser,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

import { UpcomingVehicle } from "@/types/route-search.type";

interface UpcomingVehicleCardProps {
  vehicle: UpcomingVehicle;
  onBook?: (vehicle: UpcomingVehicle) => void;
  isSelected?: boolean;
}

const formatDistance = (meters: number | null | undefined) => {
  if (meters === null || meters === undefined) {
    return "-";
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
};

const formatLastLocation = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined) {
    return "-";
  }

  if (seconds < 60) {
    return `${Math.round(seconds)} detik`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} mnt`;
  }

  const hours = Math.floor(minutes / 60);

  return `${hours} jam`;
};

const getStatus = (status: UpcomingVehicle["status"]) => {
  switch (status) {
    case "ONGOING":
      return {
        label: "Aktif",
        className: "bg-emerald-50 text-emerald-600",
        icon: FiCheckCircle,
      };

    case "COMPLETED":
      return {
        label: "Selesai",
        className: "bg-blue-50 text-blue-600",
        icon: FiCheckCircle,
      };

    case "CANCELLED":
      return {
        label: "Dibatalkan",
        className: "bg-red-50 text-red-600",
        icon: FiXCircle,
      };

    default:
      return {
        label: "-",
        className: "bg-slate-100 text-slate-500",
        icon: FiAlertCircle,
      };
  }
};

export default function UpcomingVehicleCard({
  vehicle,
  onBook,
  isSelected = false,
}: UpcomingVehicleCardProps) {
  const status = getStatus(vehicle.status);
  const StatusIcon = status.icon;

  const hasLocation =
    vehicle.hasLocationData &&
    vehicle.vehicleLat !== null &&
    vehicle.vehicleLng !== null;

  const isLive =
    vehicle.hasLocationData &&
    vehicle.lastLocationAgeSeconds !== null &&
    vehicle.lastLocationAgeSeconds < 120;

  const canBook = vehicle.status === "ONGOING";

  return (
    <div
      className={`
        overflow-hidden rounded-2xl bg-white
        p-3
        transition-all duration-200
        sm:p-4
        ${
          isSelected
            ? "border-2 border-blue-600 shadow-[0_8px_30px_rgb(37,99,235,0.12)]"
            : "border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
        }
      `}
    >
      {/* HEADER */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Vehicle Icon */}
          <div
            className={`
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-full
              sm:h-10 sm:w-10
              ${
                isSelected
                  ? "bg-blue-100 text-blue-600"
                  : "bg-blue-50 text-blue-600"
              }
            `}
          >
            <FiNavigation className="text-sm sm:text-base" />
          </div>

          {/* Vehicle Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                AG-{String(vehicle.vehicleId).padStart(3, "0")}
              </h3>

              <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold text-slate-500 sm:text-[9px]">
                ID {vehicle.vehicleId}
              </span>
            </div>

            <p className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-500 sm:text-[10px]">
              <FiUser className="shrink-0 text-[9px]" />

              <span className="truncate">Driver #{vehicle.driverId}</span>
            </p>
          </div>
        </div>

        {/* STATUS */}
        <span
          className={`
            flex shrink-0 items-center gap-1
            rounded-full px-2 py-1
            text-[8px] font-bold
            sm:px-2.5 sm:text-[9px]
            ${status.className}
          `}
        >
          <StatusIcon className="text-[9px]" />

          {status.label}
        </span>
      </div>

      {/* INFORMATION */}
      <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-2 sm:gap-2 sm:p-2.5">
        {/* DISTANCE */}
        <div className="min-w-0">
          <p className="mb-1 text-[8px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[9px]">
            Jarak
          </p>

          <p className="flex items-center gap-1 text-[10px] font-bold text-blue-600 sm:text-xs">
            <FiMapPin className="shrink-0 text-[10px] sm:text-xs" />

            <span className="truncate">
              {formatDistance(vehicle.distanceToUserMeters)}
            </span>
          </p>
        </div>

        {/* LOCATION */}
        <div className="min-w-0">
          <p className="mb-1 text-[8px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[9px]">
            Lokasi
          </p>

          <p
            className={`
              flex items-center gap-1
              text-[10px] font-bold
              sm:text-xs
              ${isLive ? "text-emerald-600" : "text-slate-600"}
            `}
          >
            <span
              className={`
                h-1.5 w-1.5 shrink-0 rounded-full
                ${isLive ? "animate-pulse bg-emerald-500" : "bg-slate-300"}
              `}
            />

            <span className="truncate">
              {hasLocation
                ? formatLastLocation(vehicle.lastLocationAgeSeconds)
                : "-"}
            </span>
          </p>
        </div>

        {/* ARRIVAL */}
        <div className="min-w-0">
          <p className="mb-1 text-[8px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[9px]">
            Tiba
          </p>

          <p className="flex items-center gap-1 text-[10px] font-bold text-slate-700 sm:text-xs">
            <FiClock className="shrink-0 text-[10px] text-blue-500 sm:text-xs" />
            -
          </p>
        </div>
      </div>

      {/* TRACKING INFO */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        <div className="min-w-0">
          <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[9px]">
            Perjalanan
          </p>

          <p className="mt-0.5 truncate text-[9px] font-medium text-slate-600 sm:text-[10px]">
            {vehicle.hasPassedUser
              ? "Sudah melewati lokasi kamu"
              : "Menuju lokasi kamu"}
          </p>
        </div>

        {vehicle.hasLocationData && (
          <div
            className={`
              flex shrink-0 items-center gap-1
              text-[8px] font-semibold
              sm:text-[9px]
              ${isLive ? "text-emerald-600" : "text-slate-400"}
            `}
          >
            <span
              className={`
                h-1.5 w-1.5 rounded-full
                ${isLive ? "animate-pulse bg-emerald-500" : "bg-slate-300"}
              `}
            />

            {isLive ? "Live" : "Offline"}
          </div>
        )}
      </div>

      {/* BOOK BUTTON */}
      <button
        type="button"
        disabled={!canBook}
        onClick={() => onBook?.(vehicle)}
        className={`
          mt-3 flex w-full items-center justify-center gap-1.5
          rounded-xl py-2
          text-[10px] font-bold
          transition-all
          active:scale-[0.98]
          sm:py-2.5 sm:text-xs
          ${
            !canBook
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : isSelected
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          }
        `}
      >
        {isSelected && <FiCheckCircle className="text-xs" />}

        {isSelected ? "Angkot Terpilih" : "Book Now"}
      </button>
    </div>
  );
}
