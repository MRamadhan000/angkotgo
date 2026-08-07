"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft, FaIdBadge } from "react-icons/fa";

interface DetailHeaderProps {
  user: any;
  title: string;
  description?: string;
  onBack?: () => void;
}

export function DetailHeader({
  user,
  title,
  description,
  onBack,
}: DetailHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const userRole = (user?.role || user?.roles?.[0] || "DRIVER").toUpperCase();
  const roleBadgeText = userRole.includes("CONDUCTOR") ? "CONDUCTOR" : "DRIVER";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-blue-900 p-4 sm:p-6 lg:p-8 shadow-md">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-600/30 blur-2xl"></div>

      <div className="relative z-10 flex items-start gap-3 sm:gap-4">
        {/* Tombol Back dengan Panah Putih Tebal & Highlight Kontras */}
        <button
          type="button"
          onClick={handleBack}
          className="mt-0.5 sm:mt-1 flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-blue-600 text-white border-0 border-white/80 shadow-lg hover:bg-blue-500 hover:border-white transition-all shrink-0 cursor-pointer"
          title="Kembali"
        >
          <FaArrowLeft className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-white font-extrabold stroke-[3]" />
        </button>

        {/* Informasi Header */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white break-words leading-tight">
              {title}
            </h1>
          </div>

          {description && (
            <p className="text-xs sm:text-sm text-blue-200 line-clamp-2">
              {description}
            </p>
          )}

          {/* Nama User & Badge Role */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-white bg-blue-800/50 px-2.5 py-0.5 rounded-md border border-blue-700/40">
              {user?.name || "Pengguna"}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800/80 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-blue-100 border border-blue-700/50 uppercase tracking-wider">
              <FaIdBadge className="h-3 w-3 text-blue-300" />
              <span>{roleBadgeText}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}