import { FiClock, FiNavigation, FiUser, FiUsers } from "react-icons/fi";

export interface Vehicle {
  id: string;
  plateNumber: string;
  driver: string;
  availableSeats: number;
  totalSeats: number;
  arrivalMinutes: number;
  fare: number;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: (vehicle: Vehicle) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function VehicleCard({
  vehicle,
  isSelected,
  onSelect,
}: VehicleCardProps) {
  const isFull = vehicle.availableSeats === 0;
  const isFewSeats = vehicle.availableSeats > 0 && vehicle.availableSeats <= 2;

  return (
    <div
      onClick={() => onSelect(vehicle)}
      className={`
        relative overflow-hidden rounded-2xl bg-white p-3.5 sm:p-4 transition-all duration-300 ease-in-out
        ${isFull ? "cursor-not-allowed opacity-60 grayscale-[30%]" : "cursor-pointer"}
        ${
          isSelected
            ? "border-2 border-blue-600 shadow-[0_8px_30px_rgb(37,99,235,0.12)]"
            : "border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
        }
      `}
    >
      {/* Top Section: Icon, ID, Driver & Status */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex gap-2.5 sm:gap-3">
          <div
            className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full ${
              isSelected
                ? "bg-blue-100 text-blue-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <FiNavigation className="text-base sm:text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="text-xs sm:text-base font-bold text-slate-900">
                {vehicle.id}
              </h3>
              <span className="rounded-md bg-slate-100 px-1 py-0.5 text-[9px] sm:text-[10px] font-semibold text-slate-600">
                {vehicle.plateNumber}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-500">
              <FiUser className="text-[9px] sm:text-[10px]" />
              {vehicle.driver}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold ${
            isFull ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {isFull ? "Penuh" : "Tersedia"}
        </div>
      </div>

      {/* Stats Container (Grid layout minimalis) */}
      <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2.5 sm:p-3">
        <div className="flex flex-col">
          <span className="mb-0.5 sm:mb-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Kursi
          </span>
          <p
            className={`flex items-center gap-1 text-xs sm:text-sm font-bold ${
              isFull
                ? "text-red-500"
                : isFewSeats
                  ? "text-amber-500"
                  : "text-slate-800"
            }`}
          >
            <FiUsers className="text-xs sm:text-sm" />
            {vehicle.availableSeats}
          </p>
        </div>

        <div className="flex flex-col">
          <span className="mb-0.5 sm:mb-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Tiba
          </span>
          <p className="flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-800">
            <FiClock
              className={`text-xs sm:text-sm ${isSelected ? "text-blue-600" : "text-slate-400"}`}
            />
            {vehicle.arrivalMinutes} mnt
          </p>
        </div>

        <div className="flex flex-col">
          <span className="mb-0.5 sm:mb-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Tarif
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            {formatCurrency(vehicle.fare)}
          </p>
        </div>
      </div>

      {/* Action Button */}
      {!isFull && (
        <button
          disabled={isFull}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(vehicle);
          }}
          className={`w-full rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all active:scale-[0.98] ${
            isSelected
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "bg-white text-blue-600 ring-1 ring-inset ring-blue-200 hover:bg-blue-50"
          }`}
        >
          {isSelected ? "Angkot Terpilih" : "Pilih Angkot"}
        </button>
      )}
    </div>
  );
}
