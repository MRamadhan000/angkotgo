"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiTruck,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiEdit3,
  FiMapPin,
  FiNavigation,
  FiActivity,
  FiX,
  FiLogOut,
  FiUser,
  FiLoader,
} from "react-icons/fi";

/* =========================================================
   1. TYPES & DUMMY DATA
   ========================================================= */

export enum AssignmentStatus {
  SCHEDULED = "SCHEDULED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface DriverAssignment {
  id: number;
  vehicleCode: string;
  plateNumber: string;
  routeName: string;
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  date: string;
  status: AssignmentStatus;
  maxCapacity: number;
  conductorName?: string;
}

export interface DriverProfile {
  name: string;
  driverId: string;
  simNumber: string;
  rating: number;
  totalTripsMonth: number;
  photoUrl: string;
}

const DUMMY_DRIVER_PROFILE: DriverProfile = {
  name: "Pak Slamet",
  driverId: "DRV-AL04-MLG",
  simNumber: "SIM-B1-981240129",
  rating: 4.9,
  totalTripsMonth: 48,
  photoUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
};

const DUMMY_TODAY_ASSIGNMENTS: DriverAssignment[] = [
  {
    id: 101,
    vehicleCode: "AL-04",
    plateNumber: "N 1842 UB",
    routeName: "Arjosari - Landungsari",
    origin: "Terminal Arjosari",
    destination: "Terminal Landungsari",
    startTime: "08:00 WIB",
    endTime: "10:15 WIB",
    date: "Hari Ini",
    status: AssignmentStatus.ONGOING,
    maxCapacity: 12,
    conductorName: "Budi (Kondektur)",
  },
  {
    id: 102,
    vehicleCode: "AL-04",
    plateNumber: "N 1842 UB",
    routeName: "Landungsari - Arjosari",
    origin: "Terminal Landungsari",
    destination: "Terminal Arjosari",
    startTime: "13:00 WIB",
    endTime: "15:15 WIB",
    date: "Hari Ini",
    status: AssignmentStatus.SCHEDULED,
    maxCapacity: 12,
  },
  {
    id: 103,
    vehicleCode: "AL-04",
    plateNumber: "N 1842 UB",
    routeName: "Arjosari - Landungsari",
    origin: "Terminal Arjosari",
    destination: "Terminal Landungsari",
    startTime: "16:30 WIB",
    endTime: "18:45 WIB",
    date: "Hari Ini",
    status: AssignmentStatus.SCHEDULED,
    maxCapacity: 12,
  },
];

const DUMMY_HISTORY_TRIPS: DriverAssignment[] = [
  {
    id: 99,
    vehicleCode: "AL-04",
    plateNumber: "N 1842 UB",
    routeName: "Arjosari - Landungsari",
    origin: "Terminal Arjosari",
    destination: "Terminal Landungsari",
    startTime: "06:00 WIB",
    endTime: "07:45 WIB",
    date: "Kemarin",
    status: AssignmentStatus.COMPLETED,
    maxCapacity: 12,
  },
  {
    id: 98,
    vehicleCode: "AL-04",
    plateNumber: "N 1842 UB",
    routeName: "Landungsari - Arjosari",
    origin: "Terminal Landungsari",
    destination: "Terminal Arjosari",
    startTime: "14:00 WIB",
    endTime: "16:00 WIB",
    date: "24 Nov 2026",
    status: AssignmentStatus.COMPLETED,
    maxCapacity: 12,
  },
];

/* =========================================================
   2. HELPER: SKELETON & DELAY
   ========================================================= */

