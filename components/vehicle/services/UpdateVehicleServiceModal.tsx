"use client";

import { useEffect, useState } from "react";
import {
  FiActivity,
  FiCalendar,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiEdit3,
  FiTool,
  FiX,
} from "react-icons/fi";

import {
  UpdateVehicleServiceInput,
  VehicleService,
} from "@/types/vehicles/vehicle-service.type";

import { ServiceType } from "@/types/vehicles/vehicle.type";

interface Props {
  service: VehicleService | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSave: (id: number, data: UpdateVehicleServiceInput) => void;
}

const SERVICE_OPTIONS = [
  {
    value: ServiceType.ROUTINE,
    label: "Routine",
    description: "Perawatan berkala kendaraan",
    icon: FiClock,
    activeClass:
      "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500",
    iconClass: "bg-blue-100 text-blue-600",
  },
  {
    value: ServiceType.REPAIR,
    label: "Repair",
    description: "Perbaikan kerusakan kendaraan",
    icon: FiTool,
    activeClass:
      "border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500",
    iconClass: "bg-amber-100 text-amber-600",
  },
  {
    value: ServiceType.INSPECTION,
    label: "Inspection",
    description: "Pemeriksaan kondisi kendaraan",
    icon: FiActivity,
    activeClass:
      "border-rose-500 bg-rose-50 text-rose-700 ring-1 ring-rose-500",
    iconClass: "bg-rose-100 text-rose-600",
  },
];

export function UpdateVehicleServiceModal({
  service,
  isOpen,
  isLoading = false,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<UpdateVehicleServiceInput>({});

  useEffect(() => {
    if (!service) return;

    setForm({
      serviceType: service.serviceType,
      description: service.description,
      cost: Number(service.cost),
      odometerAtService: service.odometerAtService,
      serviceDate: service.serviceDate?.split("T")[0],
      nextServiceDate: service.nextServiceDate?.split("T")[0] || undefined,
      nextServiceOdometer: service.nextServiceOdometer ?? undefined,
    });
  }, [service]);

  if (!isOpen || !service) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave(service.id, {
      ...form,
      cost: Number(form.cost),
      odometerAtService: Number(form.odometerAtService),
      nextServiceOdometer:
        form.nextServiceOdometer != null
          ? Number(form.nextServiceOdometer)
          : undefined,
      nextServiceDate: form.nextServiceDate || undefined,
    });
  };

  const inputClass =
    "w-full px-4 py-3 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl outline-none transition-all placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-50 disabled:text-gray-400";

  const labelClass =
    "block text-xs font-bold uppercase tracking-wide text-gray-600 mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-100">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gray-900 text-white">
              <FiEdit3 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Edit Riwayat Servis
              </h3>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">Servis ID</span>

                <span className="px-2 py-0.5 text-[10px] font-bold text-gray-600 bg-gray-100 rounded-md">
                  #{service.id}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex items-center justify-center w-9 h-9 text-gray-400 transition-colors rounded-xl hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(92vh-90px)] overflow-y-auto"
        >
          <div className="p-6 space-y-6">
            {/* SERVICE TYPE */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={labelClass}>Tipe Servis</label>

                <span className="text-[11px] text-gray-400">
                  Pilih jenis perawatan
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SERVICE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = form.serviceType === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          serviceType: option.value,
                        }))
                      }
                      className={`relative text-left p-4 rounded-2xl border transition-all ${
                        selected
                          ? option.activeClass
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {selected && (
                        <div className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-white">
                          <FiCheck className="w-3 h-3" />
                        </div>
                      )}

                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${
                          selected
                            ? option.iconClass
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <p className="text-sm font-bold">{option.label}</p>

                      <p
                        className={`text-[11px] mt-1 leading-relaxed ${
                          selected ? "opacity-80" : "text-gray-400"
                        }`}
                      >
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DATE + ODOMETER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tanggal Servis</label>

                <div className="relative">
                  <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                  <input
                    type="date"
                    value={form.serviceDate ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        serviceDate: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Odometer Saat Servis</label>

                <div className="relative">
                  <FiActivity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                  <input
                    type="number"
                    min={0}
                    value={form.odometerAtService ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        odometerAtService: Number(e.target.value),
                      }))
                    }
                    disabled={isLoading}
                    placeholder="Contoh: 125000"
                    className={`${inputClass} pl-11 pr-14`}
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                    KM
                  </span>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Deskripsi Servis</label>

                <span className="text-[11px] text-gray-400">
                  Jelaskan pekerjaan yang dilakukan
                </span>
              </div>

              <textarea
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                disabled={isLoading}
                required
                rows={4}
                placeholder="Contoh: Ganti oli mesin, filter oli, dan pemeriksaan rem..."
                className={`${inputClass} resize-none leading-relaxed`}
              />
            </div>

            {/* COST */}
            <div>
              <label className={labelClass}>Biaya Servis</label>

              <div className="relative">
                <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                <input
                  type="number"
                  min={0}
                  value={form.cost ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      cost: Number(e.target.value),
                    }))
                  }
                  disabled={isLoading}
                  placeholder="Contoh: 350000"
                  className={`${inputClass} pl-11`}
                />
              </div>

              <p className="mt-1.5 text-[11px] text-gray-400">
                Masukkan total biaya yang dikeluarkan untuk servis.
              </p>
            </div>

            {/* NEXT SERVICE */}
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg border border-gray-200">
                  <FiCalendar className="w-4 h-4 text-gray-500" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-800">
                    Jadwal Servis Berikutnya
                  </h4>

                  <p className="text-[11px] text-gray-400">
                    Opsional untuk pengingat perawatan
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tanggal Berikutnya</label>

                  <input
                    type="date"
                    value={form.nextServiceDate ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        nextServiceDate: e.target.value || undefined,
                      }))
                    }
                    disabled={isLoading}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Odometer Berikutnya</label>

                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={form.nextServiceOdometer ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          nextServiceOdometer: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      disabled={isLoading}
                      placeholder="Contoh: 130000"
                      className={`${inputClass} pr-14`}
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                      KM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="hidden sm:block">
              <p className="text-[11px] text-gray-400">
                Perubahan akan disimpan ke riwayat servis kendaraan.
              </p>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
