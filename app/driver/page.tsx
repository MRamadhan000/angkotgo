"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import {
  FaBus,
  FaUsers,
  FaPowerOff,
  FaMapMarkedAlt,
  FaArrowUp,
} from "react-icons/fa";

const DriverMap = dynamic(() => import("./DriverMap"), {
  ssr: false,
});

export default function DriverAvailabilityPage() {
  const [isActive, setIsActive] = useState(true);
  const [isFull, setIsFull] = useState(true);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 cursor-default">
      {/* HERO HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[11px] sm:text-xs md:text-sm font-medium mb-2 sm:mb-3 md:mb-5">
            <FaBus size={14} />
            Real-Time Driver Monitoring
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold leading-tight">
            Dashboard
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {" "}
              Availability
            </span>
          </h2>

          <p className="text-slate-500 text-[11px] sm:text-xs md:text-sm lg:text-lg mt-1.5 sm:mt-2 md:mt-3 lg:mt-4 max-w-2xl">
            Kelola status angkot, kapasitas penumpang, dan pantau lokasi
            perjalanan secara real-time.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-lg min-w-[110px] sm:min-w-[160px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-500">Passenger</p>

                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-1">18</h3>
              </div>

              <div className="bg-blue-100 text-blue-600 w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl">
                <FaUsers />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-lg min-w-[110px] sm:min-w-[160px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-500">Trips Today</p>

                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-1">7</h3>
              </div>

              <div className="bg-green-100 text-green-600 w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl">
                <FaArrowUp />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STATUS GRID ================= */}
      <div className="grid lg:grid-cols-2 gap-5 sm:gap-6 md:gap-8 mt-8 sm:mt-10">
        {/* STATUS ANGKOT */}
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl sm:rounded-[36px] p-5 sm:p-6 md:p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-green-100/40 rounded-full blur-3xl" />

          <div className="relative flex flex-row items-start sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                Status Angkot
              </h3>

              <p className="text-slate-500 text-[10px] sm:text-xs md:text-xs lg:text-sm mt-1 sm:mt-2">
                Kontrol status operasional angkot
              </p>
            </div>

            <div
              className={`w-10 h-10 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0 ${isActive
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
                }`}
            >
              <FaPowerOff size={16} className="sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="relative mt-6 sm:mt-8 md:mt-10 bg-slate-50 rounded-xl sm:rounded-[30px] p-4 sm:p-6 flex flex-row items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-slate-500 text-[10px] sm:text-xs md:text-xs lg:text-sm">
                Current Status
              </p>

              <h4
                className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 ${isActive ? "text-green-600" : "text-red-600"
                  }`}
              >
                {isActive ? "Online" : "Offline"}
              </h4>
            </div>

            <button
              onClick={() => setIsActive(!isActive)}
              className={`relative w-16 h-9 sm:w-[90px] sm:h-[48px] rounded-full transition-all duration-300 flex-shrink-0 ${isActive ? "bg-green-500" : "bg-red-500"
                }`}
            >
              <div
                className={`absolute top-1 sm:top-[5px] w-7 sm:w-[38px] h-7 sm:h-[38px] bg-white rounded-full shadow-lg transition-all duration-300 ${isActive ? "left-8 sm:left-[47px]" : "left-1 sm:left-[5px]"
                  }`}
              />
            </button>
          </div>
        </div>

        {/* STATUS KAPASITAS */}
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl sm:rounded-[36px] p-5 sm:p-6 md:p-8 shadow-xl">
          <div className="absolute bottom-0 left-0 w-[240px] h-[240px] bg-blue-100/40 rounded-full blur-3xl" />

          <div className="relative flex flex-row items-start sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                Kapasitas Penumpang
              </h3>

              <p className="text-slate-500 text-[10px] sm:text-xs md:text-xs lg:text-sm mt-1 sm:mt-2">
                Update status kursi penumpang
              </p>
            </div>

            <div
              className={`w-10 h-10 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0 ${isFull
                  ? "bg-blue-100 text-blue-600"
                  : "bg-red-100 text-red-600"
                }`}
            >
              <FaUsers size={16} className="sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="relative mt-6 sm:mt-8 md:mt-10 bg-slate-50 rounded-xl sm:rounded-[30px] p-4 sm:p-6 flex flex-row items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-slate-500 text-[10px] sm:text-xs md:text-xs lg:text-sm">
                Seat Availability
              </p>

              <h4
                className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 ${isFull ? "text-blue-600" : "text-red-600"
                  }`}
              >
                {isFull ? "Available" : "Full"}
              </h4>
            </div>

            <button
              onClick={() => setIsFull(!isFull)}
              className={`relative w-16 h-9 sm:w-[90px] sm:h-[48px] rounded-full transition-all duration-300 flex-shrink-0 ${isFull ? "bg-blue-500" : "bg-red-500"
                }`}
            >
              <div
                className={`absolute top-1 sm:top-[5px] w-7 sm:w-[38px] h-7 sm:h-[38px] bg-white rounded-full shadow-lg transition-all duration-300 ${isFull ? "left-8 sm:left-[47px]" : "left-1 sm:left-[5px]"
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAP ================= */}
      <div className="relative overflow-hidden mt-8 sm:mt-10 bg-white border border-slate-100 rounded-2xl sm:rounded-[40px] p-5 sm:p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-100/40 rounded-full blur-3xl" />

        {/* HEADER */}
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <FaMapMarkedAlt size={14} />
              Live Passenger Heatmap
            </div>

            <h3 className="text-base sm:text-lg md:text-2xl lg:text-4xl font-bold">
              Real-Time Tracking
            </h3>

            <p className="text-slate-500 mt-1 sm:mt-2 md:mt-3 text-[10px] sm:text-xs md:text-sm lg:text-lg">
              Pantau lokasi penumpang dan perjalanan angkot secara langsung.
            </p>
          </div>

          {/* LEGEND */}
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 lg:gap-5 text-xs font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />

              <span className="text-slate-700">Passenger</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-0.5 sm:w-7 sm:h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />

              <span className="text-slate-700">Route</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl">🚌</span>

              <span className="text-slate-700">Angkot Position</span>
            </div>
          </div>
        </div>

        {/* MAP */}
        <div className="relative mt-6 sm:mt-8 h-[260px] sm:h-[380px] md:h-[520px] rounded-xl sm:rounded-[32px] overflow-hidden border border-slate-100 shadow-inner">
          <DriverMap />
        </div>
      </div>
    </section>
  );
}
