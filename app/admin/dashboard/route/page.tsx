"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Route {
  id: number;
  code: string;
  name: string;
  direction: string;
  color?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  isActive: boolean;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

// Gunakan BASE_URI yang bersih tanpa kurung siku penutup atau nested path
const BASE_URI = "https://v1rpzn50-3000.asse.devtunnels.ms";

export default function RouteDashboardPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDirection, setFilterDirection] = useState("ALL");

  // State Toast Notification Kustom
  const [toasts, setToasts] = useState<Toast[]>([]);

  // State Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);

  // State Confirm Delete Kustom
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // State Formulir
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    direction: "GO",
    color: "#3B82F6",
    distanceKm: 0,
    estimatedDurationMinutes: 0,
    isActive: true,
  });

  // Fungsi memicu Toast Kustom
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };

  // 1. GET DATA (READ)
  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URI}/routes`, {
        headers: {
          "bypass-tunnel-reminder": "true",
          "X-Tunnel-Skip-Anti-Phishing-Threshold": "true",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRoutes(data);
      } else {
        showToast(
          `Gagal memuat rute dari server (Status: ${res.status})`,
          "error",
        );
      }
    } catch (err) {
      console.error(err);
      showToast("Koneksi internet atau server backend terputus.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      direction: "GO",
      color: "#3B82F6",
      distanceKm: 0,
      estimatedDurationMinutes: 0,
      isActive: true,
    });
    setEditingRouteId(null);
  };

  const handleEditClick = (e: React.MouseEvent, route: Route) => {
    e.preventDefault();
    setEditingRouteId(route.id);
    setFormData({
      code: route.code,
      name: route.name,
      direction: route.direction === "RETURN" ? "RETURN" : "GO",
      color: route.color || "#3B82F6",
      distanceKm: route.distanceKm || 0,
      estimatedDurationMinutes: route.estimatedDurationMinutes || 0,
      isActive: route.isActive,
    });
    setIsModalOpen(true);
  };

  // 2. TRIGGER MODAL DELETE KUSTOM
  const handleDeleteTrigger = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setDeleteConfirmId(id);
  };

  // EKSEKUSI DELETE DATA KE BE
  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await fetch(`${BASE_URI}/routes/${deleteConfirmId}`, {
        method: "DELETE",
        headers: { "bypass-tunnel-reminder": "true" },
      });
      if (res.ok) {
        showToast("Rute berhasil dihapus dari sistem.", "success");
        fetchRoutes();
      } else {
        showToast(`Gagal menghapus rute (Status: ${res.status})`, "error");
      }
    } catch (err) {
      showToast("Gagal terhubung ke backend untuk menghapus data.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // 3. POST / PATCH DATA KE BE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = editingRouteId !== null;
      // Gunakan PATCH atau PUT sesuai kesepakatan backend Andre
      const url = isEditing
        ? `${BASE_URI}/routes/${editingRouteId}`
        : `${BASE_URI}/routes`;
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
            ? "Perubahan rute berhasil disimpan!"
            : "Rute baru sukses ditambahkan!",
          "success",
        );
        setIsModalOpen(false);
        resetForm();
        fetchRoutes();
      } else {
        showToast(`Gagal menyimpan ke backend. Status: ${res.status}`, "error");
      }
    } catch (err) {
      showToast("Terjadi kendala jaringan saat menyimpan rute.", "error");
    }
  };

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDirection =
      filterDirection === "ALL" || route.direction === filterDirection;
    return matchesSearch && matchesDirection;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 relative">
      {/* KUSTOM TOAST CONTAINER ELEMENT */}
      <div className="fixed top-5 right-5 z-[9999] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border text-sm font-semibold min-w-[280px] animate-in fade-in slide-in-from-top-4 duration-200 ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                : toast.type === "error"
                  ? "bg-rose-50 text-rose-800 border-rose-100"
                  : "bg-blue-50 text-blue-800 border-blue-100"
            }`}
          >
            <span>
              {toast.type === "success"
                ? "✨"
                : toast.type === "error"
                  ? "🛑"
                  : "ℹ️"}
            </span>
            <div className="flex-1">{toast.message}</div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Rute</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola detail trayek langsung ke Server Titan Backend.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
        >
          <span>+</span> Tambah Rute
        </button>
      </div>

      {/* Bar Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <input
          type="text"
          placeholder="Cari rute (kode / nama)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm w-full md:w-80 focus:outline-none focus:border-blue-500"
        />
        <div className="flex items-center gap-2">
          {["ALL", "GO", "RETURN"].map((dir) => (
            <button
              key={dir}
              onClick={() => setFilterDirection(dir)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                filterDirection === dir
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {dir === "ALL" ? "Semua" : `Arah ${dir}`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content / Loader */}
      {loading ? (
        <div className="text-center py-20 text-sm font-medium text-gray-400 bg-white border rounded-3xl border-gray-100 shadow-sm">
          🔄 Sedang mengoneksikan dan mengunduh data rute backend...
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="text-center py-20 text-sm text-gray-400 border border-dashed rounded-3xl bg-gray-50/50">
          Belum ada data rute yang terdaftar pada sistem backend.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => (
            <Link
              href={`/admin/dashboard/route/${route.id}`}
              key={route.id}
              className="block group"
            >
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-3 py-1 rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: `${route.color}15`,
                          color: route.color,
                          border: `1px solid ${route.color}`,
                        }}
                      >
                        {route.code}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${route.isActive ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-200"}`}
                      >
                        {route.isActive ? "Aktif" : "Non-Aktif"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleEditClick(e, route)}
                        className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => handleDeleteTrigger(e, route.id)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base mb-4">
                    {route.name}
                  </h3>

                  <div className="space-y-2 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                      <span>🔄 Arah:</span>
                      <span className="text-gray-800 font-bold">
                        {route.direction}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍 Jarak:</span>
                      <span className="text-gray-800 font-bold">
                        {route.distanceKm} Km
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⏱️ Estimasi:</span>
                      <span className="text-gray-800 font-bold">
                        {route.estimatedDurationMinutes} Menit
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-2 text-[11px] text-gray-400">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: route.color || "#3B82F6" }}
                  ></span>
                  <span className="font-mono">{route.color || "#3B82F6"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl border border-gray-100 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingRouteId ? "Edit Rute" : "Tambah Rute Baru"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Kode Rute *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: AL"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Warna Rute
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-10 h-9 p-0 border border-gray-200 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Nama Rute *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Arjosari - Landungsari"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Arah Rute
                </label>
                <select
                  value={formData.direction}
                  onChange={(e) =>
                    setFormData({ ...formData, direction: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="GO">GO</option>
                  <option value="RETURN">RETURN</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Jarak (KM)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.distanceKm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        distanceKm: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedDurationMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedDurationMinutes: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                >
                  Aktifkan Rute
                </label>
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
                  Simpan Rute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG CONFIRM DELETE KUSTOM */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl border border-gray-100 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 text-xl">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Konfirmasi Hapus
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Apakah Anda yakin ingin menghapus rute ini dari database backend
                secara permanen?
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
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
