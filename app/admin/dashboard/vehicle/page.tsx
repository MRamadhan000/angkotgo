"use client";

import React, { useState, useEffect } from "react";

interface Vehicle {
  id: number;
  plateNumber: string; // Menyesuaikan penamaan backend umum Andre
  vehicleCode: string;
  capacity: number; // Menggunakan tipe data number untuk manipulasi data aman
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const BASE_URI = "https://v1rpzn50-3000.asse.devtunnels.ms";

export default function VehicleDashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // State untuk Tab Filter (3 Opsi sesuai data backend)
  const [activeTab, setActiveTab] = useState<
    "ACTIVE" | "MAINTENANCE" | "INACTIVE"
  >("ACTIVE");

  // State Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // State Formulir Kendaraan
  const [formData, setFormData] = useState({
    plateNumber: "",
    vehicleCode: "",
    capacity: 12,
    status: "ACTIVE" as "ACTIVE" | "MAINTENANCE" | "INACTIVE",
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // 1. GET DATA VEHICLES
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URI}/vehicles`, {
        headers: {
          "bypass-tunnel-reminder": "true",
          "X-Tunnel-Skip-Anti-Phishing-Threshold": "true",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      } else {
        console.error("Gagal load kendaraan, status:", res.status);
      }
    } catch (err) {
      showToast("Gagal terhubung ke server backend kendaraan.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Menyaring data kendaraan berdasarkan tab yang aktif
  const filteredVehicles = vehicles.filter((v) => v.status === activeTab);

  const resetForm = () => {
    setFormData({
      plateNumber: "",
      vehicleCode: "",
      capacity: 12,
      status: "ACTIVE",
    });
    setEditingVehicleId(null);
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setFormData({
      plateNumber: vehicle.plateNumber,
      vehicleCode: vehicle.vehicleCode,
      capacity: vehicle.capacity,
      status: vehicle.status,
    });
    setIsModalOpen(true);
  };

  // 2. POST / PATCH DATA VEHICLE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = editingVehicleId !== null;
      const url = isEditing
        ? `${BASE_URI}/vehicles/${editingVehicleId}`
        : `${BASE_URI}/vehicles`;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast(
          isEditing
            ? "Data kendaraan berhasil diperbarui!"
            : "Kendaraan baru berhasil ditambahkan!",
          "success",
        );
        setIsModalOpen(false);
        resetForm();
        fetchVehicles();
      } else {
        showToast(
          `Gagal menyimpan data ke BE (Status: ${res.status})`,
          "error",
        );
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan.", "error");
    }
  };

  // 3. DELETE / DEACTIVATE DATA VEHICLE
  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await fetch(`${BASE_URI}/vehicles/${deleteConfirmId}`, {
        method: "DELETE",
        headers: { "bypass-tunnel-reminder": "true" },
      });
      if (res.ok) {
        showToast("Data kendaraan berhasil diproses (Deactivated).", "success");
        fetchVehicles();
      } else {
        showToast("Gagal menonaktifkan data di backend.", "error");
      }
    } catch (err) {
      showToast("Kendala koneksi ke backend.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 relative">
      {/* TOAST NOTIFICATION CONTAINER */}
      <div className="fixed top-5 right-5 z-[9999] space-y-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border text-sm font-semibold min-w-[280px] ${t.type === "success" ? "text-emerald-800 border-emerald-100 bg-emerald-50" : "text-rose-800 border-rose-100 bg-rose-50"}`}
          >
            <span>{t.type === "success" ? "✨" : "🛑"}</span>
            <div className="flex-1">{t.message}</div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((item) => item.id !== t.id))
              }
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Kendaraan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola armada angkot, plat nomor, kapasitas, serta status
            operasional.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
        >
          <span>+</span> Tambah Kendaraan
        </button>
      </div>

      {/* WIDGET SEGMENTED CONTROL / THREE-ELEMENT TOUCH BAR */}
      <div className="flex justify-start">
        <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 border border-gray-200/50">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === "ACTIVE"
                ? "bg-gray-800 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/60"
            }`}
          >
            🟢 Siap Jalan (
            {vehicles.filter((v) => v.status === "ACTIVE").length})
          </button>
          <button
            onClick={() => setActiveTab("MAINTENANCE")}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === "MAINTENANCE"
                ? "bg-gray-800 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/60"
            }`}
          >
            <span className="text-orange-500">🛠️</span> Servis (
            {vehicles.filter((v) => v.status === "MAINTENANCE").length})
          </button>
          <button
            onClick={() => setActiveTab("INACTIVE")}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === "INACTIVE"
                ? "bg-gray-800 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/60"
            }`}
          >
            🔴 Non-Aktif (
            {vehicles.filter((v) => v.status === "INACTIVE").length})
          </button>
        </div>
      </div>

      {/* TABLE DATA KENDARAAN */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">Plat Nomor</th>
                <th className="py-4 px-6">Kode Kendaraan</th>
                <th className="py-4 px-6">Kapasitas</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
              {loading && vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    Menghubungkan ke server armada...
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    Tidak ada armada dengan status{" "}
                    {activeTab === "ACTIVE"
                      ? "Siap Jalan"
                      : activeTab === "MAINTENANCE"
                        ? "Servis"
                        : "Non-Aktif"}
                    .
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="hover:bg-gray-50/40 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-gray-900 tracking-wide">
                      {vehicle.plateNumber}
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                      {vehicle.vehicleCode}
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {vehicle.capacity} Penumpang
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          vehicle.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : vehicle.status === "MAINTENANCE"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center space-x-2">
                      <button
                        onClick={() => handleEditClick(vehicle)}
                        className="text-gray-400 hover:text-blue-600 p-1"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(vehicle.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT KENDARAAN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingVehicleId
                  ? "Edit Data Kendaraan"
                  : "Tambah Kendaraan Baru"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 text-sm hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Plat Nomor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: N 1201 XA"
                  value={formData.plateNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      plateNumber: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Kode Kendaraan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: VH001"
                  value={formData.vehicleCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleCode: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Kapasitas (Penumpang) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="12"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Status Operasional
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as
                        | "ACTIVE"
                        | "MAINTENANCE"
                        | "INACTIVE",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ACTIVE">ACTIVE (Siap Jalan)</option>
                  <option value="MAINTENANCE">
                    MAINTENANCE (Servis/Rusak)
                  </option>
                  <option value="INACTIVE">INACTIVE (Non-Aktif)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Simpan Kendaraan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 text-xl">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Proses Penonaktifan Armada?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Sistem akan mengirimkan perintah penonaktifan/penghapusan ke
                endpoint DELETE backend kendaraan.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 border rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
