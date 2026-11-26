"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import {
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiPlus,
  FiDollarSign,
  FiRefreshCw,
  FiAlertCircle,
  FiShield,
  FiPlay,
  FiList,
  FiGrid,
  FiChevronRight,
  FiCheck,
  FiMinus,
  FiUserCheck,
  FiUserX,
  FiCreditCard,
  FiLock,
  FiAlertTriangle,
  FiX,
  FiCompass,
  FiArrowLeft,
  FiMapPin,
  FiChevronsUp,
  FiChevronsDown,
  FiTrendingUp,
} from "react-icons/fi";

/* =========================================================
1. TYPES & INTERFACES
   ========================================================= */

export enum AssignmentStatus {
  SCHEDULED = "SCHEDULED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
}

export type PaymentMethod = "QRIS" | "CASH";

export interface PassengerPayment {
  id: string;
  amount: number; // Flat Rp 5.000 per kursi
  method: PaymentMethod;
  timestamp: string;
  seatsCount: number;
}

export interface RouteStop {
  id: string;
  name: string;
  eta: string;
  isPassed: boolean;
  isNextStop?: boolean;
}

export interface DriverObservationState {
  assignmentId: number;
  vehicleCode: string;
  plateNumber: string;
  driverName: string;
  routeName: string;
  status: AssignmentStatus;
  maxCapacity: number;
  availableSeats: number;
  currentPassengers: number;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  stops: RouteStop[];
  payments: PassengerPayment[];
}

type DriverTab = "stops" | "seats" | "finance";

/* =========================================================
2. INITIAL DUMMY DATA
   ========================================================= */

const FIXED_FARE = 5000; // Harga flat Rp 5.000 per kursi

const SHEET_COLLAPSED_H = 88;
const SHEET_HALF_RATIO = 0.5;

// Data dummy transaksi riil campuran QRIS dan CASH
const DUMMY_PAYMENTS: PassengerPayment[] = [
  {
    id: "PAY-1005",
    amount: 10000,
    method: "QRIS",
    timestamp: "08:24",
    seatsCount: 2,
  },
  {
    id: "PAY-1004",
    amount: 5000,
    method: "CASH",
    timestamp: "08:15",
    seatsCount: 1,
  },
  {
    id: "PAY-1003",
    amount: 15000,
    method: "QRIS",
    timestamp: "08:08",
    seatsCount: 3,
  },
  {
    id: "PAY-1002",
    amount: 5000,
    method: "CASH",
    timestamp: "08:02",
    seatsCount: 1,
  },
  {
    id: "PAY-1001",
    amount: 10000,
    method: "QRIS",
    timestamp: "07:58",
    seatsCount: 2,
  },
];

const INITIAL_DRIVER_DATA: DriverObservationState = {
  assignmentId: 101,
  vehicleCode: "AL-04",
  plateNumber: "N 1842 UB",
  driverName: "Pak Slamet Sugiono",
  routeName: "Arjosari - Landungsari (Via Suhat)",
  status: AssignmentStatus.ONGOING, // Set ONGOING untuk mempermudah testing UI
  maxCapacity: 12,
  availableSeats: 3, // 12 - 9 penumpang dari dummy
  currentPassengers: 9,
  currentLocation: {
    lat: -7.9523,
    lng: 112.6138,
    address: "Jl. Soekarno Hatta No. 9, Malang",
  },
  stops: [
    {
      id: "ST-1",
      name: "Terminal Arjosari",
      eta: "08:00",
      isPassed: true,
      isNextStop: false,
    },
    {
      id: "ST-2",
      name: "Halte RS Puri Bunda",
      eta: "08:12",
      isPassed: true,
      isNextStop: false,
    },
    {
      id: "ST-3",
      name: "Halte Polinema (Suhat)",
      eta: "08:25",
      isPassed: false,
      isNextStop: true,
    },
    {
      id: "ST-4",
      name: "Halte Universitas Brawijaya",
      eta: "08:35",
      isPassed: false,
    },
    { id: "ST-5", name: "Halte UMM Kampus 3", eta: "08:50", isPassed: false },
    { id: "ST-6", name: "Terminal Landungsari", eta: "09:05", isPassed: false },
  ],
  payments: DUMMY_PAYMENTS,
};

