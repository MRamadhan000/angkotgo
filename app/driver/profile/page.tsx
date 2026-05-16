"use client";

import { useState } from "react";


import Link from "next/link";
import {
  Bus,
  Camera,
  ChevronDown,
  Mail,
  MapPin,
  Menu,
  Phone,
  Save,
  User,
} from "lucide-react";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function DriverProfilePage() {
  const [selectedRoute, setSelectedRoute] = useState("AG");

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
                Driver Dashboard
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/driver" className="text-slate-600 hover:text-blue-600 transition">
              Dashboard
            </Link>

            <button className="text-blue-600 font-semibold">
              Profile
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-slate-100 rounded-2xl px-3 py-2">
              <img
                src="https://i.pravatar.cc/100?img=12"
                alt="profile"
                className="w-10 h-10 rounded-xl object-cover"
              />

              <div>
                <h4 className="font-semibold text-sm">
                  Budi Santoso
                </h4>

                <p className="text-xs text-slate-500">
                  Driver AG
                </p>
              </div>
            </div>

            <button className="md:hidden">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      <section className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-4xl font-bold">
            Profile & Kendaraan
          </h2>

          <p className="text-slate-500 mt-2 text-lg">
            Kelola informasi driver dan data angkot
          </p>
        </div>

        {/* ================= PROFILE SECTION ================= */}
        <div className="bg-white rounded-[36px] border border-slate-100 p-8 lg:p-10 shadow-sm">
          
          {/* Title */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold">
                Informasi Driver
              </h3>

              <p className="text-slate-500 mt-1">
                Lengkapi data profile driver
              </p>
            </div>

            <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl">
              <User size={28} />
            </div>
          </div>

          {/* Content */}
          <div className="grid lg:grid-cols-[320px_1fr] gap-10 mt-10">
            
            {/* Photo */}
            <div className="flex flex-col items-center">
              
              <div className="relative">
                <img
                  src="https://i.pravatar.cc/300?img=12"
                  alt="driver"
                  className="w-[220px] h-[220px] rounded-[32px] object-cover border-4 border-blue-100"
                />

                <button className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
                  <Camera size={20} />
                </button>
              </div>

              <button className="mt-6 border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition px-6 py-3 rounded-2xl font-medium">
                Upload Foto
              </button>
            </div>

            {/* Form */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Nama */}
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-600">
                  Nama Lengkap
                </label>

                <div className="mt-2 relative">
                  <User
                    size={18}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    className="w-full border border-slate-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Email
                </label>

                <div className="mt-2 relative">
                  <Mail
                    size={18}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    placeholder="Masukkan email"
                    className="w-full border border-slate-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Nomor Telepon
                </label>

                <div className="mt-2 relative">
                  <Phone
                    size={18}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    className="w-full border border-slate-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-600">
                  Alamat
                </label>

                <div className="mt-2 relative">
                  <MapPin
                    size={18}
                    className="absolute left-5 top-5 text-slate-400"
                  />

                  <textarea
                    rows={4}
                    placeholder="Masukkan alamat lengkap"
                    className="w-full border border-slate-200 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= VEHICLE SECTION ================= */}
        <div className="bg-white rounded-[36px] border border-slate-100 p-8 lg:p-10 shadow-sm">
          
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-bold">
                Profile Angkot
              </h3>

              <p className="text-slate-500 mt-1">
                Lengkapi informasi kendaraan angkot
              </p>
            </div>

            <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl">
              <Bus size={28} />
            </div>
          </div>

          {/* Content */}
          <div className="grid lg:grid-cols-[320px_1fr] gap-10 mt-10">
            
            {/* Vehicle Image */}
            <div className="flex flex-col items-center">
              
              <div className="relative bg-blue-50 rounded-[32px] w-[260px] h-[220px] flex items-center justify-center border border-blue-100">
                <Bus
                  size={100}
                  className="text-blue-600"
                />

                <button className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
                  <Camera size={20} />
                </button>
              </div>

              <button className="mt-6 border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition px-6 py-3 rounded-2xl font-medium">
                Upload Foto Angkot
              </button>
            </div>

            {/* Vehicle Form */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Plate */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Plat Nomor
                </label>

                <input
                  type="text"
                  placeholder="N 1234 AB"
                  className="mt-2 w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500"
                />
              </div>

              {/* Color */}
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Warna Angkot
                </label>

                <input
                  type="text"
                  placeholder="Biru"
                  className="mt-2 w-full border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500"
                />
              </div>

              {/* Route */}
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-600">
                  Pilih Jalur
                </label>

                {/* Fake Select */}
                <button
                  onClick={() =>
                    setSelectedRoute(
                      selectedRoute === "AG" ? "AH" : "AG"
                    )
                  }
                  className="mt-2 w-full border border-slate-200 rounded-2xl px-5 py-4 flex items-center justify-between hover:border-blue-500 transition"
                >
                  <div className="text-left">
                    <p className="font-semibold">
                      Jalur {selectedRoute}
                    </p>

                    <p className="text-sm text-slate-500">
                      {selectedRoute === "AG"
                        ? "Arjosari - Gadang"
                        : "Arjosari - Hamid Rusdi"}
                    </p>
                  </div>

                  <ChevronDown className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="mt-10 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 shadow-lg shadow-blue-200">
              <Save size={20} />
              Simpan Perubahan
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}