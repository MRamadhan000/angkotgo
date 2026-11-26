"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
  FiNavigation,
  FiTarget,
} from "react-icons/fi";

/* =========================================================
1. TYPES
   ========================================================= */

export enum AssignmentStatus {
  SCHEDULED = "SCHEDULED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export type PaymentMethod = "QRIS" | "CASH";

interface ApiPayment {
  id: string;
  vehicleAssignmentId: number;
  amount: string;
  paymentMethod: PaymentMethod;
  transactionId: string | null;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiRoute {
  id: number;
  code: string;
  name: string;
  direction: string;
  color: string;
  encodedPolyline: string;
  totalDistanceMeters: number;
  isActive: boolean;
}

interface ApiVehicle {
  id: number;
  plateNumber: string;
  vehicleCode: string;
  capacity: number;
  type: string;
  status: string;
}

interface ApiPerson {
  id: number;
  name: string;
  phone: string;
}

interface VehicleAssignment {
  id: number;
  routeId: number;
  vehicleId: number;
  driverId: number;
  conductorId: number | null;
  startTime: string;
  status: AssignmentStatus;
  currentPassengers: number;
  assignmentDate: string;
  route: ApiRoute;
  vehicle: ApiVehicle;
  driver: ApiPerson;
  conductor: ApiPerson | null;
  payments: ApiPayment[];
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface UpdateAssignmentBody {
  status?: AssignmentStatus;
  currentPassengers?: number;
}

interface CreatePaymentBody {
  vehicleAssignmentId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}

type DriverTab = "route" | "seats" | "finance";
type ToastType = "info" | "success" | "warning";

/* =========================================================
2. API LAYER
   ========================================================= */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const FIXED_FARE = 5000;
const DEFAULT_ASSIGNMENT_ID = 10;
const DEFAULT_CENTER = { lat: -7.9523, lng: 112.6138 };

const SHEET_COLLAPSED_H = 88;
const SHEET_HALF_RATIO = 0.5;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = Array.isArray(json?.message)
      ? json.message.join(", ")
      : (json?.message ?? `Request gagal (${res.status})`);
    throw new Error(msg);
  }
  return json as T;
}

const api = {
  getAssignment: async (id: number) =>
    (
      await apiFetch<ApiResponse<VehicleAssignment>>(
        `/vehicle-assignments/${id}`,
      )
    ).data,

  updateAssignment: (id: number, body: UpdateAssignmentBody) =>
    apiFetch<ApiResponse<unknown>>(`/vehicle-assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  createPayment: (body: CreatePaymentBody) =>
    apiFetch<ApiResponse<unknown>>(`/payments`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

/* ---- ADD: kirim posisi angkot ---- */
interface CreateVehicleLocationBody {
  vehicleAssignmentId: number;
  latitude: number;
  longitude: number;
}

const postVehicleLocation = (body: CreateVehicleLocationBody) =>
  apiFetch<ApiResponse<unknown>>(`/vehicle-locations`, {
    method: "POST",
    body: JSON.stringify(body),
  });

const LOCATION_POST_INTERVAL_MS = 5000;

/* ---- ADD: trim polyline sesuai posisi driver ---- */
const PASS_RADIUS_M = 25; // titik dianggap terlewati jika driver <= 25 m
const OFF_ROUTE_M = 60; // jika > 60 m dari rute, jangan trim (menyimpang / GPS noise)
const LOOKAHEAD_POINTS = 40; // cari titik terdekat hanya beberapa titik ke depan

type LatLngLit = { lat: number; lng: number };

function projectOnSegment(p: LatLngLit, a: LatLngLit, b: LatLngLit) {
  const kx = 111320 * Math.cos((a.lat * Math.PI) / 180);
  const ky = 110540;
  const bx = (b.lng - a.lng) * kx;
  const by = (b.lat - a.lat) * ky;
  const px = (p.lng - a.lng) * kx;
  const py = (p.lat - a.lat) * ky;
  const len2 = bx * bx + by * by;
  const t =
    len2 === 0 ? 0 : Math.max(0, Math.min(1, (px * bx + py * by) / len2));
  return {
    t,
    dist: Math.hypot(px - t * bx, py - t * by),
    point: {
      lat: a.lat + t * (b.lat - a.lat),
      lng: a.lng + t * (b.lng - a.lng),
    },
  };
}

function distanceMeters(a: LatLngLit, b: LatLngLit) {
  const kx = 111320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot((b.lng - a.lng) * kx, (b.lat - a.lat) * 110540);
}

const vertexKey = (lat: number, lng: number) =>
  `${lat.toFixed(6)},${lng.toFixed(6)}`;

/* =========================================================
3. HOOKS TANSTACK QUERY
   ========================================================= */

const assignmentKey = (id: number) => ["vehicle-assignment", id] as const;

function useAssignment(id: number) {
  return useQuery({
    queryKey: assignmentKey(id),
    queryFn: () => api.getAssignment(id),
    refetchInterval: 10_000,
    enabled: Number.isFinite(id),
  });
}

function useUpdateAssignment(id: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateAssignmentBody) => api.updateAssignment(id, body),

    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: assignmentKey(id) });
      const previous = qc.getQueryData<VehicleAssignment>(assignmentKey(id));
      if (previous) {
        qc.setQueryData<VehicleAssignment>(assignmentKey(id), {
          ...previous,
          ...(body.status !== undefined && { status: body.status }),
          ...(body.currentPassengers !== undefined && {
            currentPassengers: body.currentPassengers,
          }),
        });
      }
      return { previous };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.previous) qc.setQueryData(assignmentKey(id), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: assignmentKey(id) }),
  });
}

function useCreatePayment(id: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePaymentBody) => api.createPayment(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: assignmentKey(id) }),
  });
}

/* =========================================================
4. PAGE ENTRY
   ========================================================= */

export default function DriverObservationPage() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <DriverObservationContent />
    </QueryClientProvider>
  );
}

function DriverObservationContent() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const assignmentId = Number(params?.id ?? DEFAULT_ASSIGNMENT_ID);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAssignment(assignmentId);
  const updateMutation = useUpdateAssignment(assignmentId);
  const paymentMutation = useCreatePayment(assignmentId);

  const [activeTab, setActiveTab] = useState<DriverTab>("finance");

  // GPS & Modal State
  // ✅ GPS modal muncul otomatis saat halaman dibuka
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(true);
  const [isGpsActive, setIsGpsActive] = useState(false);
  // ADD: mode fokus (opsional) saat mode perjalanan
  const [isFocusMode, setIsFocusMode] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [position, setPosition] = useState(DEFAULT_CENTER);

  // Status Change Modal
  const [pendingStatus, setPendingStatus] = useState<AssignmentStatus | null>(
    null,
  );
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: ToastType;
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form Cash
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [newPaySeats, setNewPaySeats] = useState(1);

  // Bottom Sheet
  const [maxSheetH, setMaxSheetH] = useState(360);
  const [sheetH, setSheetH] = useState(360);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    startY: 0,
    startH: 0,
    lastY: 0,
    lastT: 0,
    velocity: 0,
    moved: false,
  });
  const winH = useRef(0);

  // Google Maps
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const polylineInstance = useRef<google.maps.Polyline | null>(null);
  const watchPositionId = useRef<number | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null); // ✅ feedback error map

  /* ---------------------------------------------------------
     DERIVED DATA
  --------------------------------------------------------- */
  const status = data?.status;
  const isDrivingMode = status === AssignmentStatus.ONGOING;
  const isOperationalLocked = !isDrivingMode;
  // ADD: tampilan fokus hanya aktif saat jalan DAN user memilih fokus
  const isFocusActive = isDrivingMode && isFocusMode;

  // ADD: ref agar callback GPS (watchPosition) selalu tahu mode terbaru
  const freeLookRef = useRef(false);
  useEffect(() => {
    freeLookRef.current = isDrivingMode && !isFocusMode;
  }, [isDrivingMode, isFocusMode]);

  const maxCapacity = data?.vehicle.capacity ?? 0;
  const currentPassengers = data?.currentPassengers ?? 0;
  const availableSeats = Math.max(0, maxCapacity - currentPassengers);

  const payments = useMemo(
    () =>
      [...(data?.payments ?? [])].sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
      ),
    [data?.payments],
  );

  const financialSummary = useMemo(() => {
    let total = 0;
    let qris = 0;
    let cash = 0;
    for (const p of payments) {
      const amt = Number(p.amount);
      total += amt;
      if (p.paymentMethod === "QRIS") qris += amt;
      else cash += amt;
    }
    return {
      total,
      qris,
      cash,
      totalSeatsPaid: Math.round(total / FIXED_FARE),
    };
  }, [payments]);

  /* ---------------------------------------------------------
     TOAST
  --------------------------------------------------------- */
  const showToast = (text: string, type: ToastType = "info") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage({ text, type });
    toastTimer.current = setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  /* ---------------------------------------------------------
     BOTTOM SHEET
  --------------------------------------------------------- */
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

  // ADD: toggle mode fokus saat mode perjalanan
  const toggleFocusMode = () => {
    const next = !isFocusMode;
    setIsFocusMode(next);
    if (next) {
      setSheetH(SHEET_COLLAPSED_H);
      mapInstance.current?.setZoom(17);
      mapInstance.current?.panTo(position);
      showToast("Mode fokus aktif.", "info");
    } else {
      setSheetH(halfSheetH);
      showToast("Mode fokus dimatikan.", "info");
    }
  };

  /* ---------------------------------------------------------
     GOOGLE MAPS: init sekali
     ✅ Perbaikan: dependensi aman + retry jika container belum siap
  --------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function initMap() {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      // ✅ Validasi API key dengan feedback jelas
      if (!apiKey) {
        setMapError("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY belum diset.");
        return;
      }

      // ✅ Container mungkin belum ter-mount; coba lagi
      if (!mapRef.current) {
        retryTimer = setTimeout(initMap, 100);
        return;
      }

      // ✅ Jika sudah pernah init, jangan init ulang
      if (mapInstance.current) {
        setMapReady(true);
        return;
      }

      try {
        setOptions({ key: apiKey, v: "weekly" });
        const { Map } = (await importLibrary(
          "maps",
        )) as google.maps.MapsLibrary;
        await importLibrary("geometry");
        await importLibrary("marker"); // ✅ pastikan marker library tersedia

        if (cancelled || !mapRef.current) return;

        mapInstance.current = new Map(mapRef.current, {
          center: DEFAULT_CENTER,
          zoom: 16,
          disableDefaultUI: true,
          zoomControl: false,
        });

        // ✅ Pakai google.maps.Marker legacy (stabil di semua versi)
        markerInstance.current = new google.maps.Marker({
          map: mapInstance.current,
          position: DEFAULT_CENTER,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#1d4ed8",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        });

        setMapReady(true);
        setMapError(null);
      } catch (err) {
        console.error("Gagal memuat Google Maps:", err);
        setMapError(
          err instanceof Error ? err.message : "Gagal memuat Google Maps.",
        );
      }
    }

    initMap();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  // Gambar polyline rute setelah map & data siap
  const encodedPolyline = data?.route.encodedPolyline;
  const routeColor = data?.route.color ?? "#1E88E5";
  const vehicleCode = data?.vehicle.vehicleCode;

  useEffect(() => {
    if (!mapReady || !mapInstance.current || !encodedPolyline) return;

    try {
      const path = google.maps.geometry.encoding.decodePath(encodedPolyline);

      polylineInstance.current?.setMap(null);
      polylineInstance.current = new google.maps.Polyline({
        map: mapInstance.current,
        path,
        strokeColor: routeColor,
        strokeOpacity: 0.9,
        strokeWeight: 5,
      });

      if (!isGpsActive && path.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        mapInstance.current.fitBounds(bounds, 60);
      }
    } catch (err) {
      console.error("Gagal decode polyline:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, encodedPolyline, routeColor]);

  useEffect(() => {
    if (markerInstance.current && vehicleCode) {
      markerInstance.current.setTitle(vehicleCode);
    }
  }, [mapReady, vehicleCode]);

  const updateMapPosition = (lat: number, lng: number) => {
    const newPos = { lat, lng };
    markerInstance.current?.setPosition(newPos);
    // ADD: jika fokus dimatikan saat jalan, peta tidak mengikuti otomatis
    if (!freeLookRef.current) mapInstance.current?.panTo(newPos);
  };

  /* ---------------------------------------------------------
     GPS
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
        setPosition({ lat: latitude, lng: longitude });
        updateMapPosition(latitude, longitude);

        if (watchPositionId.current !== null) {
          navigator.geolocation.clearWatch(watchPositionId.current);
        }
        watchPositionId.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            const { latitude: wLat, longitude: wLng } = watchPos.coords;
            setPosition({ lat: wLat, lng: wLng });
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
     ADD: POST POSISI ANGKOT tiap 5 detik
     Syarat: GPS aktif + mode perjalanan (ONGOING)
  --------------------------------------------------------- */
  const positionRef = useRef(position);
  const isSendingLocation = useRef(false);
  const hasLocationErrorShown = useRef(false);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (!isGpsActive || !isDrivingMode || !Number.isFinite(assignmentId)) {
      return;
    }

    const sendLocation = async () => {
      if (isSendingLocation.current) return; // cegah request menumpuk
      isSendingLocation.current = true;

      try {
        await postVehicleLocation({
          vehicleAssignmentId: assignmentId,
          latitude: positionRef.current.lat,
          longitude: positionRef.current.lng,
        });
        hasLocationErrorShown.current = false;
      } catch (err) {
        console.warn("Gagal kirim lokasi:", err);
        if (!hasLocationErrorShown.current) {
          hasLocationErrorShown.current = true; // toast cukup sekali
          showToast(
            `Gagal kirim lokasi: ${err instanceof Error ? err.message : "error"}`,
            "warning",
          );
        }
      } finally {
        isSendingLocation.current = false;
      }
    };

    sendLocation(); // kirim langsung saat mulai
    const timer = setInterval(sendLocation, LOCATION_POST_INTERVAL_MS);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGpsActive, isDrivingMode, assignmentId]);

  /* ---------------------------------------------------------
     ADD: VISUAL KOORDINAT DARI encodedPolyline
     decode -> lat/lng -> marker A (awal), B (akhir), titik-titik rute
  --------------------------------------------------------- */
  const routeMarkers = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapReady || !mapInstance.current || !encodedPolyline) return;

    const map = mapInstance.current;
    const decoded = google.maps.geometry.encoding.decodePath(encodedPolyline);
    const coords = decoded.map((p) => ({ lat: p.lat(), lng: p.lng() }));
    if (coords.length === 0) return;

    const markers: google.maps.Marker[] = [];

    // Titik-titik koordinat rute (disampling max ±150 titik agar ringan)
    const step = Math.max(1, Math.ceil(coords.length / 150));
    coords.forEach((c, i) => {
      if (i % step !== 0 || i === 0 || i === coords.length - 1) return;
      markers.push(
        new google.maps.Marker({
          map,
          position: c,
          clickable: true,
          title: `${c.lat.toFixed(6)}, ${c.lng.toFixed(6)}`,
          zIndex: 1,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3.5,
            fillColor: "#ffffff",
            fillOpacity: 1,
            strokeColor: routeColor,
            strokeWeight: 2,
          },
        }),
      );
    });

    // Marker awal (A) & akhir (B)
    const first = coords[0];
    const last = coords[coords.length - 1];

    markers.push(
      new google.maps.Marker({
        map,
        position: first,
        title: `Awal: ${first.lat.toFixed(6)}, ${first.lng.toFixed(6)}`,
        zIndex: 5,
        label: {
          text: "A",
          color: "#ffffff",
          fontWeight: "bold",
          fontSize: "11px",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: "#059669",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      }),
      new google.maps.Marker({
        map,
        position: last,
        title: `Akhir: ${last.lat.toFixed(6)}, ${last.lng.toFixed(6)}`,
        zIndex: 5,
        label: {
          text: "B",
          color: "#ffffff",
          fontWeight: "bold",
          fontSize: "11px",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: "#e11d48",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      }),
    );

    routeMarkers.current = markers;

    return () => {
      markers.forEach((m) => m.setMap(null));
      routeMarkers.current = [];
    };
  }, [mapReady, encodedPolyline, routeColor]);

  /* ---------------------------------------------------------
     ADD: TRIM POLYLINE — hanya tampilkan rute yang belum dilewati
  --------------------------------------------------------- */
  const pathRef = useRef<LatLngLit[]>([]);
  const vertexIndexRef = useRef<Map<string, number>>(new Map());
  const progressRef = useRef({ seg: 0, t: 0 });

  // Decode sekali per rute, reset progres
  useEffect(() => {
    progressRef.current = { seg: 0, t: 0 };
    if (!mapReady || !encodedPolyline) {
      pathRef.current = [];
      return;
    }
    const coords = google.maps.geometry.encoding
      .decodePath(encodedPolyline)
      .map((p) => ({ lat: p.lat(), lng: p.lng() }));
    pathRef.current = coords;

    const map = new Map<string, number>();
    coords.forEach((c, i) => {
      const k = vertexKey(c.lat, c.lng);
      if (!map.has(k)) map.set(k, i);
    });
    vertexIndexRef.current = map;
  }, [mapReady, encodedPolyline]);

  // Potong rute mengikuti posisi GPS driver
  useEffect(() => {
    const poly = polylineInstance.current;
    const path = pathRef.current;
    if (!mapReady || !poly || path.length < 2) return;

    const applyMarkers = (seg: number, t: number) => {
      routeMarkers.current.forEach((m) => {
        const pos = m.getPosition();
        if (!pos) return;
        const idx = vertexIndexRef.current.get(vertexKey(pos.lat(), pos.lng()));
        if (idx === undefined) return;
        m.setVisible(!(idx < seg || (idx === seg && t > 0)));
      });
    };

    // Di luar mode jalan: tampilkan rute penuh lagi
    if (!(isGpsActive && isDrivingMode)) {
      const prog = progressRef.current;
      if (prog.seg !== 0 || prog.t !== 0) {
        progressRef.current = { seg: 0, t: 0 };
        poly.setPath(path);
        applyMarkers(0, 0);
      }
      return;
    }

    const prog = progressRef.current;
    const isFirstLock = prog.seg === 0 && prog.t === 0;
    const lastSeg = Math.min(
      path.length - 2,
      isFirstLock ? path.length - 2 : prog.seg + LOOKAHEAD_POINTS,
    );

    let best: {
      i: number;
      t: number;
      dist: number;
      point: LatLngLit;
    } | null = null;
    for (let i = prog.seg; i <= lastSeg; i++) {
      const r = projectOnSegment(position, path[i], path[i + 1]);
      if (!best || r.dist < best.dist) best = { ...r, i };
    }
    if (!best || best.dist > OFF_ROUTE_M) return;

    let seg = best.i;
    let t = best.t;
    let snap = best.point;

    // Radius: sudah dekat titik berikutnya -> anggap terlewati
    const next = path[seg + 1];
    if (distanceMeters(position, next) <= PASS_RADIUS_M) {
      if (seg + 1 <= path.length - 2) {
        seg += 1;
        t = 0;
      } else {
        t = 1;
      }
      snap = next;
    }

    // Progres hanya boleh maju, tidak mundur
    if (seg === prog.seg && t < prog.t) return;

    progressRef.current = { seg, t };
    poly.setPath([snap, ...path.slice(seg + 1)]);
    applyMarkers(seg, t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, isGpsActive, isDrivingMode, mapReady, encodedPolyline]);

  /* ---------------------------------------------------------
     STATUS CHANGE
     ✅ GPS wajib sebelum ONGOING
  --------------------------------------------------------- */
  const triggerStatusChangeRequest = (target: AssignmentStatus) => {
    if (status === target) return;

    // ✅ Gate: GPS wajib aktif sebelum mulai jalan
    if (target === AssignmentStatus.ONGOING && !isGpsActive) {
      showToast("Aktifkan GPS dulu sebelum mulai jalan.", "warning");
      setIsGpsModalOpen(true);
      return;
    }

    setPendingStatus(target);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (!pendingStatus) return;
    const target = pendingStatus;

    setIsStatusModalOpen(false);
    setPendingStatus(null);

    updateMutation.mutate(
      { status: target },
      {
        onSuccess: () => {
          if (target === AssignmentStatus.ONGOING) {
            setIsFocusMode(true); // default fokus aktif saat mulai jalan
            setSheetH(SHEET_COLLAPSED_H);
            mapInstance.current?.setZoom(17);
            mapInstance.current?.panTo(position);
            showToast("Mode jalan aktif. Hati-hati di jalan!", "info");
          } else if (target === AssignmentStatus.COMPLETED) {
            showToast(
              "Trayek selesai! Terima kasih atas pelayanan Anda.",
              "success",
            );
          } else {
            showToast("Status diubah ke Dijadwalkan.", "warning");
          }
        },
        onError: (err) =>
          showToast(`Gagal ubah status: ${err.message}`, "warning"),
      },
    );
  };

  /* ---------------------------------------------------------
     SEATS
  --------------------------------------------------------- */
  const setPassengers = (count: number) => {
    const next = clamp(count, 0, maxCapacity);
    if (next === currentPassengers) return;

    updateMutation.mutate(
      { currentPassengers: next },
      {
        onError: (err) =>
          showToast(`Gagal update kursi: ${err.message}`, "warning"),
      },
    );
  };

  /* ---------------------------------------------------------
     CASH PAYMENT
  --------------------------------------------------------- */
  const handleAddCashPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const seatsToBook = clamp(newPaySeats, 1, Math.max(1, availableSeats));
    const totalCost = seatsToBook * FIXED_FARE;

    paymentMutation.mutate(
      {
        vehicleAssignmentId: data.id,
        amount: totalCost,
        paymentMethod: "CASH",
        transactionId: `CASH-${Date.now()}`,
      },
      {
        onSuccess: () => {
          updateMutation.mutate({
            currentPassengers: Math.min(
              data.vehicle.capacity,
              data.currentPassengers + seatsToBook,
            ),
          });
          setNewPaySeats(1);
          setIsAddPaymentOpen(false);
          showToast(
            `Pembayaran Cash ${seatsToBook} kursi (Rp ${totalCost.toLocaleString("id-ID")}) berhasil dicatat.`,
            "success",
          );
        },
        onError: (err) =>
          showToast(`Gagal catat pembayaran: ${err.message}`, "warning"),
      },
    );
  };

  /* =========================================================
5. LOADING & ERROR STATE
   ========================================================= */
  if (isLoading) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-slate-100 text-slate-500">
        <FiRefreshCw className="h-6 w-6 animate-spin text-blue-700" />
        <p className="text-xs font-bold">Memuat penugasan...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-slate-100 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <FiAlertCircle size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">
            Penugasan tidak bisa dimuat
          </h2>
          <p className="max-w-xs text-[11px] text-slate-500">
            {error instanceof Error ? error.message : "Terjadi kesalahan."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600"
          >
            Kembali
          </button>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  const isSaving = updateMutation.isPending || paymentMutation.isPending;
  const lockedTitle =
    data.status === AssignmentStatus.SCHEDULED
      ? "Masih Dijadwalkan"
      : data.status === AssignmentStatus.CANCELLED
        ? "Perjalanan Dibatalkan"
        : "Perjalanan Selesai";
  const lockedDesc =
    data.status === AssignmentStatus.SCHEDULED
      ? "Tekan 'Mulai Jalan' untuk membuka akses"
      : "Trayek ditutup, tidak menerima transaksi";

  /* =========================================================
6. RENDER UI
   ========================================================= */
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased select-none">
      {/* MAP BACKGROUND */}
      <div
        ref={mapRef}
        className="absolute inset-0 z-0 h-full w-full bg-slate-200"
      />

      {/* ✅ Fallback jika map gagal dimuat */}
      {!mapReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/80 px-6 text-center">
          <div className="space-y-2">
            {mapError ? (
              <>
                <FiAlertCircle className="mx-auto h-8 w-8 text-rose-500" />
                <p className="text-xs font-bold text-slate-700">
                  Peta gagal dimuat
                </p>
                <p className="max-w-xs text-[11px] text-slate-500">
                  {mapError}
                </p>
              </>
            ) : (
              <>
                <FiRefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-700" />
                <p className="text-xs font-bold text-slate-700">
                  Memuat peta...
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMessage && (
        <div
          className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-3"
          style={isSheetFull ? { top: 12 } : { bottom: sheetH + 10 }}
        >
          <div
            className={`pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold shadow-xl backdrop-blur-md ${
              toastMessage.type === "success"
                ? "border-emerald-700 bg-emerald-900/90 text-emerald-50"
                : toastMessage.type === "warning"
                  ? "border-amber-700 bg-amber-900/90 text-amber-50"
                  : "border-blue-700 bg-blue-900/90 text-blue-50"
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
          isFocusActive
            ? "pointer-events-none -translate-y-[130%] opacity-0"
            : "translate-y-0 opacity-100"
        }`}
        aria-hidden={isFocusActive}
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
                      {data.vehicle.vehicleCode}
                    </span>
                    <span className="shrink-0 rounded border border-slate-200 bg-slate-100 px-1 py-px text-[9px] font-bold text-slate-700">
                      {data.vehicle.plateNumber}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-500">
                    {data.route.name}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsGpsModalOpen(true)}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold transition ${
                isGpsActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "animate-pulse border-rose-200 bg-rose-50 text-rose-700"
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
              disabled={isSaving}
              onClick={() =>
                triggerStatusChangeRequest(AssignmentStatus.SCHEDULED)
              }
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold transition active:scale-95 disabled:opacity-60 ${
                data.status === AssignmentStatus.SCHEDULED
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <FiClock size={11} />
              Jadwal
            </button>

            <FiChevronRight className="mx-0.5 h-3 w-3 shrink-0 text-slate-400" />

            <button
              disabled={isSaving}
              onClick={() =>
                triggerStatusChangeRequest(AssignmentStatus.ONGOING)
              }
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold transition active:scale-95 disabled:opacity-60 ${
                data.status === AssignmentStatus.ONGOING
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <FiPlay size={11} />
              Mulai Jalan
            </button>

            <FiChevronRight className="mx-0.5 h-3 w-3 shrink-0 text-slate-400" />

            <button
              disabled={isSaving}
              onClick={() =>
                triggerStatusChangeRequest(AssignmentStatus.COMPLETED)
              }
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold transition active:scale-95 disabled:opacity-60 ${
                data.status === AssignmentStatus.COMPLETED
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
      {isFocusActive && (
        <button
          onClick={() => setIsGpsModalOpen(true)}
          aria-label="Status GPS"
          className="absolute right-2.5 top-[max(0.5rem,env(safe-area-inset-top))] z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 shadow-lg backdrop-blur-xl"
        >
          <FiCompass
            className={`h-4 w-4 ${isGpsActive ? "text-emerald-600" : "animate-pulse text-rose-600"}`}
          />
        </button>
      )}

      {/* ADD: TOGGLE MODE FOKUS (hanya saat mode perjalanan) */}
      {isDrivingMode && !isSheetFull && (
        <button
          type="button"
          onClick={toggleFocusMode}
          aria-pressed={isFocusMode}
          className={`fixed right-2.5 z-20 flex items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-bold shadow-lg backdrop-blur-xl active:scale-95 ${
            isFocusMode
              ? "border-blue-700 bg-blue-700 text-white"
              : "border-slate-200 bg-white/95 text-slate-600"
          }`}
          style={{
            bottom: sheetH + 10,
            transition: isDragging
              ? "none"
              : "bottom 260ms cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          <FiTarget size={13} />
          {isFocusMode ? "Fokus: On" : "Fokus: Off"}
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
        {/* HANDLE */}
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

        {/* TABS */}
        <div className="shrink-0 px-3 pb-2">
          <div className="grid grid-cols-3 gap-0.5 rounded-xl bg-slate-100 p-0.5">
            {(
              [
                { key: "route", label: "Rute", icon: <FiList size={13} /> },
                {
                  key: "seats",
                  label: `Seat (${availableSeats})`,
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
          {/* DRIVING BANNER */}
          {isDrivingMode && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <FiMapPin className="h-4 w-4 shrink-0 text-blue-700" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500">
                    Sedang jalan
                  </p>
                  <p className="truncate text-xs font-bold text-blue-900">
                    {data.route.name}
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

          {/* LOCKED BANNER */}
          {isOperationalLocked && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                  <FiLock size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-amber-900">
                    {lockedTitle}
                  </p>
                  <p className="text-[10px] leading-tight text-amber-700">
                    {lockedDesc}
                  </p>
                </div>
              </div>

              {data.status === AssignmentStatus.SCHEDULED && (
                <button
                  onClick={() =>
                    triggerStatusChangeRequest(AssignmentStatus.ONGOING)
                  }
                  className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-black text-white"
                >
                  Jalan
                </button>
              )}
            </div>
          )}

          {/* TAB: RUTE */}
          {activeTab === "route" && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
                  style={{ backgroundColor: data.route.color }}
                >
                  {data.route.code}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {data.route.name}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500">
                    {(data.route.totalDistanceMeters / 1000).toFixed(1)} km •
                    Arah{" "}
                    {data.route.direction === "FORWARD"
                      ? "berangkat"
                      : "pulang"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <InfoTile
                  label="Jam berangkat"
                  value={data.startTime.slice(0, 5)}
                />
                <InfoTile
                  label="Tanggal"
                  value={formatDate(data.assignmentDate)}
                />
                <InfoTile label="Pengemudi" value={data.driver.name} />
                <InfoTile
                  label="Kondektur"
                  value={data.conductor?.name ?? "-"}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (mapInstance.current && polylineInstance.current) {
                    const bounds = new google.maps.LatLngBounds();
                    polylineInstance.current
                      .getPath()
                      .forEach((p) => bounds.extend(p));
                    mapInstance.current.fitBounds(bounds, 60);
                    setSheetH(SHEET_COLLAPSED_H);
                  }
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-[11px] font-bold text-slate-600 transition active:scale-95"
              >
                <FiNavigation size={13} />
                Lihat seluruh rute di peta
              </button>
            </div>
          )}

          {/* TAB: SEATS */}
          {activeTab === "seats" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-2.5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Kapasitas Angkot
                  </p>
                  <p className="text-sm font-black text-blue-900">
                    {currentPassengers} Terisi / {maxCapacity}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-800">
                  {availableSeats} Kosong
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Kursi Terisi
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {updateMutation.isPending
                      ? "Menyimpan..."
                      : "Tap nomor untuk update"}
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {Array.from({ length: maxCapacity }, (_, i) => {
                    const seatNumber = i + 1;
                    const isOccupied = seatNumber <= currentPassengers;

                    return (
                      <button
                        key={seatNumber}
                        type="button"
                        disabled={isOperationalLocked}
                        onClick={() =>
                          setPassengers(
                            seatNumber === currentPassengers
                              ? seatNumber - 1
                              : seatNumber,
                          )
                        }
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
                disabled={isOperationalLocked || currentPassengers === 0}
                onClick={() => setPassengers(0)}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-[11px] font-bold text-slate-600 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset (Semua Kursi Kosong)
              </button>
            </div>
          )}

          {/* TAB: UANG */}
          {activeTab === "finance" && (
            <div className="space-y-3">
              <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                      <FiDollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        Total Pemasukan Operasional
                      </p>
                      <p className="text-lg font-black leading-tight text-emerald-950">
                        Rp {financialSummary.total.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isOperationalLocked || availableSeats === 0}
                    onClick={() => setIsAddPaymentOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiPlus size={14} />
                    <span>Cash</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-emerald-200/60 pt-2.5">
                  <div className="rounded-xl border border-blue-100 bg-white p-2.5">
                    <p className="mb-0.5 flex items-center gap-1 text-[10px] font-bold text-blue-700">
                      <FiCreditCard size={11} /> QRIS (Digital)
                    </p>
                    <p className="text-xs font-black text-slate-900 sm:text-sm">
                      Rp {financialSummary.qris.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-white p-2.5">
                    <p className="mb-0.5 flex items-center gap-1 text-[10px] font-bold text-amber-800">
                      <FiDollarSign size={11} /> Cash (Tunai)
                    </p>
                    <p className="text-xs font-black text-slate-900 sm:text-sm">
                      Rp {financialSummary.cash.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Riwayat Pembayaran Kursi
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                    {isFetching && (
                      <FiRefreshCw className="h-2.5 w-2.5 animate-spin" />
                    )}
                    {financialSummary.totalSeatsPaid} Kursi Terbayar
                  </span>
                </div>

                {payments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center">
                    <p className="text-xs font-bold text-slate-600">
                      Belum Ada Transaksi
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Transaksi QRIS atau pencatatan tunai akan muncul di sini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {payments.map((item, idx) => {
                      const amount = Number(item.amount);
                      const seats = Math.round(amount / FIXED_FARE);
                      const isQris = item.paymentMethod === "QRIS";
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-slate-300"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-bold ${
                                isQris
                                  ? "border-blue-100 bg-blue-50 text-blue-700"
                                  : "border-amber-100 bg-amber-50 text-amber-700"
                              }`}
                            >
                              {isQris ? (
                                <FiCreditCard size={16} />
                              ) : (
                                <FiDollarSign size={16} />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-slate-900">
                                  Transaksi #{payments.length - idx}
                                </p>
                                <span
                                  className={`rounded px-1.5 py-px text-[9px] font-extrabold uppercase ${
                                    isQris
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {item.paymentMethod}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                Pukul {formatTime(item.paidAt)} • {seats} Kursi
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-black text-slate-900">
                              Rp {amount.toLocaleString("id-ID")}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400">
                              @ Rp {FIXED_FARE.toLocaleString("id-ID")} / kursi
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MODAL KONFIRMASI STATUS */}
      {isStatusModalOpen && pendingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90dvh] w-full max-w-xs space-y-4 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-2xl">
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

      {/* MODAL GPS — ✅ WAJIB, tidak bisa ditutup sebelum GPS aktif */}
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
                GPS <strong>wajib aktif</strong> sebelum Anda bisa memulai
                perjalanan. Lokasi Anda akan tampil real-time di peta penumpang
                AngkotGo.
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
              disabled={isLocating || isGpsActive}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-700/30 transition active:scale-95 disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <FiRefreshCw size={14} className="animate-spin" />
                  Mencari Posisi...
                </>
              ) : isGpsActive ? (
                <>
                  <FiCheckCircle size={14} />
                  GPS Aktif
                </>
              ) : (
                <>
                  <FiShield size={14} />
                  Izinkan GPS
                </>
              )}
            </button>

            {/* ✅ Tombol tutup hanya muncul setelah GPS aktif */}
            {isGpsActive ? (
              <button
                onClick={() => setIsGpsModalOpen(false)}
                className="w-full text-[11px] font-bold text-slate-500"
              >
                Tutup
              </button>
            ) : (
              <p className="text-[10px] text-slate-400">
                GPS wajib aktif untuk melanjutkan.
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODAL BAYAR CASH */}
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
                    onClick={() => setNewPaySeats((p) => Math.max(1, p - 1))}
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
                      setNewPaySeats((p) => Math.min(availableSeats, p + 1))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 active:scale-95"
                  >
                    <FiPlus size={15} />
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Kursi kosong saat ini: {availableSeats}
                </p>
              </div>

              <div className="flex justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] font-bold text-amber-900">
                <span>
                  Total Bayar Tunai ({newPaySeats} x Rp{" "}
                  {FIXED_FARE.toLocaleString("id-ID")})
                </span>
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
                  disabled={paymentMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/20 transition hover:bg-amber-700 active:scale-95 disabled:opacity-60"
                >
                  {paymentMutation.isPending ? (
                    <>
                      <FiRefreshCw size={13} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Cash"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
7. SMALL HELPERS
   ========================================================= */

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
      <p className="text-[10px] font-semibold text-slate-400">{label}</p>
      <p className="truncate text-xs font-bold text-slate-800">{value}</p>
    </div>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}