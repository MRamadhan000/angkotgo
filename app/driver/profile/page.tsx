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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  
  // Form Data State
  const [formData, setFormData] = useState({
    name: "Budi Santoso",
    email: "budi.santoso@angkotgo.com",
    phone: "081234567890",
    address: "Jl. Arjosari No. 123, Malang",
    platNomor: "N 1111 AG",
    warnaAngkot: "Biru",
    route: "AG",
  });
  
  const [selectedRoute, setSelectedRoute] = useState("AG");
  const [tempSelectedRoute, setTempSelectedRoute] = useState("AG");
  const [hasChanges, setHasChanges] = useState(false);

  const routes = [
    { id: "AG", name: "Jalur AG", description: "Arjosari - Gadang" },
    { id: "AH", name: "Jalur AH", description: "Arjosari - Hamid Rusdi" },
    { id: "BC", name: "Jalur BC", description: "Batu - Cimahi" },
    { id: "DE", name: "Jalur DE", description: "Dago - Ende" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    setFormData(prev => ({ ...prev, route: selectedRoute }));
    setHasChanges(false);
    // Here you would typically send data to backend
    console.log('Changes saved:', formData);
  };
 
  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#F4F8FF] text-slate-900 overflow-hidden`}
    >
      {/* ================= BACKGROUND ================= */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-100/50 via-cyan-50 to-transparent blur-3xl -z-10" />

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
            <Link
              href="/driver"
              className="hover:text-blue-600 transition"
            >
              Dashboard
            </Link>

            <Link
              href="/driver/profile"
              className="text-blue-600 font-semibold"
            >
              Profile
            </Link>
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

      {/* ================= MOBILE SIDEBAR ================= */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300 ${
          sidebarOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-[290px] bg-white/90 backdrop-blur-2xl z-50 shadow-2xl transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
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
                <h2 className="font-bold text-lg">
                  AngkotTrack
                </h2>

                <p className="text-xs text-slate-500">
                  Driver Menu
                </p>
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
                <h3 className="font-bold">
                  Budi Santoso
                </h3>

                <p className="text-sm text-blue-100">
                  Driver AG
                </p>
              </div>
            </div>
          </div>

          {/* MENU */}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/driver"
              className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-slate-100 transition"
            >
              <FaRoute />
              Dashboard
            </Link>

            <Link
              href="/driver/profile"
              className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-blue-50 text-blue-600 font-semibold"
            >
              <FaUser />
              Profile
            </Link>
          </div>

          {/* ACTIVE ROUTE */}
          <div className="mt-10 bg-slate-50 rounded-3xl p-5 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center">
                <FaRoute />
              </div>

              <div>
                <h4 className="font-bold">
                  Active Route
                </h4>

                <p className="text-sm text-slate-500">
                  Arjosari - Gadang
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= CONTENT ================= */}
      <section className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 space-y-8 sm:space-y-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Driver Profile
            </h2>

            <p className="text-slate-500 text-xs sm:text-sm md:text-base lg:text-lg mt-2 sm:mt-3">
              Kelola informasi driver dan kendaraan angkot secara modern.
            </p>
          </div>

          {hasChanges && (
            <button onClick={handleSaveChanges} className="flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:scale-[1.02] transition text-xs sm:text-sm whitespace-nowrap">
              <FaSave />
              Save Changes
            </button>
          )}
        </div>

        {/* ================= PROFILE CARD ================= */}
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl sm:rounded-[36px] p-5 sm:p-6 md:p-8 lg:p-10 shadow-xl">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-100/40 rounded-full blur-3xl" />

          {/* HEADER */}
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-3 sm:gap-4">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                Driver Information
              </h3>

              <p className="text-slate-500 text-xs sm:text-xs md:text-sm lg:text-base mt-1 sm:mt-2">
                Lengkapi data profile driver anda
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg">
              <FaUser size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* CONTENT */}
          <div className="relative grid lg:grid-cols-[320px_1fr] gap-6 sm:gap-8 md:gap-12 mt-6 sm:mt-8 md:mt-12">
            {/* PHOTO */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl sm:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition" />

                <img
                  src="https://i.pravatar.cc/300?img=12"
                  alt="driver"
                  className="relative w-[180px] sm:w-[240px] h-[180px] sm:h-[240px] rounded-xl sm:rounded-[36px] object-cover border-4 sm:border-[6px] border-white shadow-2xl"
                />

                <button className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-2 sm:p-4 rounded-lg sm:rounded-2xl shadow-lg">
                  <FaCamera size={14} className="sm:w-4.5 sm:h-4.5" />
                </button>
              </div>

              <button className="mt-5 sm:mt-8 px-5 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:text-blue-600 transition font-medium text-sm sm:text-base">
                Upload Photo
              </button>
            </div>

            {/* FORM */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {/* NAME */}
              <div className="md:col-span-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-600">
                  Nama Lengkap
                </label>

                <div className="relative mt-2 sm:mt-3">
                  <FaUser className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl pl-10 sm:pl-14 pr-3 sm:pr-5 py-2.5 sm:py-4 text-sm sm:text-base outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-600">
                  Email
                </label>

                <div className="relative mt-2 sm:mt-3">
                  <FaEnvelope className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Masukkan email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl pl-10 sm:pl-14 pr-3 sm:pr-5 py-2.5 sm:py-4 text-sm sm:text-base outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* PHONE */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-600">
                  Nomor Telepon
                </label>

                <div className="relative mt-2 sm:mt-3">
                  <FaPhoneAlt className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl pl-10 sm:pl-14 pr-3 sm:pr-5 py-2.5 sm:py-4 text-sm sm:text-base outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* ADDRESS */}
              <div className="md:col-span-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-600">
                  Alamat
                </label>

                <div className="relative mt-2 sm:mt-3">
                  <FaMapMarkerAlt className="absolute left-3 sm:left-5 top-3 sm:top-5 text-slate-400 text-sm" />

                  <textarea
                    rows={4}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Masukkan alamat lengkap"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl pl-10 sm:pl-14 pr-3 sm:pr-5 py-2.5 sm:py-4 text-sm sm:text-base outline-none resize-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= VEHICLE CARD ================= */}
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl sm:rounded-[36px] p-5 sm:p-6 md:p-8 lg:p-10 shadow-xl">
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-100/40 rounded-full blur-3xl" />

          {/* HEADER */}
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-3 sm:gap-4">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                Vehicle Information
              </h3>

              <p className="text-slate-500 text-xs sm:text-xs md:text-sm lg:text-base mt-1 sm:mt-2">
                Lengkapi data kendaraan angkot
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg">
              <FaCarSide size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* CONTENT */}
          <div className="relative grid lg:grid-cols-[320px_1fr] gap-6 sm:gap-8 md:gap-12 mt-6 sm:mt-8 md:mt-12">
            {/* VEHICLE PHOTO */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl sm:rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition" />

                <div className="relative w-[200px] sm:w-[260px] h-[160px] sm:h-[230px] rounded-xl sm:rounded-[36px] bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-center shadow-xl">
                  <FaBus
                    size={60}
                    className="text-blue-600 sm:w-[100px] sm:h-[100px]"
                  />

                  <button className="absolute bottom-2 right-2 sm:bottom-5 sm:right-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-2 sm:p-4 rounded-lg sm:rounded-2xl shadow-lg">
                    <FaCamera size={14} className="sm:w-4.5 sm:h-4.5" />
                  </button>
                </div>
              </div>

              <button className="mt-5 sm:mt-8 px-5 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:text-blue-600 transition font-medium text-sm sm:text-base">
                Upload Vehicle
              </button>
            </div>

            {/* FORM */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-600">
                  Plat Nomor
                </label>

                <input
                  type="text"
                  name="platNomor"
                  value={formData.platNomor}
                  onChange={handleInputChange}
                  placeholder="N 1234 AB"
                  className="mt-2 sm:mt-3 w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-4 text-sm sm:text-base outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-600">
                  Warna Angkot
                </label>

                <input
                  type="text"
                  name="warnaAngkot"
                  value={formData.warnaAngkot}
                  onChange={handleInputChange}
                  placeholder="Biru"
                  className="mt-2 sm:mt-3 w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-4 text-sm sm:text-base outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              {/* ROUTE */}
              <div className="md:col-span-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-600">
                  Pilih Jalur
                </label>

                <button
                  onClick={() => {
                    setTempSelectedRoute(selectedRoute);
                    setIsRouteModalOpen(true);
                  }}
                  className="mt-2 sm:mt-3 w-full bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-5 flex items-center justify-between hover:border-blue-500 hover:bg-white transition"
                >
                  <div className="text-left">
                    <p className="font-bold text-base sm:text-lg">
                      {routes.find(r => r.id === selectedRoute)?.name}
                    </p>

                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                      {routes.find(r => r.id === selectedRoute)?.description}
                    </p>
                  </div>

                  <FaChevronDown className="text-slate-400 text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON AT BOTTOM */}
        {hasChanges && (
          <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/0 pt-4 pb-4 sm:pb-6 px-4 sm:px-0 z-30">
            <button onClick={handleSaveChanges} className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:scale-[1.02] transition text-sm sm:text-base">
              <FaSave />
              Simpan Perubahan
            </button>
          </div>
        )}

        {/* ================= ROUTE SELECTION MODAL ================= */}
        {isRouteModalOpen && (
          <>
            {/* MODAL BACKDROP */}
            <div
              onClick={() => setIsRouteModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300"
            />

            {/* MODAL CONTENT */}
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
              <div className="bg-white rounded-2xl sm:rounded-[32px] p-6 sm:p-8 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">
                      Pilih Jalur
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Silakan pilih jalur operasional anda
                    </p>
                  </div>
                  <button
                    onClick={() => setIsRouteModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <FaTimes size={20} className="text-slate-600" />
                  </button>
                </div>

                {/* ROUTE OPTIONS */}
                <div className="space-y-3 mb-6">
                  {routes.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => {
                        setTempSelectedRoute(route.id);
                      }}
                      className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left text-sm sm:text-base ${
                        tempSelectedRoute === route.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            tempSelectedRoute === route.id
                              ? "border-blue-500 bg-blue-500"
                              : "border-slate-300"
                          }`}
                        >
                          {tempSelectedRoute === route.id && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm sm:text-base ${
                            tempSelectedRoute === route.id
                              ? "text-blue-600"
                              : "text-slate-900"
                          }`}>
                            {route.name}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500">
                            {route.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsRouteModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-lg sm:rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition text-sm sm:text-base"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRoute(tempSelectedRoute);
                      setIsRouteModalOpen(false);
                    }}
                    className="flex-1 px-4 py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:scale-[1.02] transition text-sm sm:text-base"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}