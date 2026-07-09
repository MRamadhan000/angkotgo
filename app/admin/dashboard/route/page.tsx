"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MapPin,
  Clock,
  Compass,
  Pencil,
  X,
  LayoutGrid,
  List,
  Route as RouteIcon,
  CheckCircle,
  AlertCircle,
  Info,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const BASE_URI = "https://v1rpzn50-3000.asse.devtunnels.ms";

// Cari bagian interface Route Anda, ubah fv menjadi opsional:
interface Route {
  id: number;
  code: string;
  name: string;
  direction: string;
  color?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  isActive: boolean;
  fv?: any; // <-- Tambahkan tanda tanya '?' di sini agar tidak error di normalizeRoute!
}

export default function RouteDashboard() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);

  // Fetch lifecycle states
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Toast state
  interface Toast {
    id: number;
    type: "success" | "error" | "info";
    message: string;
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [directionFilter, setDirectionFilter] = useState<
    "all" | "GO" | "RETURN"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    direction: "GO",
    color: "#3b82f6",
    distanceKm: 0,
    estimatedDurationMinutes: 0,
    isActive: true,
  });

  /**
   * Normalize a single backend route object into our internal Route shape.
   * Supports both camelCase and snake_case field naming from NestJS.
   */
  // Ubah fungsi normalizeRoute Anda menjadi seperti ini:
  const normalizeRoute = (raw: any): Route => {
    return {
      id: raw.id,
      code: raw.code ?? raw.route_code ?? "",
      name: raw.name ?? "",
      direction: raw.direction ?? raw.arah ?? "GO",
      color: raw.color ?? raw.color_hex ?? undefined,
      distanceKm: raw.distanceKm ?? raw.jarak ?? undefined,
      estimatedDurationMinutes:
        raw.estimatedDurationMinutes ?? raw.estimasi_durasi ?? undefined,
      isActive:
        typeof raw.isActive === "boolean"
          ? raw.isActive
          : (raw.is_active ?? true),
      fv: raw.fv ?? undefined, // <-- Tambahkan mapping ini untuk menghilangkan error baris 87
    };
  };

  const fetchRoutes = async () => {
    setIsFetching(true);
    setFetchError(null);

    // Abort after 10 seconds to prevent hanging when Dev Tunnel is unreachable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${BASE_URI}/routes`, {
        signal: controller.signal,
        headers: {
          "bypass-tunnel-reminder": "true",
          "X-Tunnel-Skip-Anti-Phishing-Threshold": "true",
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server merespons dengan status ${response.status}`);
      }
      const data = await response.json();
      const normalized = Array.isArray(data) ? data.map(normalizeRoute) : [];
      setRoutes(normalized);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Gagal mengambil data rute:", error);

      if (error.name === "AbortError") {
        setFetchError(
          "Koneksi timeout — server tidak merespons dalam 10 detik.",
        );
      } else {
        setFetchError(
          error.message || "Tidak dapat terhubung ke server backend.",
        );
      }
    } finally {
      setIsFetching(false);
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
      color: route.color || "#3b82f6",
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
      ? `${BASE_URI}/routes/${editingRouteId}`
      : `${BASE_URI}/routes`;

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
        showToast(
          "success",
          editingRouteId
            ? "Rute berhasil diperbarui!"
            : "Rute berhasil ditambahkan!",
        );
        setIsModalOpen(false);
        setEditingRouteId(null);
        setFormData({
          code: "",
          name: "",
          direction: "GO",
          color: "#3b82f6",
          distanceKm: 0,
          estimatedDurationMinutes: 0,
          isActive: true,
        });
        fetchRoutes();
      } else {
        const errorData = await response.json();
        showToast(
          "error",
          `Gagal: ${errorData.message || "Terjadi kesalahan"}`,
        );
      }
    } catch (error) {
      console.error("Gagal submit:", error);
      showToast(
        "error",
        "Gagal terhubung ke server (Abaikan jika sedang Blind Integration).",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Filter routes
  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.name.toLowerCase().includes(search.toLowerCase()) ||
      route.code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && route.isActive) ||
      (statusFilter === "inactive" && !route.isActive);

    const matchesDirection =
      directionFilter === "all" || route.direction === directionFilter;

    return matchesSearch && matchesStatus && matchesDirection;
  });

  const totalCount = routes.length;
  const activeCount = routes.filter((r) => r.isActive).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#F7F9FC] text-slate-800 p-4 sm:p-6 lg:p-8`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Rute
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelola detail trayek, jarak, estimasi durasi, arah, dan warna rute
              angkot.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl shadow-sm text-xs font-medium text-slate-700">
              <RouteIcon size={14} className="text-slate-400" />
              <span>
                <strong className="text-slate-950">{totalCount}</strong> Rute
              </span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3.5 py-2 rounded-2xl text-xs font-semibold text-green-700">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>{activeCount} Aktif</span>
            </div>
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3.5 py-2 rounded-2xl text-xs font-semibold text-red-700">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>{inactiveCount} Non-Aktif</span>
            </div>
          </div>
        </div>

        {/* Toolbar Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari rute (kode / nama)..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition placeholder:text-slate-400 text-slate-800"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
              {(["all", "active", "inactive"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition ${
                    statusFilter === status
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200/60"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {status === "all"
                    ? "Semua"
                    : status === "active"
                      ? "Aktif"
                      : "Non-Aktif"}
                </button>
              ))}
            </div>

            {/* Filter Direction */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
              {(["all", "GO", "RETURN"] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => setDirectionFilter(dir)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    directionFilter === dir
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200/60"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {dir === "all" ? "Arah" : dir}
                </button>
              ))}
            </div>
          </div>

          {/* View Switcher and Add Button */}
          <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
            {/* View Mode Button */}
            <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="List View"
              >
                <List size={15} />
              </button>
            </div>

            {/* Add Route Button */}
            <button
              onClick={() => {
                setEditingRouteId(null);
                setFormData({
                  code: "",
                  name: "",
                  direction: "GO",
                  color: "#3b82f6",
                  distanceKm: 0,
                  estimatedDurationMinutes: 0,
                  isActive: true,
                });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold shadow-md shadow-blue-200/60 hover:shadow-lg hover:shadow-blue-200/80 transition-all text-sm"
            >
              <Plus size={16} />
              Tambah Rute
            </button>
          </div>
        </div>

        {/* Content Area — Intelligent UI States */}
        {isFetching ? (
          /* ─── LOADING STATE: Skeleton Cards ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-pulse"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-7 bg-slate-100 rounded-xl" />
                    <div className="w-14 h-5 bg-slate-100 rounded-full" />
                  </div>
                  <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                </div>
                <div className="mt-4 h-5 bg-slate-100 rounded-lg w-3/4" />
                <div className="mt-2 h-4 bg-slate-50 rounded-lg w-1/2" />
                <div className="mt-5 border-t border-slate-100 pt-3 space-y-2.5">
                  <div className="h-3.5 bg-slate-50 rounded w-2/3" />
                  <div className="h-3.5 bg-slate-50 rounded w-1/2" />
                  <div className="h-3.5 bg-slate-50 rounded w-3/5" />
                </div>
                <div className="mt-4 pt-2 border-t border-dashed border-slate-100 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-100" />
                  <div className="w-16 h-3 bg-slate-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          /* ─── ERROR STATE: Connection failed ─── */
          <div className="bg-white border border-red-100 rounded-2xl p-10 sm:p-14 text-center shadow-sm">
            <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-red-400">
              <WifiOff size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">
              Koneksi Terputus
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              Tidak dapat memuat data rute dari server backend. Pastikan server
              NestJS sedang berjalan dan endpoint API dapat diakses.
            </p>
            <p className="text-[10px] text-red-400 font-mono mt-3 max-w-md mx-auto break-all">
              {fetchError}
            </p>
            <button
              onClick={fetchRoutes}
              className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-200/50 transition text-sm"
            >
              <RefreshCw size={14} />
              Coba Lagi
            </button>
          </div>
        ) : filteredRoutes.length === 0 ? (
          /* ─── EMPTY STATE: No routes found ─── */
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <RouteIcon size={20} />
            </div>
            <h3 className="font-bold text-slate-800">
              {routes.length === 0 &&
              !search &&
              statusFilter === "all" &&
              directionFilter === "all"
                ? "Belum ada rute terdaftar"
                : "Tidak ada rute ditemukan"}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xs mx-auto">
              {routes.length === 0 &&
              !search &&
              statusFilter === "all" &&
              directionFilter === "all"
                ? "Data rute masih kosong. Tambahkan rute baru untuk memulai."
                : "Silakan periksa kata kunci pencarian Anda atau sesuaikan filter status/arah rute."}
            </p>
            {routes.length === 0 &&
              !search &&
              statusFilter === "all" &&
              directionFilter === "all" && (
                <button
                  onClick={() => {
                    setEditingRouteId(null);
                    setFormData({
                      code: "",
                      name: "",
                      direction: "GO",
                      color: "#3b82f6",
                      distanceKm: 0,
                      estimatedDurationMinutes: 0,
                      isActive: true,
                    });
                    setIsModalOpen(true);
                  }}
                  className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-200/50 transition text-sm"
                >
                  <Plus size={15} />
                  Tambah Rute Pertama
                </button>
              )}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRoutes.map((route) => {
              const themeColor = route.color || "#3b82f6";
              return (
                <div
                  key={route.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {/* Custom Color Code Badge */}
                        <div
                          className="px-3 py-1.5 rounded-xl font-extrabold text-sm tracking-wide leading-none border"
                          style={{
                            backgroundColor: `${themeColor}12`,
                            color: themeColor,
                            borderColor: `${themeColor}30`,
                          }}
                        >
                          {route.code}
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            route.isActive
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {route.isActive ? "Aktif" : "Non-Aktif"}
                        </span>
                      </div>

                      {/* Edit Trigger */}
                      <button
                        onClick={() => handleEditClick(route)}
                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center transition"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>

                    {/* Route Name */}
                    <h3 className="mt-4 font-bold text-slate-800 text-base leading-snug line-clamp-2">
                      {route.name}
                    </h3>

                    {/* Stats List */}
                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                        <Compass
                          size={14}
                          className="text-slate-400 flex-shrink-0"
                        />
                        <span>
                          Arah:{" "}
                          <strong className="text-slate-700">
                            {route.direction}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                        <MapPin
                          size={14}
                          className="text-slate-400 flex-shrink-0"
                        />
                        <span>
                          Jarak:{" "}
                          <strong className="text-slate-700">
                            {route.distanceKm || 0} Km
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                        <Clock
                          size={14}
                          className="text-slate-400 flex-shrink-0"
                        />
                        <span>
                          Estimasi Durasi:{" "}
                          <strong className="text-slate-700">
                            {route.estimatedDurationMinutes || 0} Menit
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Left Color Indicator Bar */}
                  <div className="mt-4 pt-2 flex items-center gap-2 border-t border-dashed border-slate-100">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-200"
                      style={{ backgroundColor: themeColor }}
                    />
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-medium">
                      {themeColor}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View Layout */
          <div className="overflow-x-auto bg-white border border-slate-200 shadow-sm rounded-2xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 font-semibold text-slate-500">Kode</th>
                  <th className="p-4 font-semibold text-slate-500">
                    Nama Rute
                  </th>
                  <th className="p-4 font-semibold text-slate-500">Arah</th>
                  <th className="p-4 font-semibold text-slate-500">
                    Jarak (Km)
                  </th>
                  <th className="p-4 font-semibold text-slate-500">Durasi</th>
                  <th className="p-4 font-semibold text-slate-500">Warna</th>
                  <th className="p-4 font-semibold text-slate-500">Status</th>
                  <th className="p-4 font-semibold text-slate-500 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((route) => {
                  const themeColor = route.color || "#3b82f6";
                  return (
                    <tr
                      key={route.id}
                      className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="p-4">
                        <div
                          className="inline-block px-2.5 py-1 rounded-lg font-bold text-xs tracking-wider leading-none border"
                          style={{
                            backgroundColor: `${themeColor}12`,
                            color: themeColor,
                            borderColor: `${themeColor}30`,
                          }}
                        >
                          {route.code}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800 max-w-[240px] truncate">
                        {route.name}
                      </td>
                      <td className="p-4 text-xs font-semibold text-slate-600">
                        {route.direction}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {route.distanceKm || 0} Km
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {route.estimatedDurationMinutes || 0} Menit
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full border border-slate-200"
                            style={{ backgroundColor: themeColor }}
                          />
                          <span className="text-xs text-slate-500 font-mono uppercase">
                            {themeColor}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            route.isActive
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {route.isActive ? "Aktif" : "Non-Aktif"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleEditClick(route)}
                          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-blue-600 border border-slate-200 font-semibold text-xs transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Overlay and Backdrop */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Transparent Dark Blur Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Panel Box */}
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-800">
                {editingRouteId ? "Edit Rute" : "Tambah Rute Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition border border-slate-200"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Route Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Kode Rute <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: AL"
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition placeholder:text-slate-400 text-slate-800 font-bold"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>

                {/* Route Color */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Warna Rute
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 border-0 rounded-lg cursor-pointer p-0 overflow-hidden bg-transparent"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-2 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition uppercase font-mono text-slate-700"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>

              {/* Route Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Nama Rute <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Arjosari – Landungsari"
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition placeholder:text-slate-400 text-slate-800 font-medium"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* Direction */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Arah Rute
                </label>
                <select
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition text-slate-700 font-semibold"
                  value={formData.direction}
                  onChange={(e) =>
                    setFormData({ ...formData, direction: e.target.value })
                  }
                >
                  <option value="GO">GO</option>
                  <option value="RETURN">RETURN</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Distance */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Jarak (Km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition text-slate-800"
                    value={formData.distanceKm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        distanceKm: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition text-slate-800"
                    value={formData.estimatedDurationMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedDurationMinutes: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              {/* Status active checkbox */}
              <div className="pt-2 flex items-center">
                <label className="relative flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Aktifkan Rute
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition text-sm font-bold border border-slate-200/40"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition text-sm font-bold shadow-md shadow-blue-200/50 flex items-center gap-2"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Rute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl shadow-xl border animate-in fade-in slide-in-from-top-4 duration-300 w-full bg-white/95 backdrop-blur-md ${
                isSuccess
                  ? "border-emerald-100 bg-emerald-50/90 text-emerald-800"
                  : isError
                    ? "border-red-100 bg-red-50/90 text-red-800"
                    : "border-slate-100 bg-white/90 text-slate-800"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isSuccess
                    ? "bg-emerald-500/10 text-emerald-600"
                    : isError
                      ? "bg-red-500/10 text-red-600"
                      : "bg-blue-500/10 text-blue-600"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle size={15} />
                ) : isError ? (
                  <AlertCircle size={15} />
                ) : (
                  <Info size={15} />
                )}
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-bold text-slate-800 leading-none">
                  {isSuccess ? "Berhasil" : isError ? "Kesalahan" : "Info"}
                </p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium leading-normal">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100/50 transition flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
