"use client";

import { useState } from "react";
import { CreateTarifRequest } from "@/types/tarif.type";
import { FiX, FiSave } from "react-icons/fi";

interface CreateTarifModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTarifRequest) => void;
}

export function CreateTarifModal({
  isOpen,
  onClose,
  onSave,
}: CreateTarifModalProps) {
  const [form, setForm] = useState<CreateTarifRequest>({
    name: "",
    nominal: 0,
  });

  if (!isOpen) return null;

  const handleChange = (field: keyof CreateTarifRequest, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newData: CreateTarifRequest = {
      name: form.name,
      nominal: Number(form.nominal),
    };

    onSave(newData);
    setForm({
      name: "",
      nominal: 0,
    });
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
      placeholder: "Contoh: 10000",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-xl border border-gray-100 space-y-6 my-8">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h3 className="text-lg font-bold text-gray-900">Tambah Tarif Baru</h3>
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
                      type === "number" ? Number(e.target.value) : e.target.value
                    )
                  }
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800"
                  required={required}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
    