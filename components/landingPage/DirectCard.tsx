export interface DirectAngkot {
  type: "direct";
  id: string;
  name: string;
  color: string;
  eta: number;
  distance: number;
  price: number;
  capacity: number;
  maxCapacity: number;
  pos: [number, number];
  plate: string;
  driver: string;
}

import {
  FaBus,
  FaUser,
  FaClock,
  FaLocationDot,
  FaArrowRight,
  FaChair,
} from "react-icons/fa6";

const fmtRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export function DirectCard({
  a,
  onBook,
  onTracking,
  isTracking,
}: {
  a: DirectAngkot;
  onBook: (a: DirectAngkot) => void;
  onTracking?: (a: DirectAngkot) => void;
  isTracking?: boolean;
}) {
  const left = a.maxCapacity - a.capacity;

  return (
    <div
      className="
        group relative overflow-hidden
        rounded-[24px]
        border border-slate-200
        bg-white
        p-4
        transition-all duration-300
        hover:-translate-y-1
        hover:border-blue-300
        hover:shadow-[0_18px_50px_rgba(37,99,235,0.10)]
      "
    >
      {/* Glow */}
      <div
        className="
          absolute -top-20 -right-20
          w-36 h-36
          bg-blue-100/40
          rounded-full blur-3xl
          opacity-0
          group-hover:opacity-100
          transition duration-500
        "
      />

      {/* TOP */}
      <div className="relative flex items-start gap-3">
        {/* Route Badge */}
        <div
          className="
            w-[52px] h-[52px]
            rounded-xl
            bg-gradient-to-br from-blue-500 to-blue-700
            text-white
            flex items-center justify-center
            shadow-md shadow-blue-200
            flex-shrink-0
          "
        >
          <span className="font-bold text-sm tracking-wide">{a.id}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-semibold text-slate-800 truncate">
              {a.name}
            </h3>

            {left === 0 && (
              <span
                className="
                  px-2 py-[3px]
                  rounded-full
                  bg-red-100
                  text-red-600
                  text-[9px]
                  font-bold
                  tracking-wide
                "
              >
                PENUH
              </span>
            )}

            {left >= 8 && (
              <span
                className="
                  px-2 py-[3px]
                  rounded-full
                  bg-blue-100
                  text-blue-600
                  text-[9px]
                  font-bold
                  tracking-wide
                "
              >
                BANYAK KURSI
              </span>
            )}
          </div>

          {/* Driver */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <FaBus className="text-blue-500 text-[11px]" />
              <span>{a.plate}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <FaUser className="text-blue-500 text-[11px]" />
              <span>{a.driver}</span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="text-right flex-shrink-0">
          <h4 className="text-[18px] font-bold text-slate-800">
            {fmtRp(a.price)}
          </h4>

          <div className="mt-2 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-[12px]">
              <FaClock className="text-[11px]" />
              <span>{a.eta} menit</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <FaLocationDot className="text-[10px]" />
              <span>{a.distance}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-slate-100" />

      {/* Seat Status */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-700">
            <FaChair className="text-blue-500 text-[11px]" />
            Status Kursi
          </div>

          <span
            className={`
        px-3 py-1 rounded-full text-[10px] font-bold tracking-wide
        ${left > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
      `}
          >
            {left > 0 ? "KOSONG" : "PENUH"}
          </span>
        </div>

        {/* Progress */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="
        h-full rounded-full
        transition-all duration-500
        bg-gradient-to-r from-blue-500 to-blue-700
      "
            style={{
              width: `${(a.capacity / a.maxCapacity) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Button */}
      <button
        disabled={left === 0}
        onClick={() => onBook(a)}
        className={`
          mt-5 w-full
          rounded-xl
          py-3
          text-[12px]
          font-semibold
          tracking-wide
          flex items-center justify-center gap-2
          transition-all duration-300
          ${
            left > 0
              ? `
                bg-gradient-to-r from-blue-600 to-blue-700
                text-white
                hover:scale-[1.01]
                hover:shadow-lg
                hover:shadow-blue-200
              `
              : `
                bg-slate-200
                text-slate-400
                cursor-not-allowed
              `
          }
        `}
      >
        {left > 0 ? (
          <>
            Pesan Sekarang
            <FaArrowRight className="text-[11px]" />
          </>
        ) : (
          "Kursi Penuh"
        )}
      </button>
      {/* Tracking Button */}
      <button
        onClick={() => onTracking && onTracking(a)}
        disabled={!isTracking}
        className={`
          mt-2 w-full
          rounded-xl
          py-2
          text-[12px]
          font-semibold
          tracking-wide
          flex items-center justify-center gap-2
          border border-blue-600
          transition-all duration-300
          ${
            isTracking
              ? 'bg-white text-blue-700 hover:bg-blue-50'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }
        `}
      >
        Lihat Tracking
      </button>
    </div>
  );
}