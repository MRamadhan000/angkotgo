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
  FiList,
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

const formatAssignmentDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const today = new Date().toISOString().split("T")[0];
  if (dateStr === today) return "Hari Ini";

  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

/* =========================================================
3. MAIN COMPONENT
   ========================================================= */

export default function DriverDashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading: isAuthLoading } = useAuth();

  // Navigation & Logout Modal State
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [navigatingKey, setNavigatingKey] = useState<string | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  /* 1. Fetch Seluruh Penugasan Mendatang dari API Backend */
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

  /* FILTERING DASHBOARD UTAMA: PENUGASAN KHUSUS HARI INI (TODAY ONLY) */
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const todayAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const itemDate = item.assignmentDate
        ? item.assignmentDate.split("T")[0]
        : "";
      return itemDate === todayStr;
    });
  }, [assignments, todayStr]);

  /* Filter Penugasan Berjalan (ONGOING) Pertama Hari Ini */
  const activeTrip = useMemo(() => {
    return todayAssignments.find((a) => a.status === AssignmentStatus.ONGOING);
  }, [todayAssignments]);

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

  const goToScheduleList = () => {
    router.push("/driver/upcoming");
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
          {/* Baris 1: avatar + nama + logout */}
          <div className="flex items-center justify-between gap-2">
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
                      Driver (ID: {driverProfile?.id || user?.id || "-"})
                    </span>
                  </div>
                </>
              )}
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

          {/* Baris 2: aksi navigasi (Jadwal Lengkap, Riwayat & Profil) */}
          <div className="mt-2.5 pt-1 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-200/60 p-1">
              <button
                onClick={goToScheduleList}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-[10px] font-bold text-blue-700 shadow-xs border border-slate-200/80 transition active:scale-95 disabled:opacity-50"
              >
                <FiList size={13} className="text-blue-700" />
                <span>Jadwal Lengkap</span>
              </button>

              <button
                onClick={goToHistory}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-white/70 py-2 text-[10px] font-bold text-slate-700 transition hover:bg-white active:scale-95 active:bg-white disabled:opacity-50"
              >
                <FiActivity size={13} className="text-slate-600" />
                <span>Riwayat</span>
              </button>

              <button
                onClick={goToProfile}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-white/70 py-2 text-[10px] font-bold text-slate-700 transition hover:bg-white active:scale-95 active:bg-white disabled:opacity-50"
              >
                <FiEdit3 size={13} className="text-slate-500" />
                <span>Edit Profil</span>
              </button>
            </div>
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
              <div className="space-y-2.5 rounded-2xl border border-blue-100 bg-white p-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <Skel className="h-3.5 w-28" />
                  <Skel className="h-4 w-24" />
                </div>
                <Skel className="h-4 w-44" />
                <Skel className="h-[74px] w-full rounded-xl" />
                <Skel className="h-3 w-40" />
                <Skel className="h-11 w-full rounded-xl" />
              </div>

              <div className="rounded-2xl border border-white/80 bg-white p-3 shadow-md">
                <div className="mb-2.5 flex items-center justify-between">
                  <Skel className="h-3 w-24" />
                  <Skel className="h-3 w-28" />
                </div>
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5"
                    >
                      <Skel className="h-10 w-10 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-1.5">
                        <Skel className="h-3.5 w-3/4" />
                        <Skel className="h-3 w-1/2" />
                        <Skel className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : fetchError ? (
          /* ============ ERROR STATE ============ */
          <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-xs space-y-3 my-4">
            <FiAlertCircle size={36} className="mx-auto text-rose-500" />
            <h2 className="text-sm font-extrabold text-slate-900">
              Gagal Memuat Penugasan
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
          /* ============ KONTEN HASIL FETCH API (TODAY ONLY) ============ */
          <div className="grid grid-cols-1 items-start gap-3 animate-in fade-in duration-300 md:grid-cols-12">
            {/* KIRI: RINGKASAN PENUGASAN HARI INI & AKSES JADWAL MULTI-HARI */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white p-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-md shadow-blue-700/30">
                    <FiCalendar size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">
                      Penugasan Hari Ini
                    </p>
                    <p className="text-lg font-black leading-tight text-blue-900">
                      {todayAssignments.length} Trayek
                    </p>
                  </div>
                </div>

                <button
                  onClick={goToScheduleList}
                  title="Lihat Semua Jadwal"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition active:scale-95 hover:bg-blue-100"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>

              {/* CARD BANNER LINK KEU JADWAL BESOK / MULTI-HARI */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-900">
                    Semua Jadwal Penugasan
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-md">
                    {assignments.length} Total
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 leading-tight">
                  Lihat agenda operasional mendatang untuk besok dan lusa.
                </p>
              </div>
            </div>

            {/* KANAN: PENUGASAN & JADWAL HARI INI */}
            <div className="space-y-3 md:col-span-8">
              {/* TRAYEK BERLANGSUNG (ONGOING) HARI INI */}
              {activeTrip && (
                <div className="rounded-2xl border border-blue-100 bg-white p-3 shadow-lg">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-blue-700">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                      Sedang Beroperasi
                    </span>
                    <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                      {activeTrip.vehicle.vehicleCode} •{" "}
                      {activeTrip.vehicle.plateNumber}
                    </span>
                  </div>

                  <h2 className="mt-2 text-[15px] font-black leading-snug text-slate-900">
                    {activeTrip.route.name}
                  </h2>

                  <div className="mt-2 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 p-2.5">
                    <div className="flex flex-col items-center pt-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-700" />
                      <span className="my-0.5 h-4 w-0.5 bg-slate-300" />
                      <FiMapPin size={11} className="text-rose-600" />
                    </div>
                    <div className="space-y-2 text-xs font-bold text-slate-800">
                      <p>
                        Rute {activeTrip.route.code} (
                        {activeTrip.route.direction})
                      </p>
                      <p>
                        Kapasitas: {activeTrip.currentPassengers} /{" "}
                        {activeTrip.vehicle.capacity} Penumpang
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <FiClock size={11} />
                      Jam Mulai: {activeTrip.startTime} WIB (Hari Ini)
                    </span>
                    {activeTrip.conductor && (
                      <span className="font-bold text-blue-700">
                        {activeTrip.conductor.name} (Kondektur)
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openMap(String(activeTrip.id))}
                    disabled={navigatingKey !== null}
                    className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-700/30 transition active:scale-95 disabled:opacity-80"
                  >
                    {navigatingKey === String(activeTrip.id) ? (
                      <>
                        <FiLoader size={14} className="animate-spin" />
                        Membuka peta...
                      </>
                    ) : (
                      <>
                        <FiNavigation size={14} />
                        Buka Peta & Kursi Real-Time
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* DAFTAR PENUGASAN HARI INI */}
              <div className="rounded-2xl border border-white/80 bg-white p-3 shadow-md">
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Penugasan Hari Ini
                  </h2>
                  <button
                    onClick={goToScheduleList}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:underline"
                  >
                    <FiCalendar size={11} />
                    Lihat Semua ({assignments.length})
                  </button>
                </div>

                {todayAssignments.length === 0 ? (
                  <div className="py-8 text-center text-xs font-medium text-slate-400 space-y-2">
                    <p>
                      Belum ada penugasan operasional untuk hari ini (
                      {formatAssignmentDate(todayStr)}).
                    </p>
                    {assignments.length > 0 && (
                      <button
                        onClick={goToScheduleList}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 border border-blue-100 active:scale-95"
                      >
                        <FiList size={12} />
                        Lihat Jadwal Besok / Mendatang
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayAssignments.map((item) => {
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
                                  isOngoing ? "text-blue-900" : "text-slate-800"
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
                              {item.startTime} WIB • {item.vehicle.plateNumber}{" "}
                              ({item.vehicle.vehicleCode})
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
                )}
              </div>
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
