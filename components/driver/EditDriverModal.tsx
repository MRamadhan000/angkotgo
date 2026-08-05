"use client";

import { useState, useEffect } from "react";
import { Driver, UpdateDriverInput } from "@/types/driver.type";
import { FiX, FiSave } from "react-icons/fi";

interface EditDriverModalProps {
  isOpen: boolean;
  driver: Driver | null;
  onClose: () => void;
  onSave: (updatedData: UpdateDriverInput) => void;
}

export function EditDriverModal({
  isOpen,
  driver,
  onClose,
  onSave,
}: EditDriverModalProps) {
  const [form, setForm] = useState({
    name: "",
    nik: "",
    email: "",
    phone: "",
    licenseNumber: "",
    licenseExpiryDate: "",
    address: "",
    isVerified: false,
    status: "ACTIVE" as Driver["status"],
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
  });

  useEffect(() => {
    if (driver) {
      setForm({
        name: driver.name || "",
        nik: driver.nik || "",
        email: driver.email || "",
        phone: driver.phone || "",
        licenseNumber: driver.licenseNumber || "",
        licenseExpiryDate: driver.licenseExpiryDate
          ? new Date(driver.licenseExpiryDate).toISOString().split("T")[0]
          : "",
        address: driver.address || "",
        isVerified: driver.isVerified ?? false,
        status: driver.status || "ACTIVE",
        bankName: driver.bankAccountInfo?.bankName || "",
        accountNumber: driver.bankAccountInfo?.accountNumber || "",
        accountHolderName: driver.bankAccountInfo?.accountHolderName || "",
      });
    }
  }, [driver]);

  if (!isOpen || !driver) return null;

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData: UpdateDriverInput = {
      name: form.name,
      nik: form.nik,
      email: form.email,
      phone: form.phone,
      licenseNumber: form.licenseNumber,
      licenseExpiryDate: form.licenseExpiryDate
        ? new Date(form.licenseExpiryDate).toISOString()
        : undefined,
      address: form.address || null,
      isVerified: form.isVerified,
      status: form.status,
      bankAccountInfo:
        form.bankName || form.accountNumber || form.accountHolderName
          ? {
              bankName: form.bankName,
              accountNumber: form.accountNumber,
              accountHolderName: form.accountHolderName,
            }
          : null,
    };

    onSave(updatedData);
    onClose();
  };

  const mainFields = [
    {
      label: "Nama Lengkap",
      key: "name" as const,
      type: "text",
      required: true,
    },
    { label: "NIK", key: "nik" as const, type: "text" },
    { label: "Email", key: "email" as const, type: "email" },
    { label: "Nomor Telepon", key: "phone" as const, type: "text" },
    { label: "Nomor SIM", key: "licenseNumber" as const, type: "text" },
    { label: "Expired SIM", key: "licenseExpiryDate" as const, type: "date" },
  ];

  const bankFields = [
    {
      label: "Nama Bank",
      key: "bankName" as const,
      placeholder: "Contoh: BCA",
    },
    {
      label: "Nomor Rekening",
      key: "accountNumber" as const,
      placeholder: "Nomor Rekening",
    },
    {
      label: "Nama Pemilik",
      key: "accountHolderName" as const,
      placeholder: "Atas Nama",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 space-y-6 my-8">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Data Driver</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto px-1"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainFields.map(({ label, key, type, required }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
                  required={required}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Alamat
            </label>
            <textarea
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Status Akun
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  handleChange("status", e.target.value as Driver["status"])
                }
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="OFF_DUTY">OFF_DUTY</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Verifikasi Akun
              </label>
              <select
                value={String(form.isVerified)}
                onChange={(e) =>
                  handleChange("isVerified", e.target.value === "true")
                }
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white"
              >
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Informasi Rekening Bank
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {bankFields.map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onChange={() => {}}
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gray-800 hover:bg-gray-900 rounded-xl shadow-sm transition-all"
            >
              <FiSave className="w-4 h-4" /> Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
