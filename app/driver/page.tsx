"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import {
  FaBus,
  FaUsers,
  FaPowerOff,
  FaBars,
  FaChartLine,
  FaTimes,
  FaMapMarkedAlt,
  FaUserCircle,
  FaBell,
  FaRoute,
  FaArrowUp,
} from "react-icons/fa";

import { Poppins } from "next/font/google";

const DriverMap = dynamic(() => import("./DriverMap"), {
  ssr: false,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function DriverAvailabilityPage() {
  const [isActive, setIsActive] = useState(true);
  const [isFull, setIsFull] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#F4F8FF] text-slate-900 overflow-hidden`}
    >
      {/* ================= BACKGROUND ================= */}
      <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-br from-blue-100/60 via-cyan-50 to-transparent blur-3xl -z-10" />

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 h-[85px] border-b border-white/30 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition"
            >
              <FaBars size={22} />
            </button>

            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
              <FaBus size={22} />
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AngkotTrack
              </h1>

              <p className="text-xs md:text-sm text-slate-500">
                Driver Dashboard
              </p>
            </div>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/driver" className="hover:text-blue-600 transition">
              Dashboard
            </Link>

            <Link
              href="/driver/profile"
              className="hover:text-blue-600 transition"
            >
              Profile
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">

            {/* PROFILE */}
            <div className="hidden md:flex items-center gap-4 bg-white border border-slate-100 shadow-md rounded-2xl px-4 py-2">
              <img
                src="https://i.pravatar.cc/100?img=12"
                alt="profile"
                className="w-12 h-12 rounded-2xl object-cover"
              />

              <div>
                <h4 className="font-semibold">Budi Santoso</h4>

                <p className="text-sm text-slate-500">Driver AG</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE SIDEBAR ================= */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-[290px] bg-white/90 backdrop-blur-2xl z-50 shadow-2xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-2xl">
                <FaBus size={18} />
              </div>

              <div>
                <h2 className="font-bold text-lg">AngkotTrack</h2>

                <p className="text-xs text-slate-500">Driver Menu</p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl hover:bg-slate-100"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* PROFILE */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-5 text-white shadow-xl">
            <div className="flex items-center gap-4">
              <img
                src="https://i.pravatar.cc/100?img=12"
                className="w-14 h-14 rounded-2xl border-2 border-white/40"
              />

              <div>
                <h3 className="font-bold">Budi Santoso</h3>

                <p className="text-sm text-blue-100">Driver AG</p>
              </div>
            </div>
          </div>

          {/* MENU */}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/driver"
              className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-blue-50 text-blue-600 font-semibold"
            >
              <FaChartLine />
              Dashboard
            </Link>

            <Link
              href="/driver/profile"
              className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-slate-100 transition"
            >
              <FaUserCircle />
              Profile
            </Link>
          </div>

          {/* INFO CARD */}
          <div className="mt-10 bg-slate-50 rounded-3xl p-5 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center">
                <FaRoute />
              </div>

              <div>
                <h4 className="font-bold">Active Route</h4>

                <p className="text-sm text-slate-500">Arjosari - Gadang</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= CONTENT ================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10">
        {/* HERO HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-5">
              <FaBus size={14} />
              Real-Time Driver Monitoring
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Dashboard
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {" "}
                Availability
              </span>
            </h2>

            <p className="text-slate-500 text-base sm:text-lg mt-3 sm:mt-4 max-w-2xl">
              Kelola status angkot, kapasitas penumpang, dan pantau lokasi
              perjalanan secara real-time.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-lg min-w-[110px] sm:min-w-[160px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-500">Passenger</p>

                  <h3 className="text-2xl sm:text-3xl font-bold mt-1">18</h3>
                </div>

                <div className="bg-blue-100 text-blue-600 w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl">
                  <FaUsers />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-lg min-w-[110px] sm:min-w-[160px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-500">Trips Today</p>

                  <h3 className="text-2xl sm:text-3xl font-bold mt-1">7</h3>
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

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold">
                  Status Angkot
                </h3>

                <p className="text-slate-500 text-sm sm:text-base mt-1 sm:mt-2">
                  Kontrol status operasional angkot
                </p>
              </div>

              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                  isActive
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                <FaPowerOff size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>

            <div className="relative mt-6 sm:mt-8 md:mt-10 bg-slate-50 rounded-xl sm:rounded-[30px] p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Current Status
                </p>

                <h4
                  className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 ${
                    isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isActive ? "Online" : "Offline"}
                </h4>
              </div>

              <button
                onClick={() => setIsActive(!isActive)}
                className={`relative w-16 h-9 sm:w-[90px] sm:h-[48px] rounded-full transition-all duration-300 flex-shrink-0 ${
                  isActive ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <div
                  className={`absolute top-1 sm:top-[5px] w-7 sm:w-[38px] h-7 sm:h-[38px] bg-white rounded-full shadow-lg transition-all duration-300 ${
                    isActive ? "left-8 sm:left-[47px]" : "left-1 sm:left-[5px]"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* STATUS KAPASITAS */}
          <div className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl sm:rounded-[36px] p-5 sm:p-6 md:p-8 shadow-xl">
            <div className="absolute bottom-0 left-0 w-[240px] h-[240px] bg-blue-100/40 rounded-full blur-3xl" />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold">
                  Kapasitas Penumpang
                </h3>

                <p className="text-slate-500 text-sm sm:text-base mt-1 sm:mt-2">
                  Update status kursi penumpang
                </p>
              </div>

              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                  isFull
                    ? "bg-blue-100 text-blue-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                <FaUsers size={18} className="sm:w-6 sm:h-6" />
              </div>
            </div>

            <div className="relative mt-6 sm:mt-8 md:mt-10 bg-slate-50 rounded-xl sm:rounded-[30px] p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Seat Availability
                </p>

                <h4
                  className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 ${
                    isFull ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {isFull ? "Available" : "Full"}
                </h4>
              </div>

              <button
                onClick={() => setIsFull(!isFull)}
                className={`relative w-16 h-9 sm:w-[90px] sm:h-[48px] rounded-full transition-all duration-300 flex-shrink-0 ${
                  isFull ? "bg-blue-500" : "bg-red-500"
                }`}
              >
                <div
                  className={`absolute top-1 sm:top-[5px] w-7 sm:w-[38px] h-7 sm:h-[38px] bg-white rounded-full shadow-lg transition-all duration-300 ${
                    isFull ? "left-8 sm:left-[47px]" : "left-1 sm:left-[5px]"
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

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Real-Time Tracking
              </h3>

              <p className="text-slate-500 mt-2 sm:mt-3 text-base sm:text-lg">
                Pantau lokasi penumpang dan perjalanan angkot secara langsung.
              </p>
            </div>

            {/* LEGEND */}
            <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-5 text-xs sm:text-sm font-medium">
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
    </main>
  );
}
