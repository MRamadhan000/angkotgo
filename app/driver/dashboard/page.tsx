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
  FaCheckCircle,
  FaRoute,
  FaIdCard,
  FaUserCheck,
  FaInfoCircle,
  FaThLarge,
  FaPlay,
  FaCheck,
  FaMapMarkedAlt,
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
import DriverMap from "@/app/driver/dashboard/DriverMap";

// 1. Header Profil Driver
function DriverHeaderProfile() {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const driverName = "Siti Aminah";

  return (
    <header className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm">
          AG
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900">
              AngkotGo Driver
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Portal Operasional Pengemudi Non-Kondektur
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-slate-700 text-xs font-semibold cursor-pointer"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
            S
          </div>
          <span className="hidden sm:inline">{driverName}</span>
          <FaChevronDown className="text-slate-400 text-xs" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
            <div className="px-3.5 py-2 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-900">{driverName}</p>
              <p className="text-xs text-slate-500 font-medium">
                Pengemudi Aktif
              </p>
            </div>
            <Link
              href="/driver/dashboard/profile"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaUserCircle className="text-slate-400 text-sm" /> Profil Saya
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
            >
              <FaSignOutAlt className="text-sm" /> Keluar Akun
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// 2. Widget Kontrol Perjalanan + Live Map Kondisional
function InteractiveDriverWidget({
  assignmentItem,
  capacity = 8,
  onTripCompleted,
}: {
  assignmentItem: TripHistoryItem;
  capacity?: number;
  onTripCompleted: (assignmentId: number | string) => void;
}) {
  const [tripStatus, setTripStatus] = useState<AssignmentStatus>(
    assignmentItem.status || AssignmentStatus.SCHEDULED,
  );
  const [occupiedCount, setOccupiedCount] = useState<number>(0);

  const seats = useMemo(() => {
    return Array.from({ length: capacity }, (_, i) => ({
      seatNumber: i + 1,
      isOccupied: i < occupiedCount,
    }));
  }, [capacity, occupiedCount]);

  const handleStartTrip = () => {
    setTripStatus(AssignmentStatus.ONGOING);
  };

  const handleFinishTrip = () => {
    setTripStatus(AssignmentStatus.COMPLETED);
    setOccupiedCount(0);
    onTripCompleted(assignmentItem.assignmentId);
  };

  const handleSelectSeatCapacity = (seatNumber: number) => {
    setOccupiedCount(
      occupiedCount === seatNumber ? seatNumber - 1 : seatNumber,
    );
  };

  return (
    <div className="space-y-4 pt-2">
      {/* STATE 1: PENUGASAN SUDAH SELESAI */}
      {tripStatus === AssignmentStatus.COMPLETED ? (
        <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 text-emerald-900">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <FaCheck className="text-sm" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Penugasan Hari Ini Selesai
            </p>
            <p className="text-xs font-medium text-emerald-700 mt-0.5">
              Terima kasih atas pelayanan Anda! Data perjalanan telah berhasil
              dicatat.
            </p>
          </div>
        </div>
      ) : (
        /* STATE 2: BELUM MULAI (SCHEDULED) ATAU SEDANG BERJALAN (ONGOING) */
        <>
          {/* MAP HANYA MUNCUL JIKA TRIP BERJALAN (ONGOING) */}
          {tripStatus === AssignmentStatus.ONGOING && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FaMapMarkedAlt className="text-emerald-600 text-sm" /> Live
                  Map Tracking Perjalanan
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  GPS Aktif
                </span>
              </div>
              <div className="h-72 rounded-2xl overflow-hidden border border-slate-100 relative">
                <DriverMap />
              </div>
            </div>
          )}

          {/* BAR KONTROL UTAMA */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <FaUserCheck className="text-emerald-600 text-sm" /> Kendali
                Perjalanan Driver
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Status Perjalanan:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    tripStatus === AssignmentStatus.ONGOING
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {tripStatus === AssignmentStatus.ONGOING
                    ? "Berjalan (ON)"
                    : "Belum Dimulai"}
                </span>
              </div>
            </div>

            {/* Tombol Mulai / Selesai */}
            {tripStatus === AssignmentStatus.SCHEDULED ? (
              <button
                type="button"
                onClick={handleStartTrip}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
              >
                <FaPlay className="text-xs" />
                Mulai Perjalanan
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishTrip}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer"
              >
                <FaCheckCircle className="text-xs" />
                Selesaikan Perjalanan
              </button>
            )}
          </div>

          {/* CONTROL SEAT (Hanya muncul jika tripStatus === ONGOING) */}
          {tripStatus === AssignmentStatus.ONGOING && (
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FaThLarge className="text-emerald-600 text-sm" />{" "}
                  Ketersediaan Kursi
                </span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  {occupiedCount} / {capacity} Terisi
                </span>
              </div>

              <div className="pt-1">
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
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DriverNonConductorDashboardPage() {
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
      status: AssignmentStatus.SCHEDULED,
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
  ];

  const [completedAssignments, setCompletedAssignments] = useState<
    TripHistoryItem[]
  >([]);

  const initialData =
    activeSchedule && activeSchedule.length > 0
      ? activeSchedule
      : MOCK_SCHEDULES;

  const handleTripCompleted = (assignmentId: number | string) => {
    const completedItem = initialData.find(
      (item) => item.assignmentId === assignmentId,
    );
    if (
      completedItem &&
      !completedAssignments.some((item) => item.assignmentId === assignmentId)
    ) {
      setCompletedAssignments((prev) => [
        ...prev,
        { ...completedItem, status: AssignmentStatus.COMPLETED },
      ]);
    }
  };

  const activeSchedules = useMemo(() => {
    return initialData.filter((item) => {
      const itemDate =
        typeof item.date === "string"
          ? item.date.split("T")[0]
          : new Date(item.date).toISOString().split("T")[0];

      if (selectedDate) return itemDate === selectedDate;
      return itemDate === todayStr || itemDate === tomorrowStr;
    });
  }, [initialData, selectedDate, todayStr, tomorrowStr]);

  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Header Profil */}
        <DriverHeaderProfile />

        {/* Info Banner */}
        <div className="p-4 bg-blue-50/70 rounded-2xl text-xs text-blue-900 font-medium flex items-center gap-3">
          <FaInfoCircle className="text-blue-600 text-base shrink-0" />
          <span>
            <strong>Operasional Mandiri:</strong> Armada berjalan tanpa
            kondektur. Anda memiliki akses kontrol penuh perjalanan, pemantauan
            lokasi, & kursi penumpang.
          </span>
        </div>

        {/* Filter Tanggal Operasional */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FaCalendarAlt className="text-emerald-600 text-sm" /> Tanggal
              Operasional
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Hari ini ({todayStr}) & H+1 ({tomorrowStr})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border-0 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => setSelectedDate("")}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
            >
              Semua
            </button>
          </div>
        </div>

        {/* SECTION 1: PENUGASAN DRIVER AKTIF */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FaBus className="text-emerald-600 text-sm" /> Penugasan Driver
              Aktif
            </h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              {activeSchedules.length} Penugasan
            </span>
          </div>

          {activeLoading && (
            <div className="text-center py-8 bg-white rounded-2xl text-xs font-medium text-slate-400 border border-slate-100 shadow-sm">
              Memuat data penugasan...
            </div>
          )}

          {activeError && (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs font-medium">
              {activeError}
            </div>
          )}

          {!activeLoading && activeSchedules.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl text-xs font-medium text-slate-400 border border-slate-100 shadow-sm">
              Tidak ada penugasan aktif untuk tanggal ini.
            </div>
          )}

          <div className="space-y-4">
            {activeSchedules.map((item) => (
              <div
                key={item.assignmentId}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-5"
              >
                {/* Header Card Rute & Jam */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-lg">
                      {item.routeCode}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {item.routeName}
                    </h4>
                  </div>
                  <div className="text-xs font-semibold bg-slate-50 text-slate-700 px-3 py-1 rounded-lg flex items-center gap-1.5">
                    <FaClock className="text-emerald-600 text-xs" />{" "}
                    {item.startTime} - {item.endTime}
                  </div>
                </div>

                {/* Detail Kendaraan & Pengemudi */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Kendaraan
                    </span>
                    <span className="text-xs font-semibold text-slate-900 mt-1 block">
                      {item.vehicle?.plateNumber}{" "}
                      <span className="text-slate-500 font-normal">
                        ({item.vehicle?.vehicleCode})
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Pengemudi
                    </span>
                    <span className="text-xs font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                      <FaIdCard className="text-slate-400 text-xs" /> Siti
                      Aminah
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Kondektur
                    </span>
                    <span className="text-xs font-normal text-slate-400 mt-1 block">
                      -
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Arah Rute
                    </span>
                    <span className="text-xs font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                      <FaRoute className="text-slate-400 text-xs" />{" "}
                      {item.direction}
                    </span>
                  </div>
                </div>

                {/* Interactive Driver Control (Sudah termasuk Live Map kondisional di dalamnya) */}
                <InteractiveDriverWidget
                  assignmentItem={item}
                  capacity={item.vehicle?.capacity}
                  onTripCompleted={handleTripCompleted}
                />
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: RIWAYAT PENUGASAN SELESAI */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FaHistory className="text-emerald-600 text-sm" /> Riwayat
              Penugasan Selesai
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <FaCheckCircle className="text-emerald-600 text-xs" />{" "}
              {completedAssignments.length} Selesai
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Tanggal</th>
                  <th className="p-3">Kode / Rute</th>
                  <th className="p-3">Kendaraan</th>
                  <th className="p-3">Waktu</th>
                  <th className="p-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {completedAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      Belum ada riwayat penugasan selesai pada sesi ini. Klik
                      &quot;Mulai Perjalanan&quot; lalu &quot;Selesaikan
                      Perjalanan&quot; untuk mensimulasikan.
                    </td>
                  </tr>
                ) : (
                  completedAssignments.map((hist) => (
                    <tr
                      key={hist.assignmentId}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-3 font-semibold text-slate-900">
                        {String(hist.date).split("T")[0]}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-900">
                          {hist.routeCode}
                        </span>{" "}
                        -{" "}
                        <span className="text-slate-500">{hist.routeName}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {hist.vehicle?.plateNumber}
                      </td>
                      <td className="p-3 text-slate-500">
                        {hist.startTime} - {hist.endTime}
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700">
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
