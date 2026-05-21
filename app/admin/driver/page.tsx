"use client";

import { useState } from "react";

import {
  Bus,
  Search,
  Bell,
  Menu,
  Users,
  ShieldCheck,
  ShieldX,
  Eye,
  CheckCircle2,
  XCircle,
  Clock3,
  Phone,
  MapPinned,
  Car,
  X,
  LayoutDashboard,
  Route,
} from "lucide-react";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function DriverManagementPage() {
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const drivers = [
    {
      name: "Budi Santoso",
      phone: "081234567890",
      route: "AG",
      plate: "N 1234 AB",
      status: "Aktif",
      verification: "Terverifikasi",
    },
    {
      name: "Andi Saputra",
      phone: "081298765432",
      route: "AH",
      plate: "N 4321 CD",
      status: "Pending",
      verification: "Belum Verifikasi",
    },
    {
      name: "Rahmat Hidayat",
      phone: "081277788899",
      route: "LDG",
      plate: "N 9988 EF",
      status: "Nonaktif",
      verification: "Diberhentikan",
    },
  ];

  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#F5F9FF] text-slate-900`}
    >
      {/* ================= OVERLAY ================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-gradient-to-b from-blue-50 to-white border-r border-slate-200
          transition-transform duration-300 md:hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="h-20 border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2.5 rounded-xl shadow-lg">
              <Bus size={20} />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-blue-700">
                AngkotTrack
              </h1>

              <p className="text-xs text-slate-500">
                Admin
              </p>
            </div>
          </div>

          <button
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <div className="p-4 space-y-2">
          <a
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition font-medium text-sm"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </a>

          <a
            href="/admin/rute"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition font-medium text-sm"
          >
            <Route size={18} />
            <span>Manajemen Rute</span>
          </a>

          <a
            href="/admin/driver"
            className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold shadow-lg shadow-blue-200/50 text-sm"
          >
            <Users size={18} />
            <span>Manajemen Driver</span>
          </a>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div>
        
        {/* ================= NAVBAR ================= */}
        <nav className="sticky top-0 z-30 h-[85px] border-b border-white/30 bg-white/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <Menu size={22} />
              </button>

              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
                <Bus size={22} />
              </div>

              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  AngkotTrack
                </h1>

                <p className="text-xs md:text-sm text-slate-500">
                  Admin Dashboard
                </p>
              </div>
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="/admin" className="hover:text-blue-600 transition">
                Dashboard
              </a>

              <a href="/admin/rute" className="hover:text-blue-600 transition">
                Manajemen Rute
              </a>

              <a href="/admin/driver" className="text-blue-600 font-semibold">
                Manajemen Driver
              </a>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden lg:flex items-center gap-3 bg-slate-100 px-4 py-2.5 rounded-lg">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari driver..."
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>

              {/* Notification */}
              <button className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
                <Bell size={18} />
              </button>
            </div>
          </div>
        </nav>

        {/* ================= CONTENT ================= */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 sm:py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Manajemen Driver
            </h2>

            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              Verifikasi dan kelola status driver angkot
            </p>
          </div>

          {/* ================= STATS ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {/* Total Driver */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Total Driver
                  </p>

                  <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-blue-600">
                    52
                  </h3>
                </div>

                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg flex-shrink-0">
                  <Users size={20} />
                </div>
              </div>
            </div>

            {/* Verified */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Terverifikasi
                  </p>

                  <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-green-600">
                    40
                  </h3>
                </div>

                <div className="bg-green-100 text-green-600 p-3 rounded-lg flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Pending
                  </p>

                  <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-orange-600">
                    8
                  </h3>
                </div>

                <div className="bg-orange-100 text-orange-600 p-3 rounded-lg flex-shrink-0">
                  <Clock3 size={20} />
                </div>
              </div>
            </div>

            {/* Nonaktif */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Diberhentikan
                  </p>

                  <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-red-600">
                    4
                  </h3>
                </div>

                <div className="bg-red-100 text-red-600 p-3 rounded-lg flex-shrink-0">
                  <ShieldX size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* ================= FILTER ================= */}
          <div className="mb-8 flex flex-wrap gap-2 sm:gap-3">
            
            {[
              "Semua",
              "Terverifikasi",
              "Pending",
              "Diberhentikan",
            ].map((status, i) => (
              <button
                key={i}
                onClick={() => setSelectedStatus(status)}
                className={`
                  px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold transition text-xs sm:text-sm
                  ${
                    selectedStatus === status
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200/50"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                  }
                `}
              >
                {status}
              </button>
            ))}
          </div>

          {/* ================= DRIVER TABLE ================= */}
          <section className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-8 shadow-sm">
            
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold">
                  Data Driver
                </h3>

                <p className="text-slate-500 mt-2 text-sm">
                  Monitoring dan verifikasi akun driver
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[900px]">
                
                <thead>
                  <tr className="border-b border-slate-200">
                    
                    <th className="text-left py-4 px-4 text-slate-500 font-semibold text-sm">
                      Driver
                    </th>

                    <th className="text-left py-4 px-4 text-slate-500 font-semibold text-sm">
                      Kontak
                    </th>

                    <th className="text-left py-4 px-4 text-slate-500 font-semibold text-sm">
                      Jalur
                    </th>

                    <th className="text-left py-4 px-4 text-slate-500 font-semibold text-sm">
                      Status
                    </th>

                    <th className="text-left py-4 px-4 text-slate-500 font-semibold text-sm">
                      Verifikasi
                    </th>

                    <th className="text-center py-4 px-4 text-slate-500 font-semibold text-sm">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  
                  {drivers.map((driver, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      
                      {/* Driver */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          
                          <img
                            src={`https://i.pravatar.cc/150?img=${i + 10}`}
                            className="w-10 h-10 rounded-lg object-cover"
                          />

                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm truncate">
                              {driver.name}
                            </h4>

                            <p className="text-xs text-slate-500">
                              Driver
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Kontak */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <Phone size={14} className="flex-shrink-0" />
                            <span className="truncate">{driver.phone}</span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-600 text-xs">
                            <MapPinned size={12} className="flex-shrink-0" />
                            Malang
                          </div>
                        </div>
                      </td>

                      {/* Jalur */}
                      <td className="py-4 px-4">
                        <span className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md text-xs font-semibold">
                          {driver.route}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`
                            px-3 py-1.5 rounded-md text-xs font-semibold
                            ${
                              driver.status === "Aktif"
                                ? "bg-green-100 text-green-600"
                                : driver.status === "Pending"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-red-100 text-red-600"
                            }
                          `}
                        >
                          {driver.status}
                        </span>
                      </td>

                      {/* Verification */}
                      <td className="py-4 px-4">
                        <span
                          className={`
                            px-3 py-1.5 rounded-md text-xs font-semibold
                            ${
                              driver.verification === "Terverifikasi"
                                ? "bg-green-100 text-green-600"
                                : driver.verification === "Belum Verifikasi"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                            }
                          `}
                        >
                          {driver.verification}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          
                          <button className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition">
                            <Eye size={16} />
                          </button>

                          <button className="w-9 h-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition">
                            <CheckCircle2 size={16} />
                          </button>

                          <button className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition">
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}