"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Bus,
  MapPinned,
  Clock3,
  Users,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main
      className={`${poppins.className} bg-white text-slate-900 overflow-hidden`}
    >
      {/* ================= NAVBAR ================= */}
      <nav className="w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl fixed top-0 left-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200">
              <Bus size={22} />
            </div>
            <div>
              <h1 className="font-bold text-lg md:text-xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                AngkotTrack
              </h1>
              <p className="text-xs text-slate-500">
                Smart Transport for Students
              </p>
            </div>
          </div>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#home" className="hover:text-blue-600 transition">
              Home
            </a>
            <a href="#about" className="hover:text-blue-600 transition">
              About
            </a>
            <a href="#features" className="hover:text-blue-600 transition">
              Features
            </a>
            <a href="#cta" className="hover:text-blue-600 transition">
              Contact
            </a>
          </div>

          {/* LOGIN BUTTON DESKTOP */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/driver"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md"
            >
              Login Driver
              <ChevronRight size={18} />
            </Link>

            <Link
              href="/admin"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md"
            >
              Login Admin
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* HAMBURGER MOBILE */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <Menu size={26} />
          </button>
        </div>
      </nav>

      {/* ================= MOBILE SIDEBAR ================= */}

      {/* OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-xl">
                <Bus size={22} />
              </div>
              <div>
                <h2 className="font-bold text-lg">AngkotTrack</h2>
                <p className="text-xs text-slate-500">Menu</p>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <X size={26} />
            </button>
          </div>

          {/* MENU */}
          <div className="flex flex-col gap-2 text-lg">
            <a
              href="#home"
              onClick={() => setIsSidebarOpen(false)}
              className="px-4 py-3 hover:bg-slate-100 rounded-xl"
            >
              Home
            </a>

            <a
              href="#about"
              onClick={() => setIsSidebarOpen(false)}
              className="px-4 py-3 hover:bg-slate-100 rounded-xl"
            >
              About
            </a>

            <a
              href="#features"
              onClick={() => setIsSidebarOpen(false)}
              className="px-4 py-3 hover:bg-slate-100 rounded-xl"
            >
              Features
            </a>

            <a
              href="#cta"
              onClick={() => setIsSidebarOpen(false)}
              className="px-4 py-3 hover:bg-slate-100 rounded-xl"
            >
              Contact
            </a>
          </div>

          <div className="border-t border-slate-200 my-6" />

          {/* LOGIN */}
          <div className="flex flex-col gap-3">
            <Link
              href="/driver"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold"
            >
              Login Driver
              <ChevronRight size={20} />
            </Link>

            <Link
              href="/admin"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold"
            >
              Login Admin
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* ================= HERO ================= */}

      <section id="home" className="pt-32 md:pt-40 pb-20 md:pb-28 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          {/* TEXT */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm mb-6">
              <ShieldCheck size={16} />
              Real-Time Smart Transportation
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
              Smart Angkot Tracking for
              <span className="text-blue-600"> Students</span>
            </h1>

            <p className="mt-6 text-slate-600 text-base md:text-lg max-w-xl">
              Monitor angkot locations in real-time, check estimated arrival
              times, track seat availability, and enjoy transparent fares
              around campus areas like UMM, UB, and UM.
            </p>

            <div className="mt-10">
              <Link
                href="/rute"
                className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold"
              >
                Cari Rute
              </Link>
            </div>

            {/* STATS */}
            <div className="mt-12 flex flex-wrap gap-8">
              <div>
                <h2 className="text-3xl font-bold text-blue-600">50+</h2>
                <p className="text-slate-500 text-sm">Active Drivers</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-blue-600">3</h2>
                <p className="text-slate-500 text-sm">Campus Routes</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-blue-600">24/7</h2>
                <p className="text-slate-500 text-sm">Monitoring</p>
              </div>
            </div>
          </div>

          {/* IMAGE CARD */}
          <div className="bg-white border rounded-3xl overflow-hidden shadow-xl">
            <img
              src="/angkot.png"
              alt="Angkot"
              className="w-full h-[260px] md:h-[320px] object-cover"
            />

            <div className="p-6">
              <p className="text-xs uppercase text-slate-400 mb-4">
                Active Route
              </p>

              <div className="flex justify-between text-sm">
                <span>UMM</span>
                <span>Soekarno Hatta</span>
                <span>UB</span>
                <span>UM</span>
              </div>

              <div className="mt-5 flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock3 size={16} />
                  ETA 3 min
                </div>

                <div className="flex items-center gap-2 text-green-600">
                  <Users size={16} />
                  Available
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}

      <section id="about" className="py-20 md:py-28 px-4 md:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold">
            Empowering Student Transportation
          </h2>

          <p className="mt-6 text-slate-600 text-base md:text-lg">
            AngkotTrack modernizes public angkot systems with real-time GPS,
            ETA prediction, occupancy monitoring, and transparent fares.
          </p>
        </div>
      </section>

      {/* ================= FEATURES ================= */}

      <section id="features" className="py-20 md:py-28 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {[
            {
              icon: MapPinned,
              title: "Live Fleet Map",
              desc: "Track angkot movement in real-time with interactive maps.",
            },
            {
              icon: Clock3,
              title: "Dynamic ETA",
              desc: "Get accurate arrival predictions.",
            },
            {
              icon: Users,
              title: "Occupancy Status",
              desc: "Know whether the angkot is full.",
            },
            {
              icon: ShieldCheck,
              title: "Fare Transparency",
              desc: "Official fares available.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white border rounded-2xl p-6 shadow-md hover:shadow-xl transition"
            >
              <f.icon className="text-blue-600" size={28} />

              <h3 className="font-bold mt-4">{f.title}</h3>
              <p className="text-slate-600 text-sm mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}

      <section id="cta" className="py-20 md:py-28 px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-blue-600 text-white rounded-3xl p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Experience Smart Transportation?
          </h2>

          <button className="mt-8 bg-white text-blue-600 px-8 py-3 rounded-xl font-bold">
            Launch Application
          </button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="border-t py-10 px-6 text-center text-slate-500">
        © 2026 AngkotTrack
      </footer>
    </main>
  );
}