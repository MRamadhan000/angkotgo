"use client";

import { FaMapMarkerAlt, FaExchangeAlt } from "react-icons/fa";
import { Route, Vehicle } from "./types";
import { COLORS } from "@/constants";

interface RouteCardProps {
  route: Route;
  vehicles: Vehicle[];
  onSelect: (route: Route) => void;
}

export function RouteCard({ route, vehicles, onSelect }: RouteCardProps) {
  const routeVehicles = vehicles.filter((v) => v.routeId === route.id);
  const etaPickup =
    routeVehicles.length > 0
      ? Math.min(...routeVehicles.map((v) => v.etaPickup))
      : 8;
  const activeCount = routeVehicles.length || route.activeVehicles;

  return (
    <div
      onClick={() => onSelect(route)}
      className="group relative border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.995]"
      style={{
        borderColor: route.recommended ? COLORS.primary : "#e2e8f0",
        background: "#fff",
        boxShadow: route.recommended
          ? `0 0 0 1px ${COLORS.primary}22`
          : undefined,
      }}
    >
      {/* Recommended badge */}
      {route.recommended && (
        <div
          className="absolute -top-3 left-5 text-[10px] font-bold px-3 py-1 rounded-full"
          style={{ background: COLORS.primary, color: "#fff" }}
        >
          ⚡ Tercepat
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-1">
            <span
              className="font-black text-[32px] leading-none tracking-[-2.5px]"
              style={{ color: COLORS.primary }}
            >
              {route.id}
            </span>
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: "#d1fae5", color: "#065f46" }}
            >
              {activeCount} aktif
            </span>
          </div>
          <div
            className="font-bold text-base leading-tight"
            style={{ color: COLORS.textDark }}
          >
            {route.name}
          </div>
          <div
            className="text-xs mt-1 flex items-center gap-1"
            style={{ color: COLORS.textSecondary }}
          >
            <FaMapMarkerAlt size={9} />
            {route.destination}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: route.transit === 0 ? "#f0fdf4" : "#fef9c3",
              color: route.transit === 0 ? "#16a34a" : "#854d0e",
            }}
          >
            {route.transit === 0 ? "Tanpa transit" : `${route.transit}× transit`}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 h-px" style={{ background: "#f1f5f9" }} />

      {/* Meta row */}
      <div className="flex items-end justify-between">
        <div>
          <div
            className="text-[10px] uppercase tracking-widest mb-1"
            style={{ color: COLORS.textSecondary }}
          >
            Penjemputan
          </div>
          <div
            className="text-2xl font-bold tabular-nums leading-none"
            style={{ color: COLORS.textDark }}
          >
            {etaPickup}{" "}
            <span
              className="text-sm font-normal"
              style={{ color: COLORS.textSecondary }}
            >
              menit
            </span>
          </div>
        </div>

        <div className="text-right">
          <div
            className="text-xl font-black"
            style={{ color: COLORS.primary }}
          >
            Rp{route.fare.toLocaleString("id-ID")}
          </div>
          <div className="text-xs" style={{ color: COLORS.textSecondary }}>
            ±{route.estimatedTrip} menit perjalanan
          </div>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(route);
        }}
        className="mt-4 w-full py-3 rounded-full text-sm font-semibold transition active:scale-[0.98]"
        style={{
          background: route.recommended ? COLORS.primary : "transparent",
          color: route.recommended ? "#fff" : COLORS.primary,
          border: route.recommended ? "none" : `1.5px solid ${COLORS.primary}`,
        }}
      >
        Pilih Trayek {route.id}
      </button>
    </div>
  );
}
