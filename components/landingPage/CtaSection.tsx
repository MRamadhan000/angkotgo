"use client";

import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { COLORS, TYPOGRAPHY } from "@/constants";

export default function CTASection() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div
          className="relative flex h-[260px] items-center justify-center overflow-hidden rounded-3xl px-8 text-center"
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
              className="mb-3 text-3xl font-bold leading-tight md:text-5xl"
              style={{ color: COLORS.white }}
            >
              Siap Menjelajahi Kota Malang?
            </h2>

            <p
              className={`${TYPOGRAPHY.subheading} mx-auto mb-8 max-w-xl`}
              style={{
                color: "rgba(255,255,255,0.88)",
              }}
            >
              Temukan angkot terdekat dan mulai perjalananmu sekarang.
            </p>

            <a
              href="#tracking"
              className="inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-3 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
              style={{
                backgroundColor: COLORS.white,
                color: COLORS.primary,
              }}
            >
              <span className={TYPOGRAPHY.button}>
                Mulai Tracking Sekarang
              </span>

              <FaMapMarkerAlt className="text-lg" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}