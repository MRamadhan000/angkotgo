"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const ShiftBadge = ({ shift }: { shift: number }) => {
  const map: Record<number, { dot: string; text: string; bg: string }> = {
    1: { dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50" },
    2: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
    3: { dot: "bg-purple-500", text: "text-purple-700", bg: "bg-purple-50" },
  };
  const s = map[shift] || { dot: "bg-gray-500", text: "text-gray-700", bg: "bg-gray-50" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
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
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
};

export default function DriverSchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      s.workDate.includes(q) ||
      s.vehicle.plateNumber.toLowerCase().includes(q)
    );
  });

  // Stats
  const totalSchedules = schedules.length;
  const todayDate = new Date().toISOString().split("T")[0];
  const todaySchedules = schedules.filter(s => s.workDate === todayDate).length;
  const totalTrips = schedules.reduce((acc, s) => acc + s.trips.length, 0);

  const handleTripClick = (tripId: number) => {
    router.push(`/driver/dashboard/schedules/${tripId}`);
    // Atau jika mau pakai Link: <Link href={`/driver/schedules/${tripId}`}> 
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jadwal Saya</h1>
            <p className="text-sm text-gray-500 mt-1">Jadwal penugasan dan trip hari ini</p>
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
              <p className="text-2xl font-bold text-gray-900">{totalSchedules}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              🗓️
            </div>
            <div>
              <p className="text-xs text-gray-500">Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">{todaySchedules}</p>
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
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                <div key={schedule.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header Schedule */}
                  <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-lg">
                          {new Date(schedule.workDate).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                        <p className="text-sm text-gray-500">Kendaraan: {schedule.vehicle.plateNumber}</p>
                      </div>
                      <ShiftBadge shift={schedule.shift} />
                    </div>
                  </div>

                  {/* Trips */}
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Daftar Trip</p>
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
                                  style={{ backgroundColor: trip.route.color + '20', color: trip.route.color }}
                                >
                                  {trip.route.code}
                                </span>
                              </div>
                              <p className="font-medium mt-1 text-gray-800">{trip.route.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{trip.route.direction}</p>
                            </div>

                            <StatusBadge status={trip.status} />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs">Berangkat</p>
                              <p className="font-medium">{trip.plannedDeparture}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Tiba</p>
                              <p className="font-medium">{trip.plannedArrival}</p>
                            </div>
                          </div>

                          <div className="mt-4 text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            Lihat Detail Trip →
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
    </div>
  );
}