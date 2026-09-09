"use client";

import React from "react";
import { FiArrowLeft, FiUser } from "react-icons/fi";

interface TopBarProps {
  user?: {
    name?: string | null;
  } | null;
  isAuthenticated?: boolean;
  onBack?: () => void;
}

export default function TopBar({
  user,
  isAuthenticated = false,
  onBack,
}: TopBarProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/95 px-3.5 py-2.5 shadow-md shadow-blue-900/5 backdrop-blur-md transition-all">
      {/* Back Button & Logo / Title */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Kembali"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-blue-50 hover:text-[#003d9b] active:scale-95"
        >
          <FiArrowLeft className="text-sm" />
        </button>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-tight text-slate-900 sm:text-sm">
              Angkot<span className="text-[#003d9b]">Go</span>
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-[#003d9b] ring-1 ring-blue-600/20">
              Rute
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            Pesan & lacak angkot realtime
          </p>
        </div>
      </div>

      {/* User Avatar Pill */}
      {isAuthenticated && user ? (
        <div className="flex max-w-36 items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-[#003d9b] shadow-xs sm:max-w-44 sm:px-3">
          <FiUser className="shrink-0 text-xs text-[#003d9b]" aria-hidden="true" />
          <span className="truncate text-[11px] sm:text-xs">{user.name}</span>
        </div>
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400">
          <FiUser className="text-xs" />
        </div>
      )}
    </div>
  );
}
