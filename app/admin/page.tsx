"use client";

import { useState } from "react";

import {
  FaBus,
  FaRoute,
  FaUsers,
  FaMoneyBillWave,
  FaBell,
  FaBars,
  FaChartLine,
  FaArrowTrendUp,
  FaLocationDot,
  FaXmark,
  FaTableCellsLarge,
  FaUserShield,
  FaCircleCheck,
  FaClockRotateLeft,
  FaChevronRight,
} from "react-icons/fa6";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#F4F8FF] text-slate-900 overflow-hidden`}
    >
      {/* ================= BACKGROUND ================= */}
      <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-br from-blue-100/60 via-cyan-50 to-transparent blur-3xl -z-10" />

      {/* ================= OVERLAY ================= */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300 lg:hidden ${
          sidebarOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[290px] bg-white/90 backdrop-blur-2xl border-r border-white/40 z-50 shadow-2xl transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* HEADER */}
        <div className="h-[90px] border-b border-slate-100 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
              <FaBus size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AngkotTrack
              </h1>

              <p className="text-sm text-slate-500">
                Admin Dashboard
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100"
          >
            <FaXmark size={22} />
          </button>
        </div>

        {/* ADMIN CARD */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[28px] p-5 text-white shadow-xl">
            <div className="flex items-center gap-4">
              <img
                src="https://i.pravatar.cc/100?img=15"
                alt="admin"
                className="w-14 h-14 rounded-2xl border-2 border-white/40"
              />

              <div>
                <h3 className="font-bold text-lg">
                  Admin Utama
                </h3>

                <p className="text-sm text-blue-100">
                  System Administrator
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm text-blue-100">
              <FaCircleCheck />
              Sistem berjalan normal
            </div>
          </div>

          {/* MENU */}
          <div className="mt-8 space-y-3">
            <a
              href="/admin"
              className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-4 rounded-2xl font-semibold shadow-lg shadow-blue-200"
            >
              <div className="flex items-center gap-4">
                <FaTableCellsLarge size={20} />
                Dashboard
              </div>

              <FaChevronRight />
            </a>

            <a
              href="/admin/rute"
              className="flex items-center justify-between px-5 py-4 rounded-2xl hover:bg-slate-100 transition font-medium group"
            >
              <div className="flex items-center gap-4">
                <FaRoute
                  size={20}
                  className="text-slate-500 group-hover:text-blue-600"
                />

                Manajemen Rute
              </div>

              <FaChevronRight className="text-slate-400 text-sm" />
            </a>

            <a
              href="/admin/driver"
              className="flex items-center justify-between px-5 py-4 rounded-2xl hover:bg-slate-100 transition font-medium group"
            >
              <div className="flex items-center gap-4">
                <FaUsers
                  size={20}
                  className="text-slate-500 group-hover:text-blue-600"
                />

                Manajemen Driver
              </div>

              <FaChevronRight className="text-slate-400 text-sm" />
            </a>
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="lg:ml-[290px]">
        {/* ================= NAVBAR ================= */}
        <nav className="sticky top-0 z-30 h-[85px] border-b border-white/30 bg-white/80 backdrop-blur-xl">
          <div className="h-full px-4 md:px-6 flex items-center justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100"
              >
                <FaBars size={22} />
              </button>

              <div>
                <h2 className="text-2xl font-bold">
                  Dashboard Admin
                </h2>

                <p className="text-sm text-slate-500 hidden sm:block">
                  Monitoring sistem angkot Kota Malang
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
              <button className="relative w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-md flex items-center justify-center hover:border-blue-500 transition">
                <FaBell className="text-slate-600" />

                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full" />
              </button>

              <img
                src="https://i.pravatar.cc/100?img=15"
                alt="admin"
                className="hidden md:block w-12 h-12 rounded-2xl border border-slate-100 shadow-md"
              />
            </div>
          </div>
        </nav>

        {/* ================= CONTENT ================= */}
        <section className="px-4 md:px-6 py-8 md:py-10">
          {/* HERO */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-5">
                <FaChartLine size={14} />
                Real-Time Monitoring System
              </div>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Admin
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  {" "}
                  Dashboard
                </span>
              </h1>

              <p className="text-slate-500 text-lg mt-4 max-w-2xl">
                Pantau performa sistem angkot, driver,
                rute, dan aktivitas penumpang secara
                real-time.
              </p>
            </div>

            {/* STATUS CARD */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-xl min-w-[300px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">
                    System Status
                  </p>

                  <h3 className="text-3xl font-bold mt-2 text-green-600">
                    Online
                  </h3>
                </div>

                <div className="w-16 h-16 rounded-3xl bg-green-100 text-green-600 flex items-center justify-center">
                  <FaCircleCheck size={28} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-sm text-green-600 font-medium">
                <FaArrowTrendUp />
                Semua layanan berjalan normal
              </div>
            </div>
          </div>

          {/* ================= STATS ================= */}
          <div className="grid sm:grid-cols-2 2xl:grid-cols-4 gap-6 mt-10">
            {[
              {
                title: "Total Rute",
                value: "12",
                desc: "+2 jalur baru bulan ini",
                icon: FaRoute,
                color:
                  "from-orange-500 to-yellow-400",
                bg: "bg-orange-100",
                text: "text-orange-600",
              },
              {
                title: "Total Driver",
                value: "84",
                desc: "72 driver aktif hari ini",
                icon: FaUsers,
                color:
                  "from-blue-600 to-cyan-500",
                bg: "bg-blue-100",
                text: "text-blue-600",
              },
              {
                title: "Tarif Aktif",
                value: "Rp5K",
                desc: "Tarif angkot saat ini",
                icon: FaMoneyBillWave,
                color:
                  "from-green-500 to-emerald-400",
                bg: "bg-green-100",
                text: "text-green-600",
              },
              {
                title: "Trayek Populer",
                value: "AG",
                desc: "Jalur paling aktif",
                icon: FaLocationDot,
                color:
                  "from-red-500 to-pink-400",
                bg: "bg-red-100",
                text: "text-red-600",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative overflow-hidden bg-white rounded-[32px] border border-slate-100 p-7 shadow-lg hover:-translate-y-2 transition-all duration-300"
              >
                <div
                  className={`absolute top-0 right-0 w-[180px] h-[180px] bg-gradient-to-br ${item.color} opacity-10 rounded-full blur-3xl`}
                />

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-slate-500">
                      {item.title}
                    </p>

                    <h3
                      className={`text-4xl font-bold mt-3 ${item.text}`}
                    >
                      {item.value}
                    </h3>
                  </div>

                  <div
                    className={`${item.bg} ${item.text} w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg`}
                  >
                    <item.icon size={28} />
                  </div>
                </div>

                <div className="relative mt-6 flex items-center gap-2 text-sm text-green-600 font-medium">
                  <FaArrowTrendUp size={14} />
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          {/* ================= MAIN GRID ================= */}
          <div className="grid xl:grid-cols-3 gap-8 mt-10">
            {/* LEFT */}
            <div className="xl:col-span-2 space-y-8">
              {/* OVERVIEW */}
              <section className="relative overflow-hidden bg-white rounded-[36px] border border-slate-100 p-8 shadow-xl">
                <div className="absolute top-0 right-0 w-[260px] h-[260px] bg-blue-100/40 rounded-full blur-3xl" />

                <div className="relative flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-3xl font-bold">
                      Overview Sistem
                    </h3>

                    <p className="text-slate-500 mt-2">
                      Ringkasan performa angkot
                    </p>
                  </div>

                  <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-lg">
                    <FaChartLine size={28} />
                  </div>
                </div>

                <div className="relative grid sm:grid-cols-3 gap-5 mt-8">
                  {[
                    {
                      title: "Driver Online",
                      value: "72",
                      color:
                        "from-blue-500 to-cyan-400",
                    },
                    {
                      title: "Angkot Aktif",
                      value: "58",
                      color:
                        "from-orange-500 to-yellow-400",
                    },
                    {
                      title: "Penumpang",
                      value: "1.2K",
                      color:
                        "from-green-500 to-emerald-400",
                    },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className={`bg-gradient-to-br ${card.color} rounded-[28px] p-6 text-white shadow-lg`}
                    >
                      <p className="text-white/80 text-sm">
                        {card.title}
                      </p>

                      <h4 className="text-4xl font-bold mt-3">
                        {card.value}
                      </h4>
                    </div>
                  ))}
                </div>
              </section>

              {/* ACTIVITY */}
              <section className="bg-white rounded-[36px] border border-slate-100 p-8 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-3xl font-bold">
                      Aktivitas Terbaru
                    </h3>

                    <p className="text-slate-500 mt-2">
                      Monitoring aktivitas sistem
                    </p>
                  </div>

                  <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
                    <FaClockRotateLeft size={26} />
                  </div>
                </div>

                <div className="mt-8 space-y-5">
                  {[
                    {
                      text: "Driver AG-12 berhasil diverifikasi",
                      color: "bg-green-500",
                    },
                    {
                      text: "Rute baru AL berhasil ditambahkan",
                      color: "bg-blue-500",
                    },
                    {
                      text: "Tarif diperbarui menjadi Rp5.000",
                      color: "bg-orange-500",
                    },
                    {
                      text: "Driver AH-07 diberhentikan",
                      color: "bg-red-500",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 bg-slate-50 rounded-[28px] p-5 hover:bg-slate-100 transition"
                    >
                      <div
                        className={`w-3 h-3 rounded-full mt-1.5 ${item.color}`}
                      />

                      <div>
                        <p className="font-semibold">
                          {item.text}
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          Baru saja diperbarui
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT */}
            <div className="space-y-8">
              {/* SETTING */}
              <section className="relative overflow-hidden bg-white rounded-[36px] border border-slate-100 p-8 shadow-xl">
                <div className="absolute bottom-0 left-0 w-[220px] h-[220px] bg-green-100/40 rounded-full blur-3xl" />

                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">
                      Setting Tarif
                    </h3>

                    <p className="text-slate-500 mt-2">
                      Atur tarif angkot aktif
                    </p>
                  </div>

                  <div className="w-16 h-16 rounded-3xl bg-green-100 text-green-600 flex items-center justify-center shadow-lg">
                    <FaMoneyBillWave size={26} />
                  </div>
                </div>

                <div className="relative mt-8">
                  <label className="text-sm font-semibold text-slate-600">
                    Tarif Saat Ini
                  </label>

                  <div className="mt-3 relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                      Rp
                    </span>

                    <input
                      type="number"
                      defaultValue="5000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition text-white py-4 rounded-2xl font-semibold shadow-xl shadow-blue-200">
                    Simpan Tarif
                  </button>
                </div>
              </section>

              {/* QUICK STATUS */}
              <section className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[36px] p-8 text-white shadow-2xl shadow-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">
                      Active Drivers
                    </p>

                    <h3 className="text-5xl font-bold mt-3">
                      72
                    </h3>
                  </div>

                  <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
                    <FaUserShield size={28} />
                  </div>
                </div>

                <div className="mt-8 h-3 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-[78%] h-full bg-white rounded-full" />
                </div>

                <div className="mt-3 text-sm text-blue-100">
                  78% driver sedang aktif hari ini
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}