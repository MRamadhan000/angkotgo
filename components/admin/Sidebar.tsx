"use client";

import React from "react";
import {
  FaTachometerAlt,
  FaRoute,
  FaUserTie,
  FaBus,
  FaMapSigns,
  FaMoneyBillWave,
  FaChartBar,
  FaUsers,
  FaCog,
  FaBell,
} from "react-icons/fa";

const menuItems = [
  {
    icon: <FaTachometerAlt />,
    label: "Dashboard",
    href: "/admin/dashboard",
    section: "main",
  },
  {
    icon: <FaRoute />,
    label: "Manajemen Rute",
    href: "#",
    badge: "12",
    section: "main",
  },
  {
    icon: <FaUserTie />,
    label: "Manajemen Driver",
    href: "#",
    section: "main",
  },
//   { icon: <FaBus />, label: "Manajemen Angkot", href: "#", section: "main" },
//   { icon: <FaMapSigns />, label: "Halte & Trayek", href: "#", section: "main" },
//   {
//     icon: <FaMoneyBillWave />,
//     label: "Tarif & Pembayaran",
//     href: "#",
//     section: "finance",
//   },
//   {
//     icon: <FaChartBar />,
//     label: "Laporan & Analitik",
//     href: "#",
//     section: "finance",
//   },
//   { icon: <FaUsers />, label: "Pengguna", href: "#", section: "system" },
//   {
//     icon: <FaBell />,
//     label: "Notifikasi",
//     href: "#",
//     badge: "3",
//     badgeRed: true,
//     section: "system",
//   },
//   { icon: <FaCog />, label: "Pengaturan", href: "#", section: "system" },
];

interface SidebarProps {
  activeMenu?: string;
}

export default function Sidebar({ activeMenu = "Dashboard" }: SidebarProps) {
  return (
    <div className="w-60 min-w-[240px] bg-gradient-to-b from-[#1E40AF] to-[#1a3a7a] flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-[10px] flex items-center justify-center font-extrabold text-sm text-white tracking-tight">
            AG
          </div>
          <div>
            <div className="text-[15px] font-bold text-white tracking-tight">
              AngkotGo
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5">
        {/* Main Menu */}
        <p className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.8px] px-2.5 py-2">
          Menu Utama
        </p>
        {menuItems
          .filter((i) => i.section === "main")
          .map((item, idx) => (
            <NavItem key={idx} item={item} active={item.label === activeMenu} />
          ))}
      </div>

      {/* Footer User */}
      <div className="px-2.5 py-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] cursor-pointer hover:bg-white/8 transition-colors">
          <div className="w-8 h-8 bg-white/20 rounded-[8px] flex items-center justify-center font-bold text-xs text-white">
            AG
          </div>
          <div>
            <div className="text-[12px] font-semibold text-white">
              Admin AngkotGo
            </div>
            <div className="text-[10px] text-white/50">Super Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  item: {
    href: string;
    icon: React.ReactNode;
    label: string;
    badge?: string;
    badgeRed?: boolean;
  };
  active: boolean;
}

function NavItem({ item, active }: NavItemProps) {
  return (
    <a
      href={item.href}
      className={`relative mb-0.5 flex items-center gap-2.5 rounded-[8px] px-2.5 py-2.5 text-[13px] transition-all ${
        active
          ? "bg-white/15 font-semibold text-white"
          : "text-white/70 hover:bg-white/8 hover:text-white"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-white" />
      )}

      <span className="w-[18px] text-center text-[15px] opacity-80">
        {item.icon}
      </span>

      <span className="flex-1">{item.label}</span>

      {item.badge && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            item.badgeRed ? "bg-red-500 text-white" : "bg-white/20 text-white"
          }`}
        >
          {item.badge}
        </span>
      )}
    </a>
  );
}
