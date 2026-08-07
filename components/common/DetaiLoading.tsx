// src/components/common/DetailLoading.tsx
"use client";

import { FaSpinner } from "react-icons/fa";

export function DetailLoading() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-10 flex flex-col items-center justify-center gap-3 text-slate-500">
      {/* Ikon berputar dengan animasi spin */}
      <FaSpinner className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 animate-spin" />
      <span className="text-xs sm:text-sm font-medium tracking-wide">
        Memuat detail penugasan...
      </span>
    </div>
  );
}