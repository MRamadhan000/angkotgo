"use client";

import { FaSignOutAlt, FaIdBadge } from "react-icons/fa";

interface DashboardHeaderProps {
  user: any;
  onLogout: () => void;
  roleTitle?: string;
}

export function DashboardHeader({
  user,
  onLogout,
  roleTitle = "Kondektur Bertugas",
}: DashboardHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-blue-900 p-6 shadow-md sm:rounded-3xl sm:p-8">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-600/30 blur-2xl"></div>

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2.5 min-w-0 flex-1">
          <div>
            <p className="text-xs sm:text-sm font-medium text-blue-200">
              Selamat Datang Kondektur
            </p>
            <h1 className="mt-0.5 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white break-words leading-snug">
              {user?.name || "-"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800/80 px-3 py-1 text-[11px] sm:text-xs font-semibold text-blue-100 border border-blue-700/50">
              <FaIdBadge className="h-3.5 w-3.5 text-blue-300" />
              <span>{roleTitle}</span>
            </span>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-800/60 px-3 py-1 text-[11px] sm:text-xs font-bold text-blue-100 border border-blue-700/50">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400"></span>
              </span>
              <span>Siap Operasional</span>
            </div>
          </div>
        </div>

        <div className="flex items-center pt-3 sm:pt-0 border-t border-blue-800 sm:border-t-0 sm:self-center">
          <button
            onClick={onLogout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-red-600 border-2 border-red-200 shadow-sm transition-all hover:bg-red-100 cursor-pointer"
          >
            <FaSignOutAlt className="h-4 w-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}