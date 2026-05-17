"use client";

import {
  Bus,
  MapPinned,
  Clock3,
  Users,
  ShieldCheck,
  ChevronRight,
  Menu,
} from "lucide-react";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function HomePage() {
  return (
    <main
      className={`${poppins.className} bg-white text-slate-900 overflow-hidden`}
    >
      {/* ================= NAVBAR ================= */}
      <nav className="w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl fixed top-0 left-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200">
              <Bus size={22} />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">AngkotTrack</h1>
              <p className="text-xs text-slate-500">Smart Transport for Students</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#home" className="text-slate-700 hover:text-blue-600 transition">Home</a>
            <a href="#about" className="text-slate-700 hover:text-blue-600 transition">About</a>
            <a href="#features" className="text-slate-700 hover:text-blue-600 transition">Features</a>
            <a href="#cta" className="text-slate-700 hover:text-blue-600 transition">Contact</a>
          </div>

          <button className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-300 transition text-white px-6 py-2.5 rounded-xl font-medium shadow-md">
            Try Demo
            <ChevronRight size={18} />
          </button>

          <button className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition">
            <Menu size={28} className="text-slate-700" />
          </button>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section id="home" className="relative pt-40 pb-28 px-6 overflow-hidden">
        {/* Background Blur */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-200 rounded-full blur-3xl opacity-40 -z-10" />
        <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-purple-200 rounded-full blur-3xl opacity-30 -z-10" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 px-4 py-2.5 rounded-full text-sm font-medium mb-8 shadow-sm">
              <ShieldCheck size={16} />
              Real-Time Smart Transportation
            </div>

            <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
              Smart Angkot Tracking for
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"> Students</span>
            </h1>

            <p className="mt-8 text-slate-600 text-lg leading-relaxed max-w-xl">
              Monitor angkot locations in real-time, check estimated arrival
              times, track seat availability, and enjoy transparent fares
              around campus areas like UMM, UB, and UM.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-300 hover:-translate-y-1 transition text-white px-8 py-4 rounded-xl font-semibold shadow-md">
                Get Started
              </button>
              <button className="border-2 border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition text-slate-700 px-8 py-4 rounded-xl font-semibold shadow-sm">
                View Live Map
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 flex flex-wrap gap-12">
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">50+</h2>
                <p className="text-slate-500 mt-1">Active Drivers</p>
              </div>
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">3</h2>
                <p className="text-slate-500 mt-1">Major Campus Routes</p>
              </div>
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">24/7</h2>
                <p className="text-slate-500 mt-1">Live Monitoring</p>
              </div>
            </div>
          </div>

          {/* ===== RIGHT: ANGKOT IMAGE CARD ===== */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-30 -z-10" />
            <div className="absolute -top-10 -left-10 w-52 h-52 bg-purple-200 rounded-full blur-3xl opacity-40 -z-10" />

            {/* Main Card */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">

              {/* ── Angkot Image with Wave Crop ── */}
              <div className="relative h-[320px] overflow-hidden bg-gradient-to-b from-blue-50 to-slate-100">
                {/* Image */}
                <img
                  src="/angkot.png"
                  alt="Angkot"
                  className="w-full h-full object-cover object-center"
                  style={{ objectPosition: "center 60%" }}
                />

                {/* Gradient overlay top */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-transparent" />

                {/* Wave SVG crop at the bottom */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
                  <svg
                    viewBox="0 0 1200 80"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    className="w-full h-[60px]"
                  >
                    <path
                      d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z"
                      fill="white"
                    />
                  </svg>
                </div>

                {/* Live badge top-left */}
                <div className="absolute top-5 left-5 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg text-xs font-semibold text-slate-700 border border-white/50">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live Tracking
                </div>

                {/* ETA badge top-right */}
                <div className="absolute top-5 right-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                  ETA 3 min
                </div>
              </div>

              {/* ── Route Map Section ── */}
              <div className="px-7 pb-7 pt-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5 letter-spacing">
                  Active Route
                </p>

                {/* Route Line with Stops */}
                <div className="relative">
                  {/* Route stops container */}
                  <div className="flex items-start justify-between relative">

                    {/* Dotted line connecting all stops */}
                    <div
                      className="absolute top-[18px] left-[18px] right-[18px] h-px"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(to right, #3b82f6 0px, #3b82f6 8px, transparent 8px, transparent 16px)",
                      }}
                    />

                    {/* Bus icon moving on the route (positioned ~40% from left) */}
                    <div
                      className="absolute -top-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-lg shadow-lg z-10"
                      style={{ left: "calc(38% - 16px)" }}
                    >
                      <Bus size={16} />
                    </div>

                    {/* Stop: UMM */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-lg">
                        <MapPinned size={16} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">UMM</span>
                      <span className="text-[10px] text-slate-400">Start</span>
                    </div>

                    {/* Stop: Soekarno-Hatta */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-blue-500 text-blue-600 flex items-center justify-center shadow-md">
                        <MapPinned size={16} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 text-center">Soekarno<br />Hatta</span>
                      <span className="text-[10px] text-slate-400">Via</span>
                    </div>

                    {/* Stop: UB */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-blue-400 text-blue-500 flex items-center justify-center shadow-md">
                        <MapPinned size={16} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">UB</span>
                      <span className="text-[10px] text-slate-400">Via</span>
                    </div>

                    {/* Stop: UM */}
                    <div className="flex flex-col items-center gap-2 z-10">
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shadow-md">
                        <MapPinned size={16} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">UM</span>
                      <span className="text-[10px] text-slate-400">End</span>
                    </div>
                  </div>
                </div>

                {/* Info Row */}
                <div className="mt-7 flex items-center justify-between bg-gradient-to-r from-blue-50 to-slate-50 rounded-2xl px-4 py-3 border border-blue-100 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock3 size={16} className="text-blue-500" />
                    <span>Next arrival: <strong className="text-slate-800">3 min</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users size={16} className="text-green-500" />
                    <span className="font-semibold text-green-600">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ===== END RIGHT ===== */}
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="py-28 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-blue-600 font-semibold uppercase tracking-widest text-sm">About Us</p>
          <h2 className="text-4xl lg:text-5xl font-bold mt-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Empowering Student Transportation</h2>
          <p className="mt-7 text-slate-600 max-w-3xl mx-auto leading-relaxed text-lg">
            AngkotTrack is a smart transportation platform designed to modernize public angkot
            systems around university areas by integrating real-time GPS tracking, ETA prediction,
            occupancy monitoring, and transparent fare systems into one accessible web application.
          </p>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-28 px-6 relative">
        <div className="absolute -top-20 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-blue-600 font-semibold uppercase tracking-widest text-sm">Features</p>
            <h2 className="text-4xl lg:text-5xl font-bold mt-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Everything You Need</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-18">
            {[
              {
                icon: MapPinned,
                title: "Live Fleet Map",
                desc: "Track angkot movement in real-time with interactive maps.",
              },
              {
                icon: Clock3,
                title: "Dynamic ETA",
                desc: "Get accurate arrival predictions updated automatically.",
              },
              {
                icon: Users,
                title: "Occupancy Status",
                desc: "Know whether the angkot is available or already full.",
              },
              {
                icon: ShieldCheck,
                title: "Fare Transparency",
                desc: "See official student and public transportation fares.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-300"
              >
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 w-fit p-4 rounded-xl">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mt-6 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 mt-4 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section id="cta" className="py-28 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 rounded-3xl p-16 text-center text-white shadow-2xl shadow-blue-300 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to Experience
              <br />
              Smart Transportation?
            </h2>
            <p className="mt-7 text-blue-100 max-w-2xl mx-auto text-lg leading-relaxed">
              Join the future of campus transportation and monitor angkot routes
              in real-time directly from your device.
            </p>
            <button className="mt-10 bg-white text-blue-700 hover:bg-blue-50 hover:shadow-lg hover:shadow-white/20 transition px-9 py-4 rounded-xl font-bold text-lg">
              Launch Application
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 py-12 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2.5 rounded-xl shadow-lg">
              <Bus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">AngkotTrack</h3>
              <p className="text-sm text-slate-500">Smart Campus Transportation System</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm text-center">
            © 2026 AngkotTrack. Built for smarter student mobility.
          </p>
        </div>
      </footer>
    </main>
  );
}