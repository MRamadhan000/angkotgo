"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiCalendar,
  FiTruck,
  FiTool,
  FiPlus,
} from "react-icons/fi";

import {
  Vehicle,
  UpdateVehicleInput,
  CreateVehicleInput,
  VehicleType,
} from "@/types/vehicles/vehicle.type";

import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from "@/hooks/vehicles/useVehicles";

import { EditVehicleModal } from "@/components/vehicle/EditVehicleModal";
import { CreateVehicleModal } from "@/components/vehicle/CreateVehicleModal";
import { useToast } from "@/context/ToastContext";

const TABLE_HEADERS = [
  "Kendaraan & Kode",
  "Nomor Plat",
  "Kapasitas & Odometer",
  "Statistik & Layanan",
  "Status Kendaraan",
  "Waktu",
  "Aksi",
];

const STATUS_TABS = [
  {
    label: "Aktif",
    value: "ACTIVE",
    icon: FiCheckCircle,
  },
  {
    label: "Tidak Aktif",
    value: "INACTIVE",
    icon: FiClock,
  },
  {
    label: "Perawatan",
    value: "MAINTENANCE",
    icon: FiTool,
  },
];

function extractVehicles(response: unknown): Vehicle[] {
  const data = Array.isArray(response)
    ? response
    : response &&
        typeof response === "object" &&
        "data" in response &&
        Array.isArray(response.data)
      ? response.data
      : [];

  return data.map((item: any) => ({
    ...item,
    capacity: Number(item.capacity ?? 0),
    currentOdometer: Number(item.currentOdometer ?? 0),
    type: item.type ?? VehicleType.REGULER,
  }));
}

function formatDate(date?: string | Date | null) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID");
}

function statusStyle(status: string) {
  return (
    {
      ACTIVE: "bg-blue-50 text-blue-700",
      INACTIVE: "bg-amber-50 text-amber-700",
      MAINTENANCE: "bg-rose-50 text-rose-700",
    }[status] ?? "bg-gray-100 text-gray-600"
  );
}

