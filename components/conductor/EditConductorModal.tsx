"use client";

import { useState, useEffect } from "react";
import {
  Conductor,
  UpdateConductorInput,
  ConductorStatus,
} from "@/types/conductor.type";
import { FiX, FiSave } from "react-icons/fi";

interface EditConductorModalProps {
  isOpen: boolean;
  conductor: Conductor | null;
  onClose: () => void;
  onSave: (updatedData: UpdateConductorInput) => void;
}

interface ConductorFormState {
  name: string;
  nik: string;
  email: string;
  phone: string;
  address: string;
  isVerified: boolean;
  status: ConductorStatus;
  totalTrips: number;
}

export function EditConductorModal({
  isOpen,
  conductor,
  onClose,
  onSave,
}: EditConductorModalProps) {
  const [form, setForm] = useState<ConductorFormState>({
    name: "",
    nik: "",
    email: "",
    phone: "",
    address: "",
    isVerified: false,
    status: "OFF_DUTY",
    totalTrips: 0,
  });

  useEffect(() => {
    if (conductor) {
      setForm({
        name: conductor.name || "",
        nik: conductor.nik || "",
        email: conductor.email || "",
        phone: conductor.phone || "",
        address: conductor.address || "",
        isVerified: conductor.isVerified ?? false,
        status: conductor.status || "OFF_DUTY",
        totalTrips: conductor.totalTrips ?? 0,
      });
    }
  }, [conductor]);

  if (!isOpen || !conductor) return null;

  const handleChange = <K extends keyof ConductorFormState>(
    field: K,
    value: ConductorFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData: UpdateConductorInput = {
      name: form.name,
      nik: form.nik,
      email: form.email,
      phone: form.phone,
      address: form.address || null,
      isVerified: form.isVerified,
      status: form.status,
      totalTrips: Number(form.totalTrips),
    };

    onSave(updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 space-y-6 my-8">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Edit Data Kondektur
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Perbarui atribut informasi akun kondektur.
            </p>
          </div>
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
          {/* Baris 1: Nama & NIK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                NIK
              </label>
              <input
                type="text"
                value={form.nik}
                onChange={(e) => handleChange("nik", e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </div>
          </div>

          {/* Baris 2: Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Nomor Telepon
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </div>
          </div>

          {/* Baris 3: Total Trip */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Total Trip
            </label>
            <input
              type="number"
              value={form.totalTrips}
              onChange={(e) =>
                handleChange("totalTrips", Number(e.target.value))
              }
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>

          {/* Baris 4: Alamat */}
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

          {/* Baris 5: Status & Verifikasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Status Akun
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  handleChange("status", e.target.value as ConductorStatus)
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

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
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
