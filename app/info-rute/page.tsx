"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FaBus,
  FaMapMarkedAlt,
  FaArrowRight,
  FaBars,
  FaTimes,
  FaRoute,
  FaWifi,
  FaChevronDown,
  FaSearch,
} from "react-icons/fa";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function InfoRutePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedRoute, setExpandedRoute] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const routes = [
    {
      jalur: "AG/AH",
      travek: "Travek Arjosari - Gadang - Term. Hamid Rusdi",
      dariTerminalArjosari:
        "Terminal Arjosari – Jl. Simpang R. Panji Suroso – Jl. Raden Intan – Jl. Jend A. Yani – Jl. Letjen S. Parman – Jl. Letjen Sutoyo – Jl. Jakung Suprapto – Jl. Basuki Rahman – Merdeka Utara – Jl. Sersan Harun – Jl. Prof. Moh. Yamin – Jl. Sartono SH – Jl. Kot. Sugiono – Terminal Gadang",
      dariTerminalLandungsari:
        "Terminal Gadang – Jl. Kol. Sugiyono – Jl. Sartono SH – Jl. Irian Jaya – Jl. Tanimbar – Jl. Sulawesi – Jl. Uranus Utsman – Jl. Syarif Al Qodri – Jl. Kauman – Jl. Hasyim Asy'ari – Jl. A. R. Hakim – Jl. Jalkut Rahmat – Jl. Jakung Suprapto – Jl. Letjen Sutoyo – Jl. Letjen S. Parman – Jl. Jend A. Yani – Jl. Raden Intan – Terminal Arjosari",
    },
    {
      jalur: "AL",
      travek: "Term. Arjosari – Term. Landungsari",
      dariTerminalArjosari:
        "Terminal Arjosari – Jl. R. Panji Suroso – Jl. Laksamana Adi Sucipto – Jl. Tenaga – Jl. Karya Timur – Jl. Mahakam – Jl. W. R. Supratman – Jl. Panglima Sudirman – Jl. Patimura – Jl. Trunojoyo – Jl. Kertanegara – Jl. Tugu – Jl. Kahuripan – Jl. Semeru – Jl. Ijen – Jl. Retawo – Jl. Bondowoso – Jl. Jombang – Jl. Surabaya – Jl. Jakarta – Jl. Bogor – Jl. Veteran – Jl. Sumbersari – Terminal Sari",
      dariTerminalLandungsari:
        "Terminal Landung Sari – Jl. Tilogomas – Jl. Mayjen MT. Haryono – Jl. Gajayana – Jl. Veteran – Jl. Bandung – Jl. Ijen – Jl. Semeru – Jl. Kahuripan – Jl. Tugu – Jl. Kertanegara – Jl. Trunojoyo – Jl. Patimura – Jl. Panglima Sudirman – Jl. W.R. Supratman – Jl. Tenaga – Jl. Laksamana Adi Sucipto – Jl. R. Panji Suroso – Terminal Arjosari",
    },
    {
      jalur: "ADL",
      travek: "Term. Arjosari – Dinoyo – Term. Landungsari",
      dariTerminalArjosari:
        "Terminal Arjosari – Jl. Simpang R. Panji Suroso – Jl. Raden Intan – Jl. Jend. A. Yani – Jl. Letjen S. Parman – Jl. Letjen Sutoyo – Jl. W. R. Supratman – Jl. Panglima Sudirman – Jl. Patimura – Jl. Trunojoyo – Jl. Kertanegara – Jl. Kahuripan – Jl. Semeru – Jl. Ijen – Jl. Bandung – Jl. Tenaga Bogor – Jl. Mayjen Panjaitan – Jl. Jombang – Jl. Surabaya – Jl. Jakarta – Jl. Bogor – Jl. Mayjen Haryono – Jl. Tilogomas",
      dariTerminalLandungsari:
        "Terminal Landung Sari – Jl. Tilogomas – Jl. Mayjen Haryono – Jl. Mayjen Panjaitan – Jl. Semeru – Jl. Kahuripan – Jl. Tugu – Jl. Kertanegara – Jl. Trunojoyo – cokro Aminoto – Jl. Dr. Cipto – Jl. Panglima Sudirman – Jl. W. R. Supratman – Jl. Letjen Sutoyo – Jl. Letjen S. Parman – Jl. Jend A. Yani – Jl. Raden Intan – Terminal Arjosari",
    },
  ];

  // Filter routes berdasarkan search query
  const filteredRoutes = routes.filter((route) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      route.jalur.toLowerCase().includes(searchLower) ||
      route.travek.toLowerCase().includes(searchLower) ||
      route.dariTerminalArjosari.toLowerCase().includes(searchLower) ||
      route.dariTerminalLandungsari.toLowerCase().includes(searchLower)
    );
  });

  // Fungsi untuk highlight text yang dicari
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={index}
          className="bg-yellow-300 font-semibold text-slate-900 px-0.5 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <main
      className={`${poppins.className} bg-[#f8fbff] text-slate-900 overflow-hidden`}
    >
      {/* ================= BACKGROUND EFFECT ================= */}
      <div className="absolute top-0 left-0 w-full h-[700px] bg-gradient-to-br from-blue-100/60 via-cyan-50 to-transparent blur-3xl -z-10" />

      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg shadow-blue-200">
              <FaBus size={16} className="sm:hidden" />
              <FaBus size={18} className="hidden sm:block md:hidden" />
              <FaBus size={22} className="hidden md:block" />
            </div>

            <div>
              <h1 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AngkotTrack
              </h1>

              <p className="text-xs text-slate-500 leading-tight">
                Smart Transport
              </p>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs lg:text-sm font-medium">
            <Link href="/" className="hover:text-blue-600 transition duration-200">
              Home
            </Link>

            <Link
              href="/faq"
              className="hover:text-blue-600 transition duration-200"
            >
              FAQ
            </Link>

            <a
              href="/info-rute"
              className="text-blue-600 font-semibold"
            >
              Info Rute
            </a>
          </div>

          {/* BUTTONS */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              href="/driver/auth/login"
              className="px-3 lg:px-5 py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition font-medium text-xs lg:text-sm"
            >
              Driver
            </Link>

            <Link
              href="/admin"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 lg:px-5 py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl font-semibold text-xs lg:text-sm shadow-lg shadow-blue-200 hover:scale-[1.03] transition"
            >
              Admin
              <FaArrowRight size={11} className="lg:hidden" />
              <FaArrowRight size={14} className="hidden lg:block" />
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-slate-100"
          >
            <FaBars size={18} className="sm:hidden" />
            <FaBars size={20} className="hidden sm:block" />
          </button>
        </div>
      </nav>

      {/* ================= MOBILE SIDEBAR ================= */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-all duration-300 ${
          isSidebarOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-white z-[70] shadow-2xl transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-600 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <FaBus size={16} className="sm:hidden" />
                <FaBus size={20} className="hidden sm:block" />
              </div>

              <div>
                <h2 className="font-bold text-base sm:text-lg">AngkotTrack</h2>
                <p className="text-xs text-slate-500">Navigation</p>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100"
            >
              <FaTimes size={18} className="sm:hidden" />
              <FaTimes size={22} className="hidden sm:block" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5 sm:gap-2">
            <Link
              href="/"
              onClick={() => setIsSidebarOpen(false)}
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Home
            </Link>
            <Link
              href="/faq"
              onClick={() => setIsSidebarOpen(false)}
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base hover:bg-blue-50 hover:text-blue-600 transition"
            >
              FAQ
            </Link>
            <Link
              href="/info-rute"
              onClick={() => setIsSidebarOpen(false)}
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base bg-blue-50 text-blue-600 font-semibold transition"
            >
              Info Rute
            </Link>
          </div>

          <div className="border-t my-4 sm:my-6" />

          <div className="flex flex-col gap-2 sm:gap-3">
            <Link
              href="/driver/auth/login"
              className="bg-slate-100 py-2 sm:py-3 rounded-lg text-center font-semibold text-sm sm:text-base hover:bg-slate-200 transition"
            >
              Login Driver
            </Link>

            <Link
              href="/admin/auth/login"
              className="bg-blue-600 text-white py-2 sm:py-3 rounded-lg text-center font-semibold text-sm sm:text-base"
            >
              Login Admin
            </Link>
          </div>
        </div>
      </aside>

      {/* ================= HERO ================= */}
      <section className="relative pt-20 sm:pt-24 md:pt-32 lg:pt-44 pb-8 sm:pb-12 md:pb-16 px-3 sm:px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 md:mb-6">
            <FaWifi size={12} className="sm:hidden" />
            <FaWifi size={14} className="hidden sm:block" />
            Info Rute
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Informasi
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {" "}
              Rute Angkot
            </span>
            <br className="hidden sm:block" />
            Kota Malang
          </h1>

          <p className="mt-4 sm:mt-6 text-slate-600 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
            Lihat detail lengkap setiap rute angkot, jalan yang dilewati, dan terminal tujuan.
          </p>

          {/* SEARCH INPUT */}
          <div className="mt-8 sm:mt-10 md:mt-12 max-w-2xl mx-auto px-3 sm:px-0">
            <div className="relative">
              <FaSearch className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm sm:text-base" />
              <input
                type="text"
                placeholder="Cari rute, terminal, atau jalan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-xs sm:text-sm md:text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= ROUTES SECTION ================= */}
      <section className="py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {filteredRoutes.length > 0 ? (
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {filteredRoutes.map((route, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-100 rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* HEADER */}
                  <button
                    onClick={() =>
                      setExpandedRoute(expandedRoute === index ? -1 : index)
                    }
                    className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-colors"
                  >
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                          <FaRoute size={14} className="sm:hidden" />
                          <FaRoute size={16} className="hidden sm:block md:hidden" />
                          <FaRoute size={18} className="hidden md:block" />
                        </div>
                        <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-slate-900">
                          Rute {route.jalur}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm md:text-base text-slate-600 ml-10 sm:ml-12 md:ml-14">
                        {highlightText(route.travek, searchQuery)}
                      </p>
                    </div>

                    <FaChevronDown
                      size={16}
                      className={`text-blue-600 shrink-0 transition-transform duration-300 ${
                        expandedRoute === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* CONTENT */}
                  {expandedRoute === index && (
                    <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 bg-white border-t border-slate-100">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
                        {/* DARI TERMINAL ARJOSARI */}
                        <div>
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                              <FaMapMarkedAlt
                                size={14}
                                className="sm:hidden text-blue-600"
                              />
                              <FaMapMarkedAlt
                                size={16}
                                className="hidden sm:block text-blue-600"
                              />
                            </div>
                            <h4 className="font-semibold text-sm sm:text-base md:text-lg text-slate-900">
                              Dari Terminal Arjosari
                            </h4>
                          </div>
                          <div className="ml-8 sm:ml-10 bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
                            <p className="text-xs sm:text-sm md:text-base text-slate-700 leading-relaxed">
                              {highlightText(route.dariTerminalArjosari, searchQuery)}
                            </p>
                          </div>
                        </div>

                        {/* DARI TERMINAL LANDUNGSARI */}
                        <div>
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
                              <FaMapMarkedAlt
                                size={14}
                                className="sm:hidden text-cyan-600"
                              />
                              <FaMapMarkedAlt
                                size={16}
                                className="hidden sm:block text-cyan-600"
                              />
                            </div>
                            <h4 className="font-semibold text-sm sm:text-base md:text-lg text-slate-900">
                              Dari Terminal Landungsari
                            </h4>
                          </div>
                          <div className="ml-8 sm:ml-10 bg-cyan-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
                            <p className="text-xs sm:text-sm md:text-base text-slate-700 leading-relaxed">
                              {highlightText(route.dariTerminalLandungsari, searchQuery)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <div className="text-5xl sm:text-6xl md:text-7xl mb-4 opacity-20">
                🔍
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900 mb-2">
                Tidak ada rute yang ditemukan
              </h3>
              <p className="text-slate-600 text-sm sm:text-base">
                Coba ubah pencarian Anda. Gunakan nama rute, terminal, atau jalan.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ================= INFO SECTION ================= */}
      <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-slate-100 rounded-lg sm:rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-10 shadow-md">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-slate-900">
              Informasi Penting
            </h2>
            <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg text-slate-700">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                <span>
                  <strong>Jalur:</strong> Kode angkot yang melayani rute tertentu
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                <span>
                  <strong>Travek:</strong> Deskripsi singkat rute yang dilayani
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                <span>
                  <strong>Terminal:</strong> Lokasi awal dan akhir perjalanan angkot
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                <span>
                  <strong>Jalan yang Dilewati:</strong> Daftar lengkap jalan dan lokasi
                  yang dilewati angkot dalam satu siklus perjalanan
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 py-6 sm:py-8 md:py-10 px-3 sm:px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-lg">
              <FaBus size={14} className="sm:hidden" />
              <FaBus size={16} className="hidden sm:block" />
            </div>

            <div>
              <h2 className="font-bold text-sm sm:text-base">AngkotTrack</h2>
              <p className="text-xs text-slate-500">Smart Transport Platform</p>
            </div>
          </div>

          <p className="text-slate-500 text-xs sm:text-sm">
            © 2026 AngkotTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
