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
  FaUserTie,
  FaInfoCircle,
  FaThLarge,
  FaMapMarkedAlt,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
import { usePersonnelSchedule } from "@/hooks/vehicles/usePersonalSchedules";
import { useSeatManagement } from "@/hooks/vehicles/useSeatManagement";
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
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const driverName = user?.name || "Budi Susanto";

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
            Portal Operasional Pengemudi (Dengan Kondektur)
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
            {driverName.charAt(0).toUpperCase()}
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

// 2. Read-Only Widget untuk Perjalanan + Live Map Tracking
function ReadOnlyDriverWidget({
  assignmentItem,
  hasConductor,
}: {
  assignmentItem: TripHistoryItem;
  hasConductor: boolean;
}) {
  const { status, loading, error } = useSeatManagement(
    String(assignmentItem.assignmentId),
    false,
  );

  const currentStatus =
    status?.status || assignmentItem.status || AssignmentStatus.SCHEDULED;

  return (
    <div className="space-y-4 pt-2">
      {/* LIVE MAP TRACKING (Muncul jika perjalanan dalam status ONGOING) */}
      {currentStatus === AssignmentStatus.ONGOING && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FaMapMarkedAlt className="text-emerald-600 text-sm" /> Live Map
              Tracking Perjalanan
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

      {/* BAR STATUS & WEWENANG PERJALANAN */}
      <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <FaUserTie className="text-emerald-600 text-sm" /> Status Perjalanan
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              Kondisi Operasional:
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentStatus === AssignmentStatus.ONGOING
                  ? "bg-emerald-600 text-white"
                  : currentStatus === AssignmentStatus.COMPLETED
                    ? "bg-slate-200 text-slate-800"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {currentStatus === AssignmentStatus.ONGOING
                ? "Berjalan (ON)"
                : currentStatus === AssignmentStatus.COMPLETED
                  ? "Selesai"
                  : "Belum Dimulai"}
            </span>
          </div>
        </div>

        {/* Informational Badge: Dibuat persis seperti Dikelola Kondektur (Read-Only) */}
        <div className="w-full sm:w-auto px-3 py-1.5 bg-amber-50 border border-amber-200/60 rounded-xl flex items-center gap-2 text-amber-800 text-xs font-medium">
          <FaLock className="text-amber-600 shrink-0 text-xs" />
          <span>
            Pembaruan status perjalanan dikelola sepenuhnya oleh Kondektur.
          </span>
        </div>
      </div>

      {/* PANTAU KETERSEDIAAN KURSI (READ-ONLY) */}
      <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <FaThLarge className="text-emerald-600 text-sm" /> Ketersediaan
            Kursi (Pantau Mode)
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            Dikelola oleh Kondektur
          </span>
        </div>

        <div className="pt-1">
          <SeatGridControl
            seats={status?.seats || []}
            canControl={false}
            onToggleSeat={() => {}}
            hasConductor={hasConductor}
            isUserConductor={false}
          />
        </div>

        {loading && (
          <p className="text-xs text-slate-400 font-medium pt-1">
            Memuat data status kursi...
          </p>
        )}
        {error && (
          <p className="text-xs text-rose-500 font-medium pt-1">{error}</p>
        )}
      </div>
    </div>
  );
}

export default function DriverConductorDashboardPage() {
  const { activeSchedule, activeLoading, activeError } = usePersonnelSchedule();
  const { user } = useAuth();

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
      status: AssignmentStatus.ONGOING,
      routeCode: "MK-01",
      routeName: "Rute Utama - Kota Pasar",
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
      conductor: {
        id: 1,
        name: "Ahmad Fauzi",
        nik: "3500000001",
        email: "ahmad.fauzi@angkotgo.com",
        phone: "081234567890",
        password: "",
        address: "Malang",
        photoUrl: null,
        isVerified: true,
        status: "ACTIVE",
        totalTrips: 15,
        createdAt: todayStr,
        updatedAt: todayStr,
      },
    },
    {
      assignmentId: 102,
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
      conductor: {
        id: 2,
        name: "Budi Santoso",
        nik: "3500000002",
        email: "budi.santoso@angkotgo.com",
        phone: "081234567891",
        password: "",
        address: "Malang",
        photoUrl: null,
        isVerified: true,
        status: "ACTIVE",
        totalTrips: 10,
        createdAt: todayStr,
        updatedAt: todayStr,
      },
    },
    {
      assignmentId: 99,
      date: "2026-08-09",
      status: AssignmentStatus.COMPLETED,
      routeCode: "MK-01",
      routeName: "Rute Utama - Kota Pasar",
      direction: DirectionType.FORWARD,
      startTime: "08:00",
      endTime: "16:30",
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
      conductor: {
        id: 1,
        name: "Ahmad Fauzi",
        nik: "3500000001",
        email: "ahmad.fauzi@angkotgo.com",
        phone: "081234567890",
        password: "",
        address: "Malang",
        photoUrl: null,
        isVerified: true,
        status: "ACTIVE",
        totalTrips: 15,
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
    <div className="min-h-screen bg-white text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Header Profil */}
        <DriverHeaderProfile />

        {/* Info Banner */}
        <div className="p-4 bg-blue-50/70 rounded-2xl text-xs text-blue-900 font-medium flex items-center gap-3">
          <FaInfoCircle className="text-blue-600 text-base shrink-0" />
          <span>
            <strong>Operasional Bersama Kondektur:</strong> Perjalanan
            didampingi oleh Kondektur. Status perjalanan dan ketersediaan kursi
            diatur sepenuhnya oleh Kondektur, Anda dapat memantau peta dan
            informasi rute secara real-time.
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
              Jadwal operasional harian pengemudi & kondektur
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

                {/* Detail Kendaraan, Pengemudi, & Kondektur */}
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
                      <FaIdCard className="text-slate-400 text-xs" />
                      {user?.name || "Budi Susanto"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Kondektur
                    </span>
                    <span className="text-xs font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                      <FaUserTie className="text-emerald-600 text-xs" />
                      {item.conductor?.name || "Ahmad Fauzi"}
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

                {/* Read-Only Driver Widget & Live Map Tracking */}
                <ReadOnlyDriverWidget
                  assignmentItem={item}
                  hasConductor={Boolean(item.conductor)}
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
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <FaCheckCircle className="text-emerald-600 text-xs" />{" "}
                {historySchedules.length} Selesai
              </span>
              <Link
                href="/driver/dashboard/history3"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline transition"
              >
                Lihat Semua <FaArrowRight className="text-[10px]" />
              </Link>
            </div>
          </div>

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
                {historySchedules.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 px-4 text-center text-slate-400 font-medium"
                    >
                      Belum ada riwayat penugasan selesai.
                    </td>
                  </tr>
                ) : (
                  historySchedules.map((hist, index) => (
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
                          {user?.name || "Budi Susanto"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <FaUserTie className="text-emerald-600 text-xs" />
                          {hist.conductor?.name || "Ahmad Fauzi"}
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
