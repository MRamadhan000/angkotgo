"use client";

import { FaBus } from "react-icons/fa";
import { COLORS, TYPOGRAPHY } from "@/constants";

export default function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-[60] border-white/10 bg-white/0 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm"
            style={{ backgroundColor: COLORS.primary }}
          >
            <FaBus className="text-[22px] text-white" />
          </div>

          <span
            className={TYPOGRAPHY.logo}
            style={{ color: COLORS.primary }}
          >
            AngkotGo
          </span>
        </div>

        <div className="hidden items-center gap-9 md:flex">
          <a
            href="#beranda"
            className={`${TYPOGRAPHY.navLink} border-b-2 border-blue-600 pb-px text-blue-600`}
          >
            Beranda
          </a>

          <a
            href="#benefits"
            className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
          >
            Benefits
          </a>

          <a
            href="#fitur"
            className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
          >
            Fitur
          </a>

          <a
            href="#about"
            className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
          >
            About Us
          </a>

          <a
            href="#contact"
            className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
          >
            Contact
          </a>
        </div>

        <a
          href="#tracking"
          className="hidden rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all md:flex"
          style={{
            backgroundColor: COLORS.accent,
            boxShadow: "0 4px 14px rgb(37 99 235 / .35)",
          }}
        >
          Mulai Tracking
        </a>

        <button className="p-2 md:hidden">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}