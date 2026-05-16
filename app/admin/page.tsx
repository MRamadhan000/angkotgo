"use client";

import { useState } from "react";

import {
  Bus,
  DollarSign,
  Route,
  Plus,
  Save,
  Search,
  Bell,
  Menu,
  MapPinned,
  ArrowRightLeft,
  CircleDollarSign,
  X,
} from "lucide-react";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function AdminDashboardPage() {
  const [tarif, setTarif] = useState("4000");
  const [openModal, setOpenModal] = useState(false);

  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#F5F9FF] text-slate-900`}
    >
      {/* ================= NAVBAR ================= */}
      <nav className="w-full h-[85px] border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          
          {/* Logo */}
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

          {/* Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button className="text-blue-600 font-semibold">
              Dashboard
            </button>

            <button className="text-slate-600 hover:text-blue-600 transition">
              Manajemen Harga
            </button>

            <button className="text-slate-600 hover:text-blue-600 transition">
              Manajemen Rute
            </button>
          </div>

          {/* Right */}
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
            <button className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
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
        
        {/* Header */}
        <div>
          <h2 className="text-4xl font-bold">
            Dashboard Admin
          </h2>

          <p className="text-slate-500 mt-2 text-lg">
            Kelola tarif angkot dan manajemen trayek secara real-time
          </p>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
          
          {/* Tarif */}
          <div className="bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              
              <div>
                <p className="text-slate-500">
                  Tarif Angkot
                </p>

                <h3 className="text-3xl font-bold mt-2 text-blue-600">
                  Rp 4K
                </h3>
              </div>

              <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl">
                <DollarSign size={28} />
              </div>
            </div>
          </div>

          {/* Total Jalur */}
          <div className="bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              
              <div>
                <p className="text-slate-500">
                  Total Jalur
                </p>

                <h3 className="text-3xl font-bold mt-2 text-orange-600">
                  12
                </h3>
              </div>

              <div className="bg-orange-100 text-orange-600 p-4 rounded-2xl">
                <Route size={28} />
              </div>
            </div>
          </div>

          {/* Trayek Aktif */}
          <div className="bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              
              <div>
                <p className="text-slate-500">
                  Trayek Populer
                </p>

                <h3 className="text-3xl font-bold mt-2 text-red-600">
                  AG
                </h3>
              </div>

              <div className="bg-red-100 text-red-600 p-4 rounded-2xl">
                <MapPinned size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* ================= MANAGEMENT SECTION ================= */}
        <div className="grid xl:grid-cols-2 gap-8 mt-10">
          
          {/* ================= MANAJEMEN HARGA ================= */}
          <section className="bg-white rounded-[36px] border border-slate-100 p-8 shadow-sm">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              
              <div>
                <h3 className="text-3xl font-bold">
                  Manajemen Harga
                </h3>

                <p className="text-slate-500 mt-2">
                  Input dan update tarif angkot
                </p>
              </div>

              <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl">
                <CircleDollarSign size={30} />
              </div>
            </div>

            {/* Form */}
            <div className="mt-10 space-y-6">
              
              {/* Tarif */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Tarif Angkot
                </label>

                <div className="mt-3 relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    Rp
                  </span>

                  <input
                    type="number"
                    value={tarif}
                    onChange={(e) =>
                      setTarif(e.target.value)
                    }
                    className="w-full border border-slate-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Button */}
              <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg shadow-blue-200">
                <Save size={20} />
                Simpan Tarif
              </button>
            </div>
          </section>

          {/* ================= MANAJEMEN RUTE ================= */}
          <section className="bg-white rounded-[36px] border border-slate-100 p-8 shadow-sm">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              
              <div>
                <h3 className="text-3xl font-bold">
                  Manajemen Rute
                </h3>

                <p className="text-slate-500 mt-2">
                  Tambahkan trayek dan jalur angkot
                </p>
              </div>

              <div className="bg-orange-100 text-orange-600 p-4 rounded-2xl">
                <Route size={30} />
              </div>
            </div>

            {/* Content */}
            <div className="mt-10">
              
              <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-[30px] p-8">
                
                <h4 className="text-2xl font-bold">
                  Tambah Jalur Baru
                </h4>

                <p className="text-slate-500 mt-2">
                  Klik tombol di bawah untuk menambahkan trayek baru
                </p>

                <button
                  onClick={() => setOpenModal(true)}
                  className="mt-8 w-full bg-orange-500 hover:bg-orange-600 transition text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg shadow-orange-200"
                >
                  <Plus size={20} />
                  Tambahkan Rute
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ================= TABLE ROUTES ================= */}
        <section className="mt-10 bg-white rounded-[36px] border border-slate-100 p-8 shadow-sm">
          
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            
            <div>
              <h3 className="text-3xl font-bold">
                Daftar Jalur Angkot
              </h3>

              <p className="text-slate-500 mt-2">
                Monitoring jalur dan trayek aktif
              </p>
            </div>

            <button
              onClick={() => setOpenModal(true)}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-3 shadow-lg shadow-blue-200"
            >
              <Plus size={20} />
              Tambah Jalur
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-8">
            <table className="w-full min-w-[700px]">
              
              <thead>
                <tr className="text-left border-b border-slate-200">
                  <th className="pb-5 text-slate-500 font-semibold">
                    Jalur
                  </th>

                  <th className="pb-5 text-slate-500 font-semibold">
                    Trayek
                  </th>

                  <th className="pb-5 text-slate-500 font-semibold">
                    Start
                  </th>

                  <th className="pb-5 text-slate-500 font-semibold">
                    End
                  </th>

                  <th className="pb-5 text-slate-500 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                
                {[
                  {
                    jalur: "AG",
                    trayek: "Arjosari - Gadang",
                    start: "Arjosari",
                    end: "Gadang",
                    status: "Aktif",
                  },
                  {
                    jalur: "AH",
                    trayek: "Arjosari - Hamid Rusdi",
                    start: "Arjosari",
                    end: "Hamid Rusdi",
                    status: "Aktif",
                  },
                  {
                    jalur: "LDG",
                    trayek: "Landungsari - Dinoyo - Gadang",
                    start: "Landungsari",
                    end: "Gadang",
                    status: "Aktif",
                  },
                ].map((route, i) => (
                  <tr key={i}>
                    
                    <td className="py-6 font-bold text-blue-600">
                      {route.jalur}
                    </td>

                    <td className="py-6">
                      {route.trayek}
                    </td>

                    <td className="py-6 text-slate-600">
                      {route.start}
                    </td>

                    <td className="py-6 text-slate-600">
                      {route.end}
                    </td>

                    <td className="py-6">
                      <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-semibold">
                        {route.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {/* ================= MODAL ================= */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center px-6">
          
          <div className="w-full max-w-2xl bg-white rounded-[36px] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            {/* Close */}
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-5 right-5 w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div>
              <h3 className="text-3xl font-bold">
                Tambahkan Jalur Baru
              </h3>

              <p className="text-slate-500 mt-2">
                Input data trayek dan jalur angkot
              </p>
            </div>

            {/* Form */}
            <div className="mt-10 space-y-6">
              
              {/* Jenis Jalur */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Jenis Jalur
                </label>

                <input
                  type="text"
                  placeholder="Contoh: AG"
                  className="mt-3 w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500"
                />
              </div>

              {/* Trayek */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Trayek
                </label>

                <input
                  type="text"
                  placeholder="Contoh: Arjosari - Gadang"
                  className="mt-3 w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500"
                />
              </div>

              {/* Start & End */}
              <div className="grid md:grid-cols-2 gap-5">
                
                {/* Start */}
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    Start Point
                  </label>

                  <div className="relative mt-3">
                    <MapPinned
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="Arjosari"
                      className="w-full border border-slate-200 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* End */}
                <div>
                  <label className="text-sm font-semibold text-slate-600">
                    End Point
                  </label>

                  <div className="relative mt-3">
                    <ArrowRightLeft
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="Gadang"
                      className="w-full border border-slate-200 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Button */}
              <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 transition text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg shadow-orange-200">
                <Plus size={20} />
                Simpan Jalur
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}