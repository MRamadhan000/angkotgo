"use client";

import { useState, useEffect } from "react";
import { FiX, FiSave } from "react-icons/fi";
import {
  User,
  UpdateUserRequest,
} from "@/types/user.type";

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (updatedData: UpdateUserRequest) => void;
}

export function EditUserModal({
  isOpen,
  user,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [form, setForm] = useState<UpdateUserRequest>({
    name: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        password: "",
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (
    field: keyof UpdateUserRequest,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData: UpdateUserRequest = {
      name: form.name?.trim(),
      phone: form.phone?.trim(),
    };

    // Password hanya dikirim jika diisi
    if (form.password?.trim()) {
      updatedData.password = form.password;
    }

    onSave(updatedData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-xl border border-gray-100 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Edit Data User
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Perbarui informasi user
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* EMAIL */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Email
            </label>

            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
            />

            <p className="text-[11px] text-gray-400 mt-1">
              Email tidak dapat diubah.
            </p>
          </div>

          {/* NAMA */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Nama
            </label>

            <input
              type="text"
              value={form.name || ""}
              placeholder="Masukkan nama user"
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
              required
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Nomor Telepon
            </label>

            <input
              type="tel"
              value={form.phone || ""}
              placeholder="Contoh: 08123456789"
              onChange={(e) =>
                handleChange("phone", e.target.value)
              }
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Password Baru
            </label>

            <input
              type="password"
              value={form.password || ""}
              placeholder="Kosongkan jika tidak ingin mengubah"
              onChange={(e) =>
                handleChange(
                  "password",
                  e.target.value,
                )
              }
              minLength={6}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
            />

            <p className="text-[11px] text-gray-400 mt-1">
              Minimal 6 karakter. Kosongkan jika password
              tidak ingin diubah.
            </p>
          </div>

          {/* FOOTER */}
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
              <FiSave className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}