"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  FaMapMarkerAlt,
  FaCrosshairs,
  FaExchangeAlt,
  FaRoute,
  FaInfoCircle,
} from "react-icons/fa";
import { Location } from "./types";
import { COLORS } from "@/constants";

const SearchBoxDynamic = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.SearchBox),
  { ssr: false }
);

interface LocationFormProps {
  mapboxToken: string;
  originLocation: string;
  destinationLocation: string;
  originCoords: Location | null;
  destinationCoords: Location | null;
  loadingGPS: boolean;
  onOriginRetrieve: (res: any) => void;
  onDestinationRetrieve: (res: any) => void;
  onGetGPS: () => void;
  onSwapLocations: () => void;
  onFindRoute: () => void;
}

export function LocationForm({
  mapboxToken,
  originLocation,
  destinationLocation,
  originCoords,
  destinationCoords,
  loadingGPS,
  onOriginRetrieve,
  onDestinationRetrieve,
  onGetGPS,
  onSwapLocations,
  onFindRoute,
}: LocationFormProps) {
  const canSearch = !!originCoords && !!destinationCoords;

  return (
    <div className="space-y-5">
      {/* Step label */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase"
          style={{ background: "#eff6ff", color: COLORS.primary }}
        >
          Langkah 1
        </span>
        <span className="text-xs" style={{ color: COLORS.textSecondary }}>
          Tentukan lokasi
        </span>
      </div>

      {/* Origin */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            className="text-sm font-semibold flex items-center gap-2"
            style={{ color: COLORS.textDark }}
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: "#60a5fa" }}
            />
            Lokasi Awal
          </label>
          <button
            type="button"
            onClick={onGetGPS}
            disabled={loadingGPS}
            className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-full transition disabled:opacity-50"
            style={{
              background: "#eff6ff",
              color: COLORS.primary,
            }}
          >
            <FaCrosshairs
              size={10}
              className={loadingGPS ? "animate-spin" : ""}
            />
            {loadingGPS ? "Mencari GPS..." : "Gunakan GPS"}
          </button>
        </div>

        <div className="style-mapbox-search">
          <SearchBoxDynamic
            accessToken={mapboxToken}
            value={originLocation}
            onRetrieve={onOriginRetrieve}
            placeholder="Ketik lokasi awal (cth: Stasiun Malang)..."
            options={{
              country: "ID",
              proximity: [112.630875, -7.982611],
            }}
          />
        </div>
      </div>

      {/* Swap button */}
      <div className="flex items-center gap-3">
        <div
          className="flex-1 h-px"
          style={{ background: "#e2e8f0" }}
        />
        <button
          type="button"
          onClick={onSwapLocations}
          title="Tukar lokasi"
          className="w-8 h-8 rounded-full border flex items-center justify-center transition hover:bg-slate-50 active:scale-95"
          style={{
            borderColor: "#e2e8f0",
            color: COLORS.textSecondary,
          }}
        >
          <FaExchangeAlt size={11} className="rotate-90" />
        </button>
        <div
          className="flex-1 h-px"
          style={{ background: "#e2e8f0" }}
        />
      </div>

      {/* Destination */}
      <div className="space-y-2">
        <label
          className="block text-sm font-semibold flex items-center gap-2"
          style={{ color: COLORS.textDark }}
        >
          <FaMapMarkerAlt size={10} style={{ color: "#f87171" }} />
          Lokasi Tujuan
        </label>

        <div className="style-mapbox-search">
          <SearchBoxDynamic
            accessToken={mapboxToken}
            value={destinationLocation}
            onRetrieve={onDestinationRetrieve}
            placeholder="Ketik tujuan (cth: Universitas Brawijaya)..."
            options={{
              country: "ID",
              proximity: [112.630875, -7.982611],
            }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onFindRoute}
          disabled={!canSearch}
          className="w-full flex items-center justify-center gap-2.5 rounded-full py-[14px] text-white font-semibold text-sm transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100"
          style={{ backgroundColor: COLORS.primary }}
        >
          <FaRoute size={13} />
          Cari Trayek Angkot
        </button>
      </div>

      {/* Info note */}
      <div
        className="flex items-start gap-3 rounded-2xl p-4"
        style={{ background: "#f8faff" }}
      >
        <FaInfoCircle
          size={14}
          className="mt-0.5 flex-shrink-0"
          style={{ color: COLORS.primary }}
        />
        <p className="text-xs leading-relaxed" style={{ color: COLORS.textSecondary }}>
          Layanan mencakup seluruh trayek angkot resmi Kota Malang. Data
          real-time diperbarui setiap 30 detik.
        </p>
      </div>
    </div>
  );
}
