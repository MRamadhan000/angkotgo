"use client";

import { InfoRow } from "@/components/ui/InfoRow";
import { useAuth } from "@/context/AuthContext";
import { useConductorDetail } from "@/hooks/useConductors";
import Link from "next/link";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";

export const COLORS = {
  primary: "#1E40AF",
  accent: "#2563EB",
  textDark: "#0F172A",
  textSecondary: "#475569",
  white: "#FFFFFF",
} as const;

function ProfileHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-blue-900 p-5 shadow-md sm:rounded-3xl sm:p-8">
      {/* Background Accent Gradient Effect */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-600/30 blur-2xl"></div>

      <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          {/* Tombol Back dengan Panah Putih Pure */}
          <Link
            href="/conductor/dashboard"
            className="flex-shrink-0 flex items-center justify-center rounded-2xl bg-blue-800/80 p-3 sm:p-4 text-white border border-blue-700/60 shadow-inner transition-all hover:bg-blue-800"
            title="Kembali ke Dashboard"
          >
            <FaArrowLeft className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </Link>

          {/* Informasi Judul & Badge */}
          <div className="min-w-0 space-y-1 sm:space-y-2">
            <div>
              <p className="text-[11px] sm:text-sm font-medium text-blue-200">
                Kelola Akun
              </p>
              <h1 className="mt-0.5 text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-white truncate leading-snug">
                Profil Saya
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConductorProfilePage() {
  const { user } = useAuth();
  const { data: conductor, isLoading: loading, error: conductorError } = useConductorDetail(user?.id ?? null);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1200px] space-y-4 sm:space-y-6 p-3 sm:p-6 lg:p-8">
        <ProfileHeader />

        {/* CONTENT AREA */}
        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 sm:p-10 text-center text-gray-400 shadow-sm sm:rounded-3xl">
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
              <FiRefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span>Memuat data profil...</span>
            </div>
          </div>
        ) : conductorError ? (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm text-rose-800 shadow-xs">
            <FiAlertCircle className="h-5 w-5 shrink-0" />
            <span className="break-words">Gagal memuat profil: {conductorError?.message}</span>
          </div>
        ) : !conductor ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 sm:p-10 text-center text-xs sm:text-sm text-gray-400 shadow-sm sm:rounded-3xl">
            Data profil tidak ditemukan.
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {/* MAIN INFO CARD */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm sm:rounded-3xl">
              <div className="flex flex-col items-start sm:flex-row sm:items-center">
                <div className="min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Menggunakan break-words agar nama panjang tidak terpotong di HP kecil */}
                    <h2 className="text-base sm:text-xl font-bold text-gray-900 break-words">
                      {conductor.name}
                    </h2>
                  </div>

                  <p className="mt-1 font-mono text-[11px] sm:text-xs text-gray-500 break-all">
                    NIK: {conductor.nik || "-"}
                  </p>
                </div>
              </div>

              {/* Stat pills (Verifikasi Akun & Status Tugas) */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
                <div className="rounded-xl border border-gray-100 bg-blue-50/40 px-3 py-2.5 text-center">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-blue-600/70 sm:text-[10px]">
                    Verifikasi Akun
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-bold text-blue-900 sm:text-sm">
                    {conductor.isVerified ? "Terverifikasi" : "Belum Verifikasi"}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-100 bg-blue-50/40 px-3 py-2.5 text-center">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-blue-600/70 sm:text-[10px]">
                    Status Tugas
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-bold text-blue-900 sm:text-sm">
                    {conductor.status}
                  </span>
                </div>
              </div>
            </div>

            {/* DETAIL SECTION */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm sm:rounded-3xl">
              <h3 className="mb-4 border-b border-gray-100 pb-3 text-xs sm:text-sm font-bold text-gray-900">
                Informasi Kontak & Alamat
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <InfoRow icon={FiMail} label="Email" value={conductor.email} />
                <InfoRow
                  icon={FiPhone}
                  label="Nomor Telepon"
                  value={conductor.phone || "-"}
                />
                <InfoRow
                  icon={FiMapPin}
                  label="Alamat Domisili"
                  value={conductor.address || "-"}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}