/* =========================================================
3. MAIN COMPONENT
   ========================================================= */

export default function DriverObservationPage() {
  const router = useRouter();
  const [driverData, setDriverData] =
    useState<DriverObservationState>(INITIAL_DRIVER_DATA);
  const [activeTab, setActiveTab] = useState<DriverTab>("finance");

  // GPS & Modal State
  const [isGpsModalOpen, setIsGpsModalOpen] = useState<boolean>(false);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Status Change Modal State
  const [pendingStatus, setPendingStatus] = useState<AssignmentStatus | null>(
    null,
  );
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);

  // Snackbar Toast State
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "info" | "success" | "warning";
  } | null>(null);

  // Form Bayar Cash State
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState<boolean>(false);
  const [newPaySeats, setNewPaySeats] = useState<number>(1);

  // Bottom Sheet Drag State
  const [maxSheetH, setMaxSheetH] = useState<number>(360);
  const [sheetH, setSheetH] = useState<number>(360);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragRef = useRef({
    startY: 0,
    startH: 0,
    lastY: 0,
    lastT: 0,
    velocity: 0,
    moved: false,
  });

  // Google Maps Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const watchPositionId = useRef<number | null>(null);

  const isDrivingMode = driverData.status === AssignmentStatus.ONGOING;
  const isOperationalLocked = !isDrivingMode;
  const nextStop = driverData.stops.find((s) => s.isNextStop);

  /* ---------------------------------------------------------
     BOTTOM SHEET LAYOUT HANDLERS
  --------------------------------------------------------- */
  const winH = useRef(0);

  useEffect(() => {
    const full = window.innerHeight;
    winH.current = full;
    setMaxSheetH(full);
    setSheetH(Math.round(full * SHEET_HALF_RATIO));

    const onResize = () => {
      const newFull = window.innerHeight;
      const oldFull = winH.current || newFull;
      winH.current = newFull;
      setMaxSheetH(newFull);
      setSheetH((prev) => {
        if (prev <= SHEET_COLLAPSED_H + 4) return SHEET_COLLAPSED_H;
        return prev / oldFull > 0.75
          ? newFull
          : Math.round(newFull * SHEET_HALF_RATIO);
      });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  const halfSheetH = Math.round(maxSheetH * SHEET_HALF_RATIO);
  const getSnaps = () => [SHEET_COLLAPSED_H, halfSheetH, maxSheetH];
  const nearestSnapIndex = (h: number) => {
    const snaps = getSnaps();
    let best = 0;
    snaps.forEach((v, i) => {
      if (Math.abs(v - h) < Math.abs(snaps[best] - h)) best = i;
    });
    return best;
  };

  const isSheetCollapsed = sheetH <= SHEET_COLLAPSED_H + 4;
  const isSheetFull = sheetH >= maxSheetH - 4;

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startY: e.clientY,
      startH: sheetH,
      lastY: e.clientY,
      lastT: performance.now(),
      velocity: 0,
      moved: false,
    };
    setIsDragging(true);
  };

  const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const d = dragRef.current;
    const delta = d.startY - e.clientY;

    if (Math.abs(delta) > 4) d.moved = true;

    const now = performance.now();
    d.velocity = (d.lastY - e.clientY) / Math.max(1, now - d.lastT);
    d.lastY = e.clientY;
    d.lastT = now;

    setSheetH(clamp(d.startH + delta, SHEET_COLLAPSED_H, maxSheetH));
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const d = dragRef.current;
    const snaps = getSnaps();

    if (!d.moved) {
      setSheetH(snaps[(nearestSnapIndex(sheetH) + 1) % 3]);
      return;
    }

    if (Math.abs(d.velocity) > 0.5) {
      const next = clamp(
        nearestSnapIndex(d.startH) + (d.velocity > 0 ? 1 : -1),
        0,
        2,
      );
      setSheetH(snaps[next]);
      return;
    }

    setSheetH(snaps[nearestSnapIndex(sheetH)]);
  };

  const toggleFull = () =>
    setSheetH(isSheetFull ? SHEET_COLLAPSED_H : maxSheetH);

  const selectTab = (tab: DriverTab) => {
    setActiveTab(tab);
    if (isSheetCollapsed) setSheetH(halfSheetH);
  };

  /* ---------------------------------------------------------
     TOAST HELPER
  --------------------------------------------------------- */
  const showToast = (
    text: string,
    type: "info" | "success" | "warning" = "info",
  ) => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  /* ---------------------------------------------------------
     GOOGLE MAPS INITIALIZATION
  --------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey || !mapRef.current) return;

      try {
        setOptions({ key: apiKey, v: "weekly" });
        const { Map } = (await importLibrary(
          "maps",
        )) as google.maps.MapsLibrary;

        if (cancelled || !mapRef.current) return;

        const initialPos = {
          lat: driverData.currentLocation.lat,
          lng: driverData.currentLocation.lng,
        };

        mapInstance.current = new Map(mapRef.current, {
          center: initialPos,
          zoom: 16,
          disableDefaultUI: true,
          zoomControl: false,
        });

        markerInstance.current = new google.maps.Marker({
          map: mapInstance.current,
          position: initialPos,
          title: driverData.vehicleCode,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#1d4ed8",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        });
      } catch (err) {
        console.error("Gagal memuat Google Maps:", err);
      }
    }

    initMap();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateMapPosition = (lat: number, lng: number) => {
    const newPos = { lat, lng };
    if (markerInstance.current) markerInstance.current.setPosition(newPos);
    if (mapInstance.current) mapInstance.current.panTo(newPos);
  };

  /* ---------------------------------------------------------
     GPS HANDLER
  --------------------------------------------------------- */
  const requestGpsAccess = () => {
    if (!navigator.geolocation) {
      setGpsError("Browser tidak mendukung fitur GPS.");
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setIsLocating(false);
        setIsGpsActive(true);
        setIsGpsModalOpen(false);

        setDriverData((prev) => ({
          ...prev,
          currentLocation: {
            ...prev.currentLocation,
            lat: latitude,
            lng: longitude,
            address: "Lokasi GPS Terdeteksi",
          },
        }));
        updateMapPosition(latitude, longitude);

        watchPositionId.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            const { latitude: wLat, longitude: wLng } = watchPos.coords;
            setDriverData((prev) => ({
              ...prev,
              currentLocation: {
                ...prev.currentLocation,
                lat: wLat,
                lng: wLng,
              },
            }));
            updateMapPosition(wLat, wLng);
          },
          (err) => console.warn("GPS Warning:", err.message),
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 },
        );
      },
      () => {
        setIsLocating(false);
        setGpsError("Izin lokasi ditolak. Aktifkan GPS untuk melanjutkan.");
      },
      { enableHighAccuracy: true },
    );
  };

  useEffect(() => {
    return () => {
      if (watchPositionId.current !== null) {
        navigator.geolocation.clearWatch(watchPositionId.current);
      }
    };
  }, []);

  /* ---------------------------------------------------------
     STATUS CHANGE FLOW
  --------------------------------------------------------- */
  const triggerStatusChangeRequest = (targetStatus: AssignmentStatus) => {
    if (driverData.status === targetStatus) return;
    setPendingStatus(targetStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (!pendingStatus) return;

    setDriverData((prev) => ({ ...prev, status: pendingStatus }));
    setIsStatusModalOpen(false);

    if (pendingStatus === AssignmentStatus.ONGOING) {
      setSheetH(SHEET_COLLAPSED_H);
      if (mapInstance.current) {
        mapInstance.current.setZoom(17);
        mapInstance.current.panTo({
          lat: driverData.currentLocation.lat,
          lng: driverData.currentLocation.lng,
        });
      }
      showToast("Mode jalan aktif. Hati-hati di jalan!", "info");
    } else if (pendingStatus === AssignmentStatus.COMPLETED) {
      showToast(
        "Trayek selesai! Terima kasih atas pelayanan Anda.",
        "success",
      );
    } else if (pendingStatus === AssignmentStatus.SCHEDULED) {
      showToast("Status diubah ke Dijadwalkan.", "warning");
    }

    setPendingStatus(null);
  };

  /* ---------------------------------------------------------
     TRANSACTION CALCULATIONS
  --------------------------------------------------------- */
  const handleAddCashPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const seatsToBook = Math.max(1, newPaySeats);
    const totalCost = seatsToBook * FIXED_FARE;

    const newEntry: PassengerPayment = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      amount: totalCost,
      method: "CASH",
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      seatsCount: seatsToBook,
    };

    setDriverData((prev) => {
      const nextAvailable = Math.max(0, prev.availableSeats - seatsToBook);
      return {
        ...prev,
        availableSeats: nextAvailable,
        currentPassengers: prev.maxCapacity - nextAvailable,
        payments: [newEntry, ...prev.payments],
      };
    });

    setNewPaySeats(1);
    setIsAddPaymentOpen(false);
    showToast(
      `Pembayaran Cash ${seatsToBook} kursi (Rp ${totalCost.toLocaleString("id-ID")}) berhasil dicatat.`,
      "success",
    );
  };

  // Breakdown Finansial Pemasukan
  const financialSummary = useMemo(() => {
    const total = driverData.payments.reduce((sum, p) => sum + p.amount, 0);
    const qris = driverData.payments
      .filter((p) => p.method === "QRIS")
      .reduce((sum, p) => sum + p.amount, 0);
    const cash = driverData.payments
      .filter((p) => p.method === "CASH")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalSeatsPaid = driverData.payments.reduce(
      (sum, p) => sum + p.seatsCount,
      0,
    );

    return { total, qris, cash, totalSeatsPaid };
  }, [driverData.payments]);

  /* =========================================================
4. RENDER UI
   ========================================================= */
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased select-none">
      {/* MAP BACKGROUND */}
      <div
        ref={mapRef}
        className="absolute inset-0 z-0 h-full w-full bg-slate-200"
      />

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-3"
          style={isSheetFull ? { top: 12 } : { bottom: sheetH + 10 }}
        >
          <div
            className={`pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold shadow-xl backdrop-blur-md ${
              toastMessage.type === "success"
                ? "bg-emerald-900/90 text-emerald-50 border-emerald-700"
                : toastMessage.type === "warning"
                  ? "bg-amber-900/90 text-amber-50 border-amber-700"
                  : "bg-blue-900/90 text-blue-50 border-blue-700"
            }`}
          >
            {toastMessage.type === "success" && (
              <FiCheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            )}
            {toastMessage.type === "warning" && (
              <FiAlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            )}
            {toastMessage.type === "info" && (
              <FiPlay className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            )}
            <span className="min-w-0 flex-1">{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="shrink-0 text-white/60 hover:text-white"
            >
              <FiX size={13} />
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header
        className={`absolute inset-x-0 top-0 z-20 mx-auto w-full max-w-md px-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] transition-all duration-300 ${
          isDrivingMode
            ? "pointer-events-none -translate-y-[130%] opacity-0"
            : "translate-y-0 opacity-100"
        }`}
        aria-hidden={isDrivingMode}
      >
        <div className="space-y-2 rounded-2xl border border-white/80 bg-white/95 p-2.5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button
                onClick={() => router.back()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition active:scale-95"
                title="Kembali"
              >
                <FiArrowLeft size={16} />
              </button>

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-md shadow-blue-700/30">
                  <FiTruck size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-black leading-none tracking-tight text-slate-900">
                      {driverData.vehicleCode}
                    </span>
                    <span className="shrink-0 rounded border border-slate-200 bg-slate-100 px-1 py-px text-[9px] font-bold text-slate-700">
                      {driverData.plateNumber}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-500">
                    {driverData.routeName}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsGpsModalOpen(true)}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold transition ${
                isGpsActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700 animate-pulse"
              }`}
            >
              <FiCompass
                className={`h-3 w-3 ${isGpsActive ? "text-emerald-600" : "text-rose-600"}`}
              />
              {isGpsActive ? "GPS On" : "GPS Off"}
            </button>
          </div>

          {/* STATUS STEPPER */}
          <div className="flex items-center justify-between rounded-xl bg-slate-100/80 p-0.5">
            <button
              onClick={() =>
                triggerStatusChangeRequest(AssignmentStatus.SCHEDULED)
              }
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold transition active:scale-95 ${
                driverData.status === AssignmentStatus.SCHEDULED
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <FiClock size={11} />
              Jadwal
            </button>

            <FiChevronRight className="mx-0.5 h-3 w-3 shrink-0 text-slate-400" />

            <button
              onClick={() =>
                triggerStatusChangeRequest(AssignmentStatus.ONGOING)
              }
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold transition active:scale-95 ${
                driverData.status === AssignmentStatus.ONGOING
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <FiPlay size={11} />
              Mulai Jalan
            </button>

            <FiChevronRight className="mx-0.5 h-3 w-3 shrink-0 text-slate-400" />

            <button
              onClick={() =>
                triggerStatusChangeRequest(AssignmentStatus.COMPLETED)
              }
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold transition active:scale-95 ${
                driverData.status === AssignmentStatus.COMPLETED
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <FiCheckCircle size={11} />
              Selesai
            </button>
          </div>
        </div>
      </header>

      {/* GPS BUTTON IN DRIVING MODE */}
      {isDrivingMode && (
        <button
          onClick={() => setIsGpsModalOpen(true)}
          aria-label="Status GPS"
          className="absolute right-2.5 top-[max(0.5rem,env(safe-area-inset-top))] z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 shadow-lg backdrop-blur-xl"
        >
          <FiCompass
            className={`h-4 w-4 ${isGpsActive ? "text-emerald-600" : "text-rose-600 animate-pulse"}`}
          />
        </button>
      )}

      {/* BOTTOM SHEET */}
      <section
        className="absolute inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-md flex-col rounded-t-3xl border-t border-slate-100 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.16)]"
        style={{
          height: sheetH,
          transition: isDragging
            ? "none"
            : "height 260ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* HANDLE + DRAG TOGGLE */}
        <div
          className="flex shrink-0 items-center justify-between px-3 pb-1 pt-2"
          style={
            isSheetFull
              ? { paddingTop: "calc(0.5rem + env(safe-area-inset-top))" }
              : undefined
          }
        >
          <span className="w-8" />
          <div
            role="button"
            aria-label="Geser panel"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            className="flex h-8 flex-1 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
          >
            <div className="h-1 w-10 rounded-full bg-slate-300" />
          </div>

          <button
            onClick={toggleFull}
            aria-label={isSheetFull ? "Turunkan panel" : "Buka panel penuh"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition active:scale-90"
          >
            {isSheetFull ? (
              <FiChevronsDown size={18} />
            ) : (
              <FiChevronsUp size={18} />
            )}
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="shrink-0 px-3 pb-2">
          <div className="grid grid-cols-3 gap-0.5 rounded-xl bg-slate-100 p-0.5">
            {(
              [
                { key: "stops", label: "Halte", icon: <FiList size={13} /> },
                {
                  key: "seats",
                  label: `Seat (${driverData.availableSeats})`,
                  icon: <FiGrid size={13} />,
                },
                {
                  key: "finance",
                  label: "Uang",
                  icon: <FiDollarSign size={13} />,
                },
              ] as { key: DriverTab; label: string; icon: React.ReactNode }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => selectTab(tab.key)}
                className={`flex items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-bold transition active:scale-95 ${
                  activeTab === tab.key
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="relative min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-0.5">
          {/* DRIVING MODE BANNER */}
          {isDrivingMode && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <FiMapPin className="h-4 w-4 shrink-0 text-blue-700" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500">
                    Halte berikutnya
                  </p>
                  <p className="truncate text-xs font-bold text-blue-900">
                    {nextStop ? `${nextStop.name} • ${nextStop.eta}` : "-"}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  triggerStatusChangeRequest(AssignmentStatus.COMPLETED)
                }
                className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm active:scale-95"
              >
                Selesai
              </button>
            </div>
          )}

          {/* LOCKED OPERATIONAL BANNER */}
          {isOperationalLocked && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                  <FiLock size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-amber-900">
                    {driverData.status === AssignmentStatus.SCHEDULED
                      ? "Masih Dijadwalkan"
                      : "Perjalanan Selesai"}
                  </p>
                  <p className="text-[10px] leading-tight text-amber-700">
                    {driverData.status === AssignmentStatus.SCHEDULED
                      ? "Tekan 'Mulai Jalan' untuk membuka akses"
                      : "Trayek ditutup, tidak menerima transaksi"}
                  </p>
                </div>
              </div>

              {driverData.status === AssignmentStatus.SCHEDULED && (
                <button
                  onClick={() =>
                    triggerStatusChangeRequest(AssignmentStatus.ONGOING)
                  }
                  className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-black text-white shadow-xs"
                >
                  Jalan
                </button>
              )}
            </div>
          )}

          {/* TAB 1: HALTE */}
          {activeTab === "stops" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Rute & Halte
                </h3>
                <span className="text-[10px] font-semibold text-slate-500">
                  {driverData.stops.filter((s) => s.isPassed).length} /{" "}
                  {driverData.stops.length} Halte
                </span>
              </div>

              <div className="relative my-1 ml-2.5 space-y-2.5 border-l-2 border-slate-200">
                {driverData.stops.map((stop) => (
                  <div key={stop.id} className="relative pl-5">
                    <span
                      className={`absolute -left-[8px] top-2 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white ${
                        stop.isPassed
                          ? "bg-slate-400"
                          : stop.isNextStop
                            ? "bg-blue-600 animate-pulse"
                            : "bg-slate-200"
                      }`}
                    >
                      {stop.isPassed && (
                        <FiCheck className="h-2 w-2 text-white" />
                      )}
                    </span>

                    <div
                      className={`flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 ${
                        stop.isNextStop
                          ? "border-blue-200 bg-blue-50/70"
                          : "border-slate-100 bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <p
                            className={`text-[11px] font-bold ${
                              stop.isNextStop
                                ? "text-blue-900"
                                : stop.isPassed
                                  ? "text-slate-400 line-through"
                                  : "text-slate-700"
                            }`}
                          >
                            {stop.name}
                          </p>
                          {stop.isNextStop && (
                            <span className="rounded-full bg-blue-600 px-1.5 py-px text-[8px] font-extrabold text-white">
                              Berikutnya
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-medium text-slate-400">
                          Tiba: {stop.eta}
                        </p>
                      </div>
                      <FiChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SEATS */}
          {activeTab === "seats" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-2.5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Kapasitas Angkot
                  </p>
                  <p className="text-sm font-black text-blue-900">
                    {driverData.currentPassengers} Terisi /{" "}
                    {driverData.maxCapacity}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-800">
                  {driverData.availableSeats} Kosong
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Kursi Terisi
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Tap nomor untuk update
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {Array.from({ length: driverData.maxCapacity }, (_, i) => {
                    const seatNumber = i + 1;
                    const isOccupied =
                      seatNumber <= driverData.currentPassengers;

                    return (
                      <button
                        key={seatNumber}
                        type="button"
                        disabled={isOperationalLocked}
                        onClick={() => {
                          const newPassengers = seatNumber;
                          const newAvailable = Math.max(
                            0,
                            driverData.maxCapacity - newPassengers,
                          );

                          setDriverData((prev) => ({
                            ...prev,
                            currentPassengers: newPassengers,
                            availableSeats: newAvailable,
                          }));
                        }}
                        className={`flex flex-col items-center justify-center rounded-xl border py-1.5 transition-all ${
                          isOperationalLocked
                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-50"
                            : isOccupied
                              ? "border-blue-700 bg-blue-700 text-white shadow-sm active:scale-95"
                              : "border-slate-200 bg-slate-50 text-slate-400 active:scale-95"
                        }`}
                      >
                        {isOccupied ? (
                          <FiUserCheck className="h-4 w-4 text-white" />
                        ) : (
                          <FiUserX className="h-4 w-4 text-slate-300" />
                        )}
                        <span className="mt-0.5 text-[10px] font-black">
                          {seatNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={isOperationalLocked}
                onClick={() =>
                  setDriverData((prev) => ({
                    ...prev,
                    currentPassengers: 0,
                    availableSeats: prev.maxCapacity,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-[11px] font-bold text-slate-600 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset (Semua Kursi Kosong)
              </button>
            </div>
          )}

          {/* TAB 3: UANG & TRANSAKSI */}
          {activeTab === "finance" && (
            <div className="space-y-3">
              {/* CARD TOTAL UTAMA & ACTION TOMBOL CASH */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                      <FiDollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        Total Pemasukan Operasional
                      </p>
                      <p className="text-lg font-black text-emerald-950 leading-tight">
                        Rp {financialSummary.total.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isOperationalLocked}
                    onClick={() => setIsAddPaymentOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-emerald-700 transition"
                  >
                    <FiPlus size={14} />
                    <span>+ Cash</span>
                  </button>
                </div>

                {/* BREAKDOWN SUB-TOTAL (QRIS VS CASH) */}
                <div className="grid grid-cols-2 gap-2 border-t border-emerald-200/60 pt-2.5">
                  <div className="rounded-xl border border-blue-100 bg-white p-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 mb-0.5">
                      <span className="flex items-center gap-1">
                        <FiCreditCard size={11} /> QRIS (Digital)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-black text-slate-900">
                      Rp {financialSummary.qris.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-white p-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-800 mb-0.5">
                      <span className="flex items-center gap-1">
                        <FiDollarSign size={11} /> Cash (Tunai)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-black text-slate-900">
                      Rp {financialSummary.cash.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>

              {/* LIST RIWAYAT BAYAR */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Riwayat Pembayaran Kursi
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500">
                    {financialSummary.totalSeatsPaid} Kursi Terbayar
                  </span>
                </div>

                {driverData.payments.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <p className="text-xs font-bold text-slate-600">Belum Ada Transaksi</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Transaksi QRIS atau pencatatan tunai akan muncul di sini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {driverData.payments.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-xs transition hover:border-slate-300"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${
                              item.method === "QRIS"
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}
                          >
                            {item.method === "QRIS" ? (
                              <FiCreditCard size={16} />
                            ) : (
                              <FiDollarSign size={16} />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900">
                                Transaksi #{driverData.payments.length - idx}
                              </p>
                              <span
                                className={`rounded px-1.5 py-px text-[9px] font-extrabold uppercase ${
                                  item.method === "QRIS"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {item.method}
                              </span>
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                              Pukul {item.timestamp} • {item.seatsCount} Kursi
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-black text-slate-900">
                            Rp {item.amount.toLocaleString("id-ID")}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400">
                            @ Rp 5.000 / kursi
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
5. MODAL KONFIRMASI STATUS
      ========================================================= */}
      {isStatusModalOpen && pendingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-h-[90dvh] w-full max-w-xs space-y-4 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-2xl animate-in zoom-in-95 duration-150">
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                pendingStatus === AssignmentStatus.ONGOING
                  ? "bg-blue-50 text-blue-600"
                  : pendingStatus === AssignmentStatus.COMPLETED
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
              }`}
            >
              {pendingStatus === AssignmentStatus.ONGOING && (
                <FiPlay size={24} />
              )}
              {pendingStatus === AssignmentStatus.COMPLETED && (
                <FiCheckCircle size={24} />
              )}
              {pendingStatus === AssignmentStatus.SCHEDULED && (
                <FiClock size={24} />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {pendingStatus === AssignmentStatus.ONGOING
                  ? "Mulai Jalan?"
                  : pendingStatus === AssignmentStatus.COMPLETED
                    ? "Selesaikan Perjalanan?"
                    : "Ubah ke Dijadwalkan?"}
              </h3>
              <p className="text-[11px] leading-relaxed text-slate-500">
                {pendingStatus === AssignmentStatus.ONGOING
                  ? "Posisi armada akan dipantau penumpang dan fitur kursi aktif."
                  : pendingStatus === AssignmentStatus.COMPLETED
                    ? "Perjalanan akan ditutup. Pastikan semua penumpang sudah turun."
                    : "Fitur kursi & transaksi akan dikunci kembali."}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsStatusModalOpen(false);
                  setPendingStatus(null);
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmStatusChange}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold text-white shadow-md active:scale-95 ${
                  pendingStatus === AssignmentStatus.ONGOING
                    ? "bg-blue-700"
                    : pendingStatus === AssignmentStatus.COMPLETED
                      ? "bg-emerald-600"
                      : "bg-amber-600"
                }`}
              >
                Ya, Lanjut
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
6. MODAL GPS
      ========================================================= */}
      {isGpsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90dvh] w-full max-w-xs space-y-4 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <FiCompass size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Aktifkan GPS Armada
              </h3>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Lokasi Anda akan tampil real-time di peta penumpang AngkotGo.
              </p>
            </div>

            {gpsError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-left text-[11px] text-rose-700">
                <FiAlertCircle size={14} className="shrink-0 text-rose-600" />
                <span>{gpsError}</span>
              </div>
            )}

            <button
              onClick={requestGpsAccess}
              disabled={isLocating}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-700/30 transition active:scale-95 disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <FiRefreshCw size={14} className="animate-spin" />
                  Mencari Posisi...
                </>
              ) : (
                <>
                  <FiShield size={14} />
                  Izinkan GPS
                </>
              )}
            </button>

            {isGpsActive && (
              <button
                onClick={() => setIsGpsModalOpen(false)}
                className="w-full text-[11px] font-bold text-slate-500"
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
7. MODAL BAYAR CASH (INPUT TUNAI)
      ========================================================= */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-xs sm:items-center sm:p-4">
          <div className="max-h-[90dvh] w-full max-w-sm space-y-3 overflow-y-auto rounded-t-3xl border border-slate-100 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FiDollarSign className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Catat Pembayaran Tunai (Cash)
                </h3>
              </div>
              <button
                onClick={() => setIsAddPaymentOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                <FiX size={17} />
              </button>
            </div>

            <form onSubmit={handleAddCashPayment} className="space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
                  Jumlah Kursi Terpakai
                </label>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setNewPaySeats((prev) => Math.max(1, prev - 1))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 active:scale-95"
                  >
                    <FiMinus size={15} />
                  </button>
                  <span className="text-sm font-black text-slate-800">
                    {newPaySeats} Kursi
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewPaySeats((prev) =>
                        Math.min(driverData.availableSeats, prev + 1),
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 active:scale-95"
                  >
                    <FiPlus size={15} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between gap-2 rounded-xl bg-amber-50 p-2.5 text-[11px] font-bold text-amber-900 border border-amber-200">
                <span>Total Bayar Tunai ({newPaySeats} x Rp 5.000)</span>
                <span className="shrink-0 font-black">
                  Rp {(newPaySeats * FIXED_FARE).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/20 active:scale-95 hover:bg-amber-700 transition"
                >
                  Simpan Cash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}