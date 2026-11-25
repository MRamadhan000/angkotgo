"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FiTruck,
  FiClock,
  FiCalendar,
  FiChevronRight,
  FiEdit3,
  FiMapPin,
  FiNavigation,
  FiActivity,
  FiLogOut,
  FiUser,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowLeft,
  FiInbox,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

/* =========================================================
1. INTERFACES (Matching Backend Response & NestJS Entity)
   ========================================================= */

export enum AssignmentStatus {
  SCHEDULED = "SCHEDULED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface RouteData {
  id: number;
  code: string;
  name: string;
  direction: string;
  color: string;
  encodedPolyline: string;
  totalDistanceMeters: number;
  isActive: boolean;
}

export interface VehicleData {
  id: number;
  plateNumber: string;
  vehicleCode: string;
  capacity: number;
  currentOdometer: number;
  type: string;
  status: string;
}

export interface DriverData {
  id: number;
  name: string;
  nik: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  address?: string | null;
  photoUrl?: string | null;
  isVerified: boolean;
  status: string;
}

export interface ConductorData {
  id: number;
  name: string;
  nik: string;
  email: string;
  phone: string;
  address?: string | null;
  photoUrl?: string | null;
  isVerified: boolean;
  status: string;
}

export interface ApiVehicleAssignment {
  id: number;
  routeId: number;
  vehicleId: number;
  driverId: number;
  conductorId?: number | null;
  startTime: string;
  status: AssignmentStatus;
  currentPassengers: number;
  assignmentDate: string;
  createdAt: string;
  updatedAt: string;
  route: RouteData;
  driver: DriverData;
  conductor?: ConductorData | null;
  vehicle: VehicleData;
}

/* =========================================================
2. HELPER COMPONENTS & UTILS
   ========================================================= */

