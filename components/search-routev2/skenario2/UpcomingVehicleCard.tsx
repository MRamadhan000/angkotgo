"use client";

import {
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiUser,
  FiUsers,
  FiArrowRight,
  FiCheck,
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
  const remainingSeats = hasPassengerData ? Math.max(0, capacity - passengers) : null;
  const isOngoing = vehicle.status === "ONGOING";

  const driverLabel =
    vehicle.driverName || vehicle.driver?.name || `Driver #${vehicle.driverId}`;
  const vehicleLabel =
    vehicle.vehicleCode ||
    vehicle.vehicle?.vehicleCode ||
    `AG-${String(vehicle.vehicleId).padStart(3, "0")}`;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl bg-white p-3.5 transition-all duration-200 sm:p-4
        ${
          isSelected
            ? "border-2 border-emerald-500 shadow-[0_8px_25px_rgba(16,185,129,0.18)]"
            : "border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md"
        }
      `}
    >
      {/* TOP HEADER: Vehicle Code, Status, Seat Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Angkot Icon / Pill */}
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold transition ${
              isSelected
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <FiNavigation className="text-sm rotate-45" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {vehicleLabel}
              </span>
              
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
              <FiUser className="text-[10px] text-slate-400" />
              <span className="truncate">{driverLabel}</span>
            </p>
          </div>
        </div>

        {/* Fare & Seats Pill */}
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
            Rp 5.000<span className="text-[10px] font-normal text-emerald-600">/org</span>
          </span>
      
        </div>
      </div>

      {/* METRICS ROW (Distance, Arrival Time, Passengers) */}
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
        {/* DISTANCE */}
        <div className="flex flex-col">
          <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
            Jarak
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-xs font-bold text-slate-800">
            <FiMapPin className="text-[11px] text-emerald-600" />
            {formatDistance(vehicle.distanceToUserMeters)}
          </span>
        </div>

        {/* TIME TO ARRIVAL */}
        <div className="flex flex-col">
          <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
            Estimasi Tiba
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-xs font-bold text-slate-800">
            <FiClock className="text-[11px] text-emerald-600" />
            {hasLocation
              ? formatEstimateRange(
                  vehicle.osrmEstimate?.vehicleToUser?.durationMinSeconds,
                  vehicle.osrmEstimate?.vehicleToUser?.durationMaxSeconds,
                )
              : "-"}
          </span>
        </div>

        {/* PASSENGERS */}
        <div className="flex flex-col">
          <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
            Penumpang
          </span>
          <span
            className={`mt-0.5 flex items-center gap-1 text-xs font-bold ${
              isFull ? "text-rose-600" : "text-slate-800"
            }`}
          >
            <FiUsers className="text-[11px] text-slate-500" />
            {hasPassengerData ? `${passengers}/${capacity}` : `-/${capacity}`}
          </span>
        </div>
      </div>

      {/* ESTIMATE DETAIL CHIPS */}
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <EstimateItem
          label="Total Rute"
          value={formatEstimateRange(
            vehicle.osrmEstimate?.total?.durationMinSeconds,
            vehicle.osrmEstimate?.total?.durationMaxSeconds,
          )}
        />
        <EstimateItem
          label="Ke Lokasimu"
          value={formatEstimateRange(
            vehicle.osrmEstimate?.vehicleToUser?.durationMinSeconds,
            vehicle.osrmEstimate?.vehicleToUser?.durationMaxSeconds,
          )}
        />
        <EstimateItem
          label="Ke Tujuan"
          value={formatEstimateRange(
            vehicle.osrmEstimate?.userToDestination?.durationMinSeconds,
            vehicle.osrmEstimate?.userToDestination?.durationMaxSeconds,
          )}
        />
      </div>

    

      {/* ACTION CTA: GOJEK GREEN GRADIENT BUTTON */}
      <button
        type="button"
        disabled={!canBook}
        onClick={() => onBook?.(vehicle)}
        className={`
          mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-150
          ${
            !canBook
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : isSelected
              ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
              : "bg-gradient-to-r from-emerald-600 via-emerald-600 to-green-500 text-white shadow-md shadow-green-600/20 hover:from-emerald-500 hover:to-green-500 hover:shadow-lg active:scale-[0.98]"
          }
        `}
      >
        {isSelected ? (
          <>
            <FiCheckCircle className="text-sm text-white" />
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

function EstimateItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50/60 px-2 py-1.5">
      <p className="truncate text-[8px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="truncate text-[10px] font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

