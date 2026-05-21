"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaBus,
  FaPhone,
  FaLock,
  FaArrowRight,
  FaShieldAlt,
  FaGraduationCap,
  FaInfoCircle,
  FaClock,
  FaSpinner,
  FaUser,
} from "react-icons/fa";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// ─── Types ────────────────────────────────────────────────────────────────────

type RouteStatus = "tersedia" | "penuh";

interface ActiveRoute {
  name: string;
  status: RouteStatus;
  color: "green" | "amber" | "red";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ACTIVE_ROUTES: ActiveRoute[] = [
  { name: "Landungsari – Dinoyo", status: "tersedia", color: "green" },
  { name: "Arjosari – UB", status: "tersedia", color: "amber" },
  { name: "Gadang – Sawojajar", status: "penuh", color: "red" },
  { name: "Terminal – Soekarno Hatta", status: "tersedia", color: "green" },
];

const DOT_COLORS: Record<ActiveRoute["color"], string> = {
  green: "#97C459",
  amber: "#EF9F27",
  red: "#F09595",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RouteStatus }) {
  const isAvail = status === "tersedia";
  return (
    <span
      className={`ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded ${
        isAvail
          ? "bg-green-500/20 text-green-200"
          : "bg-red-400/20 text-red-200"
      }`}
    >
      {isAvail ? "Tersedia" : "Penuh"}
    </span>
  );
}

function RouteDot({ color }: { color: ActiveRoute["color"] }) {
  return (
    <span
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: DOT_COLORS[color] }}
    />
  );
}