export default function VehiclesDashboardPage() {
  const {
    data,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useVehicles();

  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const vehicles = extractVehicles(data);

  const filteredVehicles = vehicles.filter(
    (vehicle) => vehicle.status === activeTab,
  );

  const mutationLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const loading = isLoading || isFetching;

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? "Gagal memuat data kendaraan."
        : null;

  // =========================
  // HANDLERS
  // =========================

  const handleCreate = async (data: CreateVehicleInput) => {
    try {
      await createMutation.mutateAsync(data);

      setIsCreateOpen(false);
      success("Kendaraan berhasil dibuat.");
    } catch (err) {
      showError(
        `Gagal membuat kendaraan, ${
          err instanceof Error ? err.message : "terjadi kesalahan."
        }`,
      );
    }
  };

  const handleUpdate = async (data: UpdateVehicleInput) => {
    if (!selectedVehicle) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedVehicle.id,
        data,
      });

      setSelectedVehicle(null);
      success("Kendaraan berhasil diperbarui.");
    } catch (err) {
      showError(
        `Gagal mengupdate kendaraan, ${
          err instanceof Error ? err.message : "terjadi kesalahan."
        }`,
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kendaraan ini?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      success("Kendaraan berhasil dihapus.");
    } catch (err) {
      showError(
        `Gagal menghapus kendaraan, ${
          err instanceof Error ? err.message : "terjadi kesalahan."
        }`,
      );
    }
  };

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Kendaraan
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Kelola dan pantau seluruh informasi operasional armada AngkotGo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            disabled={mutationLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus className="w-4 h-4" />
            Tambah Kendaraan
          </button>

          <button
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />
          <span>Gagal memuat data: {error}</span>
        </div>
      )}

      {/* STATUS TABS */}
      <div className="flex gap-1 w-fit p-1 rounded-2xl bg-gray-100 border border-gray-200/50">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.value;
          const count = vehicles.filter(
            (vehicle) => vehicle.status === tab.value,
          ).length;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                active
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                {TABLE_HEADERS.map((header) => (
                  <th key={header} className="px-6 py-4">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {loading ? (
                <LoadingRow />
              ) : filteredVehicles.length === 0 ? (
                <EmptyRow />
              ) : (
                filteredVehicles.map((vehicle) => (
                  <VehicleRow
                    key={vehicle.id}
                    vehicle={vehicle}
                    disabled={mutationLoading}
                    onEdit={() => setSelectedVehicle(vehicle)}
                    onDelete={() => handleDelete(vehicle.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      <CreateVehicleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreate}
      />

      {/* UPDATE MODAL */}
      {selectedVehicle && (
        <EditVehicleModal
          isOpen
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}

function LoadingRow() {
  return (
    <tr>
      <td colSpan={8} className="py-14 text-center text-gray-400">
        <div className="flex justify-center items-center gap-2">
          <FiRefreshCw className="w-5 h-5 animate-spin" />
          <span>Memuat data kendaraan...</span>
        </div>
      </td>
    </tr>
  );
}


function EmptyRow() {
  return (
    <tr>
      <td colSpan={8} className="py-14 text-center">
        <div className="flex flex-col items-center text-gray-400">
          <div className="p-3 rounded-full bg-gray-100">
            <FiTruck className="w-6 h-6" />
          </div>

          <p className="mt-3 text-sm font-semibold text-gray-600">
            Tidak ada kendaraan
          </p>

          <p className="text-xs mt-1">Belum ada kendaraan pada kategori ini.</p>
        </div>
      </td>
    </tr>
  );
}


interface VehicleRowProps {
  vehicle: Vehicle;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function VehicleRow({ vehicle, disabled, onEdit, onDelete }: VehicleRowProps) {
  return (
    <tr className="hover:bg-gray-50/40 transition-colors align-top">
      {/* KENDARAAN */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
            <FiTruck className="w-4 h-4" />
          </div>

          <div>
            <div className="font-semibold text-gray-900 font-mono">
              {vehicle.vehicleCode}
            </div>
          </div>
        </div>
      </td>

      {/* PLAT */}
      <td className="px-6 py-4 font-mono text-xs font-bold text-gray-800">
        {vehicle.plateNumber || "-"}
      </td>

      {/* KAPASITAS */}
      <td className="px-6 py-4 text-xs text-gray-600">
        <div className="font-semibold text-gray-800">
          {vehicle.capacity ?? 0} Penumpang
        </div>

        <div className="text-[11px] text-gray-400 mt-0.5 font-mono">
          {(vehicle.currentOdometer ?? 0).toLocaleString("id-ID")} KM
        </div>
      </td>

      {/* STATISTIK */}
      <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
        <div className="font-semibold text-gray-800">
          {vehicle.assignmentCount ?? '-'} Penugasan
        </div>

        <div className="text-[11px] text-gray-400 mt-0.5">
          {vehicle.serviceCount ?? '-'} Riwayat Servis
        </div>
      </td>

      {/* STATUS */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${statusStyle(
            vehicle.status,
          )}`}
        >
          {vehicle.status}
        </span>
      </td>

      {/* WAKTU */}
      <td className="px-6 py-4 text-[11px] text-gray-500 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <FiCalendar className="w-3 h-3 text-gray-400" />
          Dibuat: {formatDate(vehicle.createdAt)}
        </div>

        <div className="text-gray-400 mt-0.5">
          Diubah: {formatDate(vehicle.updatedAt)}
        </div>
      </td>

      {/* AKSI */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/dashboard/vehicle/${vehicle.id}`}
            title="Detail Kendaraan"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <FiEye className="w-4 h-4" />
          </Link>

          <button
            onClick={onEdit}
            disabled={disabled}
            title="Edit Kendaraan"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiEdit3 className="w-4 h-4" />
          </button>

          <button
            onClick={onDelete}
            disabled={disabled}
            title="Hapus Kendaraan"
            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
