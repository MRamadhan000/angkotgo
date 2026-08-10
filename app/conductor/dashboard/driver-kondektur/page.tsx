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
  FaUserTie,
  FaArrowRight,
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

// 1. Header Profil Kondektur
function ConductorHeaderProfile() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const conductorName = user?.name || "Ahmad Fauzi";

  return (
    <header className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm">
          AG
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900">
              AngkotGo Conductor
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Portal Operasional Kondektur
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
            {conductorName.charAt(0)}
          </div>
          <span className="hidden sm:inline">{conductorName}</span>
          <FaChevronDown className="text-slate-400 text-xs" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
            <div className="px-3.5 py-2 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-900">
                {conductorName}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Kondektur Aktif
              </p>
            </div>
            <Link
              href="/conductor/dashboard/profile"
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

// 2. Widget Kontrol Perjalanan & Kursi Penumpang Kondektur
function InteractiveConductorWidget({
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
        <>
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <FaUserCheck className="text-emerald-600 text-sm" /> Wewenang
                Kontrol Perjalanan
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Status:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    tripStatus === AssignmentStatus.ONGOING
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {tripStatus === AssignmentStatus.ONGOING
                    ? "ONGOING"
                    : "SCHEDULED"}
                </span>
              </div>
            </div>

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

          {tripStatus === AssignmentStatus.ONGOING && (
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FaThLarge className="text-emerald-600 text-sm" /> Kelola
                  Ketersediaan Kursi (Jumlah Penumpang)
                </span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  Akses Penuh Kondektur
                </span>
              </div>

              <div className="pt-1">
                <SeatGridControl
                  seats={seats}
                  canControl={true}
                  onToggleSeat={(seatNumber: number) =>
                    handleSelectSeatCapacity(seatNumber)
                  }
                  hasConductor={true}
                  isUserConductor={true}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ConductorDashboardPage() {
  const { user } = useAuth();
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
      assignmentId: 101,
      date: todayStr,
      status: AssignmentStatus.SCHEDULED,
      routeCode: "MK-01",
      routeName: "Rute Utama - Kota Pasar",
      direction: DirectionType.FORWARD,
      startTime: "08:00",
      endTime: "17:00",
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
      assignmentId: 102,
      date: tomorrowStr,
      status: AssignmentStatus.SCHEDULED,
      routeCode: "MK-02",
      routeName: "Rute Lingkar - Pasar Kota",
      direction: "BACKWARD" as DirectionType,
      startTime: "08:00",
      endTime: "17:00",
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
        { ...completedItem, status: AssignmentStatus.COMPLETED },
        ...prev,
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

  const recentCompleted = useMemo(() => {
    return completedAssignments.slice(0, 2);
  }, [completedAssignments]);

  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-5">
        <ConductorHeaderProfile />

        <div className="p-4 bg-blue-50/70 rounded-2xl text-xs text-blue-900 font-medium flex items-center gap-3">
          <FaInfoCircle className="text-blue-600 text-base shrink-0" />
          <span>
            <strong>Operasional Kondektur:</strong> Anda memiliki akses penuh
            untuk mengelola ketersediaan kursi & memantau status perjalanan
            penumpang secara langsung.
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FaCalendarAlt className="text-emerald-600 text-sm" /> Filter
              Tanggal Operasional
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Jadwal operasional Kondektur harian
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

        {/* SECTION 1: PENUGASAN AKTIF */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FaBus className="text-emerald-600 text-sm" /> Penugasan Kondektur
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
                      Pengemudi (Driver)
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
                    <span className="text-xs font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                      <FaUserTie className="text-emerald-600 text-xs" />{" "}
                      {user?.name || "Ahmad Fauzi"}
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

                <InteractiveConductorWidget
                  assignmentItem={item}
                  capacity={item.vehicle?.capacity}
                  onTripCompleted={handleTripCompleted}
                />
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: PRATINJAU RIWAYAT PENUGASAN */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FaHistory className="text-emerald-600 text-sm" /> Riwayat Selesai
              Terbaru
            </h3>
            <Link
              href="/conductor/dashboard/history2"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline transition"
            >
              Lihat Semua Riwayat <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          {/* Clean Table Zebra Striping (Tanpa Border Horizontal) */}
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left text-xs min-w-[700px] border-collapse">
              <thead className="bg-slate-100/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Kode / Rute</th>
                  <th className="py-3.5 px-4">Arah</th>
                  <th className="py-3.5 px-4">Kendaraan</th>
                  <th className="py-3.5 px-4">Driver</th>
                  <th className="py-3.5 px-4">Kondektur</th>
                  <th className="py-3.5 px-4">Waktu</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-700">
                {recentCompleted.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 px-4 text-center text-slate-400 font-medium"
                    >
                      Belum ada riwayat penugasan selesai pada sesi ini. Klik
                      &quot;Mulai Perjalanan&quot; lalu &quot;Selesaikan
                      Perjalanan&quot; untuk mensimulasikan.
                    </td>
                  </tr>
                ) : (
                  recentCompleted.map((hist, index) => (
                    <tr
                      key={hist.assignmentId}
                      className={`transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                      } hover:bg-emerald-50/30`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {String(hist.date).split("T")[0]}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 rounded-md shrink-0">
                            {hist.routeCode}
                          </span>
                          <span className="font-semibold text-slate-900 whitespace-nowrap">
                            {hist.routeName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {hist.direction}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <FaBus className="text-slate-400 text-xs" />
                          {hist.vehicle?.plateNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <FaIdCard className="text-slate-400 text-xs" />
                          Siti Aminah
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <FaUserTie className="text-emerald-600 text-xs" />
                          {user?.name || "Ahmad Fauzi"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {hist.startTime} - {hist.endTime}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 inline-flex items-center gap-1">
                          <FaCheckCircle className="text-[10px]" />
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
