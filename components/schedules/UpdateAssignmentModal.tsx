"use client";

import { useState, useEffect } from "react";
import {
  FiX,
  FiSave,
  FiTruck,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiNavigation,
  FiLoader,
} from "react-icons/fi";
import { VehicleAssignment } from "@/types/vehicles/vehicle-assignments.type";
import { DirectionType, AssignmentStatus } from "@/types/vehicles/vehicle.type";
import { useVehicles } from "@/hooks/vehicles/useVehicles";
import { useRoutes } from "@/hooks/routes/useRoutes";
import { useDrivers } from "@/hooks/useDrivers";

interface UpdateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any, id: string) => Promise<void>;
  initialData: VehicleAssignment | null;
}

// Select dengan ikon kiri dan indikator loading di kanan
function FieldSelect({
  icon: Icon,
  loading,
  children,
  ...props
}: {
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      <select
        {...props}
        disabled={loading || props.disabled}
        className="w-full bg-gray-50 border border-gray-200 pl-10 pr-9 py-3 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:border-gray-400 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
      >
        {children}
      </select>
      {loading && (
        <FiLoader className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
      )}
    </div>
  );
}

export default function UpdateAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: UpdateAssignmentModalProps) {
  const { drivers, loading: loadingDrivers } = useDrivers();
  const { vehicles, loading: loadingVehicles } = useVehicles();
  const { routes, loading: loadingRoutes } = useRoutes();

  const [formData, setFormData] = useState({
    vehicleId: "",
    driverId: "",
    routeId: "",
    assignmentDate: "",
    startTime: "",
    endTime: "",
    direction: DirectionType.FORWARD,
    status: AssignmentStatus.SCHEDULED,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state ketika initialData atau modal dibuka
  useEffect(() => {
    if (initialData) {
      setFormData({
        vehicleId: String(
          initialData.vehicle?.id || initialData.vehicleId || "",
        ),
        driverId: String(initialData.driver?.id || initialData.driverId || ""),
        routeId: String(initialData.route?.id || initialData.routeId || ""),
        assignmentDate: initialData.assignmentDate || "",
        startTime: initialData.startTime || "",
        endTime: initialData.endTime || "",
        direction: initialData.direction || DirectionType.FORWARD,
        status: initialData.status || AssignmentStatus.SCHEDULED,
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen || !initialData) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.vehicleId || !formData.driverId || !formData.routeId) {
      setError("Kendaraan, Driver, dan Rute wajib dipilih!");
      return;
    }

    try {
      setLoading(true);
      await onSuccess(formData, String(initialData.id));
      onClose();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat memperbarui data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl p-6 space-y-6 m-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-900 text-white rounded-2xl">
              <FiSave className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Edit Penugasan Kendaraan
              </h2>
              <p className="text-xs text-gray-500">
                Perbarui detail jadwal operasional angkot.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm animate-in fade-in duration-150">
            {error}
          </div>
        )}

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Pilih Kendaraan */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Unit Kendaraan
              </label>
              <FieldSelect
                icon={FiTruck}
                loading={loadingVehicles}
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  {loadingVehicles ? "Memuat kendaraan..." : "-- Pilih Kendaraan --"}
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
                name="driverId"
                value={formData.driverId}
                onChange={handleChange}
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

            {/* 3. Pilih Rute */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Rute Perjalanan
              </label>
              <FieldSelect
                icon={FiMapPin}
                loading={loadingRoutes}
                name="routeId"
                value={formData.routeId}
                onChange={handleChange}
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

            {/* 4. Arah Perjalanan */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Arah (Direction)
              </label>
              <FieldSelect
                icon={FiNavigation}
                name="direction"
                value={formData.direction}
                onChange={handleChange}
              >
                <option value={DirectionType.FORWARD}>Forward (Pergi)</option>
                <option value={DirectionType.RETURN}>Return (Pulang)</option>
              </FieldSelect>
            </div>

            {/* 5. Tanggal Penugasan */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Tanggal Operasional
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="date"
                  name="assignmentDate"
                  value={formData.assignmentDate}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:border-gray-400 transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* 6. Status Penugasan */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Status Penugasan
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:border-gray-400 transition-all cursor-pointer"
              >
                <option value={AssignmentStatus.SCHEDULED}>Scheduled</option>
                <option value={AssignmentStatus.ONGOING}>Ongoing</option>
                <option value={AssignmentStatus.COMPLETED}>Completed</option>
                <option value={AssignmentStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>

            {/* 7. Jam Mulai */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Jam Mulai (Start Time)
              </label>
              <div className="relative">
                <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:border-gray-400 transition-all"
                />
              </div>
            </div>

            {/* 8. Jam Selesai */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Jam Selesai (End Time)
              </label>
              <div className="relative">
                <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:border-gray-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <FiX className="h-4 w-4" />
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <FiLoader className="h-4 w-4 animate-spin" />
              ) : (
                <FiSave className="h-4 w-4" />
              )}
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}