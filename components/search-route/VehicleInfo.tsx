"use client";

import { Vehicle } from "./types";

interface VehicleInfoProps {
  vehicle: Vehicle;
}

export function VehicleInfo({ vehicle }: VehicleInfoProps) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: "#e2e8f0", background: "#fff" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold" style={{ color: "#0f172a" }}>
          Informasi Kendaraan
        </span>
        <div
          className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: "#d1fae5", color: "#065f46" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#10b981" }}
          />
          LIVE
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-3">
        <VehicleItem label="Plat Nomor" value={vehicle.plateNumber} />
        <VehicleItem label="Pengemudi" value={vehicle.driver} />
        <VehicleItem
          label="Kecepatan"
          value={`${vehicle.speed} km/jam`}
        />
        <VehicleItem
          label="Status"
          value={vehicle.status}
          valueColor="#059669"
        />
      </div>
    </div>
  );
}

function VehicleItem({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div>
      <div className="text-xs mb-0.5" style={{ color: "#94a3b8" }}>
        {label}
      </div>
      <div
        className="text-sm font-semibold"
        style={{ color: valueColor ?? "#1e293b" }}
      >
        {value}
      </div>
    </div>
  );
}
