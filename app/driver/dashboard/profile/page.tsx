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
  FiCheckCircle,
} from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";

export const COLORS = {
  primary: "#1E40AF",
  accent: "#2563EB",
  textDark: "#0F172A",
  textSecondary: "#475569",
  white: "#FFFFFF",
} as const;

export default function DriverProfilePage() {
  const { user } = useAuth();
  const {
    data: driver,
    isLoading: loading,
    error: driverError,
  } = useDriverDetail(user?.id ?? null);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden flex flex-col justify-between">
      <div className="mx-auto w-full max-w-[1240px] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Navigation Bar (Konsisten dengan Halaman Lain) */}
        <div className="flex items-center justify-between">
          <Link
            href="/driver/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-blue-600 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md hover:ring-2 hover:ring-blue-50 cursor-pointer"
          >
            ← Kembali
          </Link>
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-xs transition-all duration-300 hover:border-blue-200 hover:shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            SISTEM KRU LAPANGAN
          </div>
          <div className="text-xs font-medium text-gray-500 border border-gray-200 bg-white px-4 py-1.5 rounded-full shadow-xs transition-all duration-300 hover:border-blue-200 hover:shadow-sm">
            Portal Resmi Tugas Armada
          </div>
        </div>

        {/* CONTENT AREA: Menggunakan Tata Letak Grid Dua Kolom Konsisten */}
        {loading ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-xs">
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
              <FiRefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span>Memuat data profil...</span>
            </div>
          </div>
        ) : driverError ? (
          <div className="flex items-center gap-2 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-xs sm:text-sm text-rose-800 shadow-xs">
            <FiAlertCircle className="h-5 w-5 shrink-0" />
            <span className="break-words">
              Gagal memuat profil: {driverError?.message}
            </span>
          </div>
        ) : !driver ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-xs sm:text-sm text-gray-400 shadow-xs">
            Data profil tidak ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Profile Card Sidebar (Konsisten dengan Halaman Dashboard & History) */}
            <div className="group/sidebar lg:col-span-4 rounded-3xl bg-blue-600 p-6 text-white shadow-lg flex flex-col justify-between space-y-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-4 hover:ring-blue-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 font-black text-xl shadow-inner transition-transform duration-300 group-hover/sidebar:scale-105 overflow-hidden">
                    {driver.photoUrl ? (
                      <img
                        src={driver.photoUrl}
                        alt={driver.name}
                        className="h-full w-full object-cover"
                      />
                    ) : driver.name ? (
                      driver.name.charAt(0)
                    ) : (
                      "D"
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/40 px-3 py-1 text-xs font-medium text-white border border-blue-400/30 transition-colors duration-300 group-hover/sidebar:bg-blue-500">
                    <FiCheckCircle className="text-[10px] text-emerald-300" />{" "}
                    {driver.status || "Aktif"}
                  </span>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-blue-200 font-medium">
                    Profil Pengemudi
                  </p>
                  <h1 className="text-2xl font-black mt-1 tracking-tight truncate">
                    {driver.name}
                  </h1>
                  <p className="text-xs text-blue-100 mt-0.5 font-mono">
                    NIK: {driver.nik || "-"}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2.5 rounded-xl bg-blue-700/50 px-4 py-2.5 text-xs text-blue-100 border border-blue-500/30 transition-all duration-300 hover:bg-blue-700 hover:border-blue-300">
                    <FiShield className="text-blue-300" />
                    <span className="truncate">
                      Akun{" "}
                      {driver.isVerified ? "Terverifikasi" : "Belum Verifikasi"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-blue-700/50 px-4 py-2.5 text-xs text-blue-100 border border-blue-500/30 transition-all duration-300 hover:bg-blue-700 hover:border-blue-300">
                    <FiStar className="text-blue-300" />
                    <span className="truncate">
                      Rating Performa: {driver.averageRating ?? 0} / 5.0
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Info Box di Sidebar */}
              <div className="rounded-2xl bg-blue-700/50 border border-blue-400/30 p-4 transition-all duration-300 group-hover/sidebar:bg-blue-700">
                <p className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">
                  Status SIM & Lisensi
                </p>
                <p className="text-xs font-mono font-bold text-white mt-1 truncate">
                  {driver.licenseNumber || "SIM Belum Terdaftar"}
                </p>
                <p className="text-[11px] text-blue-200 mt-0.5">
                  Masa Berlaku:{" "}
                  {driver.licenseExpiryDate
                    ? new Date(driver.licenseExpiryDate).toLocaleDateString(
                        "id-ID",
                      )
                    : "-"}
                </p>
              </div>
            </div>

            {/* Right Column: Detail Informasi Kontak, Alamat, Lisensi & Rekening */}
            <div className="lg:col-span-8 space-y-6">
              {/* Kontak & Alamat Widget */}
              <div className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:ring-4 hover:ring-blue-50 space-y-4">
                <h3 className="border-b border-gray-100 pb-3 text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  Informasi Kontak & Alamat Domisili
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

              {/* Lisensi & Keuangan Widget */}
              <div className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:ring-4 hover:ring-blue-50 space-y-4">
                <h3 className="border-b border-gray-100 pb-3 text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  Lisensi Mengemudi & Rekening Bank
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
                            "id-ID",
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

      {/* Footer Konsisten */}
      <div className="border-t border-gray-200 bg-white py-4 px-6 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-8">
        <span>Portal Operasional Terintegrasi • Mode Website Responsif</span>
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Koneksi
          Aman Lapangan
        </span>
      </div>
    </div>
  );
}
