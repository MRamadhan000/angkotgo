"use client";

import {
  Bus,
  Route,
  Users,
  CircleDollarSign,
  Bell,
  Menu,
  Search,
  TrendingUp,
  ArrowUpRight,
  MapPinned,
} from "lucide-react";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function AdminDashboardPage() {
  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#F5F9FF] text-slate-900`}
    >
      {/* ================= NAVBAR ================= */}
      <nav className="w-full h-[85px] border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
              <Bus size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-blue-700">
                AngkotTrack
              </h1>

              <p className="text-sm text-slate-500">
                Admin Dashboard
              </p>
            </div>
          </div>

          {/* MENU */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="/admin"
              className="text-blue-600 font-semibold"
            >
              Dashboard
            </a>

            <a
              href="/admin/rute"
              className="text-slate-600 hover:text-blue-600 transition"
            >
              Manajemen Rute
            </a>

            <a
              href="/admin/driver"
              className="text-slate-600 hover:text-blue-600 transition"
            >
              Manajemen Driver
            </a>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            
            {/* Search */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-100 px-4 py-3 rounded-2xl w-[260px]">
              <Search size={18} className="text-slate-400" />

              <input
                type="text"
                placeholder="Cari data..."
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>

            {/* Notification */}
            <button className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
              <Bell size={20} />
            </button>

            {/* Mobile */}
            <button className="md:hidden">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-5">
          
          <div>
            <h2 className="text-4xl font-bold">
              Dashboard Admin
            </h2>

            <p className="text-slate-500 mt-2 text-lg">
              Monitoring sistem angkot Kota Malang secara real-time
            </p>
          </div>

          {/* Badge */}
          <div className="bg-blue-600 text-white px-6 py-4 rounded-3xl shadow-lg shadow-blue-200 flex items-center gap-3">
            <TrendingUp size={22} />

            <div>
              <p className="text-sm text-blue-100">
                Sistem Aktif
              </p>

              <h4 className="font-bold">
                Monitoring Online
              </h4>
            </div>
          </div>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
          
          {/* Total Route */}
          <div className="bg-white rounded-[32px] p-7 border border-slate-100 shadow-sm hover:-translate-y-1 transition">
            
            <div className="flex items-center justify-between">
              
              <div>
                <p className="text-slate-500">
                  Total Rute
                </p>

                <h3 className="text-4xl font-bold mt-3 text-orange-600">
                  12
                </h3>
              </div>

              <div className="bg-orange-100 text-orange-600 p-4 rounded-2xl">
                <Route size={30} />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-green-600 font-medium">
              <ArrowUpRight size={16} />
              +2 jalur baru bulan ini
            </div>
          </div>

          {/* Total Driver */}
          <div className="bg-white rounded-[32px] p-7 border border-slate-100 shadow-sm hover:-translate-y-1 transition">
            
            <div className="flex items-center justify-between">
              
              <div>
                <p className="text-slate-500">
                  Total Driver
                </p>

                <h3 className="text-4xl font-bold mt-3 text-blue-600">
                  84
                </h3>
              </div>

              <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl">
                <Users size={30} />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-green-600 font-medium">
              <ArrowUpRight size={16} />
              72 driver aktif hari ini
            </div>
          </div>

          {/* Tarif */}
          <div className="bg-white rounded-[32px] p-7 border border-slate-100 shadow-sm hover:-translate-y-1 transition">
            
            <div className="flex items-center justify-between">
              
              <div>
                <p className="text-slate-500">
                  Tarif Angkot
                </p>

                <h3 className="text-4xl font-bold mt-3 text-green-600">
                  Rp5K
                </h3>
              </div>

              <div className="bg-green-100 text-green-600 p-4 rounded-2xl">
                <CircleDollarSign size={30} />
              </div>
            </div>

            <div className="mt-6 text-sm text-slate-500">
              Tarif aktif saat ini
            </div>
          </div>

          {/* Trayek Aktif */}
          <div className="bg-white rounded-[32px] p-7 border border-slate-100 shadow-sm hover:-translate-y-1 transition">
            
            <div className="flex items-center justify-between">
              
              <div>
                <p className="text-slate-500">
                  Trayek Populer
                </p>

                <h3 className="text-4xl font-bold mt-3 text-red-600">
                  AG
                </h3>
              </div>

              <div className="bg-red-100 text-red-600 p-4 rounded-2xl">
                <MapPinned size={30} />
              </div>
            </div>

            <div className="mt-6 text-sm text-slate-500">
              Jalur paling aktif hari ini
            </div>
          </div>
        </div>

        {/* ================= MAIN SECTION ================= */}
        <div className="grid xl:grid-cols-3 gap-8 mt-10">
          
          {/* ================= LEFT ================= */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Overview */}
            <section className="bg-white rounded-[36px] border border-slate-100 p-8 shadow-sm">
              
              <div className="flex items-center justify-between flex-wrap gap-4">
                
                <div>
                  <h3 className="text-3xl font-bold">
                    Overview Sistem
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Ringkasan performa angkot Kota Malang
                  </p>
                </div>

                <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl">
                  <TrendingUp size={28} />
                </div>
              </div>

              {/* Cards */}
              <div className="grid md:grid-cols-3 gap-5 mt-8">
                
                <div className="bg-blue-50 rounded-3xl p-6">
                  <p className="text-slate-500 text-sm">
                    Driver Online
                  </p>

                  <h4 className="text-3xl font-bold mt-3 text-blue-600">
                    72
                  </h4>
                </div>

                <div className="bg-orange-50 rounded-3xl p-6">
                  <p className="text-slate-500 text-sm">
                    Angkot Beroperasi
                  </p>

                  <h4 className="text-3xl font-bold mt-3 text-orange-600">
                    58
                  </h4>
                </div>

                <div className="bg-green-50 rounded-3xl p-6">
                  <p className="text-slate-500 text-sm">
                    Penumpang Hari Ini
                  </p>

                  <h4 className="text-3xl font-bold mt-3 text-green-600">
                    1.2K
                  </h4>
                </div>
              </div>
            </section>

            {/* Activity */}
            <section className="bg-white rounded-[36px] border border-slate-100 p-8 shadow-sm">
              
              <div className="flex items-center justify-between">
                
                <div>
                  <h3 className="text-3xl font-bold">
                    Aktivitas Terbaru
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Monitoring aktivitas driver dan rute
                  </p>
                </div>

                <div className="bg-slate-100 p-4 rounded-2xl">
                  <Bus size={28} />
                </div>
              </div>

              <div className="mt-8 space-y-5">
                
                {[
                  "Driver AG-12 berhasil diverifikasi",
                  "Rute baru AL berhasil ditambahkan",
                  "Tarif angkot diperbarui menjadi Rp5.000",
                  "Driver AH-07 diberhentikan",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-slate-50 rounded-2xl p-5"
                  >
                    <div className="w-3 h-3 rounded-full bg-blue-600" />

                    <p className="font-medium">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="space-y-8">
            
            {/* Tarif */}
            <section className="bg-white rounded-[36px] border border-slate-100 p-8 shadow-sm">
              
              <div className="flex items-center justify-between">
                
                <div>
                  <h3 className="text-2xl font-bold">
                    Setting Tarif
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Atur tarif angkot aktif
                  </p>
                </div>

                <div className="bg-green-100 text-green-600 p-4 rounded-2xl">
                  <CircleDollarSign size={28} />
                </div>
              </div>

              <div className="mt-8">
                
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
                    className="w-full border border-slate-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500"
                  />
                </div>

                <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-200">
                  Simpan Tarif
                </button>
              </div>
            </section>

            {/* Quick Navigation */}
            <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-[36px] p-8 shadow-xl shadow-blue-200">
              
              <h3 className="text-2xl font-bold">
                Quick Access
              </h3>

              <p className="text-blue-100 mt-2">
                Kelola sistem lebih cepat
              </p>

              <div className="mt-8 space-y-4">
                
                <a
                  href="/rute"
                  className="flex items-center justify-between bg-white/10 hover:bg-white/20 transition rounded-2xl px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <Route size={22} />

                    <span className="font-semibold">
                      Manajemen Rute
                    </span>
                  </div>

                  <ArrowUpRight size={20} />
                </a>

                <a
                  href="/driver"
                  className="flex items-center justify-between bg-white/10 hover:bg-white/20 transition rounded-2xl px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <Users size={22} />

                    <span className="font-semibold">
                      Manajemen Driver
                    </span>
                  </div>

                  <ArrowUpRight size={20} />
                </a>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}