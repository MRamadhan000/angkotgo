"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiLock,
  FiChevronRight,
  FiCheckCircle,
  FiRefreshCw,
  FiAlertCircle,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

import ChangePasswordModal from "@/components/user-dashboard/ChangePasswordModal";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/useUsers";

export default function ProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();

  // Mengambil data detail profil pengguna
  const {
    data: profileResponse,
    isLoading: loading,
    error: profileError,
  } = useUser(Number(user?.id ?? 0));
  const profileData = profileResponse?.data;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 pt-2">
      {/* TAMPILAN LOADING */}
      {loading ? (
        <div className="rounded-2xl border border-[#c3c5d8]/30 bg-[#ffffff] p-8 md:p-12 text-center text-[#434655] shadow-sm">
          <div className="flex items-center justify-center gap-2 text-sm">
            <FiRefreshCw className="h-5 w-5 animate-spin text-[#1e56f1]" />
            <span>Memuat data profil pengguna...</span>
          </div>
        </div>
      ) : profileError ? (
        /* TAMPILAN ERROR */
        <div className="flex items-center gap-3 rounded-2xl border border-[#ba1a1a]/30 bg-[#ffdad6]/40 px-5 py-4 text-sm text-[#ba1a1a] shadow-sm">
          <FiAlertCircle className="h-5 w-5 shrink-0" />
          <span className="break-words">
            Gagal memuat profil:{" "}
            {profileError?.message || "Terjadi kesalahan sistem"}
          </span>
        </div>
      ) : !profileData ? (
        /* TAMPILAN DATA KOSONG */
        <div className="rounded-2xl border border-[#c3c5d8]/30 bg-[#ffffff] p-8 md:p-12 text-center text-sm text-[#747687] shadow-sm">
          Data profil pengguna tidak ditemukan.
        </div>
      ) : (
        /* DATA PROFIL BERHASIL DIMUAT */
        <>
          {/* Profile Header Card */}
          <section className="bg-[#ffffff] rounded-xl border border-[#c3c5d8]/40 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col items-center text-center gap-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#dce9ff] to-transparent opacity-50" />

            <div className="relative z-10 mt-2 flex flex-col items-center">
              <h1 className="text-[20px] leading-[28px] font-bold text-[#0b1c30]">
                {profileData.name}
              </h1>
              <p className="text-[14px] leading-[20px] text-[#434655] mt-1">
                {profileData.email}
              </p>
              <p className="text-[14px] leading-[20px] text-[#434655] mt-1">
                {profileData.phone}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-[#eff4ff] text-[#003fc7] px-3 py-1 rounded-full border border-[#b7c4ff]">
                <FiCheckCircle className="w-4 h-4 text-[#003fc7]" />
                <span className="text-[12px] leading-[16px] font-semibold uppercase tracking-wider">
                  {profileData.status ? "Verified User" : "Belum Verifikasi"}
                </span>
              </div>
            </div>
          </section>

          {/* Detail Informasi Kontak (Opsional, siap di-uncomment jika dibutuhkan) */}
          {/* 
          <section className="bg-[#ffffff] rounded-xl border border-[#c3c5d8]/40 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
            <h3 className="font-bold text-[14px] text-[#0b1c30] border-b border-[#c3c5d8]/30 pb-3">
              Informasi Kontak & Domisili
            </h3>
            <div className="space-y-3 text-[14px]">
              <div className="flex items-center gap-3 text-[#434655]">
                <FiMail className="w-4 h-4 text-[#1e56f1] shrink-0" />
                <span>{profileData.email || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-[#434655]">
                <FiPhone className="w-4 h-4 text-[#1e56f1] shrink-0" />
                <span>{profileData.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-[#434655]">
                <FiMapPin className="w-4 h-4 text-[#1e56f1] shrink-0" />
                <span>{profileData.address || "-"}</span>
              </div>
            </div>
          </section> 
          */}

          {/* Menu Actions Section */}
          <section className="bg-[#ffffff] rounded-xl border border-[#c3c5d8]/40 shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full text-left flex items-center justify-between p-4 hover:bg-[#eff4ff] transition-colors duration-150 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#003fc7] group-hover:bg-[#003fc7] group-hover:text-[#ffffff] transition-colors duration-150 shrink-0">
                  <FiLock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] leading-[24px] text-[#0b1c30]">
                    Change Password
                  </h3>
                  <p className="text-[13px] leading-[18px] text-[#434655]">
                    Perbarui kata sandi akun Anda
                  </p>
                </div>
              </div>
              <FiChevronRight className="w-5 h-5 text-[#747687] group-hover:text-[#003fc7] transition-colors duration-150" />
            </button>
          </section>
        </>
      )}

      {/* App Version Info */}
      <div className="flex justify-center mt-2 mb-8">
        <span className="text-[12px] leading-[16px] font-semibold text-[#747687]">
          AngkotGo App Version 2.4.1
        </span>
      </div>

      {/* Change Password Modal Component */}
      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
