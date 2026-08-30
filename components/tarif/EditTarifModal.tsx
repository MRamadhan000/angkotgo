"use client";

import { useState, useEffect } from "react";
import { Tarif, UpdateTarifRequest } from "@/types/tarif.type";
import { FiX, FiSave } from "react-icons/fi";

interface EditTarifModalProps {
  isOpen: boolean;
  tarif: Tarif | null;
  onClose: () => void;
  onSave: (updatedData: UpdateTarifRequest) => void;
}

export function EditTarifModal({
  isOpen,
  tarif,
  onClose,
  onSave,
}: EditTarifModalProps) {
  const [form, setForm] = useState({
    name: "",
    nominal: 0,
  });

  useEffect(() => {
    if (tarif) {
      setForm({
        name: tarif.name || "",
        nominal: tarif.nominal || 0,
      });
    }
  }, [tarif]);

  if (!isOpen || !tarif) return null;

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData: UpdateTarifRequest = {
      name: form.name,
      nominal: form.nominal,
    };

    onSave(updatedData);
    onClose();
  };

  const mainFields = [
    {
      label: "Nama Tarif",
      key: "name" as const,
      type: "text",
      required: true,
      placeholder: "Contoh: Tarif Reguler",
    },
    {
      label: "Nominal",
      key: "nominal" as const,
      type: "number",
      required: true,
      placeholder: "Contoh: 10.000",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-xl border border-gray-100 space-y-6 my-8">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Data Tarif</h3>
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
            {mainFields.map(({ label, key, type, required, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  placeholder={placeholder}
                  onChange={(e) =>
                    handleChange(
                      key,
                      type === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                    )
                  }
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
                  required={required}
                />
              </div>
            ))}
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
