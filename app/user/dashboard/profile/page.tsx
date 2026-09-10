"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiHome,
  FiUser,
  FiLogOut,
  FiMenu,
  FiBell,
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
import { useAuth } from "@/context/AuthContext"; // Pastikan path ini sesuai
import { useUser } from "@/hooks/useUsers"; // Adaptasi hook data detail mirip useDriverDetail

export default function ProfilePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, logout } = useAuth();

  // Adaptasi cara mengambil data mirip driverProfile
  const {
    data: profileResponse,
    isLoading: loading,
    error: profileError,
  } = useUser(Number(user?.id ?? 0));
  const profileData = profileResponse?.data;

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col md:flex-row font-sans">
      {/* Sidebar Backdrop (Mobile) */}
      <div
        className={`fixed inset-0 bg-[#0b1c30]/50 z-50 transition-opacity duration-300 backdrop-blur-sm md:hidden ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar (Kiri) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-[280px] bg-[#ffffff] z-50 md:z-auto flex flex-col shrink-0 border-r border-[#c3c5d8]/30 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-[#c3c5d8]/30">
          {/* <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e5eeff] relative shrink-0 border border-[#c3c5d8]">
            {profileData?.photoUrl ? (
              <Image
                src={profileData.photoUrl}
                alt={profileData.name || "User Avatar"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#1e56f1]">
                <FiUser className="h-5 w-5" />
              </div>
            )}
          </div> */}
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[16px] leading-[22px] text-[#0b1c30] truncate">
              {profileData ? profileData.name : "Pengguna"}
            </span>
            <span className="text-[12px] leading-[16px] text-[#434655] truncate">
              {profileData?.phone}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-2 overflow-y-auto">
          <Link
            href="/user/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-full text-[#434655] hover:bg-[#eff4ff] font-semibold text-[14px] leading-[24px] transition-colors"
          >
            <FiHome className="w-5 h-5" /> Home
          </Link>

          <Link
            href="/user/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-full bg-[#1e56f1] text-[#ffffff] font-semibold text-[14px] leading-[24px] transition-colors"
          >
            <FiUser className="w-5 h-5" />
            Profile
          </Link>
        </nav>

        <div className="p-3 border-t border-[#c3c5d8]/30 mt-auto">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-[#ba1a1a] hover:bg-[#ffdad6]/50 font-semibold text-[14px] leading-[24px] transition-colors"
            onClick={logout}
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Right Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* TopAppBar */}
        <header className="w-full sticky top-0 z-40 bg-[#f8f9ff] shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-between px-4 md:px-8 h-14 border-b border-[#c3c5d8]/20">
          <div className="flex items-center gap-3">
            <button
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-[#dee3ed]/50 active:scale-95 transition-transform duration-150 text-[#434655] md:hidden"
              onClick={toggleSidebar}
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <span className="text-[20px] leading-[28px] font-bold text-[#003fc7]">
              AngkotGo
            </span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#dee3ed]/50 active:scale-95 transition-transform duration-150 text-[#434655]">
            <FiBell className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-10 flex flex-col gap-6">
          {/* TAMPILAN LOADING (Adaptasi dari driverProfile) */}
          {loading ? (
            <div className="rounded-2xl border border-[#c3c5d8]/30 bg-[#ffffff] p-8 md:p-12 text-center text-[#434655] shadow-sm">
              <div className="flex items-center justify-center gap-2 text-sm">
                <FiRefreshCw className="h-5 w-5 animate-spin text-[#1e56f1]" />
                <span>Memuat data profil pengguna...</span>
              </div>
            </div>
          ) : profileError ? (
            /* TAMPILAN ERROR (Adaptasi dari driverProfile) */
            <div className="flex items-center gap-3 rounded-2xl border border-[#ba1a1a]/30 bg-[#ffdad6]/40 px-5 py-4 text-sm text-[#ba1a1a] shadow-sm">
              <FiAlertCircle className="h-5 w-5 shrink-0" />
              <span className="break-words">
                Gagal memuat profil:{" "}
                {profileError?.message || "Terjadi kesalahan sistem"}
              </span>
            </div>
          ) : !profileData ? (
            /* TAMPILAN DATA KOSONG (Adaptasi dari driverProfile) */
            <div className="rounded-2xl border border-[#c3c5d8]/30 bg-[#ffffff] p-8 md:p-12 text-center text-sm text-[#747687] shadow-sm">
              Data profil pengguna tidak ditemukan.
            </div>
          ) : (
            /* DATA PROFIL BERHASIL DIMUAT */
            <>
              {/* Profile Header Card */}
              <section className="bg-[#ffffff] rounded-xl border border-[#c3c5d8]/40 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col items-center text-center gap-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#dce9ff] to-transparent opacity-50" />

                {/* <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#ffffff] relative z-10 shadow-sm mt-4 shrink-0 bg-[#e5eeff]">
                  {profileData.photoUrl ? (
                    <Image
                      src={profileData.photoUrl}
                      alt={profileData.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#1e56f1]">
                      <FiUser className="h-10 w-10" />
                    </div>
                  )}
                </div> */}

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
                      {profileData.status
                        ? "Verified User"
                        : "Belum Verifikasi"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Detail Informasi Kontak */}
              {/* <section className="bg-[#ffffff] rounded-xl border border-[#c3c5d8]/40 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
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
              </section> */}

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
        </main>

        <ChangePasswordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
