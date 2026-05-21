"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FaBus,
  FaArrowRight,
  FaBars,
  FaTimes,
  FaWifi,
  FaChevronDown,
} from "react-icons/fa";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function FAQPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(0);

  const faqs = [
    {
      question: "Apa itu AngkotTrack dan bagaimana cara kerjanya?",
      answer:
        "AngkotTrack adalah platform pelacakan angkot real-time yang membantu mahasiswa memantau lokasi angkot, estimasi waktu tiba, ketersediaan tempat duduk, dan tarif transportasi. Teknologi GPS dan live tracking membuat commuting lebih efisien.",
    },
    {
      question: "Bagaimana cara melacak angkot saya?",
      answer:
        "Cukup buka aplikasi, pilih rute yang Anda tuju, dan Anda akan melihat semua angkot aktif di peta dengan lokasi real-time, ETA, dan jumlah kursi yang tersedia. Anda juga bisa memesan tempat duduk sebelumnya.",
    },
    {
      question: "Apakah ada biaya untuk menggunakan AngkotTrack?",
      answer:
        "Aplikasi AngkotTrack gratis untuk diunduh dan digunakan. Anda hanya membayar tarif normal angkot saat perjalanan. Tidak ada biaya tersembunyi atau biaya aplikasi tambahan.",
    },
    {
      question: "Rute apa saja yang tersedia di AngkotTrack?",
      answer:
        "Saat ini kami menyediakan 3+ rute kampus termasuk UMM-UB-UM dan rute lainnya. Kami terus menambah rute baru berdasarkan permintaan pengguna dan kemitraan dengan operator angkot lokal.",
    },
    {
      question: "Bagaimana cara menjadi driver di AngkotTrack?",
      answer:
        "Driver dapat mendaftar melalui aplikasi AngkotTrack dengan persyaratan kendaraan yang sesuai dan dokumentasi lengkap. Setelah verifikasi admin, Anda dapat langsung mulai melayani penumpang dengan sistem tracking kami.",
    },
    {
      question: "Apakah AngkotTrack aman digunakan?",
      answer:
        "Ya! AngkotTrack dirancang dengan standar keamanan tinggi. Semua driver terverifikasi, semua transaksi transparan, dan lokasi real-time memberikan keamanan tambahan bagi penumpang. Kami juga memiliki fitur emergency dan rating driver.",
    },
  ];

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
              className="text-blue-600 font-semibold"
            >
              FAQ
            </Link>

            <Link
              href="/info-rute"
              className="hover:text-blue-600 transition duration-200"
            >
              Info Rute
            </Link>
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
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-60 transition-all duration-300 ${
          isSidebarOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-white z-70 shadow-2xl transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
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
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base bg-blue-50 text-blue-600 font-semibold transition"
            >
              FAQ
            </Link>
            <Link
              href="/info-rute"
              onClick={() => setIsSidebarOpen(false)}
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base hover:bg-blue-50 hover:text-blue-600 transition"
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
            Pertanyaan Umum
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Frequently Asked
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {" "}
              Questions
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-slate-600 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
            Temukan jawaban untuk pertanyaan umum tentang AngkotTrack dan cara menggunakan platform kami.
          </p>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="py-8 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-slate-100 rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === index ? -1 : index)
                  }
                  className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex items-center justify-between gap-3 text-left"
                >
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg text-slate-900 leading-tight">
                    {faq.question}
                  </h3>

                  <FaChevronDown
                    size={16}
                    className={`text-blue-600 shrink-0 transition-transform duration-300 ${
                      expandedFAQ === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedFAQ === index && (
                  <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-5 md:pb-6 border-t border-slate-100">
                    <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 sm:mt-12 md:mt-16 p-6 sm:p-8 md:p-10 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl md:rounded-2xl text-center">
            <p className="text-slate-700 text-sm sm:text-base">
              Ada pertanyaan lain yang tidak terjawab?{" "}
              <a
                href="mailto:support@angkottrack.com"
                className="font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Hubungi kami
              </a>
            </p>
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
