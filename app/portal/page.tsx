"use client";

import { useRouter } from "next/navigation";
import { FaBus, FaTicketAlt, FaArrowRight, FaArrowLeft } from "react-icons/fa";

export default function LoginPortalPage() {
  const router = useRouter();

  const roles = [
    {
      label: "Driver",
      description: "Masuk untuk mulai perjalanan, lihat rute, dan lapor status armada.",
      icon: FaBus,
      href: "/driver/auth/login",
    },
    {
      label: "Kondektur",
      description: "Masuk untuk kelola penumpang, tiket, dan laporan perjalanan.",
      icon: FaTicketAlt,
      href: "/conductor/auth/login",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-body relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-800 transition-colors"
      >
        <FaArrowLeft className="text-xs" />
        Kembali
      </button>

      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-800 text-white flex items-center justify-center shadow-lg shadow-blue-800/20">
            <FaBus className="text-2xl" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Portal Masuk
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Pilih peran Anda untuk melanjutkan ke halaman login yang sesuai.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.label}
                onClick={() => router.push(role.href)}
                className="group relative flex flex-col items-center text-center bg-white border-2 border-slate-200 rounded-3xl p-7 sm:p-8 shadow-sm hover:shadow-xl hover:border-blue-800 hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-800/20"
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-blue-50 text-blue-800 flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors duration-200">
                  <Icon className="text-6xl sm:text-7xl" />
                </div>

                <h2 className="font-display text-xl font-bold text-slate-900 mb-2">
                  Masuk sebagai {role.label}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {role.description}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-800">
                  Lanjutkan
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}