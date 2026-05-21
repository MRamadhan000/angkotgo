"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaPhone, FaLock, FaArrowRight, FaBus } from "react-icons/fa";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function DriverLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phone.trim() && password.trim()) {
      setIsLoading(true);

      setTimeout(() => {
        router.push("/driver");
      }, 800);
    }
  };

  return (
    <main
      className={`${poppins.className} relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4 py-8`}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-120px] right-[-120px] w-[420px] h-[420px] bg-blue-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-120px] left-[-120px] w-[420px] h-[420px] bg-cyan-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* CARD */}
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-[32px] border border-white/30 bg-white/70 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.12)] p-8 sm:p-10">
          {/* Gradient Border Glow */}
          <div className="absolute inset-0 rounded-[32px] border border-blue-100/50 pointer-events-none" />

          {/* TOP DECORATION */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500" />

          {/* HEADER */}
          <div className="text-center mb-10">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FaBus className="text-white text-xl" />
              </div>
            </div>

            <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Driver Login
            </h1>

            <p className="mt-3 text-slate-500 text-sm sm:text-base">
              Masuk ke akun driver AngkotGo
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* PHONE */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nomor HP
              </label>

              <div className="group relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:text-blue-700 transition" />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm py-4 pl-12 pr-4 text-black outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="group relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:text-blue-700 transition" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm py-4 pl-12 pr-4 text-black outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                />
              </div>
            </div>

            {/* FORGOT PASSWORD LINK */}
            <div className="text-right">
              <Link href="/driver/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition">
                Lupa password?
              </Link>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative overflow-hidden w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 text-white font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(37,99,235,0.35)] active:scale-[0.99] disabled:opacity-60"
            >
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              <div className="relative flex items-center justify-center gap-3">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Login</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Belum punya akun?{" "}
              <Link href="/driver/auth/register" className="text-blue-600 font-semibold hover:text-blue-700 transition">
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
