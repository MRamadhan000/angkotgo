"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAllReviews } from "@/hooks/useReview";

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { data: reviewsResponse } = useAllReviews(3);

  const reviewCount = reviewsResponse?.data?.length || 0;
  const adminName = user?.name || "Super Admin";
  const adminInitials =
    adminName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SA";

  // Toggle status dropdown avatar
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Tutup dropdown jika pengguna mengklik di luar area avatar/dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Buka modal ulasan ketika lonceng notifikasi di TopBar diklik
  const handleOpenReviews = () => {
    window.dispatchEvent(new CustomEvent("open-admin-reviews"));
  };

  // Logika Logout & Redirect
  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("auth");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      window.location.href = "/admin/auth/login";
    }
  };

  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-8 fixed top-0 left-0 md:left-[210px] right-0 z-20">
      {/* Left: Hamburger + Brand Info */}
      <div className="flex items-center gap-4">
        {/* Toggle Button for mobile screens */}
        <button
          onClick={onMenuClick}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500 md:hidden"
          aria-label="Open menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-800">
              Pusat Kendali Operasional
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">
              Sistem Manajemen AngkotGo
            </span>
          </div>
        </div>
      </div>

      {/* Right: Notif Bell (terhubung modal review) + Avatar Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell dengan Interactive Hover Action */}
        <div className="relative">
          <button
            onClick={handleOpenReviews}
            className="group relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50/80 hover:bg-amber-50/80 border border-slate-200/70 hover:border-amber-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-slate-600 hover:text-amber-600 cursor-pointer"
            title="Keluhan & Ulasan Penumpang (Perlu Ditinjau)"
          >
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {reviewCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200 animate-bounce">
                {reviewCount}
              </span>
            )}
          </button>
        </div>

        {/* Avatar & Dropdown Container dengan Interactive Hover Action */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleMenu}
            className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/70 bg-slate-50/80 hover:bg-blue-50/80 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer focus:outline-none"
            aria-label="User menu"
          >
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs group-hover:scale-105 group-hover:shadow transition-all duration-200">
              {adminInitials}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full group-hover:scale-110 transition-transform" />
            </div>
            <div className="hidden lg:block text-left pr-1">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px] group-hover:text-blue-900 transition-colors">
                {adminName}
              </p>
              <p className="text-[10px] text-blue-600 font-semibold leading-tight flex items-center gap-1">
                Super Admin
                <svg
                  className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-y-0.5 transition-all duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 lg:hidden">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {adminName}
                </p>
                <p className="text-[10px] text-blue-600 font-semibold">
                  Super Admin
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
