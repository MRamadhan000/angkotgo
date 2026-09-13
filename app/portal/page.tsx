"use client";

import { useRouter } from "next/navigation";
import { FaBus, FaTicketAlt, FaUser, FaArrowRight, FaArrowLeft } from "react-icons/fa";

export default function LoginPortalPage() {
  const router = useRouter();

  const roles = [
    {
      label: "User",
      description: "Lihat rute, pesan tiket, dan cek jadwal bus.",
      icon: FaUser,
      href: "/auth/login",
    },
    {
      label: "Driver",
      description: "Mulai perjalanan, lihat rute, dan lapor status armada.",
      icon: FaBus,
      href: "/driver/auth/login",
    },
    {
      label: "Kondektur",
      description: "Kelola penumpang, tiket, dan laporan perjalanan.",
      icon: FaTicketAlt,
      href: "/conductor/auth/login",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center p-4 sm:p-6 font-body relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-blue-800 transition-colors"
      >
        <FaArrowLeft className="text-[10px] sm:text-xs" />
        Kembali
      </button>

      <div className="w-full max-w-3xl mx-auto my-auto pt-8 sm:pt-0">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-xl sm:rounded-2xl bg-blue-800 text-white flex items-center justify-center shadow-md shadow-blue-800/20">
            <FaBus className="text-xl sm:text-2xl" />
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Portal Masuk
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xs sm:max-w-md mx-auto">
            Pilih peran Anda untuk melanjutkan ke halaman login.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.label}
                onClick={() => router.push(role.href)}
                className="group relative flex flex-row sm:flex-col items-center sm:text-center bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-blue-800 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
              >
                {/* Icon Container */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mr-4 sm:mr-0 sm:mb-4 group-hover:bg-blue-100 transition-colors duration-200">
                  <Icon className="text-xl sm:text-3xl" />
                </div>

                {/* Content Container */}
                <div className="flex-1 text-left sm:text-center">
                  <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
                    {role.label}
                  </h2>
                  <p className="text-xs text-slate-500 leading-snug mt-0.5 sm:mt-1">
                    {role.description}
                  </p>
                </div>

                {/* Action Arrow (Mobile Side, Desktop Bottom) */}
                <div className="ml-2 sm:ml-0 sm:mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-800 shrink-0">
                  <span className="hidden sm:inline">Lanjutkan</span>
                  <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}