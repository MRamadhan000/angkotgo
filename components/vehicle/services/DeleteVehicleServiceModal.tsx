"use client";

import { FiAlertTriangle, FiTrash2, FiX } from "react-icons/fi";
import { VehicleService } from "@/types/vehicles/vehicle-service.type";

interface Props {
  isOpen: boolean;
  service: VehicleService;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteVehicleServiceModal({
  isOpen,
  service,
  onClose,
  onConfirm,
  isLoading = false,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
            <FiAlertTriangle className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              Hapus Riwayat Servis?
            </h3>

            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Data servis pada tanggal{" "}
              <span className="font-semibold text-gray-700">
                {new Date(service.serviceDate).toLocaleDateString("id-ID")}
              </span>{" "}
              akan dihapus secara permanen.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiTrash2
              className={`w-4 h-4 ${isLoading ? "animate-pulse" : ""}`}
            />

            {isLoading ? "Menghapus..." : "Hapus Servis"}
          </button>
        </div>
      </div>
    </div>
  );
}