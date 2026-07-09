"use client";

import { useState, useEffect } from "react";

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

export default function RouteDashboard() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    direction: "FORWARD",
    color: "#000000",
    distanceKm: 0,
    estimatedDurationMinutes: 0,
    isActive: true,
  });

  const fetchRoutes = async () => {
    try {
      const response = await fetch("http://localhost:3000/routes");
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data rute:", error);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleEditClick = (route: Route) => {
    setEditingRouteId(route.id);
    setFormData({
      code: route.code,
      name: route.name,
      direction: route.direction,
      color: route.color || "#000000",
      distanceKm: route.distanceKm || 0,
      estimatedDurationMinutes: route.estimatedDurationMinutes || 0,
      isActive: route.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const url = editingRouteId 
      ? `http://localhost:3000/routes/${editingRouteId}` 
      : "http://localhost:3000/routes";
    
    const method = editingRouteId ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          distanceKm: Number(formData.distanceKm),
          estimatedDurationMinutes: Number(formData.estimatedDurationMinutes),
        }),
      });

      if (response.ok) {
        alert(editingRouteId ? "Rute berhasil diperbarui!" : "Rute berhasil ditambahkan!");
        setIsModalOpen(false);
        setEditingRouteId(null);
        setFormData({ code: "", name: "", direction: "FORWARD", color: "#000000", distanceKm: 0, estimatedDurationMinutes: 0, isActive: true });
        fetchRoutes();
      } else {
        const errorData = await response.json();
        alert(`Gagal: ${errorData.message || "Terjadi kesalahan"}`);
      }
    } catch (error) {
      console.error("Gagal submit:", error);
      alert("Gagal terhubung ke server (Abaikan jika sedang Blind Integration).");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Rute</h1>
        <button
          onClick={() => {
            setEditingRouteId(null);
            setFormData({ code: "", name: "", direction: "FORWARD", color: "#000000", distanceKm: 0, estimatedDurationMinutes: 0, isActive: true });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Tambah Rute
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Kode</th>
              <th className="p-3">Nama Rute</th>
              <th className="p-3">Arah</th>
              <th className="p-3">Jarak (Km)</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {routes.length > 0 ? (
              routes.map((route) => (
                <tr key={route.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">{route.code}</td>
                  <td className="p-3">{route.name}</td>
                  <td className="p-3">{route.direction}</td>
                  <td className="p-3">{route.distanceKm || 0} Km</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs text-white ${route.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                      {route.isActive ? "Aktif" : "Non-Aktif"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleEditClick(route)}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-3 text-center text-gray-500">
                  Data belum tersedia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingRouteId ? "Edit Rute" : "Tambah Rute Baru"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kode Rute</label>
                <input
                  type="text"
                  required
                  className="w-full border p-2 rounded"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nama Rute</label>
                <input
                  type="text"
                  required
                  className="w-full border p-2 rounded"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Arah</label>
                <select
                  className="w-full border p-2 rounded"
                  value={formData.direction}
                  onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                >
                  <option value="FORWARD">FORWARD</option>
                  <option value="BACKWARD">BACKWARD</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Jarak (Km)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full border p-2 rounded"
                  value={formData.distanceKm}
                  onChange={(e) => setFormData({ ...formData, distanceKm: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Estimasi Durasi (Menit)</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  value={formData.estimatedDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedDurationMinutes: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm font-medium">Rute Aktif</label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingRouteId(null);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