function Skel({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
  );
}

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const formatDateHeader = (dateStr: string) => {
  if (!dateStr) return "-";
  const cleanDateStr = dateStr.split("T")[0];
  const todayStr = new Date().toISOString().split("T")[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  if (cleanDateStr === todayStr) return "Hari Ini";
  if (cleanDateStr === tomorrowStr) return "Besok";

  try {
    const [y, m, d] = cleanDateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
    return `${dayName}, ${d} ${MONTHS[m - 1]} ${y}`;
  } catch {
    return dateStr;
  }
};

/* =========================================================
3. MAIN COMPONENT
   ========================================================= */

export default function DriverSchedulePage() {
  const router = useRouter();
  const { user, logout, isLoading: isAuthLoading } = useAuth();

  // Navigation & Logout Modal State
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [navigatingKey, setNavigatingKey] = useState<string | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  /* 1. Fetch Seluruh Penugasan Mendatang (Tanpa Filter Hari Ini) */
  const {
    data: assignments = [],
    isLoading: isAssignmentsLoading,
    isFetching: isAssignmentsFetching,
    isError: isAssignmentsError,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useQuery<ApiVehicleAssignment[]>({
    queryKey: ["driver-upcoming-assignments", user?.id],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3001/vehicle-assignments/upcoming?role=DRIVER&userId=${user?.id}`,
      );

      if (!res.ok) {
        throw new Error(`Gagal mengambil data penugasan (${res.status})`);
      }

      const responseData = await res.json();
      return responseData.data || [];
    },
    enabled: !!user?.id,
    retry: 1,
  });

  /* 2. Fetch Profil Detail Driver dari API Backend */
  const {
    data: fetchedDriverProfile = null,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    refetch: refetchDriverProfile,
  } = useQuery<DriverData | null>({
    queryKey: ["driver-profile", user?.id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3001/drivers/${user?.id}`);

      if (!res.ok) return null;

      const responseData = await res.json();
      return responseData.data || responseData;
    },
    enabled: !!user?.id,
    retry: 1,
  });

  /* PENGELOMPOKAN JADWAL BERDASARKAN TANGGAL (HARI INI, BESOK, DST) */
  const groupedSchedules = useMemo(() => {
    const map = new Map<string, ApiVehicleAssignment[]>();

    assignments.forEach((item) => {
      const dateKey = item.assignmentDate
        ? item.assignmentDate.split("T")[0]
        : "Lainnya";

      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, item]);
    });

    return Array.from(map.entries()).sort(
      ([dateA], [dateB]) =>
        new Date(dateA).getTime() - new Date(dateB).getTime(),
    );
  }, [assignments]);

  /* Profil driver: utamakan hasil endpoint profil, fallback ke data penugasan */
  const driverProfile: DriverData | null =
    fetchedDriverProfile ?? assignments[0]?.driver ?? null;

  /* Loading & Refresh States */
  const isLoading = isAuthLoading || isAssignmentsLoading || isProfileLoading;
  const isRefreshing = isAssignmentsFetching || isProfileFetching;

  const fetchError = isAssignmentsError
    ? assignmentsError instanceof Error
      ? assignmentsError.message
      : "Terjadi kesalahan jaringan ke backend."
    : null;

  /* Refresh Manual */
  const handleRefresh = () => {
    if (!user?.id) return;
    refetchAssignments();
    refetchDriverProfile();
  };

  /* Handler Navigasi Halaman */
  const goToProfile = () => {
    router.push("/driver/profile");
  };

  const goToHistory = () => {
    router.push("/driver/history");
  };

  const openMap = (key: string) => {
    if (navigatingKey) return;
    setNavigatingKey(key);
    router.push(`/driver/now?assignmentId=${key}`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (logout) {
        await logout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingOut(false);
      router.push("/login");
    }
  };

  return (
    <div className="min-h-dvh w-full bg-slate-100 pb-10 font-sans text-slate-900 antialiased select-none">
      {/* ---------------------------------------------------------
         HEADER
      --------------------------------------------------------- */}
      <header className="sticky top-0 z-30 mx-auto w-full max-w-5xl px-2.5 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="space-y-2 rounded-2xl border border-white/80 bg-white/95 p-2.5 shadow-lg backdrop-blur-xl">
          {/* Baris 1: Tombol Kembali + Avatar + Nama + Logout */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <button
                onClick={() => router.back()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition active:scale-95 hover:bg-slate-100"
                title="Kembali"
              >
                <FiArrowLeft size={16} />
              </button>

              <div className="flex min-w-0 items-center gap-2.5">
                {isLoading ? (
                  <>
                    <Skel className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="space-y-1.5">
                      <Skel className="h-3.5 w-24" />
                      <Skel className="h-4 w-12" />
                    </div>
                  </>
                ) : (
                  <>
                    {/* AVATAR */}
                    <div className="relative shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white shadow-md shadow-blue-700/30 overflow-hidden">
                        {driverProfile?.photoUrl ? (
                          <img
                            src={driverProfile.photoUrl}
                            alt={driverProfile.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FiUser size={19} />
                        )}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    <div className="flex min-w-0 flex-col items-start gap-1">
                      <h1 className="max-w-full truncate text-sm font-black leading-tight tracking-tight text-slate-900">
                        {driverProfile?.name || user?.name || "Driver AngkotGo"}
                      </h1>
                      <span className="rounded-md border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-blue-700">
                        Jadwal Penugasan
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                title="Muat Ulang Data"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition active:scale-95 disabled:opacity-50 hover:bg-slate-100"
              >
                <FiRefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin text-blue-700" : ""}
                />
              </button>

              <button
                onClick={() => setIsLogoutOpen(true)}
                disabled={isLoading}
                title="Keluar dari akun"
                aria-label="Keluar dari akun"
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 text-[11px] font-bold text-rose-700 transition active:scale-95 disabled:opacity-50"
              >
                <FiLogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Baris 2: aksi navigasi ke halaman terpisah */}
          <div className="grid grid-cols-2 gap-0.5 rounded-xl bg-slate-100/80 p-0.5">
            <button
              onClick={goToHistory}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold text-slate-600 transition active:scale-95 active:bg-white disabled:opacity-50"
            >
              <FiActivity size={13} className="text-blue-700" />
              Riwayat Perjalanan
            </button>
            <button
              onClick={goToProfile}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold text-slate-600 transition active:scale-95 active:bg-white disabled:opacity-50"
            >
              <FiEdit3 size={13} className="text-slate-500" />
              Edit Profil
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------
         MAIN CONTENT
      --------------------------------------------------------- */}
      <main className="mx-auto max-w-5xl px-2.5 pt-3">
        {isLoading ? (
          /* ============ SKELETON LOADING ============ */
          <div
            className="grid grid-cols-1 items-start gap-3 md:grid-cols-12"
            aria-busy="true"
            aria-label="Memuat data"
          >
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white p-3 shadow-md">
                <Skel className="h-10 w-10 shrink-0 rounded-xl" />
                <div className="space-y-2">
                  <Skel className="h-3 w-24" />
                  <Skel className="h-5 w-16" />
                </div>
              </div>
            </div>

            <div className="space-y-3 md:col-span-8">
              {[0, 1].map((idx) => (
                <div key={idx} className="space-y-2">
                  <Skel className="h-4 w-32" />
                  <div className="space-y-2 rounded-2xl border border-white/80 bg-white p-3 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <Skel className="h-10 w-10 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-1.5">
                        <Skel className="h-3.5 w-3/4" />
                        <Skel className="h-3 w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : fetchError ? (
          /* ============ ERROR STATE ============ */
          <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-xs space-y-3 my-4">
            <FiAlertCircle size={36} className="mx-auto text-rose-500" />
            <h2 className="text-sm font-extrabold text-slate-900">
              Gagal Memuat Jadwal Penugasan
            </h2>
            <p className="text-xs text-slate-500">{fetchError}</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition active:scale-95"
            >
              <FiRefreshCw size={13} />
              Coba Lagi
            </button>
          </div>
        ) : (
          /* ============ KONTEN HASIL FETCH API (SELEURUH JADWAL) ============ */
          <div className="grid grid-cols-1 items-start gap-3 animate-in fade-in duration-300 md:grid-cols-12">
            {/* KIRI: RINGKASAN TOTAL JADWAL */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white p-3 shadow-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-md shadow-blue-700/30">
                  <FiCalendar size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Total Penugasan
                  </p>
                  <p className="text-lg font-black leading-tight text-blue-900">
                    {assignments.length} Trayek
                  </p>
                </div>
              </div>
            </div>

            {/* KANAN: JADWAL KELOMPOK PER TANGGAL (HARI INI, BESOK, DST) */}
            <div className="space-y-4 md:col-span-8">
              {groupedSchedules.length === 0 ? (
                <div className="rounded-2xl border border-white/80 bg-white p-8 text-center text-xs font-medium text-slate-400 shadow-md">
                  <FiInbox size={32} className="mx-auto mb-2 text-slate-300" />
                  Belum ada penugasan mendatang untuk Anda.
                </div>
              ) : (
                groupedSchedules.map(([dateKey, items]) => (
                  <div key={dateKey} className="space-y-2">
                    {/* SUBHEADER TANGGAL */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar size={12} className="text-blue-700" />
                        <h2 className="text-xs font-extrabold text-slate-900">
                          {formatDateHeader(dateKey)}
                        </h2>
                      </div>
                      <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {items.length} Jadwal
                      </span>
                    </div>

                    {/* DAFTAR PENUGASAN DI TANGGAL TERSEBUT */}
                    <div className="rounded-2xl border border-white/80 bg-white p-3 shadow-md space-y-2">
                      {items.map((item) => {
                        const isOngoing =
                          item.status === AssignmentStatus.ONGOING;
                        const isCompleted =
                          item.status === AssignmentStatus.COMPLETED;
                        const isOpening = navigatingKey === String(item.id);

                        return (
                          <button
                            key={item.id}
                            onClick={() => openMap(String(item.id))}
                            disabled={navigatingKey !== null}
                            className={`flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition active:scale-95 disabled:cursor-wait ${
                              isOpening ? "opacity-100" : "disabled:opacity-60"
                            } ${
                              isOngoing
                                ? "border-blue-200 bg-blue-50/70"
                                : "border-slate-100 bg-slate-50"
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                isOngoing
                                  ? "bg-blue-700 text-white shadow-md shadow-blue-700/30"
                                  : "border border-slate-200 bg-white text-slate-500"
                              }`}
                            >
                              <FiTruck size={17} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                <p
                                  className={`text-xs font-bold ${
                                    isOngoing
                                      ? "text-blue-900"
                                      : "text-slate-800"
                                  }`}
                                >
                                  {item.route.name}
                                </p>
                                <span
                                  className={`rounded-full px-1.5 py-px text-[9px] font-extrabold ${
                                    isOngoing
                                      ? "bg-blue-600 text-white"
                                      : isCompleted
                                        ? "bg-slate-200 text-slate-600"
                                        : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {isOngoing
                                    ? "Beroperasi"
                                    : isCompleted
                                      ? "Selesai"
                                      : "Dijadwalkan"}
                                </span>
                              </div>
                              <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500">
                                Kode Rute: {item.route.code} • Kapasitas:{" "}
                                {item.vehicle.capacity} Penumpang
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                                <FiClock size={10} />
                                Jam {item.startTime} WIB •{" "}
                                {item.vehicle.plateNumber} (
                                {item.vehicle.vehicleCode})
                              </p>
                            </div>

                            {isOpening ? (
                              <FiLoader className="h-4 w-4 shrink-0 animate-spin text-blue-700" />
                            ) : (
                              <FiChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ---------------------------------------------------------
         MODAL LOGOUT
      --------------------------------------------------------- */}
      {isLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xs space-y-4 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <FiLogOut size={22} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Keluar dari akun?
              </h3>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Anda perlu masuk lagi untuk membuka jadwal penugasan dan peta
                operasional.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsLogoutOpen(false)}
                disabled={isLoggingOut}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 active:scale-95 disabled:opacity-80"
              >
                {isLoggingOut ? (
                  <>
                    <FiLoader size={13} className="animate-spin" />
                    Keluar...
                  </>
                ) : (
                  "Ya, Keluar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}