"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUser, FaPhone, FaLock, FaArrowRight, FaBus, FaCheck } from "react-icons/fa";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function DriverRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.name.trim() && formData.phone.trim() && formData.password.trim() && formData.confirmPassword.trim()) {
      setIsLoading(true);

      setTimeout(() => {
        router.push("/driver/auth/login");
      }, 800);
    }
  };

  const isFormValid =
    formData.name.trim() &&
    formData.phone.trim() &&
    formData.password.trim() &&
    formData.confirmPassword.trim() &&
    formData.password === formData.confirmPassword;

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
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FaBus className="text-white text-xl" />
              </div>
            </div>

            <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Daftar Driver
            </h1>

            <p className="mt-3 text-slate-500 text-sm sm:text-base">
              Buat akun driver AngkotGo baru
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* NAME */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nama Lengkap
              </label>

              <div className="group relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:text-blue-700 transition" />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm py-3.5 pl-12 pr-4 text-black outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                />
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nomor HP
              </label>

              <div className="group relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:text-blue-700 transition" />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm py-3.5 pl-12 pr-4 text-black outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm py-3.5 pl-12 pr-4 text-black outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Konfirmasi Password
              </label>

              <div className="group relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 group-focus-within:text-blue-700 transition" />

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Konfirmasi password"
                  className={`w-full rounded-2xl border bg-white/80 backdrop-blur-sm py-3.5 pl-12 pr-4 text-black outline-none transition-all duration-300 shadow-sm hover:border-slate-300 focus:ring-4 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                  }`}
                />

                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <FaCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600" />
                )}
              </div>

              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Password tidak cocok</p>
              )}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="group relative overflow-hidden w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 text-white font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(37,99,235,0.35)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-8"
            >
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              <div className="relative flex items-center justify-center gap-3">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Daftar</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Sudah punya akun?{" "}
              <Link href="/driver/auth/login" className="text-blue-600 font-semibold hover:text-blue-700 transition">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