function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 flex-shrink-0 flex-col bg-[#0C447C] px-5 py-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-cyan-500 opacity-40" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-black/10" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
          <FaBus className="text-white text-base" />
        </div>
        <div>
          <p className="text-white font-extrabold text-sm leading-tight">
            AngkotGo
          </p>
          <p className="text-[#85B7EB] text-[10px] font-medium">
            Sistem Angkot Digital
          </p>
        </div>
      </div>

      {/* Routes */}
      <p className="relative z-10 text-[#85B7EB] text-[10px] font-semibold uppercase tracking-widest mb-2">
        Rute Aktif
      </p>
      <ul className="relative z-10 space-y-1 mb-auto">
        {ACTIVE_ROUTES.map((route, i) => (
          <li
            key={i}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg first:bg-white/10"
          >
            <RouteDot color={route.color} />
            <span className="text-blue-100 text-[11px] font-medium flex-1 leading-tight">
              {route.name}
            </span>
            <StatusBadge status={route.status} />
          </li>
        ))}
      </ul>

      {/* Tip card */}
      <div className="relative z-10 mt-6 bg-white/[0.07] rounded-xl p-3 border border-white/10">
        <p className="flex items-center gap-1.5 text-blue-100 text-[10px] font-semibold mb-1">
          <FaInfoCircle className="text-[11px]" />
          Mode Narik
        </p>
        <p className="text-blue-100 text-[10px] leading-relaxed">
          Aktifkan mode narik saat mulai beroperasi agar penumpang bisa melihat
          posisi angkotmu secara real-time.
        </p>
      </div>
    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DriverLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim() || !password.trim()) {
      setError("Nomor HP dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    // TODO: replace with real auth call
    setTimeout(() => {
      router.push("/driver");
    }, 900);
  };

  return (
    <main
      className={`${poppins.className} h-screen overflow-hidden relative`}
      style={{
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f0fdf4 100%)",
      }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-blue-200/40 rounded-full blur-3xl" />

        <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-green-200/40 rounded-full blur-3xl" />

        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:38px_38px]" />
      </div>

      <div className="grid lg:grid-cols-2 h-full">
        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}
        <section className="hidden lg:flex relative overflow-hidden">
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500" />

          {/* Decorative */}
          <div className="absolute top-[-120px] right-[-120px] w-[300px] h-[300px] rounded-full bg-white/10" />

          <div className="absolute bottom-[-100px] left-[-100px] w-[240px] h-[240px] rounded-full bg-black/10" />

          <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 text-white w-full">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                <FaBus className="text-2xl text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  AngkotGo
                </h1>

                <p className="text-blue-100 text-sm">
                  Smart Transportation Platform
                </p>
              </div>
            </div>

            {/* Hero */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium mb-6 text-white">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Real-time Monitoring System
              </div>

              <h2 className="text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight">
                Pantau Angkot
                <br />
                Secara
                <span className="text-cyan-200"> Real-Time</span>
              </h2>

              <p className="mt-6 text-blue-100 text-lg leading-relaxed">
                Membantu mahasiswa dan masyarakat mengetahui posisi angkot,
                estimasi kedatangan, serta kapasitas kursi secara langsung.
              </p>

              {/* Features */}
              <div className="mt-10 space-y-4">
                <div className="flex items-start gap-4 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <FaBus className="text-lg" />
                  </div>

                  <div>
                    <h3 className="font-bold text-lg">Tracking Armada</h3>

                    <p className="text-blue-100 text-sm mt-1">
                      Lihat posisi angkot yang sedang beroperasi secara
                      langsung.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <FaClock className="text-lg" />
                  </div>

                  <div>
                    <h3 className="font-bold text-lg">Jadwal Dinamis</h3>

                    <p className="text-blue-100 text-sm mt-1">
                      Informasi jadwal lebih akurat berdasarkan kondisi
                      lapangan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-5">
                <h3 className="text-3xl font-extrabold">120+</h3>
                <p className="text-blue-100 text-sm mt-1">Armada Aktif</p>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-5">
                <h3 className="text-3xl font-extrabold">24/7</h3>
                <p className="text-blue-100 text-sm mt-1">Monitoring</p>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-5">
                <h3 className="text-3xl font-extrabold">Real-time</h3>
                <p className="text-blue-100 text-sm mt-1">Tracking</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}
        <section className="flex items-center justify-center px-4 py-6 sm:px-6 md:px-8 lg:py-0 relative min-h-screen lg:min-h-0">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20">
                <FaBus className="text-white text-xl sm:text-2xl" />
              </div>

              <h1 className="mt-4 sm:mt-5 text-2xl sm:text-3xl font-extrabold text-slate-900">
                AngkotGo
              </h1>

              <p className="text-slate-500 mt-2 text-xs sm:text-sm">
                Smart Transportation Platform
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl sm:rounded-[28px] lg:rounded-[32px] p-5 sm:p-6 md:p-7 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              {/* Top */}
              <div className="mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-full border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Portal Driver
                </div>

                <h2 className="mt-4 sm:mt-5 text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  Masuk ke Dashboard
                </h2>

                <p className="mt-2 text-[12px] sm:text-sm text-slate-500 leading-relaxed">
                  Login untuk mulai mode narik dan aktifkan tracking armada.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 sm:mb-2">
                    Nomor HP / Username
                  </label>

                  <div className="relative">
                    <FaPhone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm" />

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-slate-200 bg-white pl-10 sm:pl-11 pr-3 sm:pr-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-1.5 sm:mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm" />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-slate-200 bg-white pl-10 sm:pl-11 pr-3 sm:pr-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Remember */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                  <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="accent-blue-600 w-4 h-4"
                    />
                    Ingat saya
                  </label>

                  <Link
                    href="/driver/auth/forgot-password"
                    className="text-blue-700 font-semibold hover:text-blue-800 whitespace-nowrap"
                  >
                    Lupa password?
                  </Link>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group mt-3 sm:mt-2 w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 sm:gap-3"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      Masuk & Aktifkan Mode Narik
                      <FaArrowRight className="group-hover:translate-x-1 transition" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5 sm:my-6">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium">atau</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Register Shortcut */}
              <Link
                href="/driver/auth/register"
                  className="group flex items-center justify-center gap-2 w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-blue-300 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.01]"
              >
                <FaUser className="text-sm" />
                Belum punya akun? Daftar
              </Link>

              {/* Bottom */}
              <div className="mt-5 sm:mt-6 bg-green-50 border border-green-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-green-700 leading-relaxed">
                  Akun driver perlu diverifikasi admin sebelum dapat digunakan
                  sepenuhnya.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
