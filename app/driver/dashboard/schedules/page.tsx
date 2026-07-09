"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// --- Enums & Types ---
export enum TripStatus {
  SCHEDULED = "SCHEDULED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

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

interface TripWithContext extends Trip {
  scheduleId: number;
  workDate: string;
  shift: number;
  vehicle: Schedule["vehicle"];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const STATUS_LABEL: Record<TripStatus, string> = {
  [TripStatus.SCHEDULED]: "Scheduled",
  [TripStatus.ACTIVE]: "Active",
  [TripStatus.COMPLETED]: "Completed",
  [TripStatus.CANCELLED]: "Cancelled",
};

// ==================== COMPONENTS ====================
const ShiftBadge = ({ shift }: { shift: number }) => {
  const styles: Record<number, { dot: string; text: string; bg: string }> = {
    1: { dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50" },
    2: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
    3: { dot: "bg-purple-500", text: "text-purple-700", bg: "bg-purple-50" },
  };
  const s = styles[shift] || {
    dot: "bg-gray-500",
    text: "text-gray-700",
    bg: "bg-gray-50",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      Shift {shift}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-700",
    ACTIVE: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex px-3 py-0.5 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-700"}`}
    >
      {status}
    </span>
  );
};

// ==================== MAIN PAGE ====================
export default function DriverSchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [driverId, setDriverId] = useState<number | null>(null);

  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const id = localStorage.getItem("driverId");
    if (!id) {
      router.replace("/driver/auth/login");
      return;
    }
    setDriverId(Number(id));
  }, [router]);

  useEffect(() => {
    if (driverId !== null) fetchSchedules(driverId);
  }, [driverId]);

  const fetchSchedules = async (userId: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/schedules/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== GROUPING & SORTING ====================
  const allTrips: TripWithContext[] = schedules.flatMap((schedule) =>
    schedule.trips.map((trip) => ({
      ...trip,
      scheduleId: schedule.id,
      workDate: schedule.workDate,
      shift: schedule.shift,
      vehicle: schedule.vehicle,
    })),
  );

  // Group by date
  const groupedByDate = allTrips.reduce(
    (acc, trip) => {
      if (!acc[trip.workDate]) acc[trip.workDate] = [];
      acc[trip.workDate].push(trip);
      return acc;
    },
    {} as Record<string, TripWithContext[]>,
  );

  // Sort dates (paling dekat dulu)
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    const today = new Date(todayDate);

    const diffA = dateA.getTime() - today.getTime();
    const diffB = dateB.getTime() - today.getTime();

    if (diffA >= 0 && diffB < 0) return -1;
    if (diffA < 0 && diffB >= 0) return 1;
    if (diffA >= 0 && diffB >= 0) return diffA - diffB;
    return diffB - diffA;
  });

  // Sort trips inside each date group
  const getSortedTrips = (trips: TripWithContext[]) => {
    return [...trips].sort((a, b) => {
      const codeCompare = a.route.code.localeCompare(b.route.code);
      if (codeCompare !== 0) return codeCompare;
      return a.plannedDeparture.localeCompare(b.plannedDeparture);
    });
  };

  // Filter
  const filteredDates = sortedDates.filter((date) => {
    const q = search.toLowerCase();
    return groupedByDate[date].some(
      (t) =>
        t.workDate.includes(q) ||
        t.vehicle.plateNumber.toLowerCase().includes(q) ||
        t.route.code.toLowerCase().includes(q) ||
        t.route.name.toLowerCase().includes(q),
    );
  });

  // Stats
  const totalTrips = allTrips.length;
  const todayTrips = allTrips.filter((t) => t.workDate === todayDate).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Jadwal Saya
          </h1>
          <p className="text-slate-600 mt-1">Jadwal penugasan dan trip kamu</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-xs text-slate-500">Total Trip</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {totalTrips}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-xs text-slate-500">Hari Ini</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              {todayTrips}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-xs text-slate-500">Total Jadwal</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {schedules.length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md">
          <input
            type="text"
            placeholder="Cari tanggal, plat, atau nama rute..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-500">
            Memuat jadwal...
          </div>
        ) : filteredDates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed">
            Belum ada jadwal
          </div>
        ) : (
          <div className="space-y-10">
            {filteredDates.map((date) => {
              const trips = getSortedTrips(groupedByDate[date]);
              const isToday = date === todayDate;
              const isTomorrow =
                new Date(date).getTime() ===
                new Date(todayDate).getTime() + 86400000;

              return (
                <div key={date}>
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-slate-900">
                        {new Date(date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </h2>
                      {isToday && (
                        <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full">
                          HARI INI
                        </span>
                      )}
                      {isTomorrow && (
                        <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                          BESOK
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-slate-500">
                      • {trips.length} trip
                    </span>
                  </div>

                  {/* Trip Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trips.map((trip) => (
                      <div
                        key={trip.id}
                        onClick={() =>
                          router.push(`/driver/dashboard/schedules/${trip.id}`)
                        }
                        className="group bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-5 transition-all hover:shadow-md cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                                style={{ backgroundColor: trip.route.color }}
                              >
                                {trip.route.code}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {trip.route.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {trip.route.direction}
                                </p>
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={trip.status} />
                        </div>

                        <div className="mt-5 flex justify-between text-sm">
                          <div>
                            <p className="text-xs text-slate-500">Berangkat</p>
                            <p className="font-medium">
                              {trip.plannedDeparture}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Tiba</p>
                            <p className="font-medium">{trip.plannedArrival}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-600">
                            <ShiftBadge shift={trip.shift} />
                            <span>{trip.vehicle.plateNumber}</span>
                          </div>

                          {/* Tombol Update Status DIHAPUS */}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}