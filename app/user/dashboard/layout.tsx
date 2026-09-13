"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUser,
  FiLogOut,
  FiMenu,
  FiBell,
  FiCreditCard,
  FiRadio,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Definisi 3 Menu Utama
  const navItems = [
    {
      name: "Dashboard",
      href: "/user/dashboard",
      icon: FiHome,
    },
    {
      name: "Payment",
      href: "/user/dashboard/payments",
      icon: FiCreditCard,
    },
    {
      name: "Sinyal",
      href: "/user/dashboard/sinyal",
      icon: FiRadio,
    },
  ];

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col md:flex-row font-sans">
      {/* Sidebar Backdrop (Mobile Only) */}
      <div
        className={`fixed inset-0 bg-[#0b1c30]/50 z-50 transition-opacity duration-300 backdrop-blur-sm md:hidden ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-[280px] bg-[#ffffff] z-50 md:z-auto flex flex-col shrink-0 border-r border-[#c3c5d8]/30 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* User Info Header */}
        <div className="p-6 flex items-center gap-3 border-b border-[#c3c5d8]/30">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c3c5d8] bg-slate-100 shrink-0 flex items-center justify-center font-bold text-blue-600">
            BS
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[18px] leading-[24px] text-[#0b1c30]">
              Budi Santoso
            </span>
            <span className="text-[12px] leading-[16px] text-[#434655]">
              +62 812 3456 7890
            </span>
          </div>
        </div>

        {/* 3 Navigasi Utama */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-full font-semibold text-[14px] leading-[24px] transition-colors ${
                  isActive
                    ? "bg-[#1e56f1] text-[#ffffff]"
                    : "text-[#434655] hover:bg-[#e5eeff]/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}

          <div className="my-2 border-t border-[#c3c5d8]/30" />

          {/* Navigasi Tambahan */}
          <Link
            href="/user/dashboard/profile"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-full font-semibold text-[14px] leading-[24px] transition-colors ${
              pathname === "/user/dashboard/profile"
                ? "bg-[#1e56f1] text-[#ffffff]"
                : "text-[#434655] hover:bg-[#e5eeff]/50"
            }`}
          >
            <FiUser className="w-5 h-5" />
            Profile
          </Link>
        </nav>

        {/* Action Logout */}
        <div className="p-3 border-t border-[#c3c5d8]/30 mt-auto">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-[#ba1a1a] hover:bg-[#ffdad6]/50 font-semibold text-[14px] leading-[24px] transition-colors"
            onClick={logout}
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top App Bar */}
        <header className="w-full sticky top-0 z-40 bg-[#f8f9ff] shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-between px-4 md:px-8 h-14 border-b border-[#c3c5d8]/20">
          <div className="flex items-center gap-3">
            <button
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-[#dee3ed]/50 active:scale-95 transition-transform duration-150 text-[#434655] md:hidden"
              onClick={toggleSidebar}
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h1 className="text-[20px] leading-[28px] font-bold text-[#003fc7]">
              AngkotGo
            </h1>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#dee3ed]/50 active:scale-95 transition-transform duration-150 text-[#434655]">
            <FiBell className="w-6 h-6" />
          </button>
        </header>

        {/* Children Render Canvas */}
        <main className="flex-1 px-4 md:px-8 py-6 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}