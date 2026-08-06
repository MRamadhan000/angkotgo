"use client";

import { useState, useEffect } from "react";
import { Vehicle, UpdateVehicleInput, VehicleStatus, VehicleType } from "@/types/vehicles/vehicle.type";
import { FiX, FiSave } from "react-icons/fi";

interface EditVehicleModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: (updatedData: UpdateVehicleInput) => void;
}

export function EditVehicleModal({
  isOpen,
  vehicle,
  onClose,
  onSave,
}: EditVehicleModalProps) {
  const [form, setForm] = useState({
    plateNumber: "",
    vehicleCode: "",
    capacity: 0,
    currentOdometer: 0,
    status: VehicleStatus.ACTIVE,
    type: VehicleType.REGULER,
  });

  useEffect(() => {
    if (vehicle) {
      setForm({
        plateNumber: vehicle.plateNumber || "",
        vehicleCode: vehicle.vehicleCode || "",
        capacity: vehicle.capacity ?? 0,
        currentOdometer: vehicle.currentOdometer ?? 0,
        status: vehicle.status || VehicleStatus.ACTIVE,
        type: vehicle.type || VehicleType.REGULER,
      });
    }
  }, [vehicle]);

  if (!isOpen || !vehicle) return null;

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData: UpdateVehicleInput = {
      plateNumber: form.plateNumber,
      vehicleCode: form.vehicleCode,
      capacity: Number(form.capacity),
      currentOdometer: Number(form.currentOdometer),
      status: form.status,
      type: form.type,
    };

    onSave(updatedData);
    onClose();
  };

  const mainFields = [
    {
      label: "Nomor Plat",
      key: "plateNumber" as const,
      type: "text",
      required: true,
      placeholder: "Contoh: B 1234 XYZ",
    },
    {
      label: "Kode Kendaraan",
      key: "vehicleCode" as const,
      type: "text",
      required: true,
      placeholder: "Contoh: ANG-001",
    },
    {
      label: "Kapasitas Penumpang",
      key: "capacity" as const,
      type: "number",
      required: false,
      placeholder: "Jumlah kursi",
    },
    {
      label: "Odometer Saat Ini (KM)",
      key: "currentOdometer" as const,
      type: "number",
      required: false,
      placeholder: "Kilometer kendaraan",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-xl border border-gray-100 space-y-6 my-8">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Data Kendaraan</h3>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Field Tipe Kendaraan */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Tipe Kendaraan
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  handleChange("type", e.target.value as VehicleType)
                }
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white"
              >
                <option value={VehicleType.REGULER}>REGULER</option>
                <option value={VehicleType.PREMIUM}>PREMIUM</option>
              </select>
            </div>

            {/* Field Status Kendaraan */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Status Kendaraan
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  handleChange("status", e.target.value as VehicleStatus)
                }
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white"
              >
                <option value={VehicleStatus.ACTIVE}>ACTIVE</option>
                <option value={VehicleStatus.INACTIVE}>INACTIVE</option>
                <option value={VehicleStatus.MAINTENANCE}>MAINTENANCE</option>
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