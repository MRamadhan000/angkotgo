"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FaBus,
  FaCalendarAlt,
  FaClock,
  FaHistory,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaToggleOn,
  FaToggleOff,
  FaUserCheck,
} from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
import { usePersonnelSchedule } from "@/hooks/vehicles/usePersonalSchedules";
import { SeatGridControl } from "@/components/now/SeatGridControl";
import {
  AssignmentStatus,
  DirectionType,
  VehicleStatus,
  VehicleType,
} from "@/types/vehicles/vehicle.type";
import { TripHistoryItem } from "@/types/vehicles/trip-history.type";

// Header & Profil khusus Pengemudi (Driver)
function DriverHeaderProfile() {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const driverName = "Siti Aminah";

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between rounded-2xl shadow-xs mb-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 text-white p-2.5 rounded-xl font-bold text-lg">
          AG
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">
            AngkotGo Driver
          </h1>
          <p className="text-xs text-gray-500">Portal Operasional Pengemudi</p>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-xl hover:bg-gray-100 transition focus:outline-none"
        >
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
            S
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800">{driverName}</div>
            <div className="text-[10px] text-blue-600 font-semibold">
              PENGEMUDI
            </div>
          </div>
          <FaChevronDown className="text-gray-400 text-xs" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-bold text-slate-800 truncate">
                {driverName}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                Akun Pengemudi Aktif
              </p>
            </div>
            <Link
              href="/driver/dashboard/profile"
              className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaUserCircle className="text-gray-400" /> Profil Saya
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium text-left"
            >
              <FaSignOutAlt /> Keluar Akun
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// Full Interactive Control Widget khusus Driver (Tanpa Kondektur)
function InteractiveDriverWidget({
  initialStatus,
  capacity = 8,
}: {
  assignmentId: number | string;
  initialStatus: AssignmentStatus;
  capacity?: number;
}) {
  const [tripStatus, setTripStatus] = useState<AssignmentStatus>(
    initialStatus || AssignmentStatus.ONGOING,
  );

  const [occupiedCount, setOccupiedCount] = useState<number>(0);

  const seats = useMemo(() => {
    return Array.from({ length: capacity }, (_, i) => ({
      seatNumber: i + 1,
      isOccupied: i < occupiedCount,
    }));
  }, [capacity, occupiedCount]);

  const handleToggleTripStatus = () => {
    if (tripStatus === AssignmentStatus.ONGOING) {
      setTripStatus(AssignmentStatus.COMPLETED);
      setOccupiedCount(0);
    } else {
      setTripStatus(AssignmentStatus.ONGOING);
    }
  };

  const handleSelectSeatCapacity = (seatNumber: number) => {
    if (occupiedCount === seatNumber) {
      setOccupiedCount(seatNumber - 1);
    } else {
      setOccupiedCount(seatNumber);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
      {/* Control Sakelar Perjalanan Driver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
        <div>
          <div className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
            <FaUserCheck className="text-blue-600" /> Kendali Penuh Pengemudi
          </div>
          <div className="text-sm font-bold text-slate-800 flex items-center gap-2 mt-0.5">
            Status:{" "}
            <span
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
                tripStatus === AssignmentStatus.ONGOING
                  ? "bg-blue-600 text-white"
                  : tripStatus === AssignmentStatus.COMPLETED
                    ? "bg-gray-200 text-gray-800"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {tripStatus}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleTripStatus}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition ${
            tripStatus === AssignmentStatus.ONGOING
              ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          }`}
        >
          {tripStatus === AssignmentStatus.ONGOING ? (
            <>
              <FaToggleOn className="text-lg" /> Selesaikan Perjalanan
            </>
          ) : (
            <>
              <FaToggleOff className="text-lg" /> Mulai Perjalanan (ON)
            </>
          )}
        </button>
      </div>

      {/* Kontrol Ketersediaan Kursi (Hanya muncul jika status ONGOING) */}
      {tripStatus === AssignmentStatus.ONGOING && (
        <div className="animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Kelola Ketersediaan Kursi (Jumlah Penumpang)
            </h4>
            <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Akses Mandiri Driver
            </span>
          </div>
          <SeatGridControl
            seats={seats}
            canControl={true}
            onToggleSeat={(seatNumber: number) =>
              handleSelectSeatCapacity(seatNumber)
            }
            hasConductor={false}
            isUserConductor={false}
          />
        </div>
      )}
    </div>
  );
}

export default function DriverDashboardPage() {
  const { activeSchedule, activeLoading, activeError } = usePersonnelSchedule();

  const getFormattedDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split("T")[0];
  };

  const todayStr = getFormattedDate(0);
  const tomorrowStr = getFormattedDate(1);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const MOCK_SCHEDULES: TripHistoryItem[] = [
    {
      assignmentId: 201,
      date: todayStr,
      status: AssignmentStatus.ONGOING,
      routeCode: "MK-01",
      routeName: "Rute Utama - Kota (Hari Ini)",
      direction: DirectionType.FORWARD,
      startTime: "07:00",
      endTime: "09:00",
      vehicle: {
        id: 1,
        plateNumber: "N 1234 AB",
        vehicleCode: "AG-01",
        capacity: 8,
        currentOdometer: 12000,
        status: VehicleStatus.ACTIVE,
        type: VehicleType.REGULER,
        createdAt: todayStr,
        updatedAt: todayStr,
      },
    },
    {
      assignmentId: 202,
      date: tomorrowStr,
      status: AssignmentStatus.SCHEDULED,
      routeCode: "MK-02",
      routeName: "Rute Lingkar - Besok (H+1)",
      direction: "BACKWARD" as DirectionType,
      startTime: "08:00",
      endTime: "10:00",
      vehicle: {
        id: 1,
        plateNumber: "N 1234 AB",
        vehicleCode: "AG-01",
        capacity: 8,
        currentOdometer: 12000,
        status: VehicleStatus.ACTIVE,
        type: VehicleType.REGULER,
        createdAt: todayStr,
        updatedAt: todayStr,
      },
    },
    {
      assignmentId: 299,
      date: "2026-08-08",
      status: AssignmentStatus.COMPLETED,
      routeCode: "MK-01",
      routeName: "Rute Utama (Riwayat)",
      direction: DirectionType.FORWARD,
      startTime: "13:00",
      endTime: "15:00",
      vehicle: {
        id: 1,
        plateNumber: "N 1234 AB",
        vehicleCode: "AG-01",
        capacity: 8,
        currentOdometer: 11900,
        status: VehicleStatus.ACTIVE,
        type: VehicleType.REGULER,
        createdAt: todayStr,
        updatedAt: todayStr,
      },
    },
  ];

  const allData =
    activeSchedule && activeSchedule.length > 0
      ? activeSchedule
      : MOCK_SCHEDULES;

  const activeSchedules = useMemo(() => {
    return allData.filter((item) => {
      const itemDate =
        typeof item.date === "string"
          ? item.date.split("T")[0]
          : new Date(item.date).toISOString().split("T")[0];

      if (selectedDate) return itemDate === selectedDate;
      return itemDate === todayStr || itemDate === tomorrowStr;
    });
  }, [allData, selectedDate, todayStr, tomorrowStr]);

  const historySchedules = useMemo(() => {
    return allData.filter((item) => item.status === AssignmentStatus.COMPLETED);
  }, [allData]);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 p-3 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Profil Driver */}
        <DriverHeaderProfile />

        {/* Filter Tanggal Operasional */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-600" /> Filter Tanggal
              Operasional
            </h2>
            <p className="text-xs text-gray-500">
              Jadwal operasional armada hari ini ({todayStr}) dan H+1 (
              {tomorrowStr})
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setSelectedDate("")}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition shrink-0"
            >
              Semua
            </button>
          </div>
        </div>

        {/* Banner Informasi Akses Mandiri */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium">
          💡 Informasi Operasional: Armada ini berjalan tanpa Kondektur. Seluruh
          kendali perjalanan dan pembaruan keterisian kursi diakses sepenuhnya
          oleh Driver secara mandiri.
        </div>

        {/* Informasi Jadwal Aktif */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <FaBus className="text-blue-600" /> Penugasan Driver Aktif
          </h3>

          {activeLoading && (
            <div className="text-center py-8 text-xs text-gray-400">
              Memuat jadwal penugasan...
            </div>
          )}

          {activeError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs">
              {activeError}
            </div>
          )}

          {!activeLoading && activeSchedules.length === 0 && (
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400">
              Tidak ada penugasan aktif untuk tanggal yang dipilih.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {activeSchedules.map((item) => (
              <div
                key={item.assignmentId}
                className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                      {item.routeCode}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      {item.routeName}
                    </h4>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                    <FaClock className="text-gray-400" /> {item.startTime} -{" "}
                    {item.endTime}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">
                      Kendaraan
                    </span>
                    <span className="font-semibold text-slate-800">
                      {item.vehicle?.plateNumber} ({item.vehicle?.vehicleCode})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">
                      Pengemudi (Driver)
                    </span>
                    <span className="font-semibold text-slate-800">
                      Siti Aminah
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">
                      Kondektur
                    </span>
                    <span className="font-bold text-gray-400">-</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">
                      Arah Rute
                    </span>
                    <span className="font-semibold text-slate-800">
                      {item.direction}
                    </span>
                  </div>
                </div>

                {/* Integration Widget Khusus Driver */}
                <InteractiveDriverWidget
                  assignmentId={item.assignmentId}
                  initialStatus={item.status}
                  capacity={item.vehicle?.capacity}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Tabel Riwayat Penugasan */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <FaHistory className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Riwayat Penugasan Selesai
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">Tanggal</th>
                  <th className="p-3">Kode / Rute</th>
                  <th className="p-3">Kendaraan</th>
                  <th className="p-3">Waktu</th>
                  <th className="p-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historySchedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">
                      Belum ada riwayat penugasan selesai.
                    </td>
                  </tr>
                ) : (
                  historySchedules.map((hist) => (
                    <tr key={hist.assignmentId} className="hover:bg-gray-50/50">
                      <td className="p-3 font-semibold text-slate-800">
                        {String(hist.date).split("T")[0]}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900">
                          {hist.routeCode}
                        </span>{" "}
                        - {hist.routeName}
                      </td>
                      <td className="p-3">{hist.vehicle?.plateNumber}</td>
                      <td className="p-3">
                        {hist.startTime} - {hist.endTime}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-800">
                          {hist.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
