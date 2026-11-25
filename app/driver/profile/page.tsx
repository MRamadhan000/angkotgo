"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiCalendar,
  FiMapPin,
  FiCheckCircle,
  FiShield,
  FiCamera,
  FiSave,
  FiLoader,
  FiAlertCircle,
  FiAward,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useDriverDetail, useUpdateDriver } from "@/hooks/useDrivers";
import type { UpdateDriverInput } from "@/types/driver.type";

export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface DriverProfileFormData {
  name: string;
  nik: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  address: string;
  photoUrl: string;
  isVerified: boolean;
  bankAccountInfo: BankAccountInfo;
}

const INITIAL_FORM_STATE: DriverProfileFormData = {
  name: "",
  nik: "",
  email: "",
  phone: "",
  licenseNumber: "",
  licenseExpiryDate: "",
  address: "",
  photoUrl: "",
  isVerified: false,
  bankAccountInfo: {
    bankName: "Bank Mandiri",
    accountNumber: "",
    accountHolderName: "",
  },
};

const BANK_OPTIONS = [
  "Bank Mandiri",
  "Bank BCA",
  "Bank BRI",
  "Bank BNI",
  "Bank Jatim",
  "Bank Permata",
];

export default function EditDriverProfilePage() {
  const { user } = useAuth();
  const {
    data: driver,
    isLoading: loading,
    error: driverError,
    refetch,
    isFetching,
  } = useDriverDetail(user?.id ?? null);

  const updateDriverMutation = useUpdateDriver();

  const router = useRouter();

  const [formData, setFormData] =
    useState<DriverProfileFormData>(INITIAL_FORM_STATE);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  /* Sync data dari hook useDriverDetail ke local state formData */
  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || "",
        nik: driver.nik || "",
        email: driver.email || "",
        phone: driver.phone || "",
        licenseNumber: driver.licenseNumber || "",
        licenseExpiryDate: driver.licenseExpiryDate
          ? new Date(driver.licenseExpiryDate).toISOString().split("T")[0]
          : "",
        address: driver.address || "",
        photoUrl: driver.photoUrl || "",
        isVerified: Boolean(driver.isVerified),
        bankAccountInfo: {
          bankName: driver.bankAccountInfo?.bankName || "Bank Mandiri",
          accountNumber: driver.bankAccountInfo?.accountNumber || "",
          accountHolderName: driver.bankAccountInfo?.accountHolderName || "",
        },
      });
    }
  }, [driver]);

  /* Handler update input text dasar */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* Handler khusus untuk nested bankAccountInfo */
  const handleBankChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bankAccountInfo: {
        ...prev.bankAccountInfo,
        [name]: value,
      },
    }));
  };

  /* Helper Toast */
  const showToast = (text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  /* Submit Form (PATCH /drivers/:id via TanStack Query) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      showToast("ID driver tidak tersedia. Silakan login ulang.", "error");
      return;
    }

    const payload: UpdateDriverInput = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      licenseNumber: formData.licenseNumber,
      licenseExpiryDate: formData.licenseExpiryDate,
      address: formData.address,
      photoUrl: formData.photoUrl,
      bankAccountInfo: formData.bankAccountInfo,
    };

    try {
      await updateDriverMutation.mutateAsync({
        id: user.id,
        data: payload,
      });

      showToast("Profil Driver berhasil diperbarui!", "success");
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (err) {
      console.error(err);
      showToast(
        err instanceof Error
          ? err.message
          : "Gagal mengupdate profil. Periksa jaringan Anda.",
        "error",
      );
    }
  };

  const isSubmitting = updateDriverMutation.isPending;

  /* Handling State Loading & Error */
  if (loading) {
    return (
      <div className="min-h-dvh w-full bg-slate-100 flex flex-col items-center justify-center gap-3 text-slate-500">
        <FiLoader size={32} className="animate-spin text-blue-700" />
        <p className="text-xs font-semibold">Memuat profil driver...</p>
      </div>
    );
  }

  if (driverError) {
    return (
      <div className="min-h-dvh w-full bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-xs max-w-sm w-full space-y-3">
          <FiAlertCircle size={40} className="mx-auto text-rose-500" />
          <h2 className="text-sm font-extrabold text-slate-900">
            Gagal Memuat Data
          </h2>
          <p className="text-xs text-slate-500">
            {driverError instanceof Error
              ? driverError.message
              : "Terjadi kesalahan saat mengambil profil driver."}
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition active:scale-95 hover:bg-slate-800 disabled:opacity-60"
          >
            {isFetching && <FiLoader size={13} className="animate-spin" />}
            {isFetching ? "Memuat..." : "Coba Lagi"}
          </button>
          <button
            onClick={() => router.back()}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition active:scale-95 hover:bg-slate-50"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-slate-100 font-sans text-slate-900 pb-16 select-none antialiased">
      {/* ---------------------------------------------------------
         TOP NAVBAR / HEADER
      --------------------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-3 shadow-xs">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition active:scale-95 hover:bg-slate-100"
              title="Kembali"
            >
              <FiArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-none">
                Edit Profil Driver
              </h1>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                Pembaruan data akun operasional driver
              </p>
            </div>
          </div>

          <button
            type="submit"
            form="driver-profile-form"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-3 sm:px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-700/20 transition active:scale-95 hover:bg-blue-800 disabled:opacity-60"
          >
            {isSubmitting ? (
              <FiLoader size={14} className="animate-spin" />
            ) : (
              <FiSave size={14} />
            )}
            <span className="hidden xs:inline">Simpan</span>
          </button>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-16 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 shadow-xl border text-xs font-bold pointer-events-auto backdrop-blur-md ${
              toastMessage.type === "success"
                ? "bg-emerald-900/90 text-emerald-50 border-emerald-700"
                : "bg-rose-900/90 text-rose-50 border-rose-700"
            }`}
          >
            {toastMessage.type === "success" ? (
              <FiCheckCircle size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <FiAlertCircle size={16} className="text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
         MAIN CONTENT FORM
      --------------------------------------------------------- */}
      <main className="mx-auto max-w-2xl px-3 sm:px-4 pt-4 sm:pt-6">
        <form
          id="driver-profile-form"
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-5"
        >
          {/* CARD 1: FOTO PROFIL & STATUS VERIFIKASI */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-blue-700 text-white text-2xl font-black shadow-md border-2 border-white overflow-hidden">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt={formData.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiUser size={36} />
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition active:scale-95 hover:bg-slate-800"
                  title="Ganti Foto"
                >
                  <FiCamera size={13} />
                </button>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">
                    {formData.name || "Nama Driver"}
                  </h2>
                  {formData.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200">
                      <FiCheckCircle size={11} className="text-emerald-600" />{" "}
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  NIK: {formData.nik || "-"}
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-700 border border-blue-100">
                    <FiShield size={12} /> Status SIM:{" "}
                    {formData.licenseNumber || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: DATA PRIBADI & KONTAK */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FiUser className="text-blue-700" size={17} />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                Informasi Pribadi & Kontak
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* NAMA LENGKAP */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nama Lengkap Driver <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pl-9 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                    required
                  />
                  <FiUser
                    className="absolute left-3 top-3 text-slate-400"
                    size={14}
                  />
                </div>
              </div>

              {/* NIK (READ-ONLY) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nomor Induk Kependudukan (NIK)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 pl-9 text-xs font-semibold text-slate-500 cursor-not-allowed"
                  />
                  <FiCreditCard
                    className="absolute left-3 top-3 text-slate-400"
                    size={14}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  NIK terverifikasi sistem & tidak dapat diubah manual.
                </span>
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Alamat Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pl-9 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                    required
                  />
                  <FiMail
                    className="absolute left-3 top-3 text-slate-400"
                    size={14}
                  />
                </div>
              </div>

              {/* PHONE */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nomor Telepon / WhatsApp{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pl-9 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                    required
                  />
                  <FiPhone
                    className="absolute left-3 top-3 text-slate-400"
                    size={14}
                  />
                </div>
              </div>
            </div>

            {/* ALAMAT LENGKAP */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Alamat Tempat Tinggal
              </label>
              <div className="relative">
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pl-9 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition resize-none"
                  placeholder="Masukkan alamat domisili..."
                />
                <FiMapPin
                  className="absolute left-3 top-3 text-slate-400"
                  size={14}
                />
              </div>
            </div>
          </div>

          {/* CARD 3: DOKUMEN LISENSI SIM B1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FiAward className="text-blue-700" size={17} />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                Lisensi SIM Driver
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* LICENSE NUMBER */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nomor SIM B1 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                  required
                />
              </div>

              {/* LICENSE EXPIRY DATE */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Kadaluarsa SIM <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="licenseExpiryDate"
                    value={formData.licenseExpiryDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pl-9 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                    required
                  />
                  <FiCalendar
                    className="absolute left-3 top-3 text-slate-400"
                    size={14}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4: REKENING BANK PENERIMA GAJI/PENCAIRAN */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FiCreditCard className="text-emerald-600" size={17} />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                Informasi Rekening Pencairan
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* NAMA BANK */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nama Bank
                </label>
                <select
                  name="bankName"
                  value={formData.bankAccountInfo.bankName}
                  onChange={handleBankChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                >
                  {BANK_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* NOMOR REKENING */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.bankAccountInfo.accountNumber}
                  onChange={handleBankChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                  placeholder="Contoh: 1440019283741"
                />
              </div>

              {/* ATAS NAMA REKENING */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Atas Nama Rekening
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.bankAccountInfo.accountHolderName}
                  onChange={handleBankChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                  placeholder="Nama sesuai buku tabungan"
                />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS FOOTER */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-98 text-center"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-xs font-bold text-white shadow-md shadow-blue-700/20 hover:bg-blue-800 transition active:scale-98 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <FiLoader size={15} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <FiSave size={15} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}