"use client";

import {
  FiCheckCircle,
  FiMapPin,
  FiNavigation,
  FiUser,
  FiUsers,
  FiFlag,
} from "react-icons/fi";

import { UpcomingVehicle } from "@/types/route-search.type";

interface UpcomingVehicleCardProps {
  vehicle: UpcomingVehicle;
  onBook?: (vehicle: UpcomingVehicle) => void;
  isSelected?: boolean;
  isBookingEnabled?: boolean;
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

const formatDuration = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined) return "-";
  const minutes = Math.max(0, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes}`;
  return `${Math.floor(minutes / 60)}j ${minutes % 60}m`;
};

const formatEstimateRange = (
  minSeconds: number | undefined,
  maxSeconds: number | undefined,
) => {
  if (minSeconds === undefined || maxSeconds === undefined) return "-";
  return `${formatDuration(minSeconds)} - ${formatDuration(maxSeconds)}`;
};

export default function UpcomingVehicleCard({
  vehicle,
  onBook,
  isSelected = false,
  isBookingEnabled = false,
}: UpcomingVehicleCardProps) {
  const hasLocation =
    vehicle.hasLocationData &&
    vehicle.vehicleLat !== null &&
    vehicle.vehicleLng !== null;

  const canBook = vehicle.status === "ONGOING" && isBookingEnabled;
  const capacity = vehicle.vehicleCapacity ?? vehicle.vehicle?.capacity ?? 8;
  const passengers = vehicle.currentPassengers;
  const hasPassengerData = passengers !== null && passengers !== undefined;
  const isFull = hasPassengerData && passengers >= capacity;
  const remainingSeats = hasPassengerData ? Math.max(0, capacity - passengers) : null;
  const isOngoing = vehicle.status === "ONGOING";

  const driverLabel =
    vehicle.driverName || vehicle.driver?.name || `Driver #${vehicle.driverId}`;
  const vehicleLabel =
    vehicle.vehicleCode ||
    vehicle.vehicle?.vehicleCode ||
    `AG-${String(vehicle.vehicleId).padStart(3, "0")}`;

  // Same underlying values/conditions as before — only where & how they're displayed has changed.
  const vehicleToUserEstimate = hasLocation
    ? formatEstimateRange(
        vehicle.osrmEstimate?.vehicleToUser?.durationMinSeconds,
        vehicle.osrmEstimate?.vehicleToUser?.durationMaxSeconds,
      )
    : "-";

  const userToDestinationEstimate = formatEstimateRange(
    vehicle.osrmEstimate?.userToDestination?.durationMinSeconds,
    vehicle.osrmEstimate?.userToDestination?.durationMaxSeconds,
  );

  const totalEstimate = formatEstimateRange(
    vehicle.osrmEstimate?.total?.durationMinSeconds,
    vehicle.osrmEstimate?.total?.durationMaxSeconds,
  );

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl bg-white p-2.5 transition-all duration-200 xs:rounded-2xl sm:p-4
        ${
          isSelected
            ? "border-2 border-blue-600 shadow-[0_8px_25px_rgba(37,99,235,0.18)]"
            : "border border-slate-200/90 shadow-sm hover:border-blue-300 hover:shadow-md"
        }
      `}
    >
      {/* TOP HEADER: Vehicle Code, Driver, Fare */}
      <div className="flex items-start justify-between gap-1.5 sm:gap-2">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {/* Angkot Icon / Pill */}
          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold transition sm:h-8 sm:w-8 sm:rounded-xl ${
              isSelected
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            <FiNavigation className="text-[10px] rotate-45 sm:text-sm" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                {vehicleLabel}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500 sm:text-[11px]">
              <FiUser className="shrink-0 text-[9px] text-slate-400 sm:text-[10px]" />
              <span className="truncate">{driverLabel}</span>
            </p>
          </div>
        </div>

        {/* Fare Pill */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="whitespace-nowrap rounded-lg bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-[#003d9b] sm:px-2 sm:text-xs">
            Rp 5.000<span className="text-[9px] font-normal text-blue-600 sm:text-[10px]">/org</span>
          </span>
        </div>
      </div>

      {/* JARAK & PENUMPANG */}
      <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-2">
        <div className="flex min-w-0 flex-col rounded-lg border border-slate-100 bg-slate-50/80 px-2 py-1.5 sm:rounded-xl sm:px-2.5 sm:py-2">
          <span className="truncate text-[8px] font-medium text-slate-400 sm:text-[9px]">
            Jarak angkot
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-slate-800 sm:text-xs">
            <FiMapPin className="shrink-0 text-[10px] text-blue-600 sm:text-[11px]" />
            <span className="truncate">{formatDistance(vehicle.distanceToUserMeters)}</span>
          </span>
        </div>

        <div className="flex min-w-0 flex-col rounded-lg border border-slate-100 bg-slate-50/80 px-2 py-1.5 sm:rounded-xl sm:px-2.5 sm:py-2">
          <span className="truncate text-[8px] font-medium text-slate-400 sm:text-[9px]">
            Penumpang
          </span>
          <span
            className={`mt-0.5 flex items-center gap-1 text-[11px] font-bold sm:text-xs ${
              isFull ? "text-rose-600" : "text-slate-800"
            }`}
          >
            <FiUsers className="shrink-0 text-[10px] text-slate-500 sm:text-[11px]" />
            <span className="truncate">
              {hasPassengerData ? `${passengers}/${capacity}` : `-/${capacity}`}
            </span>
          </span>
        </div>
      </div>

      {/* PERJALANAN: hierarki jelas — angkot ke kamu (utama), kamu ke tujuan, lalu total */}
      <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5 sm:mt-2.5 sm:rounded-xl sm:p-3">
        {/* Primary: vehicle -> user */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 sm:h-6 sm:w-6">
              <FiNavigation className="rotate-45 text-[9px] text-white sm:text-[10px]" />
            </span>
            <span className="truncate text-[11px] font-semibold text-slate-800 sm:text-xs">
              Angkot ke kamu
            </span>
          </div>
          <span className="shrink-0 whitespace-nowrap text-sm font-bold text-blue-700 sm:text-base">
            {vehicleToUserEstimate} <span className="text-[10px] font-medium sm:text-[11px]">mnt</span>
          </span>
        </div>

        {/* connector */}
        <div className="ml-[9px] h-3 w-px bg-slate-300 sm:ml-[11px] sm:h-3.5" />

        {/* Secondary: user -> destination */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-300 sm:h-6 sm:w-6">
              <FiFlag className="text-[9px] text-slate-600 sm:text-[10px]" />
            </span>
            <span className="truncate text-[11px] font-medium text-slate-600 sm:text-xs">
              Kamu ke tujuan
            </span>
          </div>
          <span className="shrink-0 whitespace-nowrap text-[11px] font-semibold text-slate-600 sm:text-xs">
            {userToDestinationEstimate} <span className="text-[9px] font-normal sm:text-[10px]">mnt</span>
          </span>
        </div>

        {/* Total */}
        <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
          <span className="text-[10px] font-medium text-slate-500 sm:text-[11px]">
            Total estimasi perjalanan
          </span>
          <span className="whitespace-nowrap text-[11px] font-bold text-slate-900 sm:text-xs">
            {totalEstimate} <span className="text-[9px] font-normal text-slate-500 sm:text-[10px]">mnt</span>
          </span>
        </div>
      </div>

      {/* ACTION CTA: BLUE GRADIENT BUTTON */}
      <button
        type="button"
        disabled={!canBook}
        onClick={() => onBook?.(vehicle)}
        className={`
          mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold transition-all duration-150 sm:mt-3 sm:gap-2 sm:rounded-xl sm:py-2.5 sm:text-xs
          ${
            !canBook
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : isSelected
              ? "bg-[#003d9b] text-white shadow-md shadow-blue-800/20"
              : "bg-gradient-to-r from-[#003d9b] via-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/25 hover:from-blue-700 hover:to-blue-600 hover:shadow-lg active:scale-[0.98]"
          }
        `}
      >
        {isSelected ? (
          <>
            <FiCheckCircle className="shrink-0 text-xs text-white sm:text-sm" />
            <span>Angkot Terpilih</span>
          </>
        ) : (
          <>
            <span>Book Now</span>
          </>
        )}
      </button>
    </div>
  );
}