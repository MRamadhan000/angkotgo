"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  FaBus,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaArrowRight,
  FaSpinner,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

function Sidebar() {
  return (
    <aside className="hidden lg:flex w-full flex-col bg-gradient-to-br from-blue-600 to-cyan-500 px-8 py-10 relative overflow-hidden h-full justify-between">
      {/* Decorative */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-black/5 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-lg my-auto">
        <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
          Bergabung Menjadi
          <span className="text-[#C8E6FF]"> Driver AngkotGo</span>
        </h2>

        <p className="mt-6 text-blue-500 bg-blue-50/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs xl:text-sm font-medium inline-flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Sistem Navigasi Real-time
        </p>

        <p className="mt-2 text-blue-100 text-base xl:text-lg leading-relaxed opacity-95">
          Daftarkan dirimu sebagai driver dan mulai aktifkan tracking armada
          secara real-time untuk membantu penumpang menemukan angkot lebih
          mudah.
        </p>

        {/* Features */}
        <div className="mt-8 xl:mt-10 space-y-4">
          <div className="flex items-start gap-4 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4 transition-all hover:bg-white/15">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <FaCheckCircle className="text-lg text-green-300" />
            </div>
            <div>
              <h3 className="font-bold text-base xl:text-lg text-white">
                Registrasi Mudah
              </h3>
              <p className="text-blue-100 text-xs xl:text-sm mt-1 opacity-90">
                Hanya membutuhkan data dasar untuk proses pendaftaran driver
                tanpa ribet.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4 transition-all hover:bg-white/15">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <FaBus className="text-lg text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base xl:text-lg text-white">
                Tracking Real-time
              </h3>
              <p className="text-blue-100 text-xs xl:text-sm mt-1 opacity-90">
                Driver dapat mengaktifkan mode narik dan membagikan lokasi
                armada secara langsung.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding info */}
      <div className="relative z-10 text-xs text-blue-200/70 border-t border-white/10 pt-4 mt-auto flex items-center justify-between">
        <p>© 2026 AngkotGo Team</p>
        <p>V1.2.0</p>
      </div>
    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DriverRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !phone.trim() || !licenseNumber.trim()) {
      setError("Semua field wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/drivers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          phone: phone,
          licenseNumber: licenseNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mendaftar, silakan coba lagi.");
      }

      router.push("/driver/auth/login");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className={`${poppins.className} min-h-screen relative overflow-x-hidden`}
      style={{
        background:
          "linear-gradient(135deg, #e6f1fb 0%, #f8fafc 50%, #eaf3de 100%)",
      }}
    >
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-120px] left-[-120px] w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] bg-blue-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-120px] right-[-120px] w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] bg-green-200/40 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:38px_38px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen items-stretch">
        {/* LEFT SIDE */}
        <section className="hidden lg:flex h-full">
          <Sidebar />
        </section>

        {/* RIGHT SIDE */}
        <section className="flex flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-12 lg:px-10 xl:px-16 w-full h-full">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile & Tablet Logo Header (Hanya tampil di layar < lg) */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_15px_30px_rgba(37,99,235,0.25)]">
                  <FaBus className="text-white text-xl" />
                </div>
              </div>
              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                AngkotGo
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Driver Registration System
              </p>
            </div>

            {/* Registration Card */}
            <div className="bg-white/75 backdrop-blur-2xl border border-white/60 rounded-2xl sm:rounded-[28px] p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              {/* Card Header */}
              <div className="mb-5 sm:mb-6 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  Daftar Driver Baru
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Lengkapi data berikut untuk membuat akun driver AngkotGo.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Nama Lengkap
                  </label>
                  <div className="group relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Nomor Telepon
                  </label>
                  <div className="group relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* Nomor SIM */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Nomor SIM (Contoh: A1234567)
                  </label>
                  <div className="group relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="email"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="contoh@email.com"
                      className="w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* Error Box */}
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm rounded-xl px-4 py-2.5 animate-pulse">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group mt-2 w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin text-xs sm:text-sm" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Sekarang</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition text-xs sm:text-sm" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Notice */}
              <div className="mt-5 bg-green-50 border border-green-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <p className="flex items-start gap-2 text-[11px] sm:text-xs text-green-700 leading-relaxed">
                  <FaInfoCircle className="mt-0.5 flex-shrink-0 text-green-600" />
                  <span>
                    Setelah registrasi, akun driver akan diverifikasi oleh admin
                    sebelum dapat digunakan sepenuhnya.
                  </span>
                </p>
              </div>

              {/* Login Redirect Link */}
              <div className="mt-5 text-center">
                <p className="text-xs sm:text-sm text-slate-500">
                  Sudah punya akun?{" "}
                  <Link
                    href="/driver/auth/login"
                    className="text-blue-600 font-bold hover:text-blue-800 transition-colors inline-block"
                  >
                    Masuk sekarang
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
