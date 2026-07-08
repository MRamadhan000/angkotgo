"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaBus,
  FaPhone,
  FaLock,
  FaArrowRight,
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DriverLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      setError("Nomor HP wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/drivers/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        throw new Error("Gagal login, periksa kembali nomor HP Anda.");
      }

      const data = await response.json();
      
      // Simpan id ke localStorage
      if (data && data.id) {
        localStorage.setItem("driverId", data.id.toString());
      }
      
      router.push("/driver/dashboard");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className={`${poppins.className} min-h-screen lg:h-screen lg:overflow-hidden relative`}
      style={{
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f0fdf4 100%)",
      }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-green-200/40 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:38px_38px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen lg:h-full items-stretch">
        {/* ================================================= */}
        {/* LEFT SIDE (Desktop View Panel) */}
        {/* ================================================= */}
        <section className="hidden lg:flex relative overflow-hidden h-full">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500" />

          {/* Decorative Elements */}
          <div className="absolute top-[-120px] right-[-120px] w-[300px] h-[300px] rounded-full bg-white/10" />
          <div className="absolute bottom-[-100px] left-[-100px] w-[240px] h-[240px] rounded-full bg-black/10" />

          <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full h-full">
            {/* Hero Brand Title */}
            <div className="max-w-xl my-auto">
              <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
                Pantau Angkot
                <br />
                Secara
                <span className="text-cyan-200"> Real-Time</span>
              </h2>

              <p className="mt-6 text-blue-100 text-base xl:text-lg leading-relaxed opacity-95">
                Membantu mahasiswa dan masyarakat mengetahui posisi angkot,
                estimasi kedatangan, serta kapasitas kursi secara langsung.
              </p>

              {/* Dynamic Feature List */}
              <div className="mt-8 xl:mt-10 space-y-4">
                <div className="flex items-start gap-4 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <FaBus className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base xl:text-lg">
                      Tracking Armada
                    </h3>
                    <p className="text-blue-100 text-xs xl:text-sm mt-1 opacity-90">
                      Lihat posisi angkot yang sedang beroperasi secara langsung
                      di peta.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base xl:text-lg">
                      Jadwal Dinamis
                    </h3>
                    <p className="text-blue-100 text-xs xl:text-sm mt-1 opacity-90">
                      Informasi estimasi waktu tiba jauh lebih akurat
                      berdasarkan kondisi lapangan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-footer inside panel */}
            <div className="text-xs text-blue-200/60 pt-4 border-t border-white/10 flex justify-between">
              <p>© 2026 AngkotGo App</p>
              <p>v2.4.0</p>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* RIGHT SIDE (Responsive Login Form) */}
        {/* ================================================= */}
        <section className="flex flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-12 lg:px-10 xl:px-16 w-full h-full my-auto">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile View Header Logo (Hanya muncul di resolusi layar < lg) */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
                  <FaBus className="text-white text-lg" />
                </div>
              </div>
              <h1 className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">
                AngkotGo
              </h1>
              <p className="text-xs text-slate-500">
                Sistem Pemantauan Operasional Driver
              </p>
            </div>

            {/* Main Form Container Box */}
            <div className="bg-white/75 backdrop-blur-2xl border border-white/60 rounded-2xl sm:rounded-[28px] p-5 sm:p-7 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              {/* Header */}
              <div className="mb-5 sm:mb-6 text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  Masuk ke Dashboard
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                  Silakan masuk menggunakan kredensial driver Anda.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Phone Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Nomor HP / Username
                  </label>
                  <div className="group relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* Password Field
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="group relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
                    />
                  </div>
                </div> */}

                {/* Remember & Forgot Row */}
                <div className="flex items-center justify-between gap-2 pt-1 text-xs sm:text-sm">
                  <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="accent-blue-600 w-4 h-4 rounded"
                    />
                    <span>Ingat saya</span>
                  </label>

                  <Link
                    href="/driver/auth/forgot-password"
                    className="text-blue-600 font-bold hover:text-blue-800 transition-colors whitespace-nowrap"
                  >
                    Lupa password?
                  </Link>
                </div>

                {/* Error Box Alert */}
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm rounded-xl px-4 py-2.5">
                    {error}
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group mt-2 w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin text-xs sm:text-sm" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition text-xs sm:text-sm" />
                    </>
                  )}
                </button>
              </form>

              {/* Visual Divider Line */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-wide">
                  atau
                </span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Register Shortcut Button */}
              <Link
                href="/driver/auth/register"
                className="group flex items-center justify-center gap-2 w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl border-2 border-blue-200 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-bold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.01]"
              >
                <FaUser className="text-xs sm:text-sm" />
                <span>Belum punya akun? Daftar</span>
              </Link>

              {/* Bottom Notice Info Box */}
              <div className="mt-5 bg-green-50 border border-green-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-green-700 leading-relaxed flex items-start gap-2">
                  <FaInfoCircle className="mt-0.5 flex-shrink-0 text-green-600" />
                  <span>
                    Akun driver perlu diverifikasi admin sebelum dapat digunakan
                    sepenuhnya.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
