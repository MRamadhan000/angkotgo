"use client";

import { FaArrowLeft, FaMapMarkerAlt, FaTicketAlt, FaSyncAlt } from "react-icons/fa";
import { Route, Vehicle, TrackingData } from "./types";
import { EtaCard } from "./EtaCard";
import { VehicleInfo } from "./VehicleInfo";
import { COLORS } from "@/constants";

interface TrackingPanelProps {
  route: Route;
  vehicle: Vehicle;
  trackingData: TrackingData;
  onBack: () => void;
  onRefresh: () => void;
}

export function TrackingPanel({
  route,
  vehicle,
  onBack,
  onRefresh,
}: TrackingPanelProps) {
  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium transition hover:opacity-70"
        style={{ color: COLORS.primary }}
      >
        <FaArrowLeft size={11} />
        Kembali ke Daftar Trayek
      </button>

      {/* Route identity */}
      <div
        className="flex items-center gap-4 pb-5 border-b"
        style={{ borderColor: "#f1f5f9" }}
      >
        <span
          className="font-black text-[42px] leading-none tracking-[-3px]"
          style={{ color: COLORS.primary }}
        >
          {route.id}
        </span>
        <div>
          <div
            className="font-bold text-lg leading-tight"
            style={{ color: COLORS.textDark }}
          >
            {route.name}
          </div>
          <div
            className="text-xs mt-0.5 flex items-center gap-1"
            style={{ color: COLORS.textSecondary }}
          >
            <FaMapMarkerAlt size={9} />
            Menuju {route.destination}
          </div>
        </div>
      </div>

      {/* Step label */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase"
          style={{ background: "#eff6ff", color: COLORS.primary }}
        >
          Langkah 3
        </span>
        <span className="text-xs" style={{ color: COLORS.textSecondary }}>
          Tracking aktif
        </span>
      </div>

      {/* ETA cards */}
      <div className="grid grid-cols-2 gap-3">
        <EtaCard
          label="Dijemput dalam"
          value={vehicle.etaPickup}
          unit="menit"
          subLabel="Jarak angkot"
          subValue={`${vehicle.distanceToPassenger} km`}
        />
        <EtaCard
          label="Estimasi sampai"
          value={vehicle.etaDestination}
          unit="menit"
          subLabel="Sisa perjalanan"
          subValue={`${vehicle.distanceRemaining} km`}
        />
      </div>

      {/* Fare */}
      <div
        className="flex items-center justify-between px-5 py-4 rounded-2xl border"
        style={{ borderColor: "#e2e8f0" }}
      >
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: COLORS.textSecondary }}
        >
          <FaTicketAlt size={13} style={{ color: COLORS.primary }} />
          Tarif angkot
        </div>
        <span
          className="font-black text-2xl"
          style={{ color: COLORS.primary }}
        >
          Rp{route.fare.toLocaleString("id-ID")}
        </span>
      </div>

      {/* Vehicle info */}
      <VehicleInfo vehicle={vehicle} />

      {/* Refresh */}
      <button
        onClick={onRefresh}
        className="w-full py-3 rounded-full border text-sm font-medium flex items-center justify-center gap-2 transition hover:bg-slate-50 active:scale-[0.99]"
        style={{
          borderColor: "#e2e8f0",
          color: COLORS.textSecondary,
        }}
      >
        <FaSyncAlt size={12} />
        Refresh Tracking (Demo)
      </button>
    </div>
  );
}
