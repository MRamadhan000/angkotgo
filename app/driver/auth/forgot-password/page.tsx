"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  FaArrowLeft,
  FaArrowRight,
  FaBus,
  FaCheckCircle,
  FaInfoCircle,
  FaLock,
  FaPhone,
  FaShieldAlt,
  FaSpinner,
} from "react-icons/fa";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type Step = "phone" | "reset" | "success";

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function DriverForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");

  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ───────────────────────────────────────────────────────────
  // Step 1
  // ───────────────────────────────────────────────────────────

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!phone.trim()) {
      setError("Nomor HP wajib diisi.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep("reset");
    }, 1200);
  };

  // ───────────────────────────────────────────────────────────
  // Step 2
  // ───────────────────────────────────────────────────────────

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Password wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 1200);
  };

  // ───────────────────────────────────────────────────────────
  // Navigation
  // ───────────────────────────────────────────────────────────

  const handleBack = () => {
    if (step === "reset") {
      setStep("phone");
      setError("");
      setNewPassword("");
      setConfirmPassword("");
      return;
    }

    router.push("/driver/auth/login");
  };

  return (
    <main
      className={`${poppins.className} relative min-h-screen w-full overflow-x-hidden`}
      style={{
        background:
          "linear-gradient(135deg, #e6f1fb 0%, #f8fafc 50%, #eaf3de 100%)",
      }}
    >
      {/* ───────────────────────────────────────────── */}
      {/* Background Decorations */}
      {/* ───────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-140px] left-[-140px] w-[320px] sm:w-[420px] h-[320px] sm:h-[420px] bg-blue-200/40 rounded-full blur-3xl animate-pulse duration-4000" />
        <div className="absolute bottom-[-140px] right-[-140px] w-[320px] sm:w-[420px] h-[320px] sm:h-[420px] bg-cyan-200/40 rounded-full blur-3xl animate-pulse duration-4000" />
        <div className="absolute top-[20%] right-[10%] w-[140px] sm:w-[180px] h-[140px] sm:h-[180px] bg-sky-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[5%] w-[140px] sm:w-[180px] h-[140px] sm:h-[180px] bg-green-200/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:38px_38px]" />
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* Content Container */}
      {/* ───────────────────────────────────────────── */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] border border-white/60 bg-white/85 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 sm:p-8 lg:p-9">
            {/* Top Glow Border Lines */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-[32px] border border-blue-100/30 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0C447C] via-[#378ADD] to-cyan-400" />

            {/* Header Form */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {step === "phone" && "Lupa Password?"}
                {step === "reset" && "Reset Password"}
                {step === "success" && "Password Berhasil"}
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                {step === "phone" &&
                  "Masukkan nomor HP untuk melanjutkan proses reset password akun driver."}
                {step === "reset" &&
                  "Buat password baru yang aman untuk akun driver anda."}
                {step === "success" &&
                  "Password berhasil diperbarui dan akun siap digunakan kembali."}
              </p>
            </div>

            {/* STEP 1: Phone Request */}
            {step === "phone" && (
              <form
                onSubmit={handlePhoneSubmit}
                className="space-y-4 sm:space-y-5"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Nomor HP
                  </label>

                  <div className="group relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors text-xs sm:text-sm" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                    />
                  </div>

                  <div className="mt-3 flex items-start gap-2.5 rounded-xl sm:rounded-2xl bg-blue-50/70 border border-blue-100 p-3">
                    <FaInfoCircle className="text-blue-600 mt-0.5 flex-shrink-0 text-xs sm:text-sm" />
                    <p className="text-[11px] sm:text-xs text-blue-700 leading-relaxed">
                      Sistem akan memverifikasi nomor HP driver sebelum password
                      dapat direset.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl sm:rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs sm:text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative overflow-hidden w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0C447C] via-[#185FA5] to-[#378ADD] text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_12px_25px_rgba(24,95,165,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin text-xs sm:text-sm" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <span>Lanjutkan</span>
                        <FaArrowRight className="group-hover:translate-x-1 transition text-xs sm:text-sm" />
                      </>
                    )}
                  </div>
                </button>
              </form>
            )}

            {/* STEP 2: Password Reset */}
            {step === "reset" && (
              <form
                onSubmit={handleResetPassword}
                className="space-y-4 sm:space-y-5"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Password Baru
                  </label>

                  <div className="group relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors text-xs sm:text-sm" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Konfirmasi Password
                  </label>

                  <div className="group relative">
                    <FaShieldAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors text-xs sm:text-sm" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Konfirmasi password"
                      className={`w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl border bg-white pl-11 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition-all duration-300 shadow-sm hover:border-slate-300 focus:ring-4 ${
                        confirmPassword && newPassword !== confirmPassword
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
                    />
                  </div>

                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-600">
                      Password tidak cocok.
                    </p>
                  )}
                </div>

                <div className="rounded-xl sm:rounded-2xl border border-amber-100 bg-amber-50/70 p-3.5">
                  <p className="text-[11px] sm:text-xs text-amber-700 leading-relaxed">
                    Gunakan kombinasi huruf, angka, dan simbol agar password
                    lebih aman.
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl sm:rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs sm:text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative overflow-hidden w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0C447C] via-[#185FA5] to-[#378ADD] text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_12px_25px_rgba(24,95,165,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin text-xs sm:text-sm" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <FaArrowRight className="group-hover:translate-x-1 transition text-xs sm:text-sm" />
                      </>
                    )}
                  </div>
                </button>
              </form>
            )}

            {/* STEP 3: Success Screen */}
            {step === "success" && (
              <div className="space-y-5 sm:space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-100 flex items-center justify-center border border-green-200">
                      <FaCheckCircle className="text-4xl sm:text-5xl text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Password Berhasil Diubah
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Password akun driver anda berhasil diperbarui. Sekarang anda
                    dapat login kembali menggunakan password baru.
                  </p>
                </div>

                <div className="rounded-xl sm:rounded-2xl border border-green-100 bg-green-50 p-3.5">
                  <p className="text-[11px] sm:text-xs text-green-700 leading-relaxed text-center">
                    Sistem keamanan berhasil memperbarui kredensial akun anda.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/driver/auth/login")}
                  className="group relative overflow-hidden w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0C447C] via-[#185FA5] to-[#378ADD] text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_12px_25px_rgba(24,95,165,0.25)]"
                >
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="relative flex items-center justify-center gap-2">
                    <span>Kembali ke Login</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition text-xs sm:text-sm" />
                  </div>
                </button>
              </div>
            )}

            {/* Footer Back Controller */}
            {step !== "success" && (
              <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100 text-center">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors"
                >
                  <FaArrowLeft className="text-[10px] sm:text-xs" />
                  <span>Kembali</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Account Registry Link */}
          <div className="mt-5 text-center">
            <p className="text-xs sm:text-sm text-slate-500">
              Belum punya akun driver?{" "}
              <Link
                href="/driver/auth/register"
                className="font-bold text-blue-700 hover:text-blue-800 transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
