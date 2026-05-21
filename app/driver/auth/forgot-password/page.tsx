"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaPhone, FaArrowRight, FaBus, FaArrowLeft } from "react-icons/fa";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function DriverForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "reset" | "success">("phone");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phone.trim()) {
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
        setStep("reset");
      }, 800);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.trim() && confirmPassword.trim() && newPassword === confirmPassword) {
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
        setStep("success");
      }, 800);
    }
  };

  const handleBackToLogin = () => {
    router.push("/driver/auth/login");
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
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FaBus className="text-white text-xl" />
              </div>
            </div>

            <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {step === "phone" && "Lupa Password?"}
              {step === "reset" && "Reset Password"}
              {step === "success" && "Password Berhasil"}
            </h1>

            <p className="mt-3 text-slate-500 text-sm sm:text-base">
              {step === "phone" && "Masukkan nomor HP untuk reset password"}
              {step === "reset" && "Buat password baru yang kuat"}
              {step === "success" && "Password anda sudah diperbarui"}
            </p>
          </div>

          {/* STEP 1: PHONE */}
          {step === "phone" && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
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

                <p className="text-xs text-slate-500 mt-2">
                  Kami akan mengirimkan kode verifikasi ke nomor ini
                </p>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isLoading || !phone.trim()}
                className="group relative overflow-hidden w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 text-white font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(37,99,235,0.35)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Lanjutkan</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition" />
                    </>
                  )}
                </div>
              </button>
            </form>
          )}

          {/* STEP 2: RESET PASSWORD */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* NEW PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password Baru
                </label>

                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                    </svg>
                  </div>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm py-4 pl-12 pr-4 text-black outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                  />
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Konfirmasi Password
                </label>

                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                    </svg>
                  </div>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi password"
                    className={`w-full rounded-2xl border bg-white/80 backdrop-blur-sm py-4 pl-12 pr-4 text-black outline-none transition-all duration-300 shadow-sm hover:border-slate-300 focus:ring-4 ${
                      confirmPassword && newPassword !== confirmPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />
                </div>

                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">Password tidak cocok</p>
                )}
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isLoading || !newPassword.trim() || newPassword !== confirmPassword}
                className="group relative overflow-hidden w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 text-white font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(37,99,235,0.35)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition" />
                    </>
                  )}
                </div>
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === "success" && (
            <div className="space-y-6">
              {/* SUCCESS ICON */}
              <div className="flex justify-center">
                <div className="relative w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* SUCCESS MESSAGE */}
              <div className="text-center">
                <p className="text-slate-600 text-sm sm:text-base">
                  Password anda telah berhasil direset. Silakan login dengan password baru anda.
                </p>
              </div>

              {/* BUTTON */}
              <button
                onClick={handleBackToLogin}
                className="group relative overflow-hidden w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 text-white font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(37,99,235,0.35)] active:scale-[0.99]"
              >
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="relative flex items-center justify-center gap-3">
                  <span>Kembali ke Login</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition" />
                </div>
              </button>
            </div>
          )}

          {/* FOOTER - BACK BUTTON */}
          {step !== "success" && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  if (step === "reset") {
                    setStep("phone");
                    setPhone("");
                  } else {
                    handleBackToLogin();
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition flex items-center justify-center gap-2 mx-auto"
              >
                <FaArrowLeft className="text-xs" />
                Kembali
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
