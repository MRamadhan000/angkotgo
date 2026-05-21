"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  FaArrowRight,
  FaBus,
  FaChartLine,
  FaClock,
  FaLock,
  FaShieldAlt,
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
      className={`${poppins.className} relative min-h-screen overflow-hidden`}
      style={{
        background:
          "linear-gradient(135deg, #e6f1fb 0%, #f8fafc 50%, #eaf3de 100%)",
      }}
    >
      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="absolute inset-0 overflow-hidden -z-10">
        {/* Blur */}
        <div className="absolute top-[-140px] right-[-140px] w-[420px] h-[420px] bg-blue-200/40 rounded-full blur-3xl animate-pulse" />

        <div className="absolute bottom-[-140px] left-[-140px] w-[420px] h-[420px] bg-cyan-200/40 rounded-full blur-3xl animate-pulse" />

        <div className="absolute top-[20%] left-[10%] w-[180px] h-[180px] bg-sky-300/20 rounded-full blur-3xl" />

        <div className="absolute bottom-[10%] right-[5%] w-[180px] h-[180px] bg-green-200/20 rounded-full blur-3xl" />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="min-h-screen grid lg:grid-cols-2">
        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <section className="hidden lg:flex relative overflow-hidden">
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0C447C] via-[#185FA5] to-[#378ADD]" />

          {/* Decorative */}
          <div className="absolute top-[-120px] right-[-120px] w-[320px] h-[320px] rounded-full bg-white/10" />

          <div className="absolute bottom-[-120px] left-[-120px] w-[260px] h-[260px] rounded-full bg-black/10" />

          <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 text-white w-full">
            {/* LOGO */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-3xl" />

                <div className="relative w-16 h-16 rounded-3xl bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                  <FaBus className="text-3xl text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  AngkotGo
                </h1>

                <p className="text-blue-100 text-sm">
                  Admin Management System
                </p>
              </div>
            </div>

            {/* HERO */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Secure Administration Panel
              </div>

              <h2 className="text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight">
                Kelola Sistem
                <br />
                Transportasi
                <span className="text-[#C8E6FF]"> Digital</span>
              </h2>

              <p className="mt-6 text-blue-100 text-lg leading-relaxed">
                Monitor armada, kelola driver, validasi akun, serta pantau
                aktivitas sistem AngkotGo secara real-time.
              </p>

              {/* FEATURES */}
              <div className="mt-10 space-y-4">
                <div className="flex items-start gap-4 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <FaUsersCog className="text-lg" />
                  </div>

                  <div>
                    <h3 className="font-bold text-lg">
                      Driver Management
                    </h3>

                    <p className="text-blue-100 text-sm mt-1">
                      Verifikasi dan kelola seluruh akun driver aktif.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <FaChartLine className="text-lg" />
                  </div>

                  <div>
                    <h3 className="font-bold text-lg">
                      Real-time Monitoring
                    </h3>

                    <p className="text-blue-100 text-sm mt-1">
                      Pantau armada dan statistik operasional secara langsung.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-5">
                <h3 className="text-3xl font-extrabold">120+</h3>

                <p className="text-blue-100 text-sm mt-1">
                  Armada Aktif
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-5">
                <h3 className="text-3xl font-extrabold">24/7</h3>

                <p className="text-blue-100 text-sm mt-1">
                  Monitoring
                </p>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-5">
                <h3 className="text-3xl font-extrabold">Realtime</h3>

                <p className="text-blue-100 text-sm mt-1">
                  Analytics
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            {/* MOBILE LOGO */}
            <div className="lg:hidden text-center mb-8">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full" />

                <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-[#0C447C] via-[#185FA5] to-[#378ADD] flex items-center justify-center shadow-[0_20px_40px_rgba(12,68,124,0.35)]">
                  <FaBus className="text-white text-2xl" />
                </div>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold text-slate-900 tracking-tight">
                AngkotGo
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Admin Management System
              </p>
            </div>

            {/* CARD */}
            <div className="relative overflow-hidden rounded-[30px] sm:rounded-[36px] border border-white/50 bg-white/75 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.10)] p-6 sm:p-8 lg:p-10">
              {/* Glow */}
              <div className="absolute inset-0 rounded-[36px] border border-blue-100/40 pointer-events-none" />

              {/* Top Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0C447C] via-[#378ADD] to-cyan-400" />

              {/* HEADER */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Secure Admin Access
                </div>

                <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Admin Login
                </h2>

                <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed">
                  Login untuk mengakses dashboard administrasi AngkotGo.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
                {/* USERNAME */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Username
                  </label>

                  <div className="group relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all" />

                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username"
                      className="w-full h-13 sm:h-14 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm pl-12 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                    >
                      Lupa password?
                    </button>
                  </div>

                  <div className="group relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all" />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full h-13 sm:h-14 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm pl-12 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative overflow-hidden w-full h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-[#0C447C] via-[#185FA5] to-[#378ADD] text-white font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] hover:shadow-[0_15px_35px_rgba(24,95,165,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {/* Shine */}
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                  <div className="relative flex items-center justify-center gap-3">
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Memverifikasi...
                      </>
                    ) : (
                      <>
                        Login ke Dashboard
                        <FaArrowRight className="group-hover:translate-x-1 transition" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* FOOTER */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
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