"use client";

import {
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiUser,
  FiUsers,
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
  if (minutes < 60) return `${minutes} mnt`;
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
  const driverLabel =
    vehicle.driverName || vehicle.driver?.name || `Driver #${vehicle.driverId}`;
  const vehicleLabel =
    vehicle.vehicleCode ||
    vehicle.vehicle?.vehicleCode ||
    `AG-${String(vehicle.vehicleId).padStart(3, "0")}`;

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
                {vehicleLabel}
              </h3>

              <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold text-slate-500 sm:text-[9px]">
                ID {vehicle.assignmentId}
              </span>
            </div>

            <p className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-500 sm:text-[10px]">
              <FiUser className="shrink-0 text-[9px]" />

              <span className="truncate">{driverLabel}</span>
            </p>
          </div>
        </div>
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

        {/* SEATS */}
        <div className="min-w-0">
          <p className="mb-1 text-[8px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[9px]">
            Kursi
          </p>
          <p className={`flex items-center gap-1 text-[10px] font-bold sm:text-xs ${!hasPassengerData ? "text-slate-500" : isFull ? "text-red-600" : "text-emerald-600"}`}>
            <FiUsers className="shrink-0 text-[10px] sm:text-xs" />
            {hasPassengerData
              ? `${passengers}/${capacity} ${isFull ? "Penuh" : "Tersedia"}`
              : `-/${capacity}`}
          </p>
        </div>

        {/* ARRIVAL */}
        <div className="min-w-0">
          <p className="mb-1 text-[8px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[9px]">
            Tiba
          </p>

          <p className="flex items-center gap-1 text-[10px] font-bold text-slate-700 sm:text-xs">
            <FiClock className="shrink-0 text-[10px] text-blue-500 sm:text-xs" />
            {hasLocation
              ? formatEstimateRange(
                  vehicle.osrmEstimate?.vehicleToUser?.durationMinSeconds,
                  vehicle.osrmEstimate?.vehicleToUser?.durationMaxSeconds,
                )
              : "-"}
          </p>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-xl border border-blue-100 bg-blue-50/60 p-2 sm:gap-2 sm:p-2.5">
        <EstimateItem
          label="Total"
          value={formatEstimateRange(
            vehicle.osrmEstimate?.total?.durationMinSeconds,
            vehicle.osrmEstimate?.total?.durationMaxSeconds,
          )}
        />
        <EstimateItem
          label="Angkot → kamu"
          value={formatEstimateRange(
            vehicle.osrmEstimate?.vehicleToUser?.durationMinSeconds,
            vehicle.osrmEstimate?.vehicleToUser?.durationMaxSeconds,
          )}
        />
        <EstimateItem
          label="Kamu → tujuan"
          value={formatEstimateRange(
            vehicle.osrmEstimate?.userToDestination?.durationMinSeconds,
            vehicle.osrmEstimate?.userToDestination?.durationMaxSeconds,
          )}
        />
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

        <span className="text-[8px] font-semibold text-slate-500 sm:text-[9px]">
          {!hasPassengerData
            ? "Menunggu data realtime"
            : isFull
              ? "Kapasitas penuh"
              : `${capacity - passengers} kursi tersisa`}
        </span>
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

function EstimateItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-blue-100 bg-white px-2 py-2">
      <p className="mb-1 wrap-break-word text-[8px] font-semibold uppercase tracking-wider text-blue-500">
        {label}
      </p>
      <p className="wrap-break-word text-[10px] font-bold text-slate-700 sm:text-xs">
        {value}
      </p>
    </div>
  );
}
