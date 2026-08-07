"use client";

import { InfoRow } from "@/components/ui/InfoRow";
import { useAuth } from "@/context/AuthContext";
import { useConductorDetail } from "@/hooks/useConductors";
import Link from "next/link";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiArrowLeft,
  FiRefreshCw,
  FiTruck,
} from "react-icons/fi";

export default function ConductorProfilePage() {
  const { user } = useAuth();

  const { conductor, loading, error } = useConductorDetail(user?.id ?? null);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased">
      <div className="mx-auto w-full max-w-[880px] space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-8">
        {/* HEADER & BACK BUTTON */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
          <Link
            href="/conductor/dashboard"
            className="flex-shrink-0 rounded-xl bg-gray-50 p-2.5 text-gray-600 transition-colors hover:bg-gray-100 sm:rounded-2xl sm:p-3"
          >
            <FiArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
              Profil Saya
            </h1>
            <p className="truncate text-xs text-gray-500 sm:text-sm">
              Informasi data diri dan status akun kondektur Anda.
            </p>
          </div>
        </div>

        {/* CONTENT AREA */}
        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm sm:rounded-3xl">
            <div className="flex items-center justify-center gap-2 text-sm">
              <FiRefreshCw className="h-4 w-4 animate-spin" />
              <span>Memuat data profil...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <FiAlertCircle className="h-5 w-5 shrink-0" />
            <span>Gagal memuat profil: {error}</span>
          </div>
        ) : !conductor ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 shadow-sm sm:rounded-3xl">
            Data profil tidak ditemukan.
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {/* MAIN INFO CARD */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-blue-50 text-blue-600 shadow-md sm:h-24 sm:w-24">
                  {conductor.photoUrl ? (
                    <img
                      src={conductor.photoUrl}
                      alt={conductor.name}
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
                    <h2 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                      {conductor.name}
                    </h2>
                    <span
                      className={`inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        conductor.isVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {conductor.isVerified ? (
                        <FiCheckCircle className="h-3 w-3" />
                      ) : (
                        <FiClock className="h-3 w-3" />
                      )}
                      {conductor.isVerified
                        ? "Terverifikasi"
                        : "Belum Verifikasi"}
                    </span>
                  </div>

                  <p className="mt-0.5 font-mono text-xs text-gray-500">
                    NIK: {conductor.nik || "-"}
                  </p>
                </div>
              </div>

              {/* Stat pills (2 items for Conductor) */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-2 py-2 text-center sm:px-3 sm:py-2.5">
                  <span className="block text-[9px] font-bold uppercase text-gray-400 sm:text-[10px]">
                    Status Tugas
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-bold text-gray-800 sm:text-sm">
                    {conductor.status}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-2 py-2 text-center sm:px-3 sm:py-2.5">
                  <span className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase text-gray-400 sm:text-[10px]">
                    <FiTruck className="h-3 w-3" /> Total Trip
                  </span>
                  <span className="mt-0.5 block text-xs font-bold text-gray-800 sm:text-sm">
                    {conductor.totalTrips ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* DETAIL SECTION */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
              <h3 className="mb-3 border-b border-gray-100 pb-2.5 text-sm font-bold text-gray-900">
                Informasi Kontak & Alamat
              </h3>

              <div className="space-y-2 text-xs sm:text-sm">
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
