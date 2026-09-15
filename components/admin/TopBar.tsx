"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Logika Logout & Redirect
  const handleLogout = () => {
    // 1. Hapus token / session jika disimpan di localStorage atau cookie
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");

    // 2. Redirect ke URL tujuan
    window.location.href = "http://localhost:3001/";
  };

  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-8 fixed top-0 left-0 md:left-[210px] right-0 z-20">
      {/* Left: Hamburger + Greeting */}
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

        <div></div>
      </div>

      {/* Right: Notif + Avatar */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
          {/* Badge */}
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </div>

        {/* Avatar & Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleMenu}
            className="relative w-10 h-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center cursor- focus:outline-none "
            aria-label="User menu"
          >
            <svg
              className="w-7 h-7 text-blue-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
