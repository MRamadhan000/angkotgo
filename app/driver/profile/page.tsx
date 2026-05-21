"use client";

import { useState } from "react";
import Link from "next/link";

import {
  FaBus,
  FaCamera,
  FaChevronDown,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBars,
  FaPhoneAlt,
  FaSave,
  FaUser,
  FaCarSide,
  FaRoute,
  FaTimes,
} from "react-icons/fa";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function DriverProfilePage() {
  const [selectedRoute, setSelectedRoute] = useState("AG");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#F4F8FF] text-slate-900 overflow-hidden`}
    >
      {/* ================= BACKGROUND ================= */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-100/50 via-cyan-50 to-transparent blur-3xl -z-10" />

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 w-full h-[90px] border-b border-white/30 bg-white/80 backdrop-blur-xl">
        <div className="w-full h-full px-6 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-xl hover:bg-slate-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <FaTimes size={22} />
              ) : (
                <FaBars size={22} />
              )}
            </button>

            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
              <FaBus size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AngkotTrack
              </h1>

              <p className="text-sm text-slate-500">
                Driver Dashboard
              </p>
            </div>
          </div>

          {/* PROFILE */}
          <div className="hidden md:flex items-center gap-4 bg-white border border-slate-100 shadow-md rounded-2xl px-4 py-2">
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="profile"
              className="w-12 h-12 rounded-2xl object-cover"
            />

            <div>
              <h4 className="font-semibold">
                Budi Santoso
              </h4>

              <p className="text-sm text-slate-500">
                Driver AG
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= LAYOUT ================= */}
      <div className="flex">
        {/* ================= SIDEBAR ================= */}
        <aside
          className={`
            fixed md:sticky
            top-[90px] left-0
            h-[calc(100vh-90px)]
            w-[280px]
            bg-white/90 backdrop-blur-xl
            border-r border-slate-100
            p-6
            z-40
            transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
          `}
        >
          <div className="space-y-3">
            <Link
              href="/driver"
              className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <FaBus size={18} />
              Dashboard
            </Link>

            <Link
              href="/driver/profile"
              className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200 font-semibold"
            >
              <FaUser size={18} />
              Profile
            </Link>
          </div>

          {/* BOTTOM CARD */}
          <div className="mt-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-5">
              <FaRoute size={24} />
            </div>

            <h3 className="font-bold text-xl">
              Active Route
            </h3>

            <p className="mt-2 text-blue-100 text-sm leading-relaxed">
              Jalur AG aktif dan sedang online untuk tracking penumpang.
            </p>

            <button className="mt-6 bg-white text-blue-600 w-full py-3 rounded-2xl font-semibold">
              View Route
            </button>
          </div>
        </aside>

        {/* ================= CONTENT ================= */}
        <section className="flex-1 px-6 md:px-10 py-10 space-y-10">
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Driver Profile
              </h2>

              <p className="text-slate-500 text-lg mt-3">
                Kelola informasi driver dan kendaraan angkot secara modern.
              </p>
            </div>

            <button className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:scale-[1.02] transition">
              <FaSave />
              Save Changes
            </button>
          </div>

          {/* ================= PROFILE CARD ================= */}
          <div className="relative overflow-hidden bg-white border border-slate-100 rounded-[36px] p-8 lg:p-10 shadow-xl">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-100/40 rounded-full blur-3xl" />

            {/* HEADER */}
            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-3xl font-bold">
                  Driver Information
                </h3>

                <p className="text-slate-500 mt-2">
                  Lengkapi data profile driver anda
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-5 rounded-3xl shadow-lg">
                <FaUser size={24} />
              </div>
            </div>

            {/* CONTENT */}
            <div className="relative grid lg:grid-cols-[320px_1fr] gap-12 mt-12">
              {/* PHOTO */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-[36px] blur-xl opacity-30 group-hover:opacity-50 transition" />

                  <img
                    src="https://i.pravatar.cc/300?img=12"
                    alt="driver"
                    className="relative w-[240px] h-[240px] rounded-[36px] object-cover border-[6px] border-white shadow-2xl"
                  />

                  <button className="absolute bottom-5 right-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-2xl shadow-lg">
                    <FaCamera size={18} />
                  </button>
                </div>

                <button className="mt-8 px-8 py-3 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:text-blue-600 transition font-medium">
                  Upload Photo
                </button>
              </div>

              {/* FORM */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* NAME */}
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-600">
                    Nama Lengkap
                  </label>

                  <div className="relative mt-3">
                    <FaUser
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Email
                  </label>

                  <div className="relative mt-3">
                    <FaEnvelope
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      placeholder="Masukkan email"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Nomor Telepon
                  </label>

                  <div className="relative mt-3">
                    <FaPhoneAlt
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="08xxxxxxxxxx"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* ADDRESS */}
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-600">
                    Alamat
                  </label>

                  <div className="relative mt-3">
                    <FaMapMarkerAlt
                      className="absolute left-5 top-5 text-slate-400"
                    />

                    <textarea
                      rows={4}
                      placeholder="Masukkan alamat lengkap"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-5 py-4 outline-none resize-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= VEHICLE CARD ================= */}
          <div className="relative overflow-hidden bg-white border border-slate-100 rounded-[36px] p-8 lg:p-10 shadow-xl">
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-100/40 rounded-full blur-3xl" />

            {/* HEADER */}
            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-3xl font-bold">
                  Vehicle Information
                </h3>

                <p className="text-slate-500 mt-2">
                  Lengkapi data kendaraan angkot
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-5 rounded-3xl shadow-lg">
                <FaCarSide size={24} />
              </div>
            </div>

            {/* CONTENT */}
            <div className="relative grid lg:grid-cols-[320px_1fr] gap-12 mt-12">
              {/* VEHICLE PHOTO */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-[36px] blur-xl opacity-30 group-hover:opacity-50 transition" />

                  <div className="relative w-[260px] h-[230px] rounded-[36px] bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-center shadow-xl">
                    <FaBus
                      size={100}
                      className="text-blue-600"
                    />

                    <button className="absolute bottom-5 right-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-2xl shadow-lg">
                      <FaCamera size={18} />
                    </button>
                  </div>
                </div>

                <button className="mt-8 px-8 py-3 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:text-blue-600 transition font-medium">
                  Upload Vehicle
                </button>
              </div>

              {/* FORM */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Plat Nomor
                  </label>

                  <input
                    type="text"
                    placeholder="N 1234 AB"
                    className="mt-3 w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Warna Angkot
                  </label>

                  <input
                    type="text"
                    placeholder="Biru"
                    className="mt-3 w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                {/* ROUTE */}
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-600">
                    Pilih Jalur
                  </label>

                  <button
                    onClick={() =>
                      setSelectedRoute(
                        selectedRoute === "AG" ? "AH" : "AG"
                      )
                    }
                    className="mt-3 w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-5 flex items-center justify-between hover:border-blue-500 hover:bg-white transition"
                  >
                    <div className="text-left">
                      <p className="font-bold text-lg">
                        Jalur {selectedRoute}
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        {selectedRoute === "AG"
                          ? "Arjosari - Gadang"
                          : "Arjosari - Hamid Rusdi"}
                      </p>
                    </div>

                    <FaChevronDown className="text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}