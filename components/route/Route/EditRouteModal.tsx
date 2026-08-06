"use client";

import { useState, useEffect } from "react";
import { Route, UpdateRouteInput } from "@/types/routes/route.type";
import { FiX, FiSave } from "react-icons/fi";

interface EditRouteModalProps {
  isOpen: boolean;
  route: Route | null;
  onClose: () => void;
  onSave: (updatedData: UpdateRouteInput) => void;
}

export function EditRouteModal({
  isOpen,
  route,
  onClose,
  onSave,
}: EditRouteModalProps) {
  const [form, setForm] = useState({
    routeCode: "",
    routeName: "",
  });

  useEffect(() => {
    if (route) {
      setForm({
        routeCode: route.routeCode || "",
        routeName: route.routeName || "",
      });
    }
  }, [route]);

  if (!isOpen || !route) return null;

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-6 my-8">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Data Trayek</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Kode Trayek
            </label>
            <input
              type="text"
              value={form.routeCode}
              placeholder="Contoh: AL"
              maxLength={10}
              onChange={(e) => handleChange("routeCode", e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Nama Trayek
            </label>
            <input
              type="text"
              value={form.routeName}
              placeholder="Contoh: Arjosari - Landungsari"
              maxLength={100}
              onChange={(e) => handleChange("routeName", e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
              required
            />
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