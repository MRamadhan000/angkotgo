"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { Step } from "./types";
import { COLORS } from "@/constants";

interface PageHeaderProps {
  step: Step;
}

const STEP_CONTENT: Record<Step, { title: string; subtitle: string }> = {
  1: {
    title: "Cari Rute Angkot",
    subtitle:
      "Masukkan lokasi awal dan tujuan untuk menemukan trayek angkot terbaik di Malang.",
  },
  2: {
    title: "Pilih Trayek",
    subtitle:
      "Beberapa trayek ditemukan sesuai tujuanmu. Pilih yang paling nyaman.",
  },
  3: {
    title: "Tracking Real-time",
    subtitle:
      "Pantau posisi angkot secara langsung hingga tiba di tujuanmu.",
  },
};

export function PageHeader({ step }: PageHeaderProps) {
  const { title, subtitle } = STEP_CONTENT[step];

  return (
    <div className="mb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold mb-5 transition-opacity hover:opacity-70"
        style={{ color: COLORS.primary }}
      >
        <FaArrowLeft size={12} />
        Kembali ke Beranda
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {/* Step pills */}
            {([1, 2, 3] as Step[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                  style={{
                    background:
                      s < step
                        ? "#10b981"
                        : s === step
                        ? COLORS.primary
                        : "#e2e8f0",
                    color: s <= step ? "#fff" : "#94a3b8",
                  }}
                >
                  {s < step ? "✓" : s}
                </div>
                {s < 3 && (
                  <div
                    className="w-8 h-px transition-all duration-300"
                    style={{
                      background: s < step ? "#10b981" : "#e2e8f0",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <h1
            className="font-bold text-3xl sm:text-4xl tracking-tight leading-tight"
            style={{ color: COLORS.textDark }}
          >
            {title}
          </h1>
          <p
            className="mt-2 text-sm sm:text-base max-w-lg"
            style={{ color: COLORS.textSecondary }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
