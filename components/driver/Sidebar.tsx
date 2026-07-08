"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/driver/dashboard",
      label: "Dashboard",
      icon: (
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
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      href: "/driver/dashboard/schedules",
      label: "Jadwal Saya",
      icon: (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      href: "/driver/dashboard/profile",
      label: "Profil Saya",
      icon: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`w-[210px] h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-30 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo Section */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 17H5a2 2 0 01-2-2V6a2 2 0 012-2h13a2 2 0 012 2v3M9 17h6M9 17v2m6-2v2M3 11h18M9 11V9m6 2V9"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">
            Angkot<span className="text-blue-600">Go</span>
          </span>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors md:hidden"
          aria-label="Close sidebar"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          // PERBAIKAN LOGIKA UTAMA:
          // Jika href adalah dashboard utama, cek kecocokan eksak agar tidak membungkus sub-halaman lain.
          const active =
            item.href === "/driver/dashboard"
              ? pathname === "/driver/dashboard" ||
                pathname.startsWith("/driver/dashboard/trip/") // Mengizinkan active jika masuk ke detail trip (opsional)
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className={active ? "text-white" : "text-gray-400"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Driver Profile */}
      <div className="px-4 py-5 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              Budi Santoso
            </p>
            <p className="text-xs text-gray-500">Driver Angkot</p>
          </div>
        </div>
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
          AL – 23
        </span>
      </div>

      {/* Keluar */}
      <div className="px-3 pb-5">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Keluar
        </button>
      </div>
    </aside>
  );
}
