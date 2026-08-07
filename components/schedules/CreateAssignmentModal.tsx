"use client";

import { useState, useEffect } from "react";
import {
  FiPlus,
  FiX,
  FiCheck,
  FiTruck,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiNavigation,
  FiLoader,
} from "react-icons/fi";
import { DirectionType, AssignmentStatus } from "@/types/vehicles/vehicle.type";
import { useVehicles } from "@/hooks/vehicles/useVehicles";
import { useRoutes } from "@/hooks/routes/useRoutes";
import { useDrivers } from "@/hooks/useDrivers";
import { useConductors } from "@/hooks/useConductors";
import { CreateVehicleAssignmentInput } from "@/types/vehicles/vehicle-assignments.type";
import { FieldSelect } from "../common/FieldSelect";

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: CreateVehicleAssignmentInput) => Promise<void> | void;
}

export default function CreateAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAssignmentModalProps) {
  const { drivers, loading: loadingDrivers } = useDrivers();
  const { vehicles, loading: loadingVehicles } = useVehicles();
  const { routes, loading: loadingRoutes } = useRoutes();
  const { conductors, loading: loadingConductors } = useConductors();

  const todayString = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<CreateVehicleAssignmentInput>({
    vehicleId: 0,
    driverId: 0,
    conductorId: undefined,
    routeId: 0,
    direction: DirectionType.FORWARD,
    assignmentDate: todayString,
    startTime: "08:00",
    endTime: "16:00",
    currentPassengers: 0,
    status: AssignmentStatus.SCHEDULED,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset form saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setFormData({
        vehicleId: 0,
        driverId: 0,
        conductorId: undefined,
        routeId: 0,
        direction: DirectionType.FORWARD,
        assignmentDate: todayString,
        startTime: "08:00",
        endTime: "16:00",
        currentPassengers: 0,
        status: AssignmentStatus.SCHEDULED,
      });
      setErrorMsg(null);
    }
  }, [isOpen, todayString]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.vehicleId || !formData.driverId || !formData.routeId) {
      setErrorMsg("Kendaraan, Driver, dan Rute wajib dipilih!");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSuccess(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal membuat jadwal penugasan baru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl p-6 space-y-6 m-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-900 text-white rounded-2xl">
              <FiPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Buat Jadwal Operasional Baru
              </h3>
              <p className="text-xs text-gray-500">
                Tugaskan unit kendaraan dan driver ke dalam rute harian.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ERROR ALERT */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm animate-in fade-in duration-150">
            {errorMsg}
          </div>
        )}

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Pilih Kendaraan (Vehicle) */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Unit Kendaraan
              </label>
              <FieldSelect
                icon={FiTruck}
                loading={loadingVehicles}
                value={formData.vehicleId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicleId: Number(e.target.value),
                  })
                }
                required
              >
                <option value="" disabled>
                  {loadingVehicles
                    ? "Memuat kendaraan..."
                    : "-- Pilih Kendaraan --"}
                </option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicleCode ? `${v.vehicleCode} - ` : ""}Plat:{" "}
                    {v.plateNumber}
                  </option>
                ))}
              </FieldSelect>
            </div>

            {/* 2. Pilih Driver */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Pengemudi (Driver)
              </label>
              <FieldSelect
                icon={FiUser}
                loading={loadingDrivers}
                value={formData.driverId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, driverId: Number(e.target.value) })
                }
                required
              >
                <option value="" disabled>
                  {loadingDrivers ? "Memuat driver..." : "-- Pilih Driver --"}
                </option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </FieldSelect>
            </div>

            {/* 3. Pilih Kondektur (Conductor) */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Kondektur (Opsional)
              </label>
              <FieldSelect
                icon={FiUser}
                loading={loadingConductors}
                value={formData.conductorId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    conductorId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              >
                <option value="">
                  {loadingConductors
                    ? "Memuat kondektur..."
                    : "-- Pilih Kondektur (Opsional) --"}
                </option>
                {conductors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </FieldSelect>
            </div>

            {/* 4. Pilih Rute (Route) */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Rute Perjalanan
              </label>
              <FieldSelect
                icon={FiMapPin}
                loading={loadingRoutes}
                value={formData.routeId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, routeId: Number(e.target.value) })
                }
                required
              >
                <option value="" disabled>
                  {loadingRoutes ? "Memuat rute..." : "-- Pilih Rute --"}
                </option>
                {routes?.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.routeCode ? `${r.routeCode} - ` : ""}
                    {r.routeName}
                  </option>
                ))}
              </FieldSelect>
            </div>

            {/* 5. Arah Perjalanan (Direction) */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Arah (Direction)
              </label>
              <FieldSelect
                icon={FiNavigation}
                value={formData.direction || DirectionType.FORWARD}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    direction: e.target.value as DirectionType,
                  })
                }
              >
                <option value={DirectionType.FORWARD}>Forward (Pergi)</option>
                <option value={DirectionType.RETURN}>Return (Pulang)</option>
              </FieldSelect>
            </div>

            {/* 6. Tanggal Penugasan */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Tanggal Operasional
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={formData.assignmentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, assignmentDate: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:border-gray-400 transition-all cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* 7. Status Awal */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Status Penugasan
              </label>
              <select
                value={formData.status || AssignmentStatus.SCHEDULED}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as AssignmentStatus,
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:border-gray-400 transition-all cursor-pointer"
              >
                <option value={AssignmentStatus.SCHEDULED}>Scheduled</option>
                <option value={AssignmentStatus.ONGOING}>Ongoing</option>
                <option value={AssignmentStatus.COMPLETED}>Completed</option>
                <option value={AssignmentStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>

            {/* 8. Jam Mulai (Start Time) */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Jam Mulai (Start Time)
              </label>
              <div className="relative">
                <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:border-gray-400 transition-all"
                  required
                />
              </div>
            </div>

            {/* 9. Jam Selesai (End Time) */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Jam Selesai (End Time)
              </label>
              <div className="relative">
                <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:border-gray-400 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 active:scale-95 cursor-pointer"
            >
              <FiX className="h-4 w-4" />
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <FiLoader className="h-4 w-4 animate-spin" />
              ) : (
                <FiCheck className="h-4 w-4" />
              )}

              {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}