"use client";

import { useState, useEffect } from "react";
import { FaBus, FaBars, FaTimes, FaUser, FaRoute } from "react-icons/fa";
import { COLORS, TYPOGRAPHY } from "@/constants";

const navItems = [
  { label: "Beranda", href: "/#beranda" },
  { label: "Benefits", href: "/#benefits" },
  { label: "Fitur", href: "/#fitur" },
  { label: "About Us", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

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
        
        {/* ================= DESKTOP LOGO ================= */}
        {/* Hanya muncul di layar desktop (md ke atas) */}
        <a href="/#beranda" className="hidden items-center gap-3 md:flex">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm"
            style={{ backgroundColor: COLORS.primary }}
          >
            <FaBus className="text-[22px] text-white" />
          </div>
          <span className={TYPOGRAPHY.logo} style={{ color: COLORS.primary }}>
            AngkotGo
          </span>
        </a>

        {/* ================= MOBILE BUTTON (PENGGANTI LOGO) ================= */}
        {/* Hanya muncul di layar mobile, menggantikan peran logo */}
        <a
          href="/rute"
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all active:scale-95 md:hidden"
          style={{
            backgroundColor: COLORS.accent,
            boxShadow: "0 4px 10px rgb(37 99 235 / .2)",
          }}
        >
          <FaRoute className="text-sm" />
          Mulai Tracking
        </a>

        {/* Desktop Menu - Menggunakan Loop */}
        <div className="hidden items-center gap-9 md:flex">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Desktop Action */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/driver/auth/login"
            className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all hover:bg-slate-50"
            style={{
              borderColor: COLORS.accent,
              color: COLORS.accent,
            }}
          >
            <FaUser />
            Login Driver
          </a>

          <a
            href="/rute"
            className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: COLORS.accent,
              boxShadow: "0 4px 14px rgb(37 99 235 / .35)",
            }}
          >
            <FaRoute />
            Mulai Tracking
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-600 transition-colors hover:text-blue-600 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? (
            <FaTimes className="h-6 w-6" />
          ) : (
            <FaBars className="h-6 w-6" />
          )}
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
            {/* Mobile Menu - Menggunakan Loop */}
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`${TYPOGRAPHY.navLink} text-slate-600 hover:text-blue-600`}
              >
                {item.label}
              </a>
            ))}

            <a
              href="/driver/auth/login"
              onClick={() => setIsOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-full border py-3 text-sm font-semibold transition-all hover:bg-slate-50"
              style={{
                borderColor: COLORS.accent,
                color: COLORS.accent,
              }}
            >
              <FaUser />
              Login Driver
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
