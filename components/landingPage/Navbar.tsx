"use client";

import { useState, useEffect } from "react";
import { FaBus, FaBars, FaTimes } from "react-icons/fa";
import { COLORS, TYPOGRAPHY } from "@/constants";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-[60] transition-all duration-300 ${
        scrolled || isOpen
          ? "bg-white/90 border-b border-slate-100 shadow-sm backdrop-blur-md"
          : "bg-white/0 border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="/#beranda" className="flex items-center gap-3">
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
        </a>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-9 md:flex">
          <a
            href="/#beranda"
            className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
          >
            Beranda
          </a>

          <a
            href="/#benefits"
            className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
          >
            Benefits
          </a>

          <a
            href="/#fitur"
            className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
          >
            Fitur
          </a>

          <a
            href="/#about"
            className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
          >
            About Us
          </a>

          <a
            href="/#contact"
            className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
          >
            Contact
          </a>
        </div>

        {/* Desktop Action */}
        <a
          href="/rute"
          className="hidden rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all md:flex hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: COLORS.accent,
            boxShadow: "0 4px 14px rgb(37 99 235 / .35)",
          }}
        >
          Mulai Tracking
        </a>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-600 transition-colors hover:text-blue-600 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`grid transition-all duration-300 md:hidden ${
          isOpen
            ? "grid-rows-[1fr] opacity-100 border-t border-slate-100 bg-white"
            : "grid-rows-[0fr] opacity-0 overflow-hidden pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-4 px-6 py-5">
            <a
              href="/#beranda"
              onClick={() => setIsOpen(false)}
              className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
            >
              Beranda
            </a>

            <a
              href="/#benefits"
              onClick={() => setIsOpen(false)}
              className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
            >
              Benefits
            </a>

            <a
              href="/#fitur"
              onClick={() => setIsOpen(false)}
              className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
            >
              Fitur
            </a>

            <a
              href="/#about"
              onClick={() => setIsOpen(false)}
              className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
            >
              About Us
            </a>

            <a
              href="/#contact"
              onClick={() => setIsOpen(false)}
              className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
            >
              Contact
            </a>

            <a
              href="/rute"
              onClick={() => setIsOpen(false)}
              className="mt-2 w-full text-center rounded-full py-3 text-sm font-semibold text-white transition-all"
              style={{
                backgroundColor: COLORS.accent,
                boxShadow: "0 4px 14px rgb(37 99 235 / .35)",
              }}
            >
              Mulai Tracking
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}