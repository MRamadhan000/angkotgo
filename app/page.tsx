"use client";

import Link from "next/link";
import { useState } from "react";

import {
  FaBus,
  FaMapMarkedAlt,
  FaClock,
  FaUsers,
  FaShieldAlt,
  FaArrowRight,
  FaBars,
  FaTimes,
  FaRoute,
  FaWifi,
} from "react-icons/fa";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const features = [
    {
      icon: <FaMapMarkedAlt size={26} />,
      title: "Live Fleet Tracking",
      desc: "Track every angkot in real-time with interactive GPS mapping.",
    },
    {
      icon: <FaClock size={26} />,
      title: "Smart ETA",
      desc: "Accurate arrival estimation powered by live traffic updates.",
    },
    {
      icon: <FaUsers size={26} />,
      title: "Seat Availability",
      desc: "Know occupancy status before the angkot arrives.",
    },
    {
      icon: <FaShieldAlt size={26} />,
      title: "Safe & Transparent",
      desc: "Transparent fares and safer commuting for students.",
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
          <div className="flex items-center gap-2 sm:gap-3">
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
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs lg:text-sm font-medium">
            <a
              href="#home"
              className="hover:text-blue-600 transition duration-200"
            >
              Home
            </a>

            <a
              href="#about"
              className="hover:text-blue-600 transition duration-200"
            >
              About
            </a>

            <a
              href="#features"
              className="hover:text-blue-600 transition duration-200"
            >
              Features
            </a>

            <a
              href="#cta"
              className="hover:text-blue-600 transition duration-200"
            >
              Contact
            </a>
          </div>

          {/* BUTTONS */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              href="/driver"
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
            {["Home", "About", "Features", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsSidebarOpen(false)}
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base hover:bg-blue-50 hover:text-blue-600 transition"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="border-t my-4 sm:my-6" />

          <div className="flex flex-col gap-2 sm:gap-3">
            <Link
              href="/driver"
              className="bg-slate-100 py-2 sm:py-3 rounded-lg text-center font-semibold text-sm sm:text-base hover:bg-slate-200 transition"
            >
              Login Driver
            </Link>

            <Link
              href="/admin"
              className="bg-blue-600 text-white py-2 sm:py-3 rounded-lg text-center font-semibold text-sm sm:text-base"
            >
              Login Admin
            </Link>
          </div>
        </div>
      </aside>

      {/* ================= HERO ================= */}
      <section
        id="home"
        className="relative pt-20 sm:pt-24 md:pt-32 lg:pt-44 pb-12 sm:pb-16 md:pb-24 px-3 sm:px-4 md:px-6"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 md:mb-6">
              <FaWifi size={12} className="sm:hidden" />
              <FaWifi size={14} className="hidden sm:block" />
              Real-Time Smart Transport
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              Modern
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {" "}
                Angkot
              </span>
              <br />
              Tracking System
            </h1>

            <p className="mt-3 sm:mt-4 md:mt-6 text-slate-600 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-xl">
              Empowering students with live angkot tracking, dynamic ETA, transparent pricing, and smart transportation.
            </p>

            <div className="mt-6 sm:mt-8 md:mt-10 flex flex-wrap gap-3 sm:gap-4">
              <Link
                href="/rute"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl font-semibold text-xs sm:text-sm md:text-base shadow-lg shadow-blue-200 hover:scale-[1.03] transition"
              >
                Explore Routes
                <FaArrowRight size={12} className="sm:hidden" />
                <FaArrowRight size={14} className="hidden sm:block" />
              </Link>

              <button className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl border border-slate-300 font-semibold text-xs sm:text-sm md:text-base hover:border-blue-500 hover:text-blue-600 transition">
                Learn More
              </button>
            </div>

            {/* STATS */}
            <div className="mt-8 sm:mt-10 md:mt-14 grid grid-cols-3 gap-2 sm:gap-3 md:gap-6">
              <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 shadow-md border border-slate-100">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600">50+</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                  Active Drivers
                </p>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 shadow-md border border-slate-100">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600">3+</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Campus Routes</p>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 shadow-md border border-slate-100">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600">24/7</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Monitoring</p>
              </div>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="relative mt-8 md:mt-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 blur-3xl opacity-20 rounded-full" />

            <div className="relative bg-white border border-slate-100 rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-[32px] overflow-hidden shadow-2xl">
              <img
                src="/angkot.png"
                alt="Angkot"
                className="w-full h-48 sm:h-64 md:h-80 lg:h-[380px] object-cover"
              />

              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div>
                    <p className="text-xs uppercase text-slate-400">
                      Active Route
                    </p>

                    <h3 className="font-bold text-base sm:text-lg md:text-xl mt-0.5 sm:mt-1">
                      UMM - UB - UM
                    </h3>
                  </div>

                  <div className="bg-green-100 text-green-600 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    Online
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 gap-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <FaClock size={12} className="sm:hidden" />
                    <FaClock size={14} className="hidden sm:block" />
                    ETA 3m
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 text-blue-600">
                    <FaUsers size={12} className="sm:hidden" />
                    <FaUsers size={14} className="hidden sm:block" />
                    Seats
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 h-2.5 sm:h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[65%] h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section
        id="about"
        className="py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6 bg-gradient-to-b from-white to-slate-50"
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 sm:px-4 md:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <FaRoute size={12} className="sm:hidden" />
            <FaRoute size={14} className="hidden sm:block" />
            About Platform
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Smart Mobility for
            <span className="text-blue-600"> Modern Students</span>
          </h2>

          <p className="mt-4 sm:mt-6 md:mt-8 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
            AngkotTrack transforms traditional public transportation into an intelligent mobility ecosystem with GPS tracking, occupancy monitoring, and real-time services.
          </p>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              Powerful Features
            </h2>

            <p className="mt-2 sm:mt-3 md:mt-4 text-slate-600 text-xs sm:text-sm md:text-base lg:text-lg">
              Designed to create a smarter commuting experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-white border border-slate-100 rounded-lg sm:rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                  {feature.icon}
                </div>

                <h3 className="text-base sm:text-lg md:text-xl font-bold mt-4 sm:mt-5 md:mt-6">
                  {feature.title}
                </h3>

                <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-2 sm:mt-3 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section id="cta" className="py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-lg sm:rounded-2xl md:rounded-3xl lg:rounded-[40px] bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 sm:p-10 md:p-16 lg:p-20 text-center shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              Ready for Smarter
              <br className="hidden sm:block" />
              Transportation?
            </h2>

            <p className="mt-4 sm:mt-6 text-blue-100 text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto">
              Experience real-time angkot tracking and transform your daily campus commute today.
            </p>

            <button className="mt-6 sm:mt-8 md:mt-10 bg-white text-blue-600 px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-sm md:text-base hover:scale-[1.03] transition">
              Launch Application
            </button>
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
              <p className="text-xs text-slate-500">
                Smart Transport Platform
              </p>
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