"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  FaArrowRight,
  FaBus,
  FaChartLine,
  FaClock,
  FaLock,
  FaSpinner,
  FaUser,
  FaUsersCog,
} from "react-icons/fa";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setIsLoading(true);

    // TODO: API LOGIN

    setTimeout(() => {
      router.push("/admin");
    }, 1200);
  };

  return (
    <main
      className={`${poppins.className} relative min-h-screen overflow-x-hidden`}
      style={{
        background:
          "linear-gradient(135deg, #e6f1fb 0%, #f8fafc 50%, #eaf3de 100%)",
      }}
    >
      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        {/* Blur Blobs */}
        <div className="absolute top-[-140px] right-[-140px] w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] bg-blue-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-140px] left-[-140px] w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] bg-cyan-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-[20%] left-[10%] w-[120px] sm:w-[180px] h-[120px] sm:h-[180px] bg-sky-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] right-[5%] w-[120px] sm:w-[180px] h-[120px] sm:h-[180px] bg-green-200/20 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* ================================================= */}
      {/* CONTENT GRID */}
      {/* ================================================= */}
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 items-stretch">
        {/* ================================================= */}
        {/* LEFT SIDE (Hanya tampil di Desktop / lg) */}
        {/* ================================================= */}
        <section className="hidden lg:flex relative overflow-hidden h-full min-h-screen">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0C447C] via-[#185FA5] to-[#378ADD]" />

          {/* Decorative shapes */}
          <div className="absolute top-[-120px] right-[-120px] w-[320px] h-[320px] rounded-full bg-white/10" />
          <div className="absolute bottom-[-120px] left-[-120px] w-[260px] h-[260px] rounded-full bg-black/10" />

          {/* Main Container */}
          <div className="relative z-10 flex flex-col justify-between p-8 xl:p-14 text-white w-full gap-8">
            {/* BRAND LOGO */}
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-3xl" />
                <div className="relative w-14 h-14 xl:w-16 xl:h-16 rounded-2xl xl:rounded-3xl bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                  <FaBus className="text-2xl xl:text-3xl text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight">
                  AngkotGo
                </h1>
                <p className="text-blue-100 text-xs xl:text-sm">
                  Admin Management System
                </p>
              </div>
            </div>

            {/* HERO CONTENT */}
            <div className="max-w-xl my-auto py-4">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs xl:text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Secure Administration Panel
              </div>

              <h2 className="text-4xl xl:text-6xl font-extrabold leading-tight tracking-tight">
                Kelola Sistem
                <br />
                Transportasi
                <span className="text-[#C8E6FF]"> Digital</span>
              </h2>

              <p className="mt-4 xl:mt-6 text-blue-100 text-base xl:text-lg leading-relaxed opacity-90">
                Monitor armada, kelola driver, validasi akun, serta pantau
                aktivitas sistem AngkotGo secara real-time.
              </p>

              {/* FEATURES LIST */}
              <div className="mt-8 xl:mt-10 space-y-4">
                <div className="flex items-start gap-4 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <FaUsersCog className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base xl:text-lg">
                      Driver Management
                    </h3>
                    <p className="text-blue-100/80 text-xs xl:text-sm mt-0.5">
                      Verifikasi dan kelola seluruh akun driver aktif.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <FaChartLine className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base xl:text-lg">
                      Real-time Monitoring
                    </h3>
                    <p className="text-blue-100/80 text-xs xl:text-sm mt-0.5">
                      Pantau armada dan statistik operasional secara langsung.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* STATS COUNTER */}
            <div className="grid grid-cols-3 gap-3 xl:gap-4">
              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4 xl:p-5">
                <h3 className="text-2xl xl:text-3xl font-extrabold">120+</h3>
                <p className="text-blue-100/80 text-xs mt-1">Armada Aktif</p>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4 xl:p-5">
                <h3 className="text-2xl xl:text-3xl font-extrabold">24/7</h3>
                <p className="text-blue-100/80 text-xs mt-1">Monitoring</p>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4 xl:p-5">
                <h3 className="text-2xl xl:text-3xl font-extrabold text-ellipsis overflow-hidden">
                  Realtime
                </h3>
                <p className="text-blue-100/80 text-xs mt-1">Analytics</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* RIGHT SIDE (Form Login - Selalu Tampil) */}
        {/* ================================================= */}
        <section className="flex items-center justify-center px-4 py-8 sm:px-6 md:py-12 lg:px-12 xl:px-16 h-full min-h-screen">
          <div className="w-full max-w-md mx-auto">
            {/* MOBILE LOGO (Hanya muncul di layar < lg) */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full" />
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#0C447C] via-[#185FA5] to-[#378ADD] flex items-center justify-center shadow-[0_15px_30px_rgba(12,68,124,0.3)]">
                  <FaBus className="text-white text-xl sm:text-2xl" />
                </div>
              </div>
              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                AngkotGo
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Admin Management System
              </p>
            </div>

            {/* LOGIN CARD */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-[36px] border border-white/60 bg-white/75 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-5 sm:p-8 lg:p-10">
              {/* Border glow */}
              <div className="absolute inset-0 rounded-[36px] border border-blue-100/30 pointer-events-none" />
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0C447C] via-[#378ADD] to-cyan-400" />

              {/* CARD HEADER */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Secure Admin Access
                </div>

                <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Admin Login
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Login untuk mengakses dashboard administrasi AngkotGo.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                {/* USERNAME FIELD */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Username
                  </label>
                  <div className="group relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all text-sm sm:text-base" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username"
                      className="w-full h-11 sm:h-14 rounded-xl sm:rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm pl-11 sm:pl-12 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* PASSWORD FIELD */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-[11px] sm:text-xs font-semibold text-blue-700 hover:text-blue-800"
                    >
                      Lupa password?
                    </button>
                  </div>
                  <div className="group relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all text-sm sm:text-base" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full h-11 sm:h-14 rounded-xl sm:rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm pl-11 sm:pl-12 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* ERROR NOTIFICATION */}
                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-red-600 animate-fade-in">
                    {error}
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative overflow-hidden w-full h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0C447C] via-[#185FA5] to-[#378ADD] text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] active:scale-[0.99] hover:shadow-[0_12px_24px_rgba(24,95,165,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {/* Glow overlay animation */}
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <span>Login ke Dashboard</span>
                        <FaArrowRight className="group-hover:translate-x-1 transition text-xs sm:text-sm" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* CARD FOOTER */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <FaClock />
                  Online Monitoring
                </div>
                <p>© 2026 AngkotGo</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}