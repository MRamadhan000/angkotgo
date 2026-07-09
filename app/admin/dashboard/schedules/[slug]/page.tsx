"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// --- Types ---
export enum TripStatus {
  SCHEDULED = "SCHEDULED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

interface Trip {
  id: number;
  tripNumber: number;
  route?: {
    id: number;
    code: string;
    name: string;
    direction: string;
    color: string;
  };
  plannedDeparture: string;
  actualDeparture: string | null;
  plannedArrival: string;
  actualArrival: string | null;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleDetail {
  id: number;
  workDate: string;
  shift: number;
  createdAt: string;
  updatedAt: string;
  driver: {
    id: number;
    name: string;
    phone: string;
    licenseNumber: string;
    status: string;
  };
  vehicle: {
    id: number;
    plateNumber: string;
    vehicleCode: string;
    capacity: number;
    status: string;
  };
  trips: Trip[];
}

interface Route {
  id: number;
  name: string;
  code: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// --- Helper Components ---
const StatusBadge = ({ status }: { status: TripStatus }) => {
  const map: Record<TripStatus, { dot: string; text: string; bg: string }> = {
    SCHEDULED: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
    ACTIVE: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
    COMPLETED: {
      dot: "bg-purple-500",
      text: "text-purple-700",
      bg: "bg-purple-50",
    },
    CANCELLED: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  };
  const s = map[status] || map.SCHEDULED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

export default function ScheduleDetailPage() {
  const params = useParams();
  const scheduleId = params.slug;

  const [schedule, setSchedule] = useState<ScheduleDetail | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    routeId: "",
    tripNumber: 1,
    plannedDeparture: "",
    plannedArrival: "",
    status: TripStatus.SCHEDULED,
  });

