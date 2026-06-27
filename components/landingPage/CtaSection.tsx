"use client";

import React from "react";
import Link from "next/link";
import { FaMapMarkerAlt } from "react-icons/fa";
import { COLORS, TYPOGRAPHY } from "@/constants";

export default function CTASection() {
  return (
    <section className="bg-white px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div
          className="relative flex min-h-[280px] py-12 md:py-0 md:h-[280px] items-center justify-center overflow-hidden rounded-3xl px-6 sm:px-8 text-center"
          style={{
            backgroundImage: "url('/bannercta.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: COLORS.primary,
              opacity: 0.72,
            }}
          />

          {/* Content */}
          <div className="relative z-10 max-w-3xl">
            <h2
              className="mb-4 text-2xl sm:text-3xl md:text-5xl font-bold leading-tight"
              style={{ color: COLORS.white }}
            >
              Siap Menjelajahi Kota Malang?
            </h2>

            <p
              className={`${TYPOGRAPHY.subheading} mx-auto mb-8 max-w-xl text-sm sm:text-base`}
              style={{
                color: "rgba(255,255,255,0.88)",
              }}
            >
              Temukan angkot terdekat dan mulai perjalananmu sekarang.
            </p>

            <Link
              href="/rute"
              className="inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-3.5 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl"
              style={{
                backgroundColor: COLORS.white,
                color: COLORS.primary,
              }}
            >
              <span className={TYPOGRAPHY.button}>
                Mulai Tracking Sekarang
              </span>

              <FaMapMarkerAlt className="text-lg" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}