"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// --- Types ---
interface Route {
  id: number;
  code: string;
  name: string;
  direction: "GO" | "RETURN";
  color: string;
  distanceKm: number | string | null;
  estimatedDurationMinutes: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// --- Helper Components ---
const DirectionBadge = ({ direction }: { direction: "GO" | "RETURN" }) => {
  return direction === "GO" ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">
      ➔ Berangkat (GO)
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700">
      ↩ Pulang (RETURN)
    </span>
  );
};

const ColorBadge = ({ color }: { color: string }) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
      <span className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ backgroundColor: color }} />
      {color}
    </span>
  );
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-500">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Draft
    </span>
  );
};

// --- Stat Card ---
const StatCard = ({
  icon, label, value, sub,
}: {
  icon: React.ReactNode; label: string; value: string | number; sub: string;
}) => (
  <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-xs mt-1 text-gray-400">{sub}</p>
    </div>
  </div>
);

// --- Main Page Component ---
export default function RouteDashboard() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState("Semua Arah");
  const [isLoading, setIsLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    direction: "GO",
    color: "#3b82f6",
    distanceKm: "",
    estimatedDurationMinutes: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      direction: "GO",
      color: "#3b82f6",
      distanceKm: "",
      estimatedDurationMinutes: "",
      isActive: true,
    });
  };

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/routes`);
      if (!response.ok) {
        throw new Error("Gagal mengambil data rute dari API backend.");
      }
      const data = await response.json();
      setRoutes(data);
    } catch (err: any) {
      console.error("Gagal mengambil data rute:", err.message);
      setRoutes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRoute = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        distanceKm: formData.distanceKm ? Number(formData.distanceKm) : null,
        estimatedDurationMinutes: formData.estimatedDurationMinutes ? Number(formData.estimatedDurationMinutes) : null
      };
      
      const res = await fetch(`${API_URL}/routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Gagal menambah rute.");
      }

      alert("Rute berhasil ditambahkan!");
      resetForm();
      setShowAddModal(false);
      fetchRoutes();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const filtered = routes.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q);
    const matchDirection =
      directionFilter === "Semua Arah" ||
      (directionFilter === "GO" && r.direction === "GO") ||
      (directionFilter === "RETURN" && r.direction === "RETURN");
    return matchSearch && matchDirection;
  });

  // Calculate dynamic stats
  const totalRoutes = routes.length;
  const activeCount = routes.filter((r) => r.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Rute Lengkap</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">Kelola data rute umum</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
          >
            + Tambah Rute
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
          <StatCard
            icon={
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
            label="Total Trayek"
            value={totalRoutes}
            sub="Rute terdaftar di database"
          />
          <StatCard
            icon={
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            label="Rute Aktif"
            value={activeCount}
            sub="Beroperasi di lapangan"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-gray-100">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari rute, kode, atau nama jalan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {/* Direction Filter */}
              <div className="relative">
                <select
                  value={directionFilter}
                  onChange={(e) => setDirectionFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 cursor-pointer"
                >
                  <option>Semua Arah</option>
                  <option value="GO">Berangkat (GO)</option>
                  <option value="RETURN">Pulang (RETURN)</option>
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-600 mb-4" />
              <p className="text-sm font-medium">Memuat data rute...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">No</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kode</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Trayek</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Arah</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Warna Rute</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jarak & Durasi</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                        Tidak ada rute yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((route, idx) => {
                      return (
                        <tr key={route.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-5 py-4 text-gray-400 font-medium">{idx + 1}</td>
                          <td className="px-5 py-4">
                            <span className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg font-bold text-sm tracking-wide">
                              {route.code}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-800 text-sm">{route.name}</td>
                          <td className="px-5 py-4">
                            <DirectionBadge direction={route.direction} />
                          </td>
                          <td className="px-5 py-4">
                            <ColorBadge color={route.color} />
                          </td>
                          <td className="px-5 py-4 text-slate-700">
                            <div className="font-semibold text-xs text-slate-800">{route.distanceKm ?? "-"} Km</div>
                            <div className="text-xs text-slate-400 mt-0.5">{route.estimatedDurationMinutes ?? "-"} Menit</div>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge isActive={route.isActive} />
                          </td>
                          <td className="px-5 py-4">
                            <Link
                              href={`/admin/dashboard/route/${route.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Detail
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan 1 – {filtered.length} dari {totalRoutes} rute terdaftar
            </p>
          </div>
        </div>
      </div>

      {/* Add Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Tambah Rute</h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kode Rute</label>
                  <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. AX" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Arah</label>
                  <select value={formData.direction} onChange={e => setFormData({...formData, direction: e.target.value as "GO" | "RETURN"})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="GO">GO</option>
                    <option value="RETURN">RETURN</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Trayek</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Terminal A - Terminal X" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jarak (Km)</label>
                  <input type="number" step="0.1" value={formData.distanceKm} onChange={e => setFormData({...formData, distanceKm: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 15.5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estimasi Waktu (Menit)</label>
                  <input type="number" value={formData.estimatedDurationMinutes} onChange={e => setFormData({...formData, estimatedDurationMinutes: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 45" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Warna Rute</label>
                  <div className="flex gap-2">
                    <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-10 h-10 p-1 border border-gray-200 rounded-xl cursor-pointer" />
                    <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="#FF5733" />
                  </div>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-200 rounded-xl w-full h-10 select-none hover:bg-gray-50">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm font-semibold text-gray-700">Rute Aktif</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={handleAddRoute}
                disabled={isSubmitting || !formData.code || !formData.name}
                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-sm"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
