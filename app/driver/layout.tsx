"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import {
  FaBus,
  FaPowerOff,
  FaBars,
  FaChartLine,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // If this is an auth page, render children directly without navbar/sidebar
  const isAuthPage = pathname?.startsWith("/driver/auth");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#F4F8FF] text-slate-900 overflow-hidden`}
    >
      {/* ================= BACKGROUND ================= */}
      <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-br from-blue-100/60 via-cyan-50 to-transparent blur-3xl -z-10" />

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 h-[85px] border-b border-white/30 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition"
            >
              <FaBars size={22} />
            </button>

            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
              <FaBus size={22} />
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AngkotTrack
              </h1>

              <p className="text-xs md:text-sm text-slate-500">
                Driver Dashboard
              </p>
            </div>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/driver"
              className={`${
                pathname === "/driver"
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600 transition"
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/driver/profile"
              className={`${
                pathname === "/driver/profile"
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600 transition"
              }`}
            >
              Profile
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* PROFILE */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-4 bg-white border border-slate-100 shadow-md rounded-2xl px-4 py-2 hover:shadow-lg transition"
              >
                <img
                  src="https://i.pravatar.cc/100?img=12"
                  alt="profile"
                  className="w-12 h-12 rounded-2xl object-cover"
                />

                <div className="text-left">
                  <h4 className="font-semibold">Budi Santoso</h4>

                  <p className="text-sm text-slate-500">Driver AG</p>
                </div>
              </button>

              {/* DROPDOWN MENU */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-slate-100 shadow-lg rounded-2xl w-48 z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      router.push("/");
                      setProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition text-red-600"
                  >
                    <FaPowerOff size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE SIDEBAR ================= */}
      <div
        onClick={() => {
          setSidebarOpen(false);
          setProfileMenuOpen(false);
        }}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-[290px] bg-white/90 backdrop-blur-2xl z-50 shadow-2xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-2xl">
                <FaBus size={18} />
              </div>

              <div>
                <h2 className="font-bold text-lg">AngkotTrack</h2>

                <p className="text-xs text-slate-500">Driver Menu</p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl hover:bg-slate-100"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* PROFILE */}
          <div
            className="mt-8 w-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-5 text-white shadow-xl transition text-left"
          >
            <div className="flex items-center gap-4">
              <img
                src="https://i.pravatar.cc/100?img=12"
                className="w-14 h-14 rounded-2xl border-2 border-white/40"
              />

              <div>
                <h3 className="font-bold">Budi Santoso</h3>

                <p className="text-sm text-blue-100">Driver AG</p>
              </div>
            </div>
          </div>

          {/* MENU */}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/driver"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition ${
                pathname === "/driver"
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "hover:bg-slate-100"
              }`}
            >
              <FaChartLine />
              Dashboard
            </Link>

            <Link
              href="/driver/profile"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition ${
                pathname === "/driver/profile"
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "hover:bg-slate-100"
              }`}
            >
              <FaUserCircle />
              Profile
            </Link>
          </div>


          {/* LOGOUT BUTTON AT THE BOTTOM */}
          <div className="mt-auto pt-6 border-t border-slate-100">
            <button
              onClick={() => {
                router.push("/");
                setSidebarOpen(false);
              }}
              className="flex items-center justify-center gap-3 px-4 py-3.5 bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white rounded-2xl transition font-semibold w-full shadow-lg shadow-red-950/20"
            >
              <FaPowerOff size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ================= CONTENT ================= */}
      <div
        className="w-full animate-in fade-in duration-300"
        onClick={() => profileMenuOpen && setProfileMenuOpen(false)}
      >
        {children}
      </div>
    </main>
  );
}
