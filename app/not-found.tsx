"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaHome, FaBus } from "react-icons/fa";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function NotFound() {
  const router = useRouter();

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

      {/* CONTAINER */}
      <div className="w-full max-w-2xl">
        {/* CARD */}
        <div className="relative overflow-hidden rounded-[32px] border border-white/30 bg-white/70 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.12)] p-8 sm:p-12 md:p-16">
          {/* Gradient Border Glow */}
          <div className="absolute inset-0 rounded-[32px] border border-blue-100/50 pointer-events-none" />

          {/* TOP DECORATION */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500" />

          {/* CONTENT */}
          <div className="text-center">
            {/* 404 ANIMATION */}
            <div className="mb-8 sm:mb-10 relative inline-block">
              <div className="text-9xl sm:text-[150px] md:text-[180px] font-black bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent animate-bounce">
                404
              </div>

              {/* FLOATING ICON */}
              <div className="absolute top-1/2 right-0 transform translate-x-12 -translate-y-1/2">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 animate-spin" style={{ animationDuration: "3s" }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center">
                    <FaBus className="text-white text-2xl sm:text-3xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* HEADER */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mt-8 sm:mt-10 tracking-tight">
              Halaman Tidak Ditemukan
            </h1>

            {/* DESCRIPTION */}
            <p className="mt-4 sm:mt-6 text-slate-600 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
              Maaf, halaman yang anda cari tidak ada atau sudah dihapus. Silakan kembali ke halaman utama atau hubungi support kami.
            </p>

            {/* ERROR CODE */}
            <div className="mt-8 sm:mt-10 flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              <span className="text-sm font-semibold text-slate-500 px-4">Error Code: 404</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            </div>

            {/* BUTTONS */}
            <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              {/* BACK BUTTON */}
              <button
                onClick={() => router.back()}
                className="group relative overflow-hidden px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl border-2 border-blue-600 text-blue-600 font-semibold transition-all duration-300 hover:bg-blue-50 active:scale-[0.99] w-full sm:w-auto"
              >
                <div className="relative flex items-center justify-center gap-3">
                  <FaArrowLeft className="group-hover:-translate-x-1 transition" />
                  <span>Kembali</span>
                </div>
              </button>

              {/* HOME BUTTON */}
              <Link
                href="/"
                className="group relative overflow-hidden w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(37,99,235,0.35)] active:scale-[0.99]"
              >
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="relative flex items-center justify-center gap-3">
                  <FaHome />
                  <span>Ke Halaman Utama</span>
                </div>
              </Link>
            </div>

            {/* QUICK LINKS */}
            <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-slate-100">
              <p className="text-sm text-slate-600 font-semibold mb-4 sm:mb-6">
                Navigasi Cepat:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <Link
                  href="/admin"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-blue-100 hover:text-blue-600 transition text-xs sm:text-sm"
                >
                  Admin Dashboard
                </Link>

                <Link
                  href="/driver"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-blue-100 hover:text-blue-600 transition text-xs sm:text-sm"
                >
                  Driver Dashboard
                </Link>

                <Link
                  href="/rute"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-blue-100 hover:text-blue-600 transition text-xs sm:text-sm"
                >
                  Cari Rute
                </Link>

                <Link
                  href="/admin/auth/login"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-blue-100 hover:text-blue-600 transition text-xs sm:text-sm"
                >
                  Admin Login
                </Link>

                <Link
                  href="/driver/auth/login"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-blue-100 hover:text-blue-600 transition text-xs sm:text-sm"
                >
                  Driver Login
                </Link>

                <Link
                  href="/driver/auth/register"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-blue-100 hover:text-blue-600 transition text-xs sm:text-sm"
                >
                  Driver Register
                </Link>
              </div>
            </div>
          </div>

          {/* FOOTER MESSAGE */}
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-500">
              Jika anda merasa ini adalah kesalahan, silakan{" "}
              <a href="mailto:support@angkotgo.com" className="text-blue-600 font-semibold hover:text-blue-700">
                hubungi support
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
