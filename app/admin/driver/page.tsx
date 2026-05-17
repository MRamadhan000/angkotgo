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
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-[280px]
          bg-white border-r border-slate-200
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="h-[85px] border-b border-slate-200 px-6 flex items-center justify-between">
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

          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <div className="p-5 space-y-3">
          <a
            href="/admin"
            className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-700 hover:bg-slate-100 transition font-medium"
          >
            <LayoutDashboard size={22} />
            Dashboard
          </a>

          <a
            href="/admin/rute"
            className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-700 hover:bg-slate-100 transition font-medium"
          >
            <Route size={22} />
            Manajemen Rute
          </a>

          <a
            href="/admin/driver"
            className="flex items-center gap-4 bg-blue-600 text-white px-5 py-4 rounded-2xl font-semibold shadow-lg shadow-blue-200"
          >
            <Users size={22} />
            Manajemen Driver
          </a>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="lg:ml-[280px]">
        
        {/* ================= NAVBAR ================= */}
        <nav className="w-full h-[85px] border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between">
            
            {/* LEFT */}
            <div className="flex items-center gap-4">
              {/* MOBILE MENU */}
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={28} />
              </button>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  Manajemen Driver
                </h2>

                <p className="text-sm text-slate-500 hidden sm:block">
                  Monitoring driver angkot
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              
              {/* Search */}
              <div className="hidden md:flex items-center gap-3 bg-slate-100 px-4 py-3 rounded-2xl w-[240px]">
                <Search size={18} className="text-slate-400" />

                <input
                  type="text"
                  placeholder="Cari data..."
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>

              {/* Notification */}
              <button className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
                <Bell size={20} />
              </button>
            </div>
          </div>
        </nav>

        {/* ================= CONTENT ================= */}
        <section className="px-4 sm:px-6 py-6 sm:py-10">
          
          {/* Header */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Manajemen Driver
            </h2>

            <p className="text-slate-500 mt-2 text-base sm:text-lg">
              Verifikasi, monitoring, dan kelola status driver angkot
            </p>
          </div>

          {/* ================= STATS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
            
            {/* Total Driver */}
            <div className="bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                
                <div>
                  <p className="text-slate-500">
                    Total Driver
                  </p>

                  <h3 className="text-3xl font-bold mt-2 text-blue-600">
                    52
                  </h3>
                </div>

                <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl">
                  <Users size={28} />
                </div>
              </div>
            </div>

            {/* Verified */}
            <div className="bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                
                <div>
                  <p className="text-slate-500">
                    Terverifikasi
                  </p>

                  <h3 className="text-3xl font-bold mt-2 text-green-600">
                    40
                  </h3>
                </div>

                <div className="bg-green-100 text-green-600 p-4 rounded-2xl">
                  <ShieldCheck size={28} />
                </div>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                
                <div>
                  <p className="text-slate-500">
                    Pending
                  </p>

                  <h3 className="text-3xl font-bold mt-2 text-orange-600">
                    8
                  </h3>
                </div>

                <div className="bg-orange-100 text-orange-600 p-4 rounded-2xl">
                  <Clock3 size={28} />
                </div>
              </div>
            </div>

            {/* Nonaktif */}
            <div className="bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                
                <div>
                  <p className="text-slate-500">
                    Diberhentikan
                  </p>

                  <h3 className="text-3xl font-bold mt-2 text-red-600">
                    4
                  </h3>
                </div>

                <div className="bg-red-100 text-red-600 p-4 rounded-2xl">
                  <ShieldX size={28} />
                </div>
              </div>
            </div>
          </div>

          {/* ================= FILTER ================= */}
          <div className="mt-10 flex flex-wrap gap-4">
            
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
                  px-5 sm:px-6 py-3 rounded-2xl font-semibold transition text-sm sm:text-base
                  ${
                    selectedStatus === status
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-blue-400"
                  }
                `}
              >
                {status}
              </button>
            ))}
          </div>

          {/* ================= DRIVER TABLE ================= */}
          <section className="mt-10 bg-white rounded-[36px] border border-slate-100 p-4 sm:p-8 shadow-sm">
            
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold">
                  Data Driver
                </h3>

                <p className="text-slate-500 mt-2">
                  Monitoring dan verifikasi akun driver
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-10">
              <table className="w-full min-w-[1100px]">
                
                <thead>
                  <tr className="border-b border-slate-200">
                    
                    <th className="text-left pb-5 text-slate-500 font-semibold">
                      Driver
                    </th>

                    <th className="text-left pb-5 text-slate-500 font-semibold">
                      Kontak
                    </th>

                    <th className="text-left pb-5 text-slate-500 font-semibold">
                      Jalur
                    </th>

                    <th className="text-left pb-5 text-slate-500 font-semibold">
                      Kendaraan
                    </th>

                    <th className="text-left pb-5 text-slate-500 font-semibold">
                      Status
                    </th>

                    <th className="text-left pb-5 text-slate-500 font-semibold">
                      Verifikasi
                    </th>

                    <th className="text-center pb-5 text-slate-500 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  
                  {drivers.map((driver, i) => (
                    <tr key={i}>
                      
                      {/* Driver */}
                      <td className="py-6">
                        <div className="flex items-center gap-4">
                          
                          <img
                            src={`https://i.pravatar.cc/150?img=${i + 10}`}
                            className="w-14 h-14 rounded-2xl object-cover"
                          />

                          <div>
                            <h4 className="font-bold text-lg">
                              {driver.name}
                            </h4>

                            <p className="text-sm text-slate-500">
                              Driver Angkot
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Kontak */}
                      <td className="py-6">
                        <div className="space-y-2">
                          
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone size={16} />
                            {driver.phone}
                          </div>

                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPinned size={16} />
                            Malang
                          </div>
                        </div>
                      </td>

                      {/* Jalur */}
                      <td className="py-6">
                        <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
                          {driver.route}
                        </span>
                      </td>

                      {/* Kendaraan */}
                      <td className="py-6">
                        <div className="flex items-center gap-3">
                          
                          <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl">
                            <Car size={18} />
                          </div>

                          <div>
                            <h5 className="font-semibold">
                              {driver.plate}
                            </h5>

                            <p className="text-sm text-slate-500">
                              Angkot Aktif
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-6">
                        <span
                          className={`
                            px-4 py-2 rounded-full text-sm font-semibold
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
                      <td className="py-6">
                        <span
                          className={`
                            px-4 py-2 rounded-full text-sm font-semibold
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
                      <td className="py-6">
                        <div className="flex items-center justify-center gap-3">
                          
                          <button className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition">
                            <Eye size={18} />
                          </button>

                          <button className="w-11 h-11 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition">
                            <CheckCircle2 size={18} />
                          </button>

                          <button className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition">
                            <XCircle size={18} />
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