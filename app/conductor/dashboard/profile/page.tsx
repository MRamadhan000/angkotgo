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
  FiCheckCircle,
  FiShield,
  FiUser,
} from "react-icons/fi";

export const COLORS = {
  primary: "#1E40AF",
  accent: "#2563EB",
  textDark: "#0F172A",
  textSecondary: "#475569",
  white: "#FFFFFF",
} as const;

export default function ConductorProfilePage() {
  const { user } = useAuth();
  const {
    data: conductor,
    isLoading: loading,
    error: conductorError,
  } = useConductorDetail(user?.id ?? null);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden flex flex-col justify-between">
      <div className="mx-auto w-full max-w-[1240px] p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Navigation Bar (Konsisten dengan halaman lain) */}
        <div className="flex items-center justify-between">
          <Link
            href="/conductor/dashboard"
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

        {/* CONTENT AREA */}
        {loading ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-xs">
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
              <FiRefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span>Memuat data profil...</span>
            </div>
          </div>
        ) : conductorError ? (
          <div className="flex items-center gap-2 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-xs sm:text-sm text-rose-800 shadow-xs">
            <FiAlertCircle className="h-5 w-5 shrink-0" />
            <span className="break-words">
              Gagal memuat profil: {conductorError?.message}
            </span>
          </div>
        ) : !conductor ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-xs sm:text-sm text-gray-400 shadow-xs">
            Data profil tidak ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Profile Card Sidebar (Konsisten dengan Dashboard & History Kondektur) */}
            <div className="group/sidebar lg:col-span-4 rounded-3xl bg-blue-600 p-6 text-white shadow-lg flex flex-col justify-between space-y-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-4 hover:ring-blue-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 font-black text-xl shadow-inner transition-transform duration-300 group-hover/sidebar:scale-105">
                    {conductor.name ? conductor.name.charAt(0) : "C"}
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/40 px-3 py-1 text-xs font-medium text-white border border-blue-400/30 transition-colors duration-300 group-hover/sidebar:bg-blue-500">
                    <FiCheckCircle className="text-[10px] text-emerald-300" />{" "}
                    {conductor.status || "Aktif"}
                  </span>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-blue-200 font-medium">
                    Profil Kondektur
                  </p>
                  <h1 className="text-2xl font-black mt-1 tracking-tight truncate">
                    {conductor.name}
                  </h1>
                  <p className="text-xs text-blue-100 mt-0.5 font-mono">
                    NIK: {conductor.nik || "-"}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2.5 rounded-xl bg-blue-700/50 px-4 py-2.5 text-xs text-blue-100 border border-blue-500/30 transition-all duration-300 hover:bg-blue-700 hover:border-blue-300">
                    <FiUser className="text-blue-300" />
                    <span className="truncate">
                      Akun{" "}
                      {conductor.isVerified
                        ? "Terverifikasi"
                        : "Belum Verifikasi"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-blue-700/50 px-4 py-2.5 text-xs text-blue-100 border border-blue-500/30 transition-all duration-300 hover:bg-blue-700 hover:border-blue-300">
                    <FiShield className="text-blue-300" />
                    <span className="truncate">
                      Kru ID: C{conductor.id || "1"}-OPS-2024
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Info Box di Sidebar */}
              <div className="rounded-2xl bg-blue-700/50 border border-blue-400/30 p-4 transition-all duration-300 group-hover/sidebar:bg-blue-700">
                <p className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">
                  Status Penugasan
                </p>
                <p className="text-sm font-bold text-white mt-1">
                  {conductor.status || "Tersedia"}
                </p>
                <p className="text-[11px] text-blue-200 mt-0.5">
                  Siap melayani operasional armada harian.
                </p>
              </div>
            </div>

            {/* Right Column: Informasi Kontak & Alamat Widget */}
            <div className="lg:col-span-8 space-y-6">
              <div className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:ring-4 hover:ring-blue-50 space-y-4">
                <h3 className="border-b border-gray-100 pb-3 text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  Informasi Kontak & Alamat Domisili
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  <InfoRow
                    icon={FiMail}
                    label="Email"
                    value={conductor.email}
                  />
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
