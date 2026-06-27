"use client";

import { FaArrowLeft } from "react-icons/fa";
import { Route, Vehicle } from "./types";
import { RouteCard } from "./RouteCard";
import { COLORS } from "@/constants";

interface RouteListProps {
  routes: Route[];
  vehicles: Vehicle[];
  onSelectRoute: (route: Route) => void;
  onBack: () => void;
}

export function RouteList({
  routes,
  vehicles,
  onSelectRoute,
  onBack,
}: RouteListProps) {
  const bestEta = Math.min(
    ...routes.flatMap((r) =>
      vehicles.filter((v) => v.routeId === r.id).map((v) => v.etaPickup)
    )
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase"
              style={{ background: "#eff6ff", color: COLORS.primary }}
            >
              Langkah 2
            </span>
          </div>
          <h3
            className="font-bold text-xl"
            style={{ color: COLORS.textDark }}
          >
            Trayek Tersedia
          </h3>
          <p className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>
            {routes.length} trayek ditemukan · Angkot terdekat {bestEta} menit
          </p>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium mt-1 shrink-0 transition hover:opacity-70"
          style={{ color: COLORS.primary }}
        >
          <FaArrowLeft size={11} />
          Ubah Lokasi
        </button>
      </div>

      {/* Route cards */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scroll">
        {routes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            vehicles={vehicles}
            onSelect={onSelectRoute}
          />
        ))}
      </div>
    </div>
  );
}
