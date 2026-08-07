"use client";

import { InfoRow } from "@/components/ui/InfoRow";
import { useAuth } from "@/context/AuthContext";
import { useDriverDetail } from "@/hooks/useDrivers";
import Link from "next/link";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiCreditCard,
  FiAward,
  FiAlertCircle,
  FiRefreshCw,
  FiStar,
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
            href="/driver/dashboard"
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

export default function DriverProfilePage() {
  const { user } = useAuth();
  const { driver, loading, error } = useDriverDetail(user?.id ?? null);

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
        ) : error ? (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm text-rose-800 shadow-xs">
            <FiAlertCircle className="h-5 w-5 shrink-0" />
            <span className="break-words">Gagal memuat profil: {error}</span>
          </div>
        ) : !driver ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 sm:p-10 text-center text-xs sm:text-sm text-gray-400 shadow-sm sm:rounded-3xl">
            Data profil tidak ditemukan.
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {/* MAIN INFO CARD */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm sm:rounded-3xl">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-blue-50 text-blue-600 shadow-md sm:h-24 sm:w-24">
                  {driver.photoUrl ? (
                    <img
                      src={driver.photoUrl}
                      alt={driver.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FiUser className="h-9 w-9" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h2 className="text-base sm:text-xl font-bold text-gray-900 break-words">
                      {driver.name}
                    </h2>
                  </div>

                  <p className="mt-1 font-mono text-[11px] sm:text-xs text-gray-500 break-all">
                    NIK: {driver.nik || "-"}
                  </p>
                </div>
              </div>

              {/* Stat pills (Verifikasi Akun, Status, & Rating) */}
              <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
                <div className="rounded-xl border border-gray-100 bg-blue-50/40 px-2 py-2.5 text-center sm:px-3">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-blue-600/70 sm:text-[10px]">
                    Verifikasi Akun
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] sm:text-xs font-bold text-blue-900 sm:text-sm">
                    {driver.isVerified ? "Terverifikasi" : "Belum Verifikasi"}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-100 bg-blue-50/40 px-2 py-2.5 text-center sm:px-3">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-blue-600/70 sm:text-[10px]">
                    Status Tugas
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] sm:text-xs font-bold text-blue-900 sm:text-sm">
                    {driver.status}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-100 bg-blue-50/40 px-2 py-2.5 text-center sm:px-3">
                  <span className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider text-blue-600/70 sm:text-[10px]">
                    <FiStar className="h-3 w-3 shrink-0" /> Rating
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] sm:text-xs font-bold text-blue-900 sm:text-sm">
                    {driver.averageRating ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* DETAIL GRID */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
              {/* Kontak & Alamat */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm sm:rounded-3xl">
                <h3 className="mb-4 border-b border-gray-100 pb-3 text-xs sm:text-sm font-bold text-gray-900">
                  Informasi Kontak & Alamat
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  <InfoRow icon={FiMail} label="Email" value={driver.email} />
                  <InfoRow
                    icon={FiPhone}
                    label="Nomor Telepon"
                    value={driver.phone || "-"}
                  />
                  <InfoRow
                    icon={FiMapPin}
                    label="Alamat Domisili"
                    value={driver.address || "-"}
                  />
                </div>
              </div>

              {/* Lisensi & Pembayaran */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm sm:rounded-3xl">
                <h3 className="mb-4 border-b border-gray-100 pb-3 text-xs sm:text-sm font-bold text-gray-900">
                  Lisensi & Keuangan
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  <InfoRow
                    icon={FiShield}
                    label="Nomor SIM (License)"
                    value={driver.licenseNumber || "-"}
                    mono
                  />
                  <InfoRow
                    icon={FiAward}
                    label="Masa Berlaku SIM"
                    value={
                      driver.licenseExpiryDate
                        ? new Date(driver.licenseExpiryDate).toLocaleDateString(
                            "id-ID"
                          )
                        : "-"
                    }
                  />
                  <InfoRow
                    icon={FiCreditCard}
                    label="Informasi Rekening Bank"
                    value={
                      driver.bankAccountInfo ? (
                        <>
                          <span className="break-words">
                            {driver.bankAccountInfo.bankName} -{" "}
                            {driver.bankAccountInfo.accountNumber}
                          </span>
                          <span className="mt-0.5 block text-[11px] font-normal text-gray-500 break-words">
                            a.n. {driver.bankAccountInfo.accountHolderName}
                          </span>
                        </>
                      ) : (
                        "Belum diatur"
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}