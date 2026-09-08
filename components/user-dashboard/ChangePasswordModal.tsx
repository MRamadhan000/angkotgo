"use client";

import { useState } from "react";
import { FiX, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validasi sederhana
    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Kata sandi baru minimal 6 karakter.");
      return;
    }

    try {
      setLoading(true);

      // SIMULASI API BACKEND (Ganti dengan endpoint API kamu)
      // await fetch('/api/user/change-password', {
      //   method: 'POST',
      //   body: JSON.stringify({ currentPassword, newPassword }),
      // });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessMessage("Kata sandi berhasil diperbarui!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Tutup modal otomatis setelah 1.5 detik
      setTimeout(() => {
        setSuccessMessage("");
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMessage("Gagal memperbarui kata sandi. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0b1c30]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#ffffff] rounded-2xl shadow-xl border border-[#c3c5d8]/40 overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-[#c3c5d8]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#003fc7]">
              <FiLock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[18px] leading-[24px] text-[#0b1c30]">
                Ubah Kata Sandi
              </h3>
              <p className="text-[12px] leading-[16px] text-[#434655]">
                Perbarui kata sandi untuk keamanan akun Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#434655] hover:bg-[#eff4ff] transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Pesan Error / Success */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-[13px] font-medium">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-lg bg-[#84ff93]/30 text-[#00521c] text-[13px] font-medium border border-[#00772c]/30">
              {successMessage}
            </div>
          )}

          {/* Input Password Saat Ini */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#0b1c30]">
              Kata Sandi Saat Ini
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama"
                className="w-full px-3.5 py-2.5 pr-10 text-[14px] bg-[#f8f9ff] border border-[#c3c5d8] rounded-xl text-[#0b1c30] placeholder-[#747687] focus:outline-none focus:border-[#1e56f1] focus:ring-1 focus:ring-[#1e56f1] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747687] hover:text-[#0b1c30]"
              >
                {showCurrent ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Input Password Baru */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#0b1c30]">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 pr-10 text-[14px] bg-[#f8f9ff] border border-[#c3c5d8] rounded-xl text-[#0b1c30] placeholder-[#747687] focus:outline-none focus:border-[#1e56f1] focus:ring-1 focus:ring-[#1e56f1] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747687] hover:text-[#0b1c30]"
              >
                {showNew ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password Baru */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[#0b1c30]">
              Konfirmasi Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full px-3.5 py-2.5 pr-10 text-[14px] bg-[#f8f9ff] border border-[#c3c5d8] rounded-xl text-[#0b1c30] placeholder-[#747687] focus:outline-none focus:border-[#1e56f1] focus:ring-1 focus:ring-[#1e56f1] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747687] hover:text-[#0b1c30]"
              >
                {showConfirm ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-[14px] font-semibold text-[#434655] hover:bg-[#eff4ff] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-full text-[14px] font-semibold bg-[#1e56f1] text-[#ffffff] hover:bg-[#003fc7] active:scale-95 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
