"use client";

import Link from "next/link";
import { COLORS, TYPOGRAPHY } from "@/constants";
import { FaArrowRight, FaMapMarkerAlt, FaUsers, FaCalendar } from "react-icons/fa";

export default function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative flex min-h-[100dvh] items-center overflow-hidden pt-24 pb-12 md:pt-32 md:pb-20 lg:py-20"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/herov.png')",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-y-12 gap-x-8 lg:grid-cols-12">
          {/* Left Content */}
          <div className="max-w-[620px] space-y-7 lg:col-span-7 xl:col-span-6 text-left">
            <h1
              className="font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-[-1.5px]"
              style={{ color: COLORS.textDark }}
            >
              Jelajahi Kota Malang
              <br />
              dengan <span style={{ color: COLORS.primary }}>AngkotGo</span>
            </h1>

            <p
              className={`${TYPOGRAPHY.subheading} max-w-[460px] text-sm sm:text-base`}
              style={{
                color: COLORS.textSecondary,
              }}
            >
              Cari rute, lacak posisi angkot secara real-time, dan nikmati
              perjalanan yang lebih mudah di Kota Malang.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/list-rute"
                className="group flex items-center gap-2.5 rounded-full px-8 py-[15px] text-white transition hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: COLORS.accent,
                }}
              >
                <span className={TYPOGRAPHY.button}>Lihat Rute</span>

                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/schedules"
                className="flex items-center gap-2.5 rounded-full border-2 bg-white/80 px-8 py-[15px] backdrop-blur transition hover:bg-white hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  borderColor: COLORS.primary,
                  color: COLORS.primary,
                }}
              >
                <FaCalendar />

                <span className={TYPOGRAPHY.button}>Lihat Jadwal</span>
              </Link>
            </div>

            {/* Users */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-[5px]">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-white text-[11px] font-bold text-white"
                    style={{
                      background:
                        num === 1
                          ? "#60a5fa"
                          : num === 2
                            ? "#3b82f6"
                            : "#1E40AF",
                    }}
                  >
                    {num === 1 ? "R" : num === 2 ? "S" : "A"}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <FaUsers className="text-slate-400" />
                Dipercaya ribuan pengguna di Kota Malang
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="hidden lg:col-span-5 xl:col-span-6 lg:block" />
        </div>
      </div>

      {/* Gradient */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/50 to-transparent" />
    </section>
  );
}
