"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// --- Types ---
interface Driver {
  id: number;
  name: string;
  phone: string;
  licenseNumber: string;
  status: string;
}

interface Vehicle {
  id: number;
  plateNumber: string;
  vehicleCode: string;
  capacity: number;
  status: string;
}

interface Trip {
  id: number;
  tripNumber: number;
  status: string;
}

interface Schedule {
  id: number;
  workDate: string;
  shift: number;
  driver: Driver;
  vehicle: Vehicle;
  trips: Trip[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// --- Helper Components ---
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
export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [shiftFilter, setShiftFilter] = useState("Semua Shift");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    driverId: "",
    vehicleId: "",
    workDate: "",
    shift: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [schedulesRes, driversRes, vehiclesRes] = await Promise.all([
        fetch(`${API_URL}/schedules`),
        fetch(`${API_URL}/drivers`),
        fetch(`${API_URL}/vehicles`),
      ]);

      if (schedulesRes.ok) setSchedules(await schedulesRes.json());
      if (driversRes.ok) setDrivers(await driversRes.json());
      if (vehiclesRes.ok) setVehicles(await vehiclesRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddScheduleClick = () => {
    setFormData({
      driverId: "",
      vehicleId: "",
      workDate: "",
      shift: "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch(`${API_URL}/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driverId: Number(formData.driverId),
          vehicleId: Number(formData.vehicleId),
          workDate: formData.workDate,
          shift: Number(formData.shift),
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan jadwal");
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Terjadi kesalahan saat menyimpan jadwal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = schedules.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.driver?.name.toLowerCase().includes(q) ||
      s.vehicle?.plateNumber.toLowerCase().includes(q) ||
      s.workDate.includes(q);
      
    const matchShift = shiftFilter === "Semua Shift" || `Shift ${s.shift}` === shiftFilter;
    return matchSearch && matchShift;
  });

  // Calculate dynamic stats
  const totalSchedules = schedules.length;
  const todayDate = new Date().toISOString().split("T")[0];
  const todaySchedulesCount = schedules.filter(s => s.workDate === todayDate).length;
  const totalTrips = schedules.reduce((acc, curr) => acc + (curr.trips?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Jadwal</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">Atur penugasan supir dan kendaraan harian</p>
          </div>
          {/* Add Button */}
          <button
            onClick={handleAddScheduleClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Jadwal
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            label="Total Jadwal"
            value={totalSchedules}
            sub="Seluruh jadwal tercatat"
          />
          <StatCard
            icon={
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label="Jadwal Hari Ini"
            value={todaySchedulesCount}
            sub="Jadwal untuk beroperasi hari ini"
            subColor="text-green-500"
          />
          <StatCard
            icon={
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            label="Total Trip (Berjalan)"
            value={totalTrips}
            sub="Keseluruhan trip supir"
            subColor="text-purple-500"
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
                placeholder="Cari berdasarkan tanggal, nama supir, atau plat kendaraan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {/* Filter */}
              <div className="relative">
                <select
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 cursor-pointer"
                >
                  <option>Semua Shift</option>
                  <option>Shift 1</option>
                  <option>Shift 2</option>
                  <option>Shift 3</option>
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
              <p className="text-sm font-medium">Memuat data jadwal...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shift</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Supir</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kendaraan</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jumlah Trip</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                        Tidak ada jadwal yang cocok dengan pencarian Anda.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-5 py-4 font-medium text-gray-700">
                          {new Date(schedule.workDate).toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <ShiftBadge shift={schedule.shift} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 text-sm">{schedule.driver?.name}</span>
                            <span className="text-xs text-blue-500 mt-0.5">{schedule.driver?.phone}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 text-sm">{schedule.vehicle?.plateNumber}</span>
                            <span className="text-xs text-gray-500 mt-0.5">Kapasitas: {schedule.vehicle?.capacity}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm">
                            {schedule.trips?.length || 0}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Link href={`/admin/dashboard/schedules/${schedule.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan {filtered.length} dari {totalSchedules} jadwal
            </p>
          </div>
        </div>
      </div>

      {/* --- ADD SCHEDULE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Tambah Jadwal Baru</h2>
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
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pilih Supir</label>
                <select
                  required
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="" disabled>-- Pilih Supir --</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.licenseNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pilih Kendaraan</label>
                <select
                  required
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="" disabled>-- Pilih Kendaraan --</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber} (Kap: {vehicle.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal Kerja</label>
                <input
                  type="date"
                  required
                  value={formData.workDate}
                  onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pilih Shift</label>
                <select
                  required
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="" disabled>-- Pilih Shift --</option>
                  <option value="1">Shift 1 (Pagi)</option>
                  <option value="2">Shift 2 (Siang)</option>
                  <option value="3">Shift 3 (Malam)</option>
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
