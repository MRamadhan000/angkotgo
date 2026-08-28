"use client";

import { FiNavigation } from "react-icons/fi";
import UpcomingVehicleCard from "./UpcomingVehicleCard";
import { UpcomingVehicle } from "@/types/route-search.type";

interface UpcomingVehicleListProps {
  upcomingVehicles: UpcomingVehicle[];
}

export default function UpcomingVehicleList({
  upcomingVehicles: vehicles,
}: UpcomingVehicleListProps) {
  return (
    <div className="pointer-events-auto w-full shrink-0 rounded-t-[24px] bg-[#faf8ff]/95 p-4 shadow-2xl backdrop-blur-md">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#191b23]">
            Angkot yang tersedia
          </h2>

          <p className="mt-0.5 text-[11px] text-gray-500">
            Pilih angkot yang ingin kamu gunakan
          </p>
        </div>

        <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#003d9b]/10 px-2 text-xs font-bold text-[#003d9b]">
          {vehicles.length}
        </div>
      </div>

      {/* VEHICLES */}
      {vehicles.length > 0 ? (
        <div className="max-h-[45vh] min-h-0 space-y-2.5 overflow-y-auto overscroll-contain pr-1">
          {vehicles.map((vehicle) => (
            <UpcomingVehicleCard key={vehicle.assignmentId} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-5 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#003d9b]/10 text-[#003d9b]">
            <FiNavigation className="text-xl" />
          </div>

          <p className="mt-3 text-sm font-semibold text-[#191b23]">
            Belum ada angkot
          </p>

          <p className="mt-1 text-[11px] text-gray-500">
            Belum ada angkot yang tersedia di sekitar rute kamu.
          </p>
        </div>
      )}
    </div>
  );
}
