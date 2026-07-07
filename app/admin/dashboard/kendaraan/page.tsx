"use client";

import { useEffect, useState } from "react";

// --- Types ---
type VehicleStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

interface Vehicle {
  id: number;
  plateNumber: string;
  vehicleCode: string;
  capacity: number;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// --- Mock Data Fallback for Offline Mode ---
const mockVehicles: Vehicle[] = [
  { id: 1, plateNumber: "N 1234 AB", vehicleCode: "AG-01", capacity: 12, status: "ACTIVE", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, plateNumber: "N 5678 CD", vehicleCode: "AL-04", capacity: 12, status: "ACTIVE", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, plateNumber: "N 9012 EF", vehicleCode: "AG-09", capacity: 10, status: "MAINTENANCE", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 4, plateNumber: "N 3456 GH", vehicleCode: "GA-02", capacity: 12, status: "ACTIVE", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 5, plateNumber: "N 7890 IJ", vehicleCode: "MM-05", capacity: 10, status: "INACTIVE", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// --- Helper Components ---
const StatusBadge = ({ status }: { status: VehicleStatus }) => {
  const map: Record<VehicleStatus, { dot: string; text: string; bg: string; label: string }> = {
    ACTIVE: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50", label: "Aktif" },
    INACTIVE: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", label: "Tidak Aktif" },
    MAINTENANCE: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", label: "Perbaikan" },
  };
  const s = map[status] || map.ACTIVE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// --- Stat Card ---
const StatCard = ({
  icon, label, value, sub, subColor,
}: {
  icon: React.ReactNode; label: string; value: string | number; sub: string; subColor?: string;
}) => (
  <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className={`text-xs mt-1 ${subColor ?? "text-gray-400"}`}>{sub}</p>
    </div>
  </div>
);

// --- Main Page ---
export default function VehicleDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    plateNumber: "",
    vehicleCode: "",
    capacity: 12,
    status: "ACTIVE" as VehicleStatus,
  });

  const perPage = 10;

  // Fetch vehicles from NestJS backend, fallback to mock data on error
  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/dashboard/kendaraan`);
      if (!response.ok) {
        throw new Error("Gagal mengambil data kendaraan dari API backend.");
      }
      const data = await response.json();
      setVehicles(data);
      setIsOfflineMode(false);
    } catch (err: any) {
      console.warn("Backend offline/unreachable, falling back to mock data:", err.message);
      setVehicles(mockVehicles);
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicleClick = () => {
    setFormData({
      plateNumber: "",
      vehicleCode: "",
      capacity: 12,
      status: "ACTIVE",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    // Validate capacity
    if (formData.capacity < 0) {
      setFormError("Kapasitas penumpang minimal 0");
      setIsSubmitting(false);
      return;
    }

    if (isOfflineMode) {
      // Simulate adding vehicle locally in Demo Mode
      const newVehicle: Vehicle = {
        id: vehicles.length + 1,
        plateNumber: formData.plateNumber.toUpperCase(),
        vehicleCode: formData.vehicleCode.toUpperCase(),
        capacity: formData.capacity,
        status: formData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setVehicles((prev) => [...prev, newVehicle]);
      setIsModalOpen(false);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/dashboard/kendaraan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          plateNumber: formData.plateNumber.toUpperCase(),
          vehicleCode: formData.vehicleCode.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Gagal menyimpan kendaraan: ${response.statusText}`
        );
      }

      setIsModalOpen(false);
      await fetchVehicles();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Gagal menyimpan kendaraan baru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      v.plateNumber.toLowerCase().includes(q) ||
      v.vehicleCode.toLowerCase().includes(q);
    const matchStatus = statusFilter === "Semua Status" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Calculate dynamic stats
  const totalVehicles = vehicles.length;
  const activeCount = vehicles.filter((v) => v.status === "ACTIVE").length;
  const maintenanceCount = vehicles.filter((v) => v.status === "MAINTENANCE").length;
  const inactiveCount = vehicles.filter((v) => v.status === "INACTIVE").length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Kendaraan</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">Kelola armada kendaraan dan kapasitas angkot</p>
          </div>
          {/* Add Vehicle */}
          <button
            onClick={handleAddVehicleClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Kendaraan
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            }
            label="Total Armada"
            value={totalVehicles}
            sub="Semua kendaraan terdaftar"
          />
          <StatCard
            icon={
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            label="Aktif Beroperasi"
            value={activeCount}
            sub={`${totalVehicles > 0 ? ((activeCount / totalVehicles) * 100).toFixed(1) : 0}% dari total armada`}
            subColor="text-green-500"
          />
          <StatCard
            icon={
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            label="Dalam Perbaikan"
            value={maintenanceCount}
            sub="Sedang maintenance"
            subColor="text-yellow-500"
          />
          <StatCard
            icon={
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            }
            label="Tidak Aktif"
            value={inactiveCount}
            sub="Sedang dinonaktifkan"
            subColor="text-red-400"
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
                placeholder="Cari kendaraan, nomor plat, atau kode trayek..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 cursor-pointer"
                >
                  <option>Semua Status</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="MAINTENANCE">Perbaikan</option>
                  <option value="INACTIVE">Tidak Aktif</option>
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
              <p className="text-sm font-medium">Memuat data kendaraan...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">No</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kode Kendaraan</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nomor Plat</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kapasitas</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bergabung</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                        Tidak ada kendaraan yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((vehicle, idx) => {
                      const joinDate = new Date(vehicle.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      });

                      return (
                        <tr key={vehicle.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-5 py-4 text-gray-400 font-medium">{idx + 1}</td>
                          <td className="px-5 py-4 font-semibold text-blue-600 uppercase">{vehicle.vehicleCode}</td>
                          <td className="px-5 py-4 font-bold text-slate-800 text-sm uppercase">{vehicle.plateNumber}</td>
                          <td className="px-5 py-4 font-medium text-gray-700">{vehicle.capacity} Penumpang</td>
                          <td className="px-5 py-4">
                            <StatusBadge status={vehicle.status} />
                          </td>
                          <td className="px-5 py-4 text-gray-500">{joinDate}</td>
                          <td className="px-5 py-4">
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Detail
                            </button>
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
              Menampilkan 1 – {filtered.length} dari {totalVehicles} kendaraan
            </p>
          </div>
        </div>
      </div>

      {/* --- ADD VEHICLE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Tambah Kendaraan Baru</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kode Kendaraan</label>
                <input
                  type="text"
                  required
                  value={formData.vehicleCode}
                  onChange={(e) => setFormData({ ...formData, vehicleCode: e.target.value })}
                  placeholder="Contoh: AG-01"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nomor Plat</label>
                <input
                  type="text"
                  required
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  placeholder="Contoh: N 1234 AB"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kapasitas (Penumpang)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="Contoh: 12"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="ACTIVE">Aktif (ACTIVE)</option>
                  <option value="INACTIVE">Tidak Aktif (INACTIVE)</option>
                  <option value="MAINTENANCE">Perbaikan (MAINTENANCE)</option>
                </select>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm shadow-sm"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