  // Edit Mode State
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingTripId, setEditingTripId] = useState<number | null>(null);

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/schedules/${scheduleId}`);
      if (!response.ok) {
        throw new Error("Gagal mengambil data jadwal.");
      }
      const data = await response.json();
      setSchedule(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch(`${API_URL}/routes`);
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      }
    } catch (err) {
      console.error("Failed to fetch routes", err);
    }
  };

  useEffect(() => {
    if (scheduleId) {
      fetchSchedule();
      fetchRoutes();
    }
  }, [scheduleId]);

  const handleAddTripClick = () => {
    setModalMode("add");
    setEditingTripId(null);

    const nextTripNumber =
      schedule && schedule.trips ? schedule.trips.length + 1 : 1;

    setFormData({
      routeId: routes.length > 0 ? routes[0].id.toString() : "",
      tripNumber: nextTripNumber,
      plannedDeparture: "06:00",
      plannedArrival: "07:00",
      status: TripStatus.SCHEDULED,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleEditTripClick = (trip: Trip) => {
    setModalMode("edit");
    setEditingTripId(trip.id);

    const getTimeValue = (timeStr: string) => {
      if (!timeStr) return "";
      return timeStr.split(":").slice(0, 2).join(":");
    };

    setFormData({
      routeId: trip.route?.id.toString() || "",
      tripNumber: trip.tripNumber,
      plannedDeparture: getTimeValue(trip.plannedDeparture),
      plannedArrival: getTimeValue(trip.plannedArrival),
      status: trip.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus trip ini? Tindakan ini tidak dapat dibatalkan.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/trips/${tripId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal menghapus trip.");
      }

      await fetchSchedule();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menghapus trip.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const isEdit = modalMode === "edit" && editingTripId !== null;

    const timeToFull = (t: string) =>
      t.includes(":") && t.length === 5 ? `${t}:00` : t;

    let url = `${API_URL}/trips`;
    let method: "POST" | "PATCH" = "POST";
    let payload: any;

    if (isEdit) {
      // Bisa ubah tripNumber + waktu + status
      url = `${API_URL}/trips/${editingTripId}`;
      method = "PATCH";
      payload = {
        tripNumber: Number(formData.tripNumber),
        plannedDeparture: timeToFull(formData.plannedDeparture),
        plannedArrival: timeToFull(formData.plannedArrival),
        status: formData.status,
      };
    } else {
      payload = {
        scheduleId: Number(scheduleId),
        routeId: Number(formData.routeId),
        tripNumber: Number(formData.tripNumber),
        plannedDeparture: timeToFull(formData.plannedDeparture),
        plannedArrival: timeToFull(formData.plannedArrival),
        status: formData.status,
      };
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            (isEdit ? "Gagal memperbarui trip." : "Gagal menyimpan trip baru."),
        );
      }

      setIsModalOpen(false);
      setEditingTripId(null);
      setModalMode("add");
      await fetchSchedule();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTripId(null);
    setModalMode("add");
    setFormError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center pt-20">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-lg mx-auto">
          <div className="text-red-500 mb-4 text-3xl">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-500 mb-6">
            {error || "Data jadwal tidak ditemukan"}
          </p>
          <Link
            href="/admin/dashboard/schedules"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Kembali ke Jadwal
          </Link>
        </div>
      </div>
    );
  }

  const joinDate = new Date(schedule.workDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sortedTrips = [...(schedule.trips || [])].sort(
    (a, b) => a.tripNumber - b.tripNumber,
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/dashboard/schedules"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors font-semibold"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali ke Jadwal
          </Link>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detail Jadwal #{schedule.id}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {joinDate} • Shift {schedule.shift}
              </p>
            </div>
            <button
              onClick={handleAddTripClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Trip
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Driver Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 text-xl font-bold">
              {schedule.driver?.name?.charAt(0) || "D"}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                Informasi Driver
              </p>
              <h3 className="text-lg font-bold text-gray-900">
                {schedule.driver?.name || "-"}
              </h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="text-gray-400">📞</span>{" "}
                  {schedule.driver?.phone || "-"}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-gray-400">🪪</span>{" "}
                  {schedule.driver?.licenseNumber || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 text-xl">
              🚐
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                Informasi Kendaraan
              </p>
              <h3 className="text-lg font-bold text-gray-900">
                {schedule.vehicle?.plateNumber || "-"}
              </h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="text-gray-400">🏷️</span> Kode:{" "}
                  {schedule.vehicle?.vehicleCode || "-"}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-gray-400">👥</span> Kapasitas:{" "}
                  {schedule.vehicle?.capacity || 0} Orang
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Daftar Perjalanan (Trips)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                    No. Trip
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                    Rute
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                    Rencana Berangkat
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                    Aktual Berangkat
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                    Rencana Tiba
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                    Aktual Tiba
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedTrips.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-gray-400 text-sm"
                    >
                      Belum ada trip yang terdaftar untuk jadwal ini.
                    </td>
                  </tr>
                ) : (
                  sortedTrips.map((trip) => (
                    <tr
                      key={trip.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-5 py-4 font-bold text-gray-800">
                        Trip {trip.tripNumber}
                      </td>
                      <td className="px-5 py-4">
                        {trip.route ? (
                          <div className="flex flex-col">
                            <span
                              className="font-bold text-gray-800 text-sm"
                              style={{ color: trip.route.color || "inherit" }}
                            >
                              {trip.route.code} {trip.route.direction}
                            </span>
                            <span
                              className="text-xs text-gray-500 max-w-[200px] truncate"
                              title={trip.route.name}
                            >
                              {trip.route.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-medium">
                        {trip.plannedDeparture}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {trip.actualDeparture
                          ? new Date(trip.actualDeparture).toLocaleTimeString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-medium">
                        {trip.plannedArrival}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {trip.actualArrival
                          ? new Date(trip.actualArrival).toLocaleTimeString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={trip.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditTripClick(trip)}
                            className="px-3 py-1.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 active:bg-amber-300 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTrip(trip.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 active:bg-red-300 transition-colors"
                          >
                            Hapus
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
      </div>

      {/* --- TRIP MODAL (Add & Edit) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {modalMode === "add" ? "Tambah Trip Baru" : "Edit Trip"}
              </h2>
              <button
                onClick={closeModal}
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
              {/* RUTE - Tetap Disabled di Edit */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Rute
                </label>
                <select
                  required
                  value={formData.routeId}
                  onChange={(e) =>
                    setFormData({ ...formData, routeId: e.target.value })
                  }
                  disabled={modalMode === "edit"}
                  className={`w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                    modalMode === "edit"
                      ? "bg-gray-100 cursor-not-allowed text-gray-500"
                      : ""
                  }`}
                >
                  <option value="" disabled>
                    Pilih Rute
                  </option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.code ? `[${route.code}] ` : ""}
                      {route.name}
                    </option>
                  ))}
                </select>
                {modalMode === "edit" && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Route tidak dapat diubah setelah trip dibuat.
                  </p>
                )}
              </div>

              {/* NO. TRIP - BISA DIEDIT */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  No. Trip
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.tripNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tripNumber: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Jam Berangkat
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.plannedDeparture}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        plannedDeparture: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Jam Tiba
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.plannedArrival}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        plannedArrival: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as TripStatus,
                    })
                  }
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value={TripStatus.SCHEDULED}>SCHEDULED</option>
                  <option value={TripStatus.ACTIVE}>ACTIVE</option>
                  <option value={TripStatus.COMPLETED}>COMPLETED</option>
                  <option value={TripStatus.CANCELLED}>CANCELLED</option>
                </select>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.routeId}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm shadow-sm"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : modalMode === "add"
                      ? "Simpan Trip"
                      : "Update Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
