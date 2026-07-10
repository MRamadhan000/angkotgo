"use client";

import React, { useState, useEffect } from "react";

interface Driver {
  id: number;
  name: string;
  phone: string;
  licenseNumber: string;
  status: "ACTIVE" | "INACTIVE";
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const BASE_URI = "https://v1rpzn50-3000.asse.devtunnels.ms";

export default function DriverDashboardPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // State untuk Tab Filter (Opsi: "ACTIVE" atau "INACTIVE")
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  // State Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // State Formulir Pengemudi
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
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

  // 1. GET DATA DRIVER
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URI}/drivers`, {
        headers: {
          "bypass-tunnel-reminder": "true",
          "X-Tunnel-Skip-Anti-Phishing-Threshold": "true",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDrivers(data);
      } else {
        console.error("Gagal load drivers, status:", res.status);
      }
    } catch (err) {
      showToast("Gagal terhubung ke server backend drivers.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Menyaring data pengemudi berdasarkan tab yang sedang aktif
  const filteredDrivers = drivers.filter(
    (driver) => driver.status === activeTab,
  );

  const resetForm = () => {
    setFormData({ name: "", phone: "", licenseNumber: "", status: "ACTIVE" });
    setEditingDriverId(null);
  };

  const handleEditClick = (driver: Driver) => {
    setEditingDriverId(driver.id);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber || "",
      status: driver.status,
    });
    setIsModalOpen(true);
  };

  // 2. POST / PATCH DATA DRIVER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = editingDriverId !== null;
      const url = isEditing
        ? `${BASE_URI}/drivers/${editingDriverId}`
        : `${BASE_URI}/drivers`;
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
            ? "Data pengemudi berhasil diperbarui!"
            : "Pengemudi baru berhasil ditambahkan!",
          "success",
        );
        setIsModalOpen(false);
        resetForm();
        fetchDrivers();
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

  // 3. DELETE DATA DRIVER
  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await fetch(`${BASE_URI}/drivers/${deleteConfirmId}`, {
        method: "DELETE",
        headers: { "bypass-tunnel-reminder": "true" },
      });
      if (res.ok) {
        showToast("Data pengemudi berhasil diproses.", "success");
        fetchDrivers();
      } else {
        showToast("Gagal menghapus data di backend.", "error");
      }
    } catch (err) {
      showToast("Kendala koneksi ke backend.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 relative">
      {/* KUSTOM TOAST NOTIFICATION CONTAINER */}
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Driver</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data operasional, nomor SIM, dan status aktif driver angkot.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
        >
          <span>+</span> Tambah Driver
        </button>
      </div>

      {/* WIDGET SEGMENTED CONTROL / SEGMENTED TOUCH BAR */}
      <div className="flex justify-start">
        <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 border border-gray-200/50">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === "ACTIVE"
                ? "bg-gray-800 text-white shadow-sm" // Elemen terpilih menjadi gelap
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/60"
            }`}
          >
            🟢 Driver Aktif (
            {drivers.filter((d) => d.status === "ACTIVE").length})
          </button>
          <button
            onClick={() => setActiveTab("INACTIVE")}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === "INACTIVE"
                ? "bg-gray-800 text-white shadow-sm" // Elemen terpilih menjadi gelap
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/60"
            }`}
          >
            🔴 Tidak Aktif (
            {drivers.filter((d) => d.status === "INACTIVE").length})
          </button>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">Nama</th>
                <th className="py-4 px-6">No. HP</th>
                <th className="py-4 px-6">No. SIM</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
              {loading && drivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    Menghubungkan ke server driver...
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    Tidak ada data driver berstatus{" "}
                    {activeTab === "ACTIVE" ? "Aktif" : "Tidak Aktif"}.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className="hover:bg-gray-50/40 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-gray-900">
                      {driver.name}
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {driver.phone || "-"}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-400">
                      {driver.licenseNumber || "-"}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${driver.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center space-x-2">
                      <button
                        onClick={() => handleEditClick(driver)}
                        className="text-gray-400 hover:text-blue-600 p-1"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(driver.id)}
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

      {/* MODAL FORM TAMBAH / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingDriverId ? "Edit Data Driver" : "Tambah Driver Baru"}
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
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  No. HP / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 08123456789"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  No. SIM
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 1234-5678-9012"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Status Driver
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "ACTIVE" | "INACTIVE",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ACTIVE">ACTIVE (Aktif)</option>
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
                  Simpan Data
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
                Proses Data Driver?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Tindakan ini akan mengirimkan instruksi penghapusan/penonaktifan
                data ke server backend.
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
