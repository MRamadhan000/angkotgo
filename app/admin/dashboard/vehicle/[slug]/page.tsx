"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiRefreshCw,
  FiTool,
  FiAlertCircle,
  FiActivity,
  FiEdit2,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";

import {
  useVehicleServicesByVehicleId,
  useCreateVehicleService,
  useUpdateVehicleService,
  useDeleteVehicleService,
} from "@/hooks/vehicles/useVehicleServices";

import {
  VehicleService,
  CreateVehicleServiceInput,
  UpdateVehicleServiceInput,
} from "@/types/vehicles/vehicle-service.type";

import { ServiceType } from "@/types/vehicles/vehicle.type";
import { CreateVehicleServiceModal } from "@/components/vehicle/services/CreateVehicleServiceModal";
import { DeleteVehicleServiceModal } from "@/components/vehicle/services/DeleteVehicleServiceModal";
import { UpdateVehicleServiceModal } from "@/components/vehicle/services/UpdateVehicleServiceModal";

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  [ServiceType.ROUTINE]: "Routine",
  [ServiceType.REPAIR]: "Repair",
  [ServiceType.INSPECTION]: "Inspection",
};

const SERVICE_TYPE_STYLE: Record<ServiceType, string> = {
  [ServiceType.ROUTINE]: "bg-blue-50 text-blue-700",
  [ServiceType.REPAIR]: "bg-amber-50 text-amber-700",
  [ServiceType.INSPECTION]: "bg-rose-50 text-rose-700",
};

function formatDate(date?: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(value?: number | string | null) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export default function VehicleServiceHistoryPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  const vehicleId = Number(params.slug);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingService, setEditingService] = useState<VehicleService | null>(
    null,
  );
  const [deletingService, setDeletingService] = useState<VehicleService | null>(
    null,
  );

  const {
    data: vehicleServices = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useVehicleServicesByVehicleId(vehicleId);

  const createMutation = useCreateVehicleService();
  const updateMutation = useUpdateVehicleService();
  const deleteMutation = useDeleteVehicleService();

  const totalCost = vehicleServices.reduce(
    (total, service) => total + Number(service.cost || 0),
    0,
  );

  const lastService = vehicleServices.length
    ? [...vehicleServices].sort(
        (a, b) =>
          new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime(),
      )[0]
    : null;

  const loading = isLoading || isFetching;

  const handleCreate = async (data: CreateVehicleServiceInput) => {
    await createMutation.mutateAsync(data);
    setIsCreateOpen(false);
  };

  const handleUpdate = async (id: number, data: UpdateVehicleServiceInput) => {
    await updateMutation.mutateAsync({
      id,
      data,
    });

    setEditingService(null);
  };

  const handleDelete = async () => {
    if (!deletingService) return;

    await deleteMutation.mutateAsync(deletingService.id);
    setDeletingService(null);
  };

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
            title="Kembali"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Riwayat Servis Kendaraan
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Riwayat perawatan dan servis kendaraan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />

            {isFetching ? "Memuat..." : "Refresh"}
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <FiPlus className="w-4 h-4" />
            Tambah Servis
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0" />

          <span>
            Gagal memuat riwayat servis: {error.message || "Terjadi kesalahan."}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Total Servis
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-2">
                {vehicleServices.length}
              </p>
            </div>

            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FiTool className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Total Biaya
              </p>

              <p className="text-xl font-bold text-gray-900 mt-2">
                {formatCurrency(totalCost)}
              </p>
            </div>

            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Servis Terakhir
              </p>

              <p className="text-sm font-bold text-gray-900 mt-2">
                {lastService ? formatDate(lastService.serviceDate) : "-"}
              </p>
            </div>

            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <FiCalendar className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Riwayat Perawatan</h2>

            <p className="text-xs text-gray-400 mt-1">
              Daftar seluruh servis kendaraan
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <FiActivity className="w-4 h-4" />
            {vehicleServices.length} record
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">Tanggal</th>
                <th className="py-4 px-6">Tipe Servis</th>
                <th className="py-4 px-6">Deskripsi</th>
                <th className="py-4 px-6">Odometer</th>
                <th className="py-4 px-6">Biaya</th>
                <th className="py-4 px-6">Servis Berikutnya</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      <span>Memuat riwayat servis...</span>
                    </div>
                  </td>
                </tr>
              ) : vehicleServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-gray-100 rounded-full text-gray-400">
                        <FiTool className="w-6 h-6" />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-gray-600">
                        Belum ada riwayat servis
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Kendaraan ini belum memiliki data servis.
                      </p>

                      <button
                        onClick={() => setIsCreateOpen(true)}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-semibold"
                      >
                        <FiPlus className="w-4 h-4" />
                        Tambah Servis
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                vehicleServices.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-gray-50/40 transition-colors align-top"
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-gray-400" />

                        <div className="font-semibold text-gray-900">
                          {formatDate(service.serviceDate)}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          SERVICE_TYPE_STYLE[service.serviceType]
                        }`}
                      >
                        {SERVICE_TYPE_LABEL[service.serviceType] ??
                          service.serviceType}
                      </span>
                    </td>

                    <td className="py-4 px-6 min-w-[280px] max-w-md">
                      <p className="text-sm font-semibold text-gray-800">
                        {service.description}
                      </p>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-mono text-sm font-semibold text-gray-800">
                        {Number(service.odometerAtService).toLocaleString(
                          "id-ID",
                        )}{" "}
                        KM
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(service.cost)}
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="space-y-1">
                        {service.nextServiceDate && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-700">
                            <FiCalendar className="w-3.5 h-3.5 text-gray-400" />

                            <span>{formatDate(service.nextServiceDate)}</span>
                          </div>
                        )}

                        {service.nextServiceOdometer != null && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <FiActivity className="w-3.5 h-3.5 text-gray-400" />

                            <span className="font-mono">
                              {Number(
                                service.nextServiceOdometer,
                              ).toLocaleString("id-ID")}{" "}
                              KM
                            </span>
                          </div>
                        )}

                        {!service.nextServiceDate &&
                          service.nextServiceOdometer == null && (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => setEditingService(service)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingService(service)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                          title="Hapus"
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

      <CreateVehicleServiceModal
        isOpen={isCreateOpen}
        vehicleId={vehicleId}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreate}
        isLoading={createMutation.isPending}
      />

      {editingService && (
        <UpdateVehicleServiceModal
          isOpen={!!editingService}
          service={editingService}
          onClose={() => setEditingService(null)}
          onSave={handleUpdate}
          isLoading={updateMutation.isPending}
        />
      )}

      {deletingService && (
        <DeleteVehicleServiceModal
          isOpen={!!deletingService}
          service={deletingService}
          onClose={() => setDeletingService(null)}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