// Blok abu-abu berdenyut sebagai pengganti konten saat loading
function Skel({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

// Simulasi waktu tunggu. Ganti dengan fetch / server action sungguhan.
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/* =========================================================
   3. MAIN COMPONENT
   ========================================================= */

export default function DriverDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DriverProfile>(DUMMY_DRIVER_PROFILE);
  const [todayAssignments] = useState<DriverAssignment[]>(
    DUMMY_TODAY_ASSIGNMENTS,
  );

  // Loading state
  const [isLoading, setIsLoading] = useState(true); // muat halaman awal
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [navigatingKey, setNavigatingKey] = useState<string | null>(null);

  // Modal & Toast State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Form Edit State
  const [editName, setEditName] = useState(profile.name);
  const [editSim, setEditSim] = useState(profile.simNumber);

  const activeTrip = todayAssignments.find(
    (a) => a.status === AssignmentStatus.ONGOING,
  );

  // Muat data awal (simulasi 1 detik)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const openEditProfile = () => {
    setEditName(profile.name);
    setEditSim(profile.simNumber);
    setIsEditProfileOpen(true);
  };

  const openHistory = async () => {
    setIsHistoryModalOpen(true);
    setIsHistoryLoading(true);
    await wait(700);
    setIsHistoryLoading(false);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await wait(900);
    setProfile((prev) => ({ ...prev, name: editName, simNumber: editSim }));
    setIsSaving(false);
    setIsEditProfileOpen(false);
    setToastMessage("Data driver berhasil disimpan.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await wait(800);
    router.push("/login");
  };

  const openMap = (key: string) => {
    if (navigatingKey) return;
    setNavigatingKey(key);
    router.push("/d2");
  };

  return (
    <div className="min-h-dvh w-full bg-slate-100 pb-10 font-sans text-slate-900 antialiased select-none">
      {/* TOAST */}
      {toastMessage && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-3">
          <div className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-900/90 px-3 py-2 text-[11px] font-bold text-emerald-50 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
            <FiCheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span className="min-w-0 flex-1">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="shrink-0 text-white/60 hover:text-white"
            >
              <FiX size={13} />
            </button>
          </div>
        </div>
      )}

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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white shadow-md shadow-blue-700/30">
                      <FiUser size={19} />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div className="flex min-w-0 flex-col items-start gap-1">
                    <h1 className="max-w-full truncate text-sm font-black leading-tight tracking-tight text-slate-900">
                      {profile.name}
                    </h1>
                    <span className="rounded-md border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-blue-700">
                      Driver
                    </span>
                  </div>
                </>
              )}
            </div>

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

          {/* Baris 2: aksi */}
          <div className="grid grid-cols-2 gap-0.5 rounded-xl bg-slate-100/80 p-0.5">
            <button
              onClick={openHistory}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold text-slate-600 transition active:scale-95 active:bg-white disabled:opacity-50"
            >
              <FiActivity size={13} className="text-blue-700" />
              Riwayat Perjalanan
            </button>
            <button
              onClick={openEditProfile}
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
              {/* skeleton kartu penugasan */}
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

              {/* skeleton jadwal */}
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
        ) : (
          /* ============ KONTEN ASLI ============ */
          <div className="grid grid-cols-1 items-start gap-3 animate-in fade-in duration-300 md:grid-cols-12">
            {/* KIRI: RINGKASAN */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white p-3 shadow-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-md shadow-blue-700/30">
                  <FiCalendar size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Jadwal Hari Ini
                  </p>
                  <p className="text-lg font-black leading-tight text-blue-900">
                    {todayAssignments.length} Trayek
                  </p>
                </div>
              </div>
            </div>

            {/* KANAN: PENUGASAN & JADWAL */}
            <div className="space-y-3 md:col-span-8">
              {/* TRAYEK BERLANGSUNG */}
              {activeTrip && (
                <div className="rounded-2xl border border-blue-100 bg-white p-3 shadow-lg">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-blue-700">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                      Sedang Beroperasi
                    </span>
                    <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                      {activeTrip.vehicleCode} • {activeTrip.plateNumber}
                    </span>
                  </div>

                  <h2 className="mt-2 text-[15px] font-black leading-snug text-slate-900">
                    {activeTrip.routeName}
                  </h2>

                  <div className="mt-2 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 p-2.5">
                    <div className="flex flex-col items-center pt-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-700" />
                      <span className="my-0.5 h-4 w-0.5 bg-slate-300" />
                      <FiMapPin size={11} className="text-rose-600" />
                    </div>
                    <div className="space-y-2 text-xs font-bold text-slate-800">
                      <p>{activeTrip.origin}</p>
                      <p>{activeTrip.destination}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <FiClock size={11} />
                      {activeTrip.startTime} - {activeTrip.endTime}
                    </span>
                    {activeTrip.conductorName && (
                      <span className="font-bold text-blue-700">
                        {activeTrip.conductorName}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openMap("active")}
                    disabled={navigatingKey !== null}
                    className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-700/30 transition active:scale-95 disabled:opacity-80"
                  >
                    {navigatingKey === "active" ? (
                      <>
                        <FiLoader size={14} className="animate-spin" />
                        Membuka peta...
                      </>
                    ) : (
                      <>
                        <FiNavigation size={14} />
                        Buka Peta & Kursi
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* JADWAL HARI INI */}
              <div className="rounded-2xl border border-white/80 bg-white p-3 shadow-md">
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Jadwal Hari Ini
                  </h2>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                    <FiCalendar size={11} />
                    Rabu, 25 Nov 2026
                  </span>
                </div>

                <div className="space-y-2">
                  {todayAssignments.map((item) => {
                    const isOngoing = item.status === AssignmentStatus.ONGOING;
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
                              {item.routeName}
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
                            {item.origin} → {item.destination}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                            <FiClock size={10} />
                            {item.startTime} - {item.endTime} •{" "}
                            {item.plateNumber}
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
                Anda perlu masuk lagi untuk membuka jadwal dan peta.
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

      {/* ---------------------------------------------------------
         MODAL EDIT PROFIL
      --------------------------------------------------------- */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150 sm:items-center sm:p-4">
          <div className="max-h-[90dvh] w-full max-w-sm space-y-3 overflow-y-auto rounded-t-3xl border border-slate-100 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FiUser className="h-4 w-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Edit Data Driver
                </h3>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                disabled={isSaving}
                className="rounded-lg p-1 text-slate-400 disabled:opacity-50"
              >
                <FiX size={17} />
              </button>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
                  Nama Driver
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isSaving}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold outline-none focus:border-blue-600 disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
                  Nomor SIM B1
                </label>
                <input
                  type="text"
                  value={editSim}
                  onChange={(e) => setEditSim(e.target.value)}
                  disabled={isSaving}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold outline-none focus:border-blue-600 disabled:opacity-60"
                  required
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  disabled={isSaving}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-700 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-700/20 active:scale-95 disabled:opacity-80"
                >
                  {isSaving ? (
                    <>
                      <FiLoader size={13} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
         MODAL RIWAYAT TRIPS
      --------------------------------------------------------- */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150 sm:items-center sm:p-4">
          <div className="flex max-h-[75dvh] w-full max-w-md flex-col space-y-3 rounded-t-3xl border border-slate-100 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FiActivity className="h-4 w-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Riwayat Perjalanan
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="rounded-lg p-1 text-slate-400"
              >
                <FiX size={17} />
              </button>
            </div>

            <div
              className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain"
              aria-busy={isHistoryLoading}
            >
              {isHistoryLoading
                ? [0, 1].map((i) => (
                    <div
                      key={i}
                      className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <Skel className="h-3 w-28" />
                        <Skel className="h-4 w-14" />
                      </div>
                      <Skel className="h-3.5 w-40" />
                      <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                        <Skel className="h-3 w-16" />
                        <Skel className="h-3 w-28" />
                      </div>
                    </div>
                  ))
                : DUMMY_HISTORY_TRIPS.map((item) => (
                    <div
                      key={item.id}
                      className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-2.5 animate-in fade-in duration-300"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-800">
                          {item.vehicleCode} • {item.plateNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-px text-[9px] font-extrabold text-emerald-800">
                          <FiCheckCircle size={9} />
                          Selesai
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900">
                        {item.routeName}
                      </p>

                      <div className="flex items-center justify-between border-t border-slate-200 pt-1 text-[10px] text-slate-500">
                        <span>{item.date}</span>
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}