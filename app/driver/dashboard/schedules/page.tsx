"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- Enums ---
export enum TripStatus {
  SCHEDULED = "SCHEDULED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// --- Types ---
interface Route {
  id: number;
  code: string;
  name: string;
  direction: string;
  color: string;
}

interface Trip {
  id: number;
  tripNumber: number;
  route: Route;
  plannedDeparture: string;
  actualDeparture: string | null;
  plannedArrival: string;
  actualArrival: string | null;
  status: string;
}

interface Schedule {
  id: number;
  workDate: string;
  shift: number;
  driver: any;
  vehicle: {
    id: number;
    plateNumber: string;
    vehicleCode: string;
    capacity: number;
  };
  trips: Trip[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const STATUS_LABEL: Record<TripStatus, string> = {
  [TripStatus.SCHEDULED]: "Scheduled",
  [TripStatus.ACTIVE]: "Active",
  [TripStatus.COMPLETED]: "Completed",
  [TripStatus.CANCELLED]: "Cancelled",
};

const ShiftBadge = ({ shift }: { shift: number }) => {
  const map: Record<number, { dot: string; text: string; bg: string }> = {
    1: { dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50" },
    2: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
    3: { dot: "bg-purple-500", text: "text-purple-700", bg: "bg-purple-50" },
  };
  const s = map[shift] || {
    dot: "bg-gray-500",
    text: "text-gray-700",
    bg: "bg-gray-50",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      Shift {shift}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-700",
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}
    >
      {status}
    </span>
  );
};

// --- Update Status Modal ---
interface UpdateStatusModalProps {
  trip: Trip;
  isSaving: boolean;
  onClose: () => void;
  onSave: (tripId: number, status: TripStatus) => void;
}

const UpdateStatusModal = ({
  trip,
  isSaving,
  onClose,
  onSave,
}: UpdateStatusModalProps) => {
  const [status, setStatus] = useState<TripStatus>(trip.status as TripStatus);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Update Status Trip
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              #{trip.tripNumber} · {trip.route.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Tutup"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <label className="block text-xs font-medium text-gray-500 mb-2">
          Status Trip
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TripStatus)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
        >
          {Object.values(TripStatus).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={() => onSave(trip.id, status)}
            disabled={isSaving || status === trip.status}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isSaving && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DriverSchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state untuk update status trip
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // Ganti dengan cara kamu ambil user ID (context, token decode, dll)
  const userId = 1; // ← TODO: Ambil dari auth context

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/schedules/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error("Error fetching driver schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.workDate.includes(q) || s.vehicle.plateNumber.toLowerCase().includes(q)
    );
  });

  // Stats
  const totalSchedules = schedules.length;
  const todayDate = new Date().toISOString().split("T")[0];
  const todaySchedules = schedules.filter(
    (s) => s.workDate === todayDate,
  ).length;
  const totalTrips = schedules.reduce((acc, s) => acc + s.trips.length, 0);

  const handleTripClick = (tripId: number) => {
    router.push(`/driver/dashboard/schedules/${tripId}`);
    // Atau jika mau pakai Link: <Link href={`/driver/schedules/${tripId}`}>
  };

  const handleOpenUpdateStatus = (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation(); // jangan trigger handleTripClick
    setSelectedTrip(trip);
  };

  const handleCloseModal = () => {
    if (isSavingStatus) return;
    setSelectedTrip(null);
  };

  // --- Handler utama: lempar tripId + status baru ---
  // TODO: sambungkan ke endpoint PATCH /trips/:id/status begitu API-nya siap
  const handleUpdateTripStatus = async (
    tripId: number,
    newStatus: TripStatus,
  ) => {
    setIsSavingStatus(true);
    try {
      // TODO: ganti dengan pemanggilan API asli, contoh:
      const res = await fetch(`${API_URL}/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal update status trip");

      console.log("Update trip status ->", { tripId, newStatus });

      // Optimistic update ke state lokal
      setSchedules((prev) =>
        prev.map((schedule) => ({
          ...schedule,
          trips: schedule.trips.map((trip) =>
            trip.id === tripId ? { ...trip, status: newStatus } : trip,
          ),
        })),
      );

      setSelectedTrip(null);
    } catch (error) {
      console.error("Error updating trip status:", error);
      // TODO: tampilkan toast/error state ke user
    } finally {
      setIsSavingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jadwal Saya</h1>
            <p className="text-sm text-gray-500 mt-1">
              Jadwal penugasan dan trip hari ini
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              📅
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Jadwal</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalSchedules}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              🗓️
            </div>
            <div>
              <p className="text-xs text-gray-500">Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">
                {todaySchedules}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              🛣️
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Trip</p>
              <p className="text-2xl font-bold text-gray-900">{totalTrips}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Cari tanggal atau plat kendaraan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table / Card List */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-600" />
            <p className="mt-3 text-sm text-gray-500">Memuat jadwal...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSchedules.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
                Belum ada jadwal
              </div>
            ) : (
              filteredSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Header Schedule */}
                  <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-lg">
                          {new Date(schedule.workDate).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          Kendaraan: {schedule.vehicle.plateNumber}
                        </p>
                      </div>
                      <ShiftBadge shift={schedule.shift} />
                    </div>
                  </div>

                  {/* Trips */}
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                      Daftar Trip
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {schedule.trips.map((trip) => (
                        <div
                          key={trip.id}
                          onClick={() => handleTripClick(trip.id)}
                          className="group border border-gray-100 hover:border-blue-200 rounded-xl p-4 transition-all hover:shadow-sm cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-semibold text-gray-700">
                                  #{trip.tripNumber}
                                </span>
                                <span
                                  className="text-xs px-2 py-0.5 rounded font-medium"
                                  style={{
                                    backgroundColor: trip.route.color + "20",
                                    color: trip.route.color,
                                  }}
                                >
                                  {trip.route.code}
                                </span>
                              </div>
                              <p className="font-medium mt-1 text-gray-800">
                                {trip.route.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {trip.route.direction}
                              </p>
                            </div>

                            <StatusBadge status={trip.status} />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs">Berangkat</p>
                              <p className="font-medium">
                                {trip.plannedDeparture}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Tiba</p>
                              <p className="font-medium">
                                {trip.plannedArrival}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                              Lihat Detail Trip →
                            </div>
                            <button
                              onClick={(e) => handleOpenUpdateStatus(e, trip)}
                              className="text-xs font-medium text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-lg px-2.5 py-1 transition-colors"
                            >
                              Update Status
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedTrip && (
        <UpdateStatusModal
          trip={selectedTrip}
          isSaving={isSavingStatus}
          onClose={handleCloseModal}
          onSave={handleUpdateTripStatus}
        />
      )}
    </div>
  );
}
