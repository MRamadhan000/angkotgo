"use client";

import { useState } from "react";
import { FiArrowLeft, FiFilter, FiNavigation, FiMapPin } from "react-icons/fi";
import VehicleCard, { Vehicle } from "@/components/ui/VehicleCard";

const vehicles: Vehicle[] = [
  {
    id: "AG-001",
    plateNumber: "N 1234 AB",
    driver: "Budi Santoso",
    availableSeats: 8,
    totalSeats: 12,
    arrivalMinutes: 5,
    fare: 5000,
  },
  {
    id: "AG-042",
    plateNumber: "N 9876 XY",
    driver: "Siti Aminah",
    availableSeats: 2,
    totalSeats: 12,
    arrivalMinutes: 12,
    fare: 5000,
  },
  {
    id: "AG-015",
    plateNumber: "N 4567 CD",
    driver: "Agus Supriyadi",
    availableSeats: 0,
    totalSeats: 12,
    arrivalMinutes: 18,
    fare: 5000,
  },
  {
    id: "AG-023",
    plateNumber: "N 2345 EF",
    driver: "Dedi Kurniawan",
    availableSeats: 6,
    totalSeats: 12,
    arrivalMinutes: 22,
    fare: 5000,
  },
  {
    id: "AG-031",
    plateNumber: "N 6789 GH",
    driver: "Rudi Hartono",
    availableSeats: 4,
    totalSeats: 12,
    arrivalMinutes: 27,
    fare: 5000,
  },
];

export default function AngkotTersedia() {
  const [selectedVehicle, setSelectedVehicle] = useState("AG-001");

  const handleSelectVehicle = (vehicle: Vehicle) => {
    if (vehicle.availableSeats <= 0) return;
    setSelectedVehicle(vehicle.id);
    console.log("Angkot dipilih:", vehicle);
  };

  const handleFilter = () => {
    console.log("Buka filter angkot...");
  };

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 text-slate-900 antialiased">
      {/* Header */}
      <header className="relative z-50 flex h-16 shrink-0 items-center justify-between bg-white px-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]">
        <button
          onClick={() => window.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200"
          aria-label="Kembali"
        >
          <FiArrowLeft className="text-xl" />
        </button>
        <h1 className="text-base font-bold tracking-tight text-slate-800">
          Angkot Tersedia
        </h1>
        <div className="w-10" />
      </header>

      {/* Map Area */}
      <div
        className="relative h-56 w-full shrink-0 overflow-hidden bg-[#e7e7f2] bg-cover bg-center md:h-64"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC0PAw6sH90A7QBDEb2gs1LPpH-KTf6iZc-HgbBVYnG-DW97nkz-w5lGaTKpoW_kqnHUD3bup8UbrT2fxzBPPrUdHXdDc52guZlOxi1Isl1vhUynYXzYkKHL7s9rDVl5Bbgwmp4kGz-2yRt1UC2v89Dy8-JnjSprbp7B29hbIU9YqatkGvaybZMJhzZXrL9nYhOpNueXtqMBVNXAfIlC4JfpT7X6m2hJpMpQtKIBUJrXTyp3k0be-wfpw')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/20 to-transparent" />

        {/* Selected Vehicle Marker */}
        <div className="absolute left-1/3 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="mb-1.5 flex h-9 w-9 animate-bounce items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg">
            <FiMapPin className="text-lg" />
          </div>
          <div className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-md">
            {selectedVehicle}
          </div>
        </div>

        {/* Other Vehicle Markers */}
        <div className="absolute right-1/4 top-1/4 flex -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-400 text-white shadow-md">
            <FiNavigation className="text-[10px]" />
          </div>
        </div>
        <div className="absolute bottom-1/4 left-2/3 flex -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-400 text-white shadow-md">
            <FiNavigation className="text-[10px]" />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-10 md:px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* List Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {vehicles.length} Angkot Ditemukan
          </h2>
          <button
            onClick={handleFilter}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 active:bg-slate-100"
          >
            <FiFilter className="text-sm" />
            Filter
          </button>
        </div>

        {/* Cards using VehicleCard Component */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={selectedVehicle === vehicle.id}
              onSelect={handleSelectVehicle}
            />
          ))}
        </div>
      </main>
    </div>
  );
}