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
      className={`${poppins.className} relative min-h-screen overflow-hidden`}
      style={{
        background:
          "linear-gradient(135deg, #e6f1fb 0%, #f8fafc 50%, #eaf3de 100%)",
      }}
    >
      {/* ───────────────────────────────────────────── */}
      {/* Background */}
      {/* ───────────────────────────────────────────── */}

      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-140px] left-[-140px] w-[420px] h-[420px] bg-blue-200/40 rounded-full blur-3xl animate-pulse" />

        <div className="absolute bottom-[-140px] right-[-140px] w-[420px] h-[420px] bg-cyan-200/40 rounded-full blur-3xl animate-pulse" />

        <div className="absolute top-[20%] right-[10%] w-[180px] h-[180px] bg-sky-300/20 rounded-full blur-3xl" />

        <div className="absolute bottom-[10%] left-[5%] w-[180px] h-[180px] bg-green-200/20 rounded-full blur-3xl" />

        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:38px_38px]" />
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* Content */}
      {/* ───────────────────────────────────────────── */}

      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full" />

              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#0C447C] via-[#185FA5] to-[#378ADD] flex items-center justify-center shadow-[0_20px_40px_rgba(12,68,124,0.35)]">
                <FaBus className="text-white text-2xl sm:text-3xl" />
              </div>
            </div>

            <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              AngkotGo
            </h1>

            <p className="mt-2 text-sm sm:text-base text-slate-500">
              Smart Transportation Platform
            </p>
          </div>

          {/* Card */}
          <div className="relative overflow-hidden rounded-[30px] sm:rounded-[36px] border border-white/50 bg-white/75 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.10)] p-6 sm:p-8 lg:p-10">
            {/* Top Glow */}
            <div className="absolute inset-0 rounded-[36px] border border-blue-100/40 pointer-events-none" />

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0C447C] via-[#378ADD] to-cyan-400" />

            {/* Header */}
            <div className="text-center mb-7 sm:mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Driver Security Center
              </div>

              <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {step === "phone" && "Lupa Password?"}
                {step === "reset" && "Reset Password"}
                {step === "success" && "Password Berhasil"}
              </h2>

              <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed">
                {step === "phone" &&
                  "Masukkan nomor HP untuk melanjutkan proses reset password akun driver."}

                {step === "reset" &&
                  "Buat password baru yang aman untuk akun driver anda."}

                {step === "success" &&
                  "Password berhasil diperbarui dan akun siap digunakan kembali."}
              </p>
            </div>

            {/* STEP 1 */}
            {step === "phone" && (
              <form onSubmit={handlePhoneSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nomor HP
                  </label>

                  <div className="group relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all" />

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full h-13 sm:h-14 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm pl-12 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                    />
                  </div>

                  <div className="mt-3 flex items-start gap-2 rounded-2xl bg-blue-50 border border-blue-100 p-3">
                    <FaInfoCircle className="text-blue-600 mt-0.5 flex-shrink-0" />

                    <p className="text-xs text-blue-700 leading-relaxed">
                      Sistem akan memverifikasi nomor HP driver sebelum password dapat direset.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative overflow-hidden w-full h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-[#0C447C] via-[#185FA5] to-[#378ADD] text-white font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] hover:shadow-[0_15px_35px_rgba(24,95,165,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                  <div className="relative flex items-center justify-center gap-3">
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Memverifikasi...
                      </>
                    ) : (
                      <>
                        Lanjutkan
                        <FaArrowRight className="group-hover:translate-x-1 transition" />
                      </>
                    )}
                  </div>
                </button>
              </form>
            )}

            {/* STEP 2 */}
            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-5 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password Baru
                  </label>

                  <div className="group relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all" />

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full h-13 sm:h-14 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm pl-12 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Konfirmasi Password
                  </label>

                  <div className="group relative">
                    <FaShieldAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all" />

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Konfirmasi password"
                      className={`w-full h-13 sm:h-14 rounded-2xl border bg-white/80 backdrop-blur-sm pl-12 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 shadow-sm hover:border-slate-300 focus:ring-4 ${
                        confirmPassword && newPassword !== confirmPassword
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
                    />
                  </div>

                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-2 text-xs text-red-600">
                      Password tidak cocok.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Gunakan kombinasi huruf, angka, dan simbol agar password lebih aman.
                  </p>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative overflow-hidden w-full h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-[#0C447C] via-[#185FA5] to-[#378ADD] text-white font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] hover:shadow-[0_15px_35px_rgba(24,95,165,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                  <div className="relative flex items-center justify-center gap-3">
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <FaArrowRight className="group-hover:translate-x-1 transition" />
                      </>
                    )}
                  </div>
                </button>
              </form>
            )}

            {/* STEP 3 */}
            {step === "success" && (
              <div className="space-y-7">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />

                    <div className="relative w-24 h-24 rounded-full bg-green-100 flex items-center justify-center border border-green-200">
                      <FaCheckCircle className="text-5xl text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Password Berhasil Diubah
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed">
                    Password akun driver anda berhasil diperbarui. Sekarang anda dapat login kembali menggunakan password baru.
                  </p>
                </div>

                <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                  <p className="text-sm text-green-700 leading-relaxed text-center">
                    Sistem keamanan berhasil memperbarui kredensial akun anda.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/driver/auth/login")}
                  className="group relative overflow-hidden w-full h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-[#0C447C] via-[#185FA5] to-[#378ADD] text-white font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] hover:shadow-[0_15px_35px_rgba(24,95,165,0.35)]"
                >
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                  <div className="relative flex items-center justify-center gap-3">
                    Kembali ke Login
                    <FaArrowRight className="group-hover:translate-x-1 transition" />
                  </div>
                </button>
              </div>
            )}

            {/* Footer */}
            {step !== "success" && (
              <div className="mt-7 sm:mt-8 pt-6 border-t border-slate-100 text-center">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-all"
                >
                  <FaArrowLeft className="text-xs" />
                  Kembali
                </button>
              </div>
            )}
          </div>

          {/* Bottom Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Belum punya akun driver?{" "}
              <Link
                href="/driver/auth/register"
                className="font-bold text-blue-700 hover:text-blue-800"
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