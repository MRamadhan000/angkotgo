"use client";

import { useState } from "react";
import Link from "next/link";
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
  FiStar,
  FiPlus,
} from "react-icons/fi";
import { useToast } from "@/context/ToastContext";

const TABLE_HEADERS = [
  "Kendaraan & Kode",
  "Nomor Plat",
  "Tipe",
  "Kapasitas & Odometer",
  "Statistik & Layanan",
  "Status Kendaraan",
  "Waktu (Dibuat/Diubah)",
  "Aksi",
];

function extractVehicleList(response: unknown): Vehicle[] {
  let rawList: any[] = [];

  if (Array.isArray(response)) {
    rawList = response;
  } else if (response && typeof response === "object" && "data" in response) {
    const maybeData = (response as { data: unknown }).data;

    if (Array.isArray(maybeData)) {
      rawList = maybeData;
    }
  }

  return rawList.map((item) => ({
    ...item,
    capacity: Number(item.capacity ?? 0),
    currentOdometer: Number(item.currentOdometer ?? 0),
    type: item.type ?? VehicleType.REGULER,
  }));
}

export default function VehiclesDashboardPage() {
  const {
    data: vehicles,
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch,
  } = useVehicles();

  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();
  const { success, error: showError } = useToast();

  // Tab filter berdasarkan status kendaraan
  const [activeTab, setActiveTab] = useState<string>("ACTIVE");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const [selectedVehicleForEdit, setSelectedVehicleForEdit] =
    useState<Vehicle | null>(null);

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? "Gagal memuat data kendaraan."
        : null;

  const vehicleList: Vehicle[] = extractVehicleList(vehicles);

  const filteredVehicles = vehicleList.filter(
    (vehicle) => vehicle.status === activeTab,
  );

  const handleCreate = async (data: CreateVehicleInput) => {
    try {
      await createMutation.mutateAsync(data);

      setIsCreateModalOpen(false);

      success("Kendaraan berhasil dibuat.");
    } catch (err) {
      showError(
        `Gagal membuat kendaraan, ${
          err instanceof Error ? err.message : "terjadi kesalahan."
        }`,
      );
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicleForEdit(vehicle);
  };

  const handleSaveEdit = async (updatedData: UpdateVehicleInput) => {
    if (!selectedVehicleForEdit) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedVehicleForEdit.id,
        data: updatedData,
      });

      setSelectedVehicleForEdit(null);

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
    if (!confirm("Apakah Anda yakin ingin menghapus kendaraan ini?")) {
      return;
    }

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

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error("Gagal refresh kendaraan:", err);
    }
  };

  const mutationLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 relative">
      {/* HEADER */}
      <div className="flex justify-between items-center">
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
            onClick={() => setIsCreateModalOpen(true)}
            disabled={mutationLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <FiPlus className="w-4 h-4" />
            Tambah Kendaraan
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading || isFetching}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />

          <span>Gagal memuat data: {error}</span>
        </div>
      )}

      {/* WIDGET SEGMENTED CONTROL */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit border border-gray-200/50">
        {[
          {
            label: "Aktif",
            value: "ACTIVE",
            icon: FiCheckCircle,
            count: vehicleList.filter((v) => v.status === "ACTIVE").length,
          },
          {
            label: "Tidak Aktif",
            value: "INACTIVE",
            icon: FiClock,
            count: vehicleList.filter((v) => v.status === "INACTIVE").length,
          },
          {
            label: "Perawatan",
            value: "MAINTENANCE",
            icon: FiTool,
            count: vehicleList.filter((v) => v.status === "MAINTENANCE").length,
          },
        ].map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                activeTab === tab.value
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                {TABLE_HEADERS.map((header) => (
                  <th key={header} className="py-4 px-6">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <FiRefreshCw className="w-5 h-5 animate-spin" />

                      <span>Memuat data kendaraan...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Tidak ada data kendaraan untuk kategori ini.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="hover:bg-gray-50/40 transition-colors align-top"
                  >
                    {/* Kendaraan & Kode */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                          <FiTruck className="w-4 h-4" />
                        </div>

                        <div>
                          <div className="font-semibold text-gray-900 font-mono">
                            {vehicle.vehicleCode}
                          </div>

                          <div className="text-xs text-gray-400">
                            ID: #{vehicle.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Nomor Plat */}
                    <td className="py-4 px-6 font-mono text-xs font-bold text-gray-800">
                      {vehicle.plateNumber || "-"}
                    </td>

                    {/* Tipe */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          vehicle.type === "PREMIUM"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {vehicle.type === "PREMIUM" && (
                          <FiStar className="w-3 h-3" />
                        )}

                        {vehicle.type || "REGULER"}
                      </span>
                    </td>

                    {/* Kapasitas & Odometer */}
                    <td className="py-4 px-6 text-xs text-gray-600">
                      <div className="font-semibold text-gray-800">
                        {vehicle.capacity ?? 0} Penumpang
                      </div>

                      <div className="text-[11px] text-gray-400 mt-0.5 font-mono">
                        {(vehicle.currentOdometer ?? 0).toLocaleString("id-ID")}{" "}
                        KM
                      </div>
                    </td>

                    {/* Statistik & Layanan */}
                    <td className="py-4 px-6 text-xs text-gray-600 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">
                        {vehicle.assignments?.length ?? 0} Penugasan
                      </div>

                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {vehicle.services?.length ?? 0} Riwayat Servis
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          vehicle.status === "ACTIVE"
                            ? "bg-blue-50 text-blue-700"
                            : vehicle.status === "INACTIVE"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>

                    {/* Waktu */}
                    <td className="py-4 px-6 text-[11px] text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-gray-400" />

                        <span>
                          Dibuat:{" "}
                          {new Date(vehicle.createdAt).toLocaleDateString(
                            "id-ID",
                          )}
                        </span>
                      </div>

                      <div className="text-gray-400 mt-0.5">
                        Diubah:{" "}
                        {new Date(vehicle.updatedAt).toLocaleDateString(
                          "id-ID",
                        )}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/vehicles/${vehicle.id}`}
                          title="Detail Kendaraan"
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors inline-flex items-center justify-center"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleEdit(vehicle)}
                          disabled={mutationLoading}
                          title="Edit Kendaraan"
                          className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg transition-colors"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={mutationLoading}
                          title="Hapus Kendaraan"
                          className="p-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-600 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREATE */}
      <CreateVehicleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
      />

      {/* MODAL EDIT */}
      {selectedVehicleForEdit && (
        <EditVehicleModal
          isOpen={Boolean(selectedVehicleForEdit)}
          vehicle={selectedVehicleForEdit}
          onClose={() => setSelectedVehicleForEdit(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
