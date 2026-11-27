"use client";

/**
 * AngkotGo — halaman utama (terhubung ke backend NestJS)
 *
 * Dependensi tambahan:
 *   npm i @tanstack/react-query socket.io-client @googlemaps/polyline-codec
 *
 * .env.local
 *   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
 *   NEXT_PUBLIC_API_URL=http://localhost:3001     (opsional, default ini)
 *   NEXT_PUBLIC_WS_URL=http://localhost:3001      (opsional, default ini)
 *
 * Ringkasan alur:
 *   1. POST /routes/search          -> tipe (DIRECT / TRANSIT) + routeIds, langsung lanjut ke langkah 2
 *      (tidak ada halaman pilihan rute)
 *   2. POST /routes/track-vehicles  -> angkot yang mendekat (per leg) + transitNode
 *   3. Socket.IO /live-location     -> posisi realtime per vehicleAssignmentId
 *        - awal  : subscribe SEMUA angkot (leg aktif + leg lanjutan) yang belum lewat
 *        - naik  : subscribe HANYA angkot yang ditumpangi
 *   4. Polyline (slicedPolyline hasil search) di-decode, lalu dipotong di FE
 *      sehingga hanya bagian yang BELUM dilewati yang tampil, lengkap dengan panah arah.
 *   5. SETIAP angkot yang belum lewat selalu punya garis ORANYE (solid, tebal, berpanah,
 *      sama seperti garis biru) dari posisinya (live / estimasi / belum berangkat) ke titik
 *      naik user, di leg aktif maupun leg lanjutan.
 *   6. MARKER custom (SVG):
 *        - Titik Jemput / Tujuan user  : pin biru (orang) / pin oranye (bendera)
 *        - Naik / Transit / Turun      : pin halte angkot dari boardCoord & alightCoord
 *        - Angkot                      : mini-bus berwarna rute + kode trayek,
 *                                        titik hijau = LIVE, abu-abu = ESTIMASI / GPS basi,
 *                                        outline oranye = terpilih
 *   7. UI TRANSIT:
 *        - Stepper vertikal "Perjalanan kamu" (naik -> ganti -> turun), warna beda per leg
 *        - Di halte transit, user memilih angkot leg berikutnya lewat kartu pilihan:
 *          ETA, waktu tunggu, kepadatan, badge Live/Estimasi/GPS basi, dan label
 *          Disarankan / Tercepat / Paling lega. Angkot yang tiba sebelum user sampai
 *          ditandai "Mungkin terlewat". Pilihan default = Disarankan.
 *
 * DATA DUMMY: hanya titik awal & tujuan user (DEMO_PRESETS) untuk demo.
 * Selain itu semua data berasal dari API (rute, ETA, jarak, status angkot, live tracking).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { decode } from "@googlemaps/polyline-codec";
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  ArrowUpDown,
  Banknote,
  BusFront,
  Check,
  CheckCircle2,
  Clock,
  Crosshair,
  Flag,
  Footprints,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Pencil,
  Radio,
  Search,
  Tablet,
  Users,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   1. TYPES
========================================================= */

type LatLng = { lat: number; lng: number };
type LocationData = LatLng & { name: string; address: string };
type Field = "origin" | "destination";
type Prediction = google.maps.places.PlacePrediction;
type ModalType = "near-destination" | "completed" | null;

/* ----- POST /routes/search ----- */
type SearchParams = {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
};

type SearchLeg = {
  legOrder: number;
  routeId: string;
  routeCode: string;
  routeName: string;
  color: string;
  boardCoord: LatLng;
  alightCoord: LatLng;
  transitHalteId?: number;
  transitHalteName?: string;
  rideDistanceMeters: number;
  slicedPolyline: string;
};

type SearchOption = {
  type: "DIRECT" | "TRANSIT";
  walkToFirstBoardMeters: number;
  walkFromLastAlightMeters: number;
  totalWalkMeters: number;
  totalRideMeters: number;
  legs: SearchLeg[];
};

type SearchResponse = { status: string; data: SearchOption[] };

/* ----- POST /routes/track-vehicles ----- */
type RawVehicle = {
  vehicleAssignmentId: number;
  liveLocationId?: number | null;
  rawCoord: LatLng;
  snappedCoord: LatLng;
  polylineIndex: number; // indeks titik pada encodedPolyline rute
  recordedAt: string | null;
  isFallbackData?: boolean;
  positionSource?: string; // non-transit: "LIVE" | fallback
  // non-transit & leg 1 transit
  status?: string;
  distanceToOriginMeters?: number;
  distanceToBoardMeters?: number;
  estimatedArrivalMinutes?: number;
  // leg 2 transit
  statusAtTransit?: string;
  distanceToTransitMeters?: number;
  etaVehicleToTransitMinutes?: number;
  estimatedWaitTimeAtTransitMinutes?: number | null;
};

type RawHalte = {
  halteId: number;
  name: string;
  latitude: number;
  longitude: number;
  stopSequence: number;
  polylineIndex: number;
};

type RawVehicleAssignment = {
  id: number;
  status?: string | null;
  startTime?: string;
  currentPassengers?: number | null;
  driver?: { name: string } | null;
  vehicle?: {
    plateNumber?: string;
    vehicleCode?: string;
    capacity?: number;
    status?: string;
  } | null;
};

type RawRoute = {
  id: number;
  code: string;
  name: string;
  color: string;
  encodedPolyline: string;
  haltes?: RawHalte[];
};

// Posisi user (titik naik) pada polyline rute: leg 1 = board, leg 2 = boardTransit, non-transit = origin.
type RawProjection = {
  board?: { polylineIndex: number };
  boardTransit?: { polylineIndex: number };
  origin?: { polylineIndex: number };
};

type TrackResponse = {
  status: string;
  data:
    | {
        type: "TRANSIT";
        totalEstimatedTripMinutes?: number;
        transitNode?: {
          halteId: number;
          name: string;
          estimatedPassengerArrivalMinutes?: number;
        };
        legs: {
          legOrder: number;
          route: RawRoute;
          userProjection: RawProjection;
          vehicleAssignments?: RawVehicleAssignment[];
          vehicles: RawVehicle[];
        }[];
      }
    | {
        route: RawRoute;
        userProjection: RawProjection;
        vehicleAssignments?: RawVehicleAssignment[];
        vehicles: RawVehicle[];
      };
};

/* ----- Model ter-normalisasi (transit & non-transit disamakan) ----- */
type Vehicle = {
  assignmentId: number;
  polylineIndex: number;
  lat: number;
  lng: number;
  status: string;
  passed: boolean;
  etaMinutes: number | null;
  distanceMeters: number | null;
  waitMinutes: number | null;
  isFallback: boolean;
  recordedAt: string | null;
  assignment?: {
    plateNumber?: string;
    vehicleCode?: string;
    capacity?: number;
    passengers?: number;
    startTime?: string;
    driverName?: string;
    assignmentStatus?: string;
    vehicleStatus?: string;
  };
};

type TrackLeg = {
  legOrder: number;
  route: RawRoute;
  stops: RawHalte[];
  boardIndex: number | null; // indeks titik naik user pada polyline rute
  vehicles: Vehicle[];
};
type StopEstimate = {
  stop: RawHalte;
  etaMinutes: number | null;
  passed: boolean;
};
type LivePosition = LatLng & { at: string };

/* ----- Garis oranye: jalur angkot -> titik naik user ----- */
type ApproachLine = {
  id: number; // vehicleAssignmentId
  path: LatLng[];
  focused: boolean;
  fallback: boolean; // posisi hanya estimasi (belum ada GPS / belum berangkat)
};

/* ----- Marker halte angkot (naik / transit / turun) ----- */
type StopMarker = {
  id: string;
  kind: "board" | "transit" | "alight";
  pos: LatLng;
  label: string; // teks pendek di pin
  title: string; // tooltip
};

/* ----- UI transit ----- */
type TransitInfo = {
  halteName: string;
  passengerArrivalMinutes: number | null; // kapan user tiba di halte transit
  totalMinutes: number | null;
};

type OptionTag = "recommended" | "fastest" | "roomiest";

type TransitOption = {
  vehicle: Vehicle;
  eta: number | null;
  wait: number | null;
  missable: boolean; // angkot lewat sebelum user sampai
  stale: boolean; // GPS lama
  live: boolean;
  estimate: boolean; // tanpa GPS, hanya jadwal
  density: number | null; // 0..1, sudah dibatasi
  overCapacity: boolean;
  tags: OptionTag[];
};

type JourneyPick = {
  routeCode: string;
  label: string;
  waitMinutes: number | null;
};

/* =========================================================
   2. CONSTANTS
========================================================= */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";

const MALANG_CENTER = { lat: -7.9666, lng: 112.6326 };

const RIDE_METERS_PER_MIN = 300; // estimasi kasar ±18 km/jam
const TRACK_RADIUS_METERS = 80;
const APPROACH_COLOR = "#f97316";
const GREY_VEHICLE = "#94a3b8"; // angkot tanpa GPS / GPS basi

// API mengirim warna yang sama untuk semua rute, jadi UI membedakan per urutan leg.
const LEG_COLORS = ["#1E88E5", "#0D9488", "#BE185D"] as const;
const legColor = (index: number) => LEG_COLORS[index % LEG_COLORS.length];

// Posisi GPS lebih tua dari ini dianggap basi.
const STALE_AFTER_MS = 10 * 60_000;

/**
 * PINTASAN MODE DEMO (data dummy: hanya titik awal & tujuan user).
 * Satu klik mengisi titik awal + tujuan sesuai mode, lalu tinggal "Cari Angkot".
 */
type DemoPreset = {
  id: string;
  label: string;
  hint: string;
  origin: LocationData;
  destination: LocationData;
};

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "transit",
    label: "Mode Transit",
    hint: "Ganti angkot 1x",
    origin: {
      name: "Titik Awal (Mode Transit)",
      address: "Demo transit",
      lat: -7.941565479266622,
      lng: 112.64197286161183,
    },
    destination: {
      name: "Tujuan (Mode Transit)",
      address: "Demo transit",
      lat: -7.945130446579807,
      lng: 112.6439641214661,
    },
  },
  {
    id: "direct",
    label: "Mode Non-Transit",
    hint: "Langsung 1 angkot",
    origin: {
      name: "Titik Awal (Mode Non-Transit)",
      address: "Demo non-transit",
      lat: -7.932640672126886,
      lng: 112.64983872577949,
    },
    destination: {
      name: "Tujuan (Mode Non-Transit)",
      address: "Demo non-transit",
      lat: -7.9382087484609425,
      lng: 112.64967779319323,
    },
  },
];

/* =========================================================
   3. STYLE TOKENS
========================================================= */

const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", system-ui, sans-serif';

const PRIMARY_BTN =
  "flex h-14 w-full items-center justify-center gap-2 rounded-full bg-blue-700 text-[16px] font-semibold text-white shadow-lg shadow-blue-700/30 transition active:scale-[0.98] active:bg-blue-800 disabled:bg-slate-300 disabled:shadow-none";

const GHOST_BTN =
  "flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold text-slate-500 transition active:bg-slate-100";

const CARD = "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5";

/* =========================================================
   4. HELPERS
========================================================= */

function formatDistance(meters: number) {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1).replace(".", ",")} km`
    : `${Math.round(meters)} m`;
}

const rideMinutes = (meters: number) => Math.max(1, Math.ceil(meters / RIDE_METERS_PER_MIN));

const optionKey = (option: SearchOption) =>
  `${option.type}-${option.legs.map((l) => l.routeId).join("-")}`;

const isStale = (recordedAt: string | null, now: number) =>
  recordedAt !== null && now - Date.parse(recordedAt) > STALE_AFTER_MS;

function formatAgo(recordedAt: string, now: number) {
  const minutes = Math.max(1, Math.round((now - Date.parse(recordedAt)) / 60_000));
  if (minutes < 60) return `${minutes} mnt lalu`;
  return `${Math.floor(minutes / 60)} jam lalu`;
}

// Padding fitBounds: sisakan ruang untuk header (atas) dan bottom sheet (bawah, maks ±50% layar).
const mapPadding = () => ({
  top: 140,
  bottom: Math.min(420, Math.round(window.innerHeight * 0.5)),
  left: 32,
  right: 32,
});

const decodePath = (encoded: string): LatLng[] =>
  decode(encoded, 5).map(([lat, lng]) => ({ lat, lng }));

async function postJson<T extends { status: string }>(
  path: string,
  body: unknown,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`Server error (${response.status})`);

  const json = (await response.json()) as T;
  if (json.status !== "success") throw new Error("Respons tidak berhasil");
  return json;
}

/* ----- Normalisasi response track-vehicles ----- */

function toVehicle(
  raw: RawVehicle,
  assignments: RawVehicleAssignment[] = [],
): Vehicle {
  const status = raw.status ?? raw.statusAtTransit ?? "UNKNOWN";
  const assignment = assignments.find(
    (item) => item.id === raw.vehicleAssignmentId,
  );

  return {
    assignmentId: raw.vehicleAssignmentId,
    polylineIndex: raw.polylineIndex,
    lat: raw.rawCoord.lat,
    lng: raw.rawCoord.lng,
    status,
    passed: status === "PASSED",
    etaMinutes:
      raw.estimatedArrivalMinutes ?? raw.etaVehicleToTransitMinutes ?? null,
    distanceMeters:
      raw.distanceToOriginMeters ??
      raw.distanceToBoardMeters ??
      raw.distanceToTransitMeters ??
      null,
    waitMinutes: raw.estimatedWaitTimeAtTransitMinutes ?? null,
    isFallback:
      raw.isFallbackData === true ||
      raw.liveLocationId === null ||
      (raw.positionSource !== undefined && raw.positionSource !== "LIVE"),
    recordedAt: raw.recordedAt ?? null,
    ...(assignment && {
      assignment: {
        plateNumber: assignment.vehicle?.plateNumber,
        vehicleCode: assignment.vehicle?.vehicleCode,
        capacity: assignment.vehicle?.capacity,
        passengers: assignment.currentPassengers ?? undefined,
        startTime: assignment.startTime,
        driverName: assignment.driver?.name,
        assignmentStatus: assignment.status ?? undefined,
        vehicleStatus: assignment.vehicle?.status,
      },
    }),
  };
}

const boardIndexOf = (projection?: RawProjection) =>
  projection?.board?.polylineIndex ??
  projection?.boardTransit?.polylineIndex ??
  projection?.origin?.polylineIndex ??
  null;

function normalizeTrack(response: TrackResponse | undefined): TrackLeg[] {
  if (!response) return [];
  const data = response.data;

  if ("legs" in data) {
    return data.legs.map((leg) => ({
      legOrder: leg.legOrder,
      route: leg.route,
      stops: leg.route.haltes ?? [],
      boardIndex: boardIndexOf(leg.userProjection),
      vehicles: leg.vehicles.map((vehicle) =>
        toVehicle(vehicle, leg.vehicleAssignments),
      ),
    }));
  }

  return [
    {
      legOrder: 1,
      route: data.route,
      stops: data.route.haltes ?? [],
      boardIndex: boardIndexOf(data.userProjection),
      vehicles: data.vehicles.map((vehicle) =>
        toVehicle(vehicle, data.vehicleAssignments),
      ),
    },
  ];
}

function extractTransitInfo(response: TrackResponse | undefined): TransitInfo | null {
  const data = response?.data;
  if (!data || !("legs" in data) || !data.transitNode) return null;

  return {
    halteName: data.transitNode.name ?? "Halte transit",
    passengerArrivalMinutes: data.transitNode.estimatedPassengerArrivalMinutes ?? null,
    totalMinutes: data.totalEstimatedTripMinutes ?? null,
  };
}

const byEta = (a: Vehicle, b: Vehicle) =>
  Number(a.passed) - Number(b.passed) ||
  (a.etaMinutes ?? 999) - (b.etaMinutes ?? 999);

const STATUS_LABEL: Record<string, string> = {
  APPROACHING: "Mendekat",
  VIABLE_CATCH: "Bisa dikejar",
  PASSED: "Sudah lewat",
};

/**
 * Susun pilihan angkot di halte transit: tandai yang mungkin terlewat / GPS basi /
 * tanpa GPS, hitung kepadatan (dibatasi 100%), lalu beri label dan urutkan.
 */
function buildTransitOptions(
  vehicles: Vehicle[],
  ctx: {
    arrival: number | null;
    now: number;
    livePositions: Record<number, LivePosition>;
  },
): TransitOption[] {
  const base = vehicles
    .filter((v) => !v.passed)
    .map((v): TransitOption => {
      const live = !!ctx.livePositions[v.assignmentId];
      const stale = !live && !v.isFallback && isStale(v.recordedAt, ctx.now);
      const eta = v.etaMinutes;
      const missable = ctx.arrival !== null && eta !== null && eta < ctx.arrival;
      const wait =
        eta !== null && ctx.arrival !== null
          ? Math.max(0, eta - ctx.arrival)
          : v.waitMinutes;

      const capacity = v.assignment?.capacity;
      const passengers = v.assignment?.passengers;
      const ratio = capacity && passengers !== undefined ? passengers / capacity : null;

      return {
        vehicle: v,
        eta,
        wait,
        missable,
        stale,
        live,
        estimate: v.isFallback && !live,
        density: ratio === null ? null : Math.min(1, ratio),
        overCapacity: ratio !== null && ratio > 1,
        tags: [],
      };
    });

  // Makin kecil makin bagus. Data tidak pasti dihukum supaya tidak jadi rekomendasi.
  const score = (o: TransitOption) =>
    (o.wait ?? 99) +
    (o.estimate ? 3 : 0) +
    (o.stale ? 6 : 0) +
    ((o.density ?? 0) >= 1 ? 2 : 0);

  const viable = base.filter((o) => !o.missable);
  const pickMin = (list: TransitOption[], by: (o: TransitOption) => number) =>
    list.reduce<TransitOption | null>(
      (best, o) => (best === null || by(o) < by(best) ? o : best),
      null,
    );

  const recommended = pickMin(viable, score);
  const fastest = pickMin(
    viable.filter((o) => o.eta !== null),
    (o) => o.eta ?? 99,
  );
  const roomiest =
    viable.length > 1
      ? pickMin(
          viable.filter((o) => o.density !== null && o.density < 0.9),
          (o) => o.density ?? 1,
        )
      : null;

  if (recommended) recommended.tags.push("recommended");
  if (fastest && fastest !== recommended) fastest.tags.push("fastest");
  if (roomiest && roomiest !== recommended && roomiest !== fastest) {
    roomiest.tags.push("roomiest");
  }

  // Angkot yang mungkin terlewat tidak ditampilkan sama sekali.
  return [...viable].sort((a, b) => score(a) - score(b));
}

function estimateStopArrivals(
  stops: RawHalte[],
  routePath: LatLng[],
  vehicleIndex: number,
): StopEstimate[] {
  const hasPath = routePath.length > 1;
  const cumulativeMeters = [0];

  if (hasPath) {
    for (let index = 1; index < routePath.length; index++) {
      const previous = routePath[index - 1];
      const current = routePath[index];
      const latitudeDelta = ((current.lat - previous.lat) * Math.PI) / 180;
      const longitudeDelta = ((current.lng - previous.lng) * Math.PI) / 180;
      const haversine =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos((previous.lat * Math.PI) / 180) *
          Math.cos((current.lat * Math.PI) / 180) *
          Math.sin(longitudeDelta / 2) ** 2;
      const boundedHaversine = Math.min(1, haversine);
      const segmentMeters =
        6_371_000 *
        2 *
        Math.atan2(
          Math.sqrt(boundedHaversine),
          Math.sqrt(1 - boundedHaversine),
        );
      cumulativeMeters.push(cumulativeMeters[index - 1] + segmentMeters);
    }
  }

  const currentIndex =
    hasPath && Number.isFinite(vehicleIndex)
      ? Math.max(0, Math.min(Math.floor(vehicleIndex), routePath.length - 1))
      : -1;
  const currentMeters =
    currentIndex >= 0 ? cumulativeMeters[currentIndex] : null;

  return [...stops]
    .sort((a, b) => a.stopSequence - b.stopSequence)
    .map((stop) => {
      const stopIndex = stop.polylineIndex;
      const validStopIndex =
        Number.isInteger(stopIndex) &&
        stopIndex >= 0 &&
        stopIndex < routePath.length;
      const passed =
        currentIndex >= 0 && validStopIndex && stopIndex < currentIndex;
      const distanceAhead =
        validStopIndex && currentMeters !== null && !passed
          ? Math.max(0, cumulativeMeters[stopIndex] - currentMeters)
          : null;

      return {
        stop,
        passed,
        etaMinutes:
          distanceAhead === null
            ? null
            : Math.ceil(distanceAhead / RIDE_METERS_PER_MIN),
      };
    });
}

/* ----- Geometri: potong polyline yang sudah dilewati ----- */

/**
 * Proyeksikan `point` ke segmen terdekat pada `path` (mulai dari segmen `fromSeg`
 * agar progres tidak pernah mundur). Mengembalikan sisa polyline mulai dari
 * titik proyeksi sampai ujung.
 */
function trimPassed(path: LatLng[], point: LatLng, fromSeg: number) {
  const k = Math.cos((point.lat * Math.PI) / 180) * 111320;
  const px = point.lng * k;
  const py = point.lat * 110540;

  let best = { seg: fromSeg, t: 0, distance: Infinity };

  for (let i = fromSeg; i < path.length - 1; i++) {
    const ax = path[i].lng * k;
    const ay = path[i].lat * 110540;
    const dx = path[i + 1].lng * k - ax;
    const dy = path[i + 1].lat * 110540 - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
    const distance = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));

    if (distance < best.distance) best = { seg: i, t, distance };
  }

  const a = path[best.seg];
  const b = path[best.seg + 1];
  const snapped: LatLng = {
    lat: a.lat + (b.lat - a.lat) * best.t,
    lng: a.lng + (b.lng - a.lng) * best.t,
  };

  return {
    seg: best.seg,
    distance: best.distance,
    remaining: [snapped, ...path.slice(best.seg + 1)],
  };
}

/** Sisa polyline yang belum dilewati. Hanya memotong saat user sudah naik (riding). */
function useRemainingPath(
  path: LatLng[],
  position: LatLng | null,
  riding: boolean,
  resetKey: string,
) {
  const progress = useRef({ key: "", seg: 0 });

  return useMemo(() => {
    if (progress.current.key !== resetKey) {
      progress.current = { key: resetKey, seg: 0 };
    }

    if (!riding || !position || path.length < 2) return path;

    const result = trimPassed(path, position, progress.current.seg);

    // Posisi terlalu jauh dari jalur (GPS melenceng) -> jangan potong ulang.
    if (result.distance > 100) return path.slice(progress.current.seg);

    progress.current.seg = result.seg;
    return result.remaining;
  }, [path, position, riding, resetKey]);
}

/** Jam yang berdetak, untuk menghitung umur data GPS. */
function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/* ----- Ikon marker custom (SVG data URL, di-cache) ----- */

type PinKind = "origin" | "destination" | "board" | "transit" | "alight";

// Glyph digambar putih di tengah kepala pin (koordinat berpusat di 0,0).
const PIN_STYLE: Record<PinKind, { color: string; glyph: (bg: string) => string }> = {
  // Titik jemput user: orang
  origin: {
    color: "#2563eb",
    glyph: () => `<circle cx="0" cy="-5" r="3.4"/><path d="M-6.5 7 A6.5 6.5 0 0 1 6.5 7 Z"/>`,
  },
  // Tujuan user: bendera
  destination: {
    color: "#f97316",
    glyph: () => `<rect x="-6" y="-8" width="2.2" height="16" rx="1"/><path d="M-3.8 -8 H7 L4 -4 L7 0 H-3.8 Z"/>`,
  },
  // Naik angkot: bus
  board: {
    color: "#1d4ed8",
    glyph: (bg) =>
      `<rect x="-7.5" y="-8" width="15" height="13" rx="2.5"/>` +
      `<rect x="-5.5" y="-6" width="11" height="5" rx="1" fill="${bg}"/>` +
      `<circle cx="-4" cy="7" r="2"/><circle cx="4" cy="7" r="2"/>`,
  },
  // Transit: dua panah bolak-balik
  transit: {
    color: "#7c3aed",
    glyph: () =>
      `<path d="M-7 -5 H2 V-8 L8 -4 L2 0 V-3 H-7 Z"/><path d="M7 3 H-2 V0 L-8 4 L-2 8 V5 H7 Z"/>`,
  },
  // Turun angkot: panah turun ke garis
  alight: {
    color: "#16a34a",
    glyph: () =>
      `<path d="M-2.2 -9 H2.2 V-1 H6 L0 6 L-6 -1 H-2.2 Z"/><rect x="-7" y="7.5" width="14" height="2.2" rx="1"/>`,
  },
};

const escapeXml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const iconCache = new Map<string, google.maps.Icon>();

function makeIcon(
  key: string,
  svg: string,
  width: number,
  height: number,
  anchorX: number,
  anchorY: number,
): google.maps.Icon {
  const cached = iconCache.get(key);
  if (cached) return cached;

  const icon: google.maps.Icon = {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(width, height),
    anchor: new google.maps.Point(anchorX, anchorY),
  };
  iconCache.set(key, icon);
  return icon;
}

/** Pin berlabel: pill teks di atas, kepala pin berikon, ujung pin = titik koordinat.
 *  Origin & destination mendapat efek ring glow yang lebih mencolok. */
function pinIcon(kind: PinKind, label: string): google.maps.Icon {
  const key = `pin-${kind}-${label}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const { color, glyph } = PIN_STYLE[kind];

  // Origin & destination pin lebih besar + efek glow
  const isUserPin = kind === "origin" || kind === "destination";
  const textW = Math.round(label.length * 6.6 + 20);
  const W = isUserPin ? Math.max(64, textW + 8) : Math.max(52, textW + 4);
  const H = isUserPin ? 90 : 72;
  const cx = W / 2;
  const pillX = (W - textW) / 2;
  const tip = H - 3;
  // Kepala pin lebih besar untuk user pins
  const pinR = isUserPin ? 20 : 15;
  const pinTop = tip - 2 * pinR - (isUserPin ? 20 : 14);

  // Glow ring (hanya origin & destination): lingkaran transparan berlapis di belakang pin
  const glowRings = isUserPin
    ? `<circle cx="${cx}" cy="${pinTop + pinR}" r="${pinR + 10}" fill="${color}" fill-opacity="0.18" stroke="none"/>` +
      `<circle cx="${cx}" cy="${pinTop + pinR}" r="${pinR + 5}" fill="${color}" fill-opacity="0.28" stroke="none"/>` +
      `<circle cx="${cx}" cy="${pinTop + pinR}" r="${pinR + 2}" fill="none" stroke="${color}" stroke-width="2.5" stroke-opacity="0.55"/>`
    : "";

  const pinPath = isUserPin
    ? `M${cx} ${tip} C${cx - 5} ${tip - 10} ${cx - pinR - 3} ${pinTop + pinR * 1.5} ${cx - pinR - 3} ${pinTop + pinR} A${pinR + 3} ${pinR + 3} 0 1 1 ${cx + pinR + 3} ${pinTop + pinR} C${cx + pinR + 3} ${pinTop + pinR * 1.5} ${cx + 5} ${tip - 10} ${cx} ${tip} Z`
    : `M${cx} ${tip} C${cx - 4} 62 ${cx - 15} 54 ${cx - 15} 42 A15 15 0 1 1 ${cx + 15} 42 C${cx + 15} 54 ${cx + 4} 62 ${cx} ${tip} Z`;

  const pinCenter = isUserPin ? pinTop + pinR : 42;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    // Bayangan di bawah tip
    `<ellipse cx="${cx}" cy="${tip}" rx="${isUserPin ? 9 : 7}" ry="${isUserPin ? 3.5 : 2.5}" fill="rgba(0,0,0,${isUserPin ? "0.3" : "0.25"})"/>` +
    // Glow rings (khusus user pin)
    glowRings +
    // Pill label
    `<rect x="${pillX}" y="1" width="${textW}" height="${isUserPin ? 23 : 21}" rx="${isUserPin ? 11.5 : 10.5}" fill="${color}" stroke="#ffffff" stroke-width="2"/>` +
    `<text x="${cx}" y="${isUserPin ? 16.5 : 15.5}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="${isUserPin ? 12 : 11}" font-weight="700" fill="#ffffff">${escapeXml(label)}</text>` +
    // Kepala pin dengan stroke putih lebih tebal
    `<path d="${pinPath}" fill="${color}" stroke="#ffffff" stroke-width="${isUserPin ? 3.5 : 2.5}"/>` +
    // Kilap dalam kepala pin
    (isUserPin ? `<ellipse cx="${cx - 5}" cy="${pinCenter - 7}" rx="6" ry="4" fill="#ffffff" fill-opacity="0.22" transform="rotate(-25,${cx - 5},${pinCenter - 7})"/>` : "") +
    // Glyph ikon di tengah kepala
    `<g transform="translate(${cx} ${pinCenter})" fill="#ffffff">${glyph(color)}</g>` +
    `</svg>`;

  return makeIcon(key, svg, W, H, cx, tip);
}

/** Mini-bus berwarna rute + kode trayek. Titik hijau = LIVE, abu-abu/pudar = ESTIMASI, outline oranye = terpilih. */
function vehicleIcon(v: {
  code: string;
  color: string;
  focused: boolean;
  fallback: boolean;
  live: boolean;
}): google.maps.Icon {
  const key = `veh-${v.code}-${v.color}-${v.focused}-${v.fallback}-${v.live}`;
  const cached = iconCache.get(key);
  if (cached) return cached;

  const s = v.focused ? 1.25 : 1;
  const W = 56;
  const H = 50;
  const stroke = v.focused ? "#f97316" : "#ffffff";
  const strokeWidth = v.focused ? 4 : 3;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(W * s)}" height="${Math.round(H * s)}" viewBox="0 0 ${W} ${H}">` +
    `<g opacity="${v.fallback ? 0.75 : 1}">` +
    `<ellipse cx="28" cy="46" rx="18" ry="3" fill="rgba(0,0,0,0.22)"/>` +
    `<rect x="6" y="6" width="44" height="28" rx="9" fill="${v.color}" stroke="${stroke}" stroke-width="${strokeWidth}"/>` +
    `<rect x="12" y="11" width="32" height="8" rx="3" fill="#ffffff" fill-opacity="0.92"/>` +
    `<text x="28" y="30" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="700" fill="#ffffff">${escapeXml(v.code)}</text>` +
    `<circle cx="17" cy="36" r="5" fill="#1e293b" stroke="#ffffff" stroke-width="1.5"/>` +
    `<circle cx="39" cy="36" r="5" fill="#1e293b" stroke="#ffffff" stroke-width="1.5"/>` +
    `</g>` +
    (v.live ? `<circle cx="50" cy="8" r="5" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>` : "") +
    `</svg>`;

  return makeIcon(key, svg, Math.round(W * s), Math.round(H * s), Math.round(28 * s), Math.round(20 * s));
}

/* =========================================================
   5. UI PRIMITIVES
========================================================= */

function Spinner({ size = 18, className = "" }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} aria-hidden />;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

/* =========================================================
   DRAGGABLE BOTTOM SHEET HOOK
   Snap positions: "peek" (kecil), "half" (setengah), "full" (penuh)
========================================================= */

type SnapPoint = "peek" | "half" | "full";

function useDraggableSheet(defaultSnap: SnapPoint = "half") {
  const [snap, setSnap] = useState<SnapPoint>(defaultSnap);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0); // positif = ke atas
  const startY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLElement>(null);

  const snapHeights: Record<SnapPoint, number> = {
    peek: 0.18,  // 18% layar
    half: 0.48,  // 48% layar
    full: 0.88,  // 88% layar
  };

  const getHeight = () => {
    if (typeof window === "undefined") return "48dvh";
    const vh = window.innerHeight;
    const base = snapHeights[snap] * vh;
    const h = Math.min(Math.max(base - dragOffset, snapHeights.peek * vh), snapHeights.full * vh);
    return `${Math.round(h)}px`;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    setDragOffset(startY.current - e.clientY);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    const delta = startY.current - e.clientY;
    setDragging(false);
    setDragOffset(0);
    startY.current = null;

    const vh = window.innerHeight;
    const threshold = vh * 0.1; // 10% layar sebagai ambang snap

    setSnap((prev) => {
      if (delta > threshold) {
        // Drag ke atas → naik level
        if (prev === "peek") return "half";
        if (prev === "half") return "full";
        return "full";
      } else if (delta < -threshold) {
        // Drag ke bawah → turun level
        if (prev === "full") return "half";
        if (prev === "half") return "peek";
        return "peek";
      }
      return prev;
    });
  };

  return { snap, setSnap, dragging, dragOffset, getHeight, sheetRef, onPointerDown, onPointerMove, onPointerUp };
}

function DragHandle(props: {
  onPointerDown: React.PointerEventHandler;
  onPointerMove: React.PointerEventHandler;
  onPointerUp: React.PointerEventHandler;
}) {
  return (
    <div
      {...props}
      className="mx-auto flex w-full cursor-grab touch-none select-none items-center justify-center py-2 active:cursor-grabbing"
      aria-label="Seret untuk mengubah ukuran panel"
    >
      <div className="h-1 w-10 rounded-full bg-black/15 transition-colors hover:bg-black/25" />
    </div>
  );
}

function Sheet({ children, defaultSnap = "half" }: { children: ReactNode; defaultSnap?: SnapPoint }) {
  const ds = useDraggableSheet(defaultSnap);
  const height = ds.getHeight();

  return (
    <section
      ref={ds.sheetRef as React.RefObject<HTMLElement>}
      className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md flex-col rounded-t-[28px] bg-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.18)]"
      style={{
        height,
        display: "flex",
        transition: ds.dragging ? "none" : "height 0.28s cubic-bezier(0.32,0.72,0,1)",
        willChange: "height",
      }}
    >
      <DragHandle
        onPointerDown={ds.onPointerDown}
        onPointerMove={ds.onPointerMove}
        onPointerUp={ds.onPointerUp}
      />
      {children}
    </section>
  );
}

/** Versi Sheet khusus untuk perjalanan aktif, mendukung slot footer fixed (tombol simulasi). */
function TripSheet({ children, riding }: { children: ReactNode; riding: boolean }) {
  const ds = useDraggableSheet(riding ? "half" : "half");

  // Reset ke half saat riding berubah
  useEffect(() => {
    ds.setSnap("half");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riding]);

  const height = ds.getHeight();

  return (
    <section
      className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md flex-col rounded-t-[28px] bg-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.18)]"
      style={{
        height,
        display: "flex",
        transition: ds.dragging ? "none" : "height 0.28s cubic-bezier(0.32,0.72,0,1)",
        willChange: "height",
      }}
    >
      <DragHandle
        onPointerDown={ds.onPointerDown}
        onPointerMove={ds.onPointerMove}
        onPointerUp={ds.onPointerUp}
      />
      {children}
    </section>
  );
}

function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[28px] bg-white px-5 pt-3 sm:px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[28px]"
      >
        <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-black/15 sm:hidden" />
        {children}
      </div>
    </div>
  );
}

function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-red-800">Gagal memuat data</p>
        <p className="mt-0.5 break-words text-[12px] text-red-700">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-[12px] font-bold text-red-800 underline">
            Coba lagi
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   5b. UI TRANSIT — stepper perjalanan + pilihan angkot
========================================================= */

function RouteChip({ code, color }: { code: string; color: string }) {
  return (
    <span
      className="inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-bold text-white"
      style={{ background: color }}
    >
      {code}
    </span>
  );
}

function JourneyRow({
  node,
  railColor,
  dimmed = false,
  children,
}: {
  node: ReactNode;
  railColor?: string;
  dimmed?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex gap-3 ${dimmed ? "opacity-50" : ""}`}>
      <div className="flex w-9 shrink-0 flex-col items-center">
        {node}
        {railColor && (
          <span
            aria-hidden
            className="my-1 min-h-3 w-1 flex-1 rounded-full"
            style={{ background: railColor }}
          />
        )}
      </div>
      <div className={`min-w-0 flex-1 pt-1 ${railColor ? "pb-3" : ""}`}>{children}</div>
    </div>
  );
}

/** Stepper vertikal: naik -> (transit, paling menonjol) -> turun. */
function TransitJourney({
  option,
  activeLeg,
  riding,
  destinationName,
  totalMinutes,
  pick,
}: {
  option: SearchOption;
  activeLeg: number;
  riding: boolean;
  destinationName: string;
  totalMinutes: number | null;
  pick: JourneyPick | null;
}) {
  const { legs } = option;

  const rows = legs.flatMap((leg, index) => {
    const next = legs[index + 1];
    const done = index < activeLeg;
    const current = index === activeLeg;

    const board = (
      <JourneyRow
        key={`board-${leg.legOrder}`}
        railColor={legColor(index)}
        dimmed={done}
        node={
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white"
            style={{ border: `2px solid ${legColor(index)}`, color: legColor(index) }}
          >
            {done ? <Check size={14} strokeWidth={3} /> : <BusFront size={14} />}
          </span>
        }
      >
        <p className="flex items-center gap-1.5 text-[13px] font-bold text-slate-900">
          Naik angkot <RouteChip code={leg.routeCode} color={legColor(index)} />
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {leg.routeName}, ±{rideMinutes(leg.rideDistanceMeters)} mnt ({formatDistance(leg.rideDistanceMeters)})
        </p>
        {current && (
          <p className="mt-0.5 text-[11px] font-semibold" style={{ color: legColor(index) }}>
            {riding ? "Sedang dinaiki" : "Menunggu angkot"}
          </p>
        )}
      </JourneyRow>
    );

    const after = next ? (
      <JourneyRow
        key={`transit-${leg.legOrder}`}
        railColor={legColor(index + 1)}
        dimmed={done}
        node={
          <span className="-my-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white shadow-md shadow-violet-600/30 ring-4 ring-violet-100">
            <ArrowRightLeft size={17} />
          </span>
        }
      >
        <p className="text-[14px] font-bold text-slate-900">{leg.transitHalteName ?? "Halte transit"}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          Turun, lalu ganti ke
          <RouteChip code={next.routeCode} color={legColor(index + 1)} />
        </p>
        {pick && index === activeLeg && (
          <p className="mt-1.5 inline-flex flex-wrap items-center gap-x-1.5 rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-800 ring-1 ring-inset ring-violet-200">
            Pilihanmu: {pick.routeCode} {pick.label}
            {pick.waitMinutes !== null &&
              (pick.waitMinutes === 0 ? ", tanpa menunggu" : `, tunggu ±${pick.waitMinutes} mnt`)}
          </p>
        )}
      </JourneyRow>
    ) : (
      <JourneyRow
        key="end"
        node={
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Flag size={14} />
          </span>
        }
      >
        <p className="text-[13px] font-bold text-slate-900">Turun, lalu jalan ke tujuan</p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {destinationName}, jalan ±{option.walkFromLastAlightMeters} m
        </p>
      </JourneyRow>
    );

    return [board, after];
  });

  return (
    <div className={CARD}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[14px] font-bold text-slate-900">Perjalanan kamu</h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
          Ganti {legs.length - 1}x{totalMinutes !== null ? `, total ±${totalMinutes} mnt` : ""}
        </span>
      </div>
      <div>{rows}</div>
    </div>
  );
}

const TAG_STYLE: Record<OptionTag, { label: string; cls: string }> = {
  recommended: { label: "Disarankan", cls: "bg-emerald-600 text-white" },
  fastest: { label: "Tercepat", cls: "bg-blue-100 text-blue-800" },
  roomiest: { label: "Paling lega", cls: "bg-violet-100 text-violet-800" },
};

function DensityBar({ option }: { option: TransitOption }) {
  if (option.density === null) return null;

  const { density, overCapacity, vehicle } = option;
  const tone =
    density < 0.5
      ? { bar: "bg-emerald-500", text: "Lega" }
      : density < 0.85
        ? { bar: "bg-amber-500", text: "Cukup terisi" }
        : { bar: "bg-red-500", text: "Penuh" };

  const a = vehicle.assignment;

  return (
    <span className="mt-2.5 flex items-center gap-2">
      <Users size={13} className="shrink-0 text-slate-400" />
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <span
          className={`block h-full rounded-full ${tone.bar}`}
          style={{ width: `${Math.max(6, Math.round(density * 100))}%` }}
        />
      </span>
      <span className="shrink-0 text-[11px] font-medium text-slate-600">
        {tone.text}
        {/* Angka mentah disembunyikan bila melebihi kapasitas (data tidak masuk akal). */}
        {!overCapacity && a?.passengers !== undefined && a.capacity
          ? `, ${a.passengers}/${a.capacity} kursi`
          : ""}
      </span>
    </span>
  );
}

function TransitOptionCard({
  option,
  color,
  now,
  selected,
  onSelect,
}: {
  option: TransitOption;
  color: string;
  now: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const { vehicle: v } = option;
  const a = v.assignment;
  const subtitle = [a?.plateNumber, a?.startTime ? `jadwal ${a.startTime.slice(0, 5)}` : null]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={selected ? { borderColor: color, boxShadow: `0 0 0 1px ${color}` } : undefined}
      className={`block w-full rounded-2xl border bg-white p-3.5 text-left transition active:scale-[0.99] ${
        selected ? "" : "border-slate-200"
      }`}
    >
      <span className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
          style={{
            borderColor: selected ? color : "#cbd5e1",
            background: selected ? color : "transparent",
          }}
        >
          {selected && <Check size={12} strokeWidth={3} className="text-white" />}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-[14px] font-bold text-slate-900">
              {a?.vehicleCode ?? `Armada #${v.assignmentId}`}
            </span>
            {option.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TAG_STYLE[tag].cls}`}
              >
                {TAG_STYLE[tag].label}
              </span>
            ))}
          </span>

          {subtitle && <span className="mt-0.5 block text-[11px] text-slate-500">{subtitle}</span>}

          <span className="mt-1.5 flex flex-wrap gap-1.5">
            {option.live && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <Radio size={10} />
                Live
              </span>
            )}
            {option.estimate && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                Estimasi jadwal
              </span>
            )}
            {option.stale && v.recordedAt && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                GPS terakhir {formatAgo(v.recordedAt, now)}
              </span>
            )}
          </span>
        </span>

        {option.eta !== null && (
          <span className="shrink-0 text-right">
            <span className="block text-[24px] font-bold leading-6" style={{ color }}>
              {option.eta}
            </span>
            <span className="block text-[10px] font-medium text-slate-500">mnt ke halte</span>
          </span>
        )}
      </span>

      {option.wait !== null ? (
        <span className="mt-2.5 flex items-center gap-1.5 text-[12px] font-medium text-slate-700">
          <Clock size={13} className="text-slate-400" />
          {option.wait === 0
            ? "Langsung naik begitu kamu tiba"
            : `Tunggu ±${option.wait} mnt setelah kamu tiba`}
        </span>
      ) : null}

      <DensityBar option={option} />
    </button>
  );
}

/** Kartu pilihan angkot leg berikutnya, ditampilkan di halte transit. */
function TransitPicker({
  halteName,
  routeCode,
  color,
  arrivalMinutes,
  options,
  pickId,
  now,
  onPick,
}: {
  halteName: string;
  routeCode: string;
  color: string;
  arrivalMinutes: number | null;
  options: TransitOption[];
  pickId: number | null;
  now: number;
  onPick: (id: number) => void;
}) {
  return (
    <div className={CARD}>
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: color }}
        >
          <ArrowRightLeft size={19} />
        </span>
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold leading-5 text-slate-900">
            Pilih angkot {routeCode} di {halteName}
          </h3>
          <p className="mt-0.5 text-[12px] text-slate-500">
            {arrivalMinutes !== null
              ? `Kamu tiba di halte ini ±${arrivalMinutes} mnt lagi. Pilih angkot yang mau ditunggu.`
              : "Pilih angkot yang mau ditunggu."}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        {options.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-[12px] text-slate-500">
            Belum ada angkot {routeCode} yang bisa dikejar saat ini.
          </p>
        ) : (
          options.map((option) => (
            <TransitOptionCard
              key={option.vehicle.assignmentId}
              option={option}
              color={color}
              now={now}
              selected={pickId === option.vehicle.assignmentId}
              onSelect={() => onPick(option.vehicle.assignmentId)}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* =========================================================
   6. CUSTOM HOOKS
========================================================= */

/* ---------- 6a. Google Maps ---------- */

function useGoogleMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers = useRef<Record<Field, google.maps.Marker | null>>({
    origin: null,
    destination: null,
  });
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey || !mapRef.current) {
        console.warn("Google Maps API key belum tersedia.");
        return;
      }

      try {
        setOptions({ key: apiKey, v: "weekly" });
        const { Map } = (await importLibrary("maps")) as google.maps.MapsLibrary;
        if (cancelled || !mapRef.current) return;

        const instance = new Map(mapRef.current, {
          center: MALANG_CENTER,
          zoom: 13,
          disableDefaultUI: true,
          gestureHandling: "greedy", // 1 jari langsung geser peta di HP
          clickableIcons: false,
        });
        mapInstance.current = instance;
        setMap(instance);
      } catch (error) {
        console.error("Gagal memuat Google Maps:", error);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const clearMarker = (field: Field) => {
    markers.current[field]?.setMap(null);
    markers.current[field] = null;
  };

  // Pin titik jemput (lokasi awal user) & titik tujuan user.
  const setMarker = (location: LatLng, field: Field) => {
    if (!mapInstance.current) return;

    markers.current[field]?.setMap(null);
    markers.current[field] = new google.maps.Marker({
      map: mapInstance.current,
      position: location,
      title: field === "origin" ? "Titik jemput" : "Titik tujuan",
      icon: pinIcon(field === "origin" ? "origin" : "destination", field === "origin" ? "Titik Jemput" : "Tujuan"),
      zIndex: 20,
    });

    mapInstance.current.panTo(location);
  };

  const fitToLocations = (a: LatLng, b: LatLng) => {
    if (!mapInstance.current) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(a);
    bounds.extend(b);
    mapInstance.current.fitBounds(bounds, mapPadding());
  };

  // Pusatkan peta ke satu titik (mis. angkot terpilih), geser sedikit agar tidak tertutup bottom sheet.
  const focusOn = (point: LatLng, zoom = 16) => {
    const instance = mapInstance.current;
    if (!instance) return;
    instance.setZoom(Math.max(instance.getZoom() ?? 0, zoom));
    instance.setCenter(point);
    instance.panBy(0, Math.round(window.innerHeight * 0.18));
  };

  return { mapRef, map, setMarker, clearMarker, fitToLocations, focusOn };
}

/* ---------- 6b. Overlay perjalanan: polyline sisa + garis oranye + marker halte + marker angkot ---------- */

type MarkerVehicle = {
  id: number;
  code: string;
  color: string;
  pos: LatLng;
  focused: boolean;
  fallback: boolean;
  live: boolean;
};

function useTripOverlays(
  map: google.maps.Map | null,
  input: {
    remaining: LatLng[];
    upcoming: LatLng[][];
    color: string;
    upcomingColor: string;
    vehicles: MarkerVehicle[];
    stops: StopMarker[];
    fitPath: LatLng[];
    fitKey: string;
    approach: ApproachLine[];
    onVehicleClick: (id: number) => void;
  },
) {
  const { remaining, upcoming, color, upcomingColor, vehicles, stops, fitPath, fitKey, approach, onVehicleClick } = input;
  const clickRef = useRef(onVehicleClick);
  clickRef.current = onVehicleClick;
  const main = useRef<google.maps.Polyline | null>(null);
  const dashed = useRef<google.maps.Polyline[]>([]);
  const approachLines = useRef<Record<number, google.maps.Polyline>>({});
  const markers = useRef<Record<number, google.maps.Marker>>({});
  const stopMarkers = useRef<Record<string, google.maps.Marker>>({});

  // Polyline sisa (belum dilewati) + panah searah perjalanan.
  useEffect(() => {
    if (!map) return;

    if (remaining.length < 2) {
      main.current?.setMap(null);
      main.current = null;
      return;
    }

    const options: google.maps.PolylineOptions = {
      path: remaining,
      strokeColor: color,
      strokeOpacity: 0.95,
      strokeWeight: 7,
      zIndex: 5,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 2.6,
            fillColor: "#ffffff",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 1,
          },
          offset: "20px",
          repeat: "64px",
        },
      ],
    };

    if (main.current) main.current.setOptions(options);
    else main.current = new google.maps.Polyline({ ...options, map });
  }, [map, remaining, color]);

  // Garis ORANYE: SATU garis per angkot, dari posisi angkot (live / estimasi /
  // belum berangkat) sampai titik naik user. Gayanya sama dengan garis biru:
  // solid, tebal 7, dengan panah putih searah perjalanan.
  // Path dihitung ulang tiap posisi live berubah, sehingga ujung garis ikut maju.
  useEffect(() => {
    if (!map) return;

    const keep = new Set(approach.map((line) => line.id));
    Object.keys(approachLines.current).forEach((key) => {
      const id = Number(key);
      if (!keep.has(id)) {
        approachLines.current[id].setMap(null);
        delete approachLines.current[id];
      }
    });

    approach.forEach((line) => {
      if (line.path.length < 2) return;

      // Angkot terpilih paling tegas; angkot estimasi sedikit lebih pudar.
      const opacity = line.focused ? 1 : line.fallback ? 0.65 : 0.95;

      const options: google.maps.PolylineOptions = {
        path: line.path,
        strokeColor: APPROACH_COLOR,
        strokeOpacity: opacity,
        strokeWeight: line.focused ? 8 : 7,
        zIndex: line.focused ? 7 : 4,
        icons: [
          {
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 2.6,
              fillColor: "#ffffff",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 1,
            },
            offset: "20px",
            repeat: "64px",
          },
        ],
      };

      const existing = approachLines.current[line.id];
      if (existing) existing.setOptions(options);
      else approachLines.current[line.id] = new google.maps.Polyline({ ...options, map });
    });
  }, [map, approach]);

  // Leg berikutnya (transit): titik bulat (dot) tebal + garis bayangan putih di bawahnya.
  useEffect(() => {
    if (!map) return;

    dashed.current.forEach((line) => line.setMap(null));

    const lines: google.maps.Polyline[] = [];

    upcoming.filter((path) => path.length >= 2).forEach((path) => {
      // Garis "shadow" putih tipis di bawah (memberikan kesan border)
      lines.push(
        new google.maps.Polyline({
          map,
          path,
          strokeOpacity: 0,
          zIndex: 2,
          icons: [
            {
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "#ffffff",
                fillOpacity: 0.9,
                strokeColor: "transparent",
                strokeWeight: 0,
                scale: 6.5,
              },
              offset: "0",
              repeat: "18px",
            },
          ],
        }),
      );
      // Titik berwarna (lebih besar, lebih solid)
      lines.push(
        new google.maps.Polyline({
          map,
          path,
          strokeOpacity: 0,
          zIndex: 3,
          icons: [
            {
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: upcomingColor,
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 1.5,
                strokeOpacity: 1,
                scale: 4.5,
              },
              offset: "0",
              repeat: "18px",
            },
          ],
        }),
      );
    });

    dashed.current = lines;
  }, [map, upcoming, upcomingColor]);

  // Marker halte angkot: naik / transit / turun.
  useEffect(() => {
    if (!map) return;

    const keep = new Set(stops.map((s) => s.id));
    Object.keys(stopMarkers.current).forEach((id) => {
      if (!keep.has(id)) {
        stopMarkers.current[id].setMap(null);
        delete stopMarkers.current[id];
      }
    });

    stops.forEach((stop) => {
      const icon = pinIcon(stop.kind, stop.label);
      const existing = stopMarkers.current[stop.id];

      if (existing) {
        existing.setPosition(stop.pos);
        existing.setIcon(icon);
        existing.setTitle(stop.title);
      } else {
        stopMarkers.current[stop.id] = new google.maps.Marker({
          map,
          position: stop.pos,
          icon,
          title: stop.title,
          zIndex: 30,
        });
      }
    });
  }, [map, stops]);

  // Marker angkot (mini-bus berwarna rute + kode trayek).
  useEffect(() => {
    if (!map) return;

    const keep = new Set(vehicles.map((v) => v.id));
    Object.keys(markers.current).forEach((key) => {
      const id = Number(key);
      if (!keep.has(id)) {
        markers.current[id].setMap(null);
        delete markers.current[id];
      }
    });

    vehicles.forEach((v) => {
      const icon = vehicleIcon(v);
      const zIndex = v.focused ? 100 : 50;
      const existing = markers.current[v.id];

      if (existing) {
        existing.setPosition(v.pos);
        existing.setIcon(icon);
        existing.setZIndex(zIndex);
      } else {
        const marker = new google.maps.Marker({
          map,
          position: v.pos,
          icon,
          zIndex,
          title: `Angkot ${v.code} #${v.id}`,
        });
        marker.addListener("click", () => clickRef.current(v.id));
        markers.current[v.id] = marker;
      }
    });
  }, [map, vehicles]);

  // Zoom ke jalur leg aktif saat leg / rute berganti.
  useEffect(() => {
    if (!map || fitPath.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    fitPath.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, mapPadding());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, fitKey]);

  // Bersihkan saat unmount.
  useEffect(
    () => () => {
      main.current?.setMap(null);
      Object.values(approachLines.current).forEach((line) => line.setMap(null));
      dashed.current.forEach((line) => line.setMap(null));
      Object.values(stopMarkers.current).forEach((marker) => marker.setMap(null));
      Object.values(markers.current).forEach((marker) => marker.setMap(null));
    },
    [],
  );
}

/* ---------- 6c. Places Autocomplete ---------- */

function usePlaceSuggestions(activeField: Field | null, originQuery: string, destinationQuery: string) {
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = activeField === "origin" ? originQuery : destinationQuery;

    if (!activeField || query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const { AutocompleteSuggestion } = (await importLibrary("places")) as google.maps.PlacesLibrary;
        const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          includedRegionCodes: ["id"],
          locationBias: { center: MALANG_CENTER, radius: 30000 },
        });
        if (cancelled) return;

        setSuggestions(
          (response.suggestions || [])
            .map((s) => s.placePrediction)
            .filter((p): p is Prediction => p !== null && p !== undefined),
        );
      } catch (error) {
        if (!cancelled) {
          console.error("Autocomplete error:", error);
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [originQuery, destinationQuery, activeField]);

  return { suggestions, loading };
}

/* ---------- 6d. WebSocket live tracking (multi vehicleAssignmentId) ---------- */

function useLiveVehicles(ids: number[]) {
  const socketRef = useRef<Socket | null>(null);
  const subscribed = useRef<Set<number>>(new Set());
  const wanted = useRef<number[]>(ids);
  const [connected, setConnected] = useState(false);
  const [positions, setPositions] = useState<Record<number, LivePosition>>({});

  // Satu koneksi socket untuk seluruh halaman.
  useEffect(() => {
    const socket = io(`${WS_URL}/live-location`, {
      transports: ["websocket"],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      subscribed.current.clear();
      wanted.current.forEach((id) => {
        socket.emit("subscribeAssignment", { assignmentId: id });
        subscribed.current.add(id);
      });
    });

    socket.on("disconnect", () => setConnected(false));

    // Termasuk data awal dari cache Redis saat baru subscribe.
    socket.on(
      "locationUpdated",
      (data: { vehicleAssignmentId: number; latitude: string | number; longitude: string | number; createdAt: string }) => {
        const lat = parseFloat(String(data.latitude));
        const lng = parseFloat(String(data.longitude));
        if (Number.isNaN(lat) || Number.isNaN(lng)) return;

        setPositions((previous) => ({
          ...previous,
          [data.vehicleAssignmentId]: { lat, lng, at: data.createdAt },
        }));
      },
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
      subscribed.current.clear();
    };
  }, []);

  // Sinkronkan subscription: hanya subscribe/unsubscribe selisihnya.
  const key = ids.join(",");
  useEffect(() => {
    wanted.current = ids;
    const socket = socketRef.current;
    if (!socket || !socket.connected) return; // ditangani handler "connect"

    const next = new Set(ids);

    subscribed.current.forEach((id) => {
      if (!next.has(id)) {
        socket.emit("unsubscribeAssignment", { assignmentId: id });
        subscribed.current.delete(id);
      }
    });

    next.forEach((id) => {
      if (!subscribed.current.has(id)) {
        socket.emit("subscribeAssignment", { assignmentId: id });
        subscribed.current.add(id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { connected, positions };
}

/* ---------- 6e. Progres perjalanan ---------- */

function useTripProgress(legCount: number) {
  const [activeLeg, setActiveLeg] = useState(0);
  const [riding, setRiding] = useState(false);
  const [focusedId, setFocusedId] = useState<number | null>(null);

  const isLastLeg = activeLeg >= legCount - 1;

  const nextLeg = () => {
    setActiveLeg((previous) => Math.min(previous + 1, legCount - 1));
    setRiding(false);
    setFocusedId(null);
  };

  const reset = () => {
    setActiveLeg(0);
    setRiding(false);
    setFocusedId(null);
  };

  return { activeLeg, riding, focusedId, isLastLeg, setRiding, setFocusedId, nextLeg, reset };
}


/* =========================================================
   7. PENCARIAN LOKASI
========================================================= */

function LocationInput({
  field,
  value,
  active,
  resolving,
  onChange,
  onFocus,
  onClear,
}: {
  field: Field;
  value: string;
  active: boolean;
  resolving: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
  onClear: () => void;
}) {
  const isOrigin = field === "origin";

  return (
    <div className={`flex items-center gap-3 rounded-xl px-3 transition ${active ? "bg-white shadow-sm" : ""}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isOrigin ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-600"
        }`}
      >
        <MapPin size={17} />
      </div>

      <div className="min-w-0 flex-1 py-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {isOrigin ? "Lokasi penjemputan" : "Tujuan perjalanan"}
        </p>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          placeholder={isOrigin ? "Lokasi awal" : "Mau pergi ke mana?"}
          className="h-8 w-full bg-transparent text-[16px] font-semibold sm:text-[14px] text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400"
        />
      </div>

      {resolving ? (
        <Spinner size={17} className="text-blue-600" />
      ) : (
        value && (
          <button
            onClick={onClear}
            aria-label={isOrigin ? "Hapus lokasi awal" : "Hapus tujuan"}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        )
      )}
    </div>
  );
}

function SearchCard(props: {
  originQuery: string;
  destinationQuery: string;
  activeField: Field | null;
  suggestions: Prediction[];
  suggestionsLoading: boolean;
  resolvingField: Field | null;
  locating: boolean;
  canSearch: boolean;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onFocusField: (field: Field) => void;
  onClear: (field: Field) => void;
  onUseCurrentLocation: () => void;
  onSwap: () => void;
  onSelectSuggestion: (prediction: Prediction, field: Field) => void;
  onPreset: (preset: DemoPreset) => void;
  onSearch: () => void;
}) {
  const { activeField, suggestions, suggestionsLoading } = props;

  return (
    <div className="mx-auto max-h-[calc(100dvh-1.5rem)] max-w-xl overflow-y-auto overscroll-contain rounded-[28px] border border-white/80 bg-white/95 p-3.5 shadow-[0_8px_35px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-4">
      <div className="relative rounded-2xl border border-slate-200 bg-slate-50/80 p-1">
        <LocationInput
          field="origin"
          value={props.originQuery}
          active={activeField === "origin"}
          resolving={props.resolvingField === "origin"}
          onChange={props.onOriginChange}
          onFocus={() => props.onFocusField("origin")}
          onClear={() => props.onClear("origin")}
        />

        <div className="relative ml-[29px] h-5">
          <div className="absolute bottom-0 left-0 top-0 border-l-2 border-dashed border-slate-300" />
          <button
            onClick={props.onSwap}
            aria-label="Tukar lokasi"
            className="absolute -right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition active:scale-95"
          >
            <ArrowUpDown size={15} />
          </button>
        </div>

        <LocationInput
          field="destination"
          value={props.destinationQuery}
          active={activeField === "destination"}
          resolving={props.resolvingField === "destination"}
          onChange={props.onDestinationChange}
          onFocus={() => props.onFocusField("destination")}
          onClear={() => props.onClear("destination")}
        />
      </div>

      {/* SUGGESTIONS */}
      {activeField && (suggestionsLoading || suggestions.length > 0) && (
        <div className="mt-2">
          <ul className="max-h-[32dvh] overflow-y-auto overscroll-contain rounded-2xl bg-white p-1.5 shadow-md ring-1 ring-black/5">
            {suggestionsLoading && suggestions.length === 0 && (
              <li className="flex items-center gap-3 px-3 py-3 text-[14px] text-slate-500">
                <Spinner size={16} className="text-blue-600" />
                Mencari lokasi...
              </li>
            )}
            {suggestions.map((item) => (
              <li key={item.placeId} className={suggestionsLoading ? "opacity-50 transition" : "transition"}>
                <button
                  onClick={() => props.onSelectSuggestion(item, activeField)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left active:bg-slate-100"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      activeField === "origin" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-500"
                    }`}
                  >
                    <MapPin size={17} />
                  </span>
                  <span className="line-clamp-2 text-[15px] text-slate-700">{item.text.toString()}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* PINTASAN DEMO */}
      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
          <Zap size={12} className="text-orange-500" />
          Pilih mode demo (awal + tujuan)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => props.onPreset(preset)}
              className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-left transition active:scale-95"
            >
              <p className="text-[12px] font-bold text-orange-800">{preset.label}</p>
              <p className="text-[11px] text-orange-700">{preset.hint}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={props.onUseCurrentLocation}
        disabled={props.locating}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 py-3 text-[13px] font-bold text-blue-700 transition hover:bg-blue-100 active:scale-[0.98] disabled:opacity-60"
      >
        {props.locating ? <Spinner size={17} /> : <LocateFixed size={17} />}
        {props.locating ? "Mencari lokasi kamu..." : "Gunakan lokasi saya saat ini"}
      </button>

      <button onClick={props.onSearch} disabled={!props.canSearch} className={`${PRIMARY_BTN} mt-2.5`}>
        <Search size={18} />
        Cari Angkot
      </button>
    </div>
  );
}

function TripSummaryBar({
  origin,
  destination,
  onEdit,
}: {
  origin: LocationData | null;
  destination: LocationData | null;
  onEdit: () => void;
}) {
  const row = (tone: string, label: string, name: string) => (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <MapPin size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="truncate text-[13px] font-semibold text-slate-800">{name}</p>
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-white/80 bg-white/95 p-3.5 shadow-[0_8px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <div className="min-w-0 flex-1 space-y-1">
        {row("bg-blue-50 text-blue-600", "Dari", origin?.name || "Lokasi awal")}
        <div className="ml-[13px] h-3 border-l-2 border-dashed border-slate-300" />
        {row("bg-orange-50 text-orange-600", "Tujuan", destination?.name || "Lokasi tujuan")}
      </div>
      <button
        onClick={onEdit}
        aria-label="Edit rute"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-700 transition hover:bg-blue-100 active:scale-95"
      >
        <Pencil size={17} />
      </button>
    </div>
  );
}

/* =========================================================
   8. STATUS PENCARIAN (menunggu hasil /routes/search)
========================================================= */

function SearchStatusSheet({
  loading,
  error,
  onRetry,
}: {
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  return (
    <Sheet defaultSnap="half">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2">
        {error ? (
          <ErrorBox message={error.message} onRetry={onRetry} />
        ) : loading ? (
          <>
            <p className="flex items-center gap-2 text-[14px] font-semibold text-slate-700">
              <Spinner size={16} className="text-blue-600" />
              Mencari rute angkot...
            </p>
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </>
        ) : (
          <div className="rounded-2xl bg-white p-6 text-center text-[14px] text-slate-500 shadow-sm ring-1 ring-black/5">
            Rute angkot belum ditemukan. Coba ubah lokasi awal atau tujuan.
          </div>
        )}
      </div>
    </Sheet>
  );
}

/* =========================================================
   9. PERJALANAN AKTIF
========================================================= */

function TripMapChips({
  connected,
  riding,
  etaMinutes,
  code,
}: {
  connected: boolean;
  riding: boolean;
  etaMinutes: number | null;
  code: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[calc(7.75rem+env(safe-area-inset-top))] z-10 mx-auto flex w-full max-w-md items-center justify-between gap-2 px-4">
      <span className="flex min-w-0 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-md">
        <span className={`h-2 w-2 shrink-0 rounded-full ${connected ? "animate-pulse bg-green-500" : "bg-slate-400"}`} />
        <span className="truncate">{riding ? `Dalam angkot ${code}` : `Menunggu angkot ${code}`}</span>
      </span>

      {!riding && etaMinutes !== null && (
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-[12px] font-bold text-white shadow-md">
          <Clock size={13} />~{etaMinutes} menit
        </span>
      )}
    </div>
  );
}

function TransitBanner({ previous, current }: { previous: SearchLeg; current: SearchLeg }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white">
        <Navigation size={17} />
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-blue-800">
          Transit berhasil di {previous.transitHalteName ?? "halte transit"}
        </p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-blue-700">
          Silakan naik angkot <b>{current.routeCode}</b> untuk melanjutkan perjalanan ke tujuan akhir.
        </p>
      </div>
    </div>
  );
}

function VehicleRow({
  vehicle,
  code,
  stopEstimates,
  isLive,
  focused,
  riding,
  canBoard,
  onBoard,
  onToggle,
}: {
  vehicle: Vehicle;
  code: string;
  stopEstimates: StopEstimate[];
  isLive: boolean;
  focused: boolean;
  riding: boolean;
  canBoard: boolean;
  onBoard: () => void;
  onToggle: () => void;
}) {
  const statusLabel = STATUS_LABEL[vehicle.status] ?? vehicle.status;
  const assignment = vehicle.assignment;
  // Angkot yang dipilih user (mis. dari halte transit) tetap bisa dinaiki walau status API berubah.
  const boardable = canBoard && (!vehicle.passed || focused);

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white transition ${
        focused
          ? "border-blue-500 shadow-md shadow-blue-900/10 ring-1 ring-blue-500"
          : "border-slate-200 shadow-sm hover:border-slate-300"
      } ${vehicle.passed && !focused ? "opacity-55" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={vehicle.passed && !focused}
        aria-pressed={focused}
        className="flex w-full items-start gap-3 p-3.5 text-left transition hover:bg-slate-50/80 disabled:cursor-not-allowed"
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            focused
              ? "bg-blue-700 text-white"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {focused ? <Crosshair size={19} /> : <BusFront size={19} />}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-[14px] font-bold leading-5 text-slate-900">
              {assignment?.plateNumber ?? `Armada #${vehicle.assignmentId}`}
            </span>
            {isLive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <Radio size={9} />
                Live
              </span>
            ) : vehicle.isFallback ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600 ring-1 ring-inset ring-slate-200">
                Estimasi
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
            Angkot {code}
            {assignment?.vehicleCode && ` • ${assignment.vehicleCode}`}
            {` • Tugas #${vehicle.assignmentId}`}
          </span>

          <span className="mt-2 flex flex-wrap gap-1.5">
            {assignment?.driverName && (
              <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                Sopir {assignment.driverName}
              </span>
            )}
            {assignment?.capacity !== undefined && (
              <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                {assignment.capacity} kursi
              </span>
            )}
            <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
              {statusLabel}
              {vehicle.distanceMeters !== null &&
                ` • ${formatDistance(vehicle.distanceMeters)}`}
            </span>
            {assignment?.assignmentStatus && (
              <span className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-100">
                Tugas {assignment.assignmentStatus}
              </span>
            )}
            {assignment?.vehicleStatus && (
              <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                Kendaraan {assignment.vehicleStatus}
              </span>
            )}
            {vehicle.waitMinutes !== null && (
              <span className="rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-700 ring-1 ring-inset ring-violet-100">
                Tunggu ±{vehicle.waitMinutes} mnt
              </span>
            )}
          </span>
        </span>

        {vehicle.etaMinutes !== null && (
          <span className="shrink-0 rounded-xl bg-blue-50 px-2.5 py-2 text-center ring-1 ring-inset ring-blue-100">
            <span className="block text-[17px] font-bold leading-5 text-blue-700">
              {vehicle.etaMinutes}
            </span>
            <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wide text-blue-600">
              menit
            </span>
          </span>
        )}
      </button>

      {stopEstimates.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-slate-700">Halte rute</p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Estimasi waktu dari posisi angkot
              </p>
            </div>
            <MapPin size={15} className="shrink-0 text-slate-400" />
          </div>
          <ol className="relative mt-3 space-y-2.5 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-slate-200">
            {stopEstimates.map(({ stop, etaMinutes, passed }) => (
              <li
                key={`${stop.halteId}-${stop.stopSequence}`}
                className="relative grid grid-cols-[12px_minmax(0,1fr)_auto] items-center gap-2.5"
              >
                <span
                  className={`z-10 h-2.5 w-2.5 rounded-full border-2 border-white ${
                    passed ? "bg-slate-300" : "bg-blue-600"
                  }`}
                />
                <span className="min-w-0 text-[11px] font-medium leading-4 text-slate-700">
                  {stop.name}
                </span>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${
                    passed
                      ? "bg-slate-100 text-slate-400"
                      : etaMinutes === null
                        ? "bg-white text-slate-400 ring-1 ring-inset ring-slate-200"
                        : "bg-white text-blue-700 ring-1 ring-inset ring-blue-100"
                  }`}
                >
                  {passed
                    ? "Terlewati"
                    : etaMinutes === null
                      ? "—"
                      : etaMinutes === 0
                        ? "Di sini"
                        : `±${etaMinutes} menit`}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {!riding && (
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={onBoard}
            disabled={!boardable}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2.5 text-[12px] font-bold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
          >
            <BusFront size={16} />
            {canBoard
              ? "Saya telah menaiki angkot ini"
              : "Tersedia setelah transit"}
          </button>
        </div>
      )}
    </div>
  );
}

function VehiclesCard({
  leg,
  vehicles,
  routePath,
  positions,
  focusedId,
  riding,
  loading,
  error,
  onRetry,
  onToggleFocus,
  onBoard,
  upcoming = false,
}: {
  leg: TrackLeg | undefined;
  vehicles: Vehicle[];
  routePath: LatLng[];
  positions: Record<number, LivePosition>;
  focusedId: number | null;
  riding: boolean;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  onToggleFocus: (id: number) => void;
  onBoard: (id: number) => void;
  upcoming?: boolean;
}) {
  const code = leg?.route.code ?? "";
  const shown = riding ? vehicles.filter((v) => v.assignmentId === focusedId) : vehicles;

  return (
    <div className={CARD}>
      <div className="space-y-2.5">
        {loading ? (
          <>
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </>
        ) : error ? (
          <ErrorBox message={error.message} onRetry={onRetry} />
        ) : shown.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-[12px] text-slate-500">
            Belum ada angkot beroperasi di sekitar rute ini.
          </p>
        ) : (
          shown.map((vehicle) => (
            <VehicleRow
              key={vehicle.assignmentId}
              vehicle={vehicle}
              code={code}
              stopEstimates={estimateStopArrivals(
                leg?.stops ?? [],
                routePath,
                vehicle.polylineIndex,
              )}
              isLive={!!positions[vehicle.assignmentId]}
              focused={focusedId === vehicle.assignmentId}
              riding={riding}
              canBoard={!upcoming}
              onBoard={() => onBoard(vehicle.assignmentId)}
              onToggle={() => onToggleFocus(vehicle.assignmentId)}
            />
          ))
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
        <Tablet size={14} className="shrink-0 text-slate-400" />
        Pembayaran tersedia melalui iPad di belakang kursi sopir
      </div>
    </div>
  );
}

/* =========================================================
   10. MODAL
========================================================= */

function NearDestinationModal({
  leg,
  nextLeg,
  isLastLeg,
  stopName,
  onGetOff,
  onClose,
}: {
  leg: SearchLeg;
  nextLeg: SearchLeg | null;
  isLastLeg: boolean;
  stopName: string;
  onGetOff: () => void;
  onClose: () => void;
}) {
  const stopType = isLastLeg ? "Tujuan" : "Transit";

  return (
    <Modal onClose={onClose}>
      <div className="text-center">
        <div className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-blue-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg shadow-blue-700/30">
            <Footprints size={36} />
          </div>
          <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-blue-700 shadow ring-1 ring-blue-100">
            <CheckCircle2 size={20} />
          </span>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1.5 text-[12px] font-semibold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-blue-700" />
          Sampai di Halte {stopType}
        </span>

        <h2 className="mt-4 text-[22px] font-bold leading-tight tracking-tight sm:text-[26px] text-slate-900">
          Wah, Anda Sudah Dekat dengan Halte {stopType}!
        </h2>

        <p className="mt-3 flex items-center justify-center gap-2 text-[15px] font-semibold text-blue-700">
          <Navigation size={16} className="shrink-0" />
          <span className="break-words">{stopName}</span>
        </p>

        <p className="mt-3 text-[14px] leading-relaxed text-slate-500">
          Angkot {leg.routeCode} telah berhenti di titik {isLastLeg ? "tujuan" : "transit"}. Pastikan Anda
          melangkah turun dengan hati-hati dan barang bawaan tidak tertinggal.
          {nextLeg && (
            <>
              {" "}
              Setelah ini, lanjutkan dengan angkot <b className="text-blue-700">{nextLeg.routeCode}</b>.
            </>
          )}
        </p>

        <div className="my-5 flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-left">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
            <BusFront size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-slate-900">Trayek {leg.routeCode}</p>
            <p className="truncate text-[12px] text-slate-500">{leg.routeName}</p>
          </div>
        </div>

        <div className="mb-5 flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-3.5 text-left">
          <Tablet size={20} className="mt-0.5 shrink-0 text-orange-600" />
          <p className="text-[12px] leading-relaxed text-orange-700">
            Bayar tarif angkot {leg.routeCode} lewat iPad di belakang kursi sopir sebelum turun.
          </p>
        </div>

        <button onClick={onGetOff} className={PRIMARY_BTN}>
          Klik Jika Sudah Turun
          <ArrowRight size={18} />
        </button>
        <button onClick={onClose} className={`${GHOST_BTN} mt-1`}>
          Belum Turun
        </button>
      </div>
    </Modal>
  );
}

function CompletedModal({ onFinish }: { onFinish: () => void }) {
  return (
    <Modal>
      <div className="text-center">
        <div className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-green-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-600/30">
            <CheckCircle2 size={36} />
          </div>
        </div>

        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700">
          SIMULASI PERJALANAN SELESAI
        </span>

        <h2 className="mt-3 text-[21px] font-bold tracking-tight sm:text-[24px] text-slate-900">
          Selamat, Perjalanan Anda Sudah Selesai!
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
          Anda telah sampai di lokasi tujuan. Terima kasih telah menggunakan AngkotGo.
        </p>

        <div className="my-5 flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-left">
          <Banknote size={22} className="mt-0.5 shrink-0 text-orange-600" />
          <div>
            <p className="text-[14px] font-bold text-orange-800">Pastikan Anda sudah membayar</p>
            <p className="mt-1 text-[12px] leading-relaxed text-orange-700">
              Pembayaran dilakukan melalui iPad di belakang kursi sopir, tunai (cash) maupun non-tunai
              (QRIS). Pastikan tarif setiap angkot yang Anda gunakan sudah dibayarkan.
            </p>
          </div>
        </div>

        <button
          onClick={onFinish}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-green-600 text-[16px] font-semibold text-white shadow-lg shadow-green-600/30 transition active:scale-[0.98] active:bg-green-700"
        >
          Selesai
          <Check size={18} />
        </button>
      </div>
    </Modal>
  );
}

/* =========================================================
   11. HALAMAN UTAMA — orkestrasi
========================================================= */

function HomePage() {
  const { mapRef, map, setMarker, clearMarker, fitToLocations, focusOn } = useGoogleMap();
  const now = useNow();

  /* ----- State pencarian ----- */
  const [origin, setOrigin] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [resolvingField, setResolvingField] = useState<Field | null>(null);
  const [locating, setLocating] = useState(false);

  /* ----- State rute & modal ----- */
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  // Angkot leg berikutnya yang dipilih user di halte transit (null = ikut rekomendasi).
  const [transitPick, setTransitPick] = useState<number | null>(null);

  const { suggestions, loading: suggestionsLoading } = usePlaceSuggestions(
    activeField,
    originQuery,
    destinationQuery,
  );

  const isSearching = !searchParams;

  /* =======================================================
     TanStack Query — POST /routes/search
  ======================================================= */
  const searchQuery = useQuery({
    queryKey: ["routes-search", searchParams],
    queryFn: async () =>
      (await postJson<SearchResponse>("/routes/search", searchParams)).data,
    enabled: !!searchParams,
    staleTime: 30_000,
    retry: false,
  });

  // Alur: search -> dapat tipe (TRANSIT/DIRECT) + routeIds -> otomatis fetch track-vehicles.
  // Tidak ada pilihan rute: hasil pertama langsung dipakai.
  const selectedOption = searchQuery.data?.[0] ?? null;
  const trip = useTripProgress(selectedOption?.legs.length ?? 0);

  /* =======================================================
     TanStack Query — POST /routes/track-vehicles
     (transit: kirim routeIds semua leg + transitHalteId; non-transit: routeIds 1 leg)
  ======================================================= */
  const trackBody = useMemo(() => {
    if (!selectedOption || !origin || !destination) return null;

    return {
      routeIds: selectedOption.legs.map((leg) => Number(leg.routeId)),
      ...(selectedOption.type === "TRANSIT" && {
        transitHalteId: selectedOption.legs[0].transitHalteId,
      }),
      originLat: origin.lat,
      originLng: origin.lng,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
      maxRadiusMeters: TRACK_RADIUS_METERS,
    };
  }, [selectedOption, origin, destination]);

  const trackQuery = useQuery({
    queryKey: ["track-vehicles", trackBody],
    queryFn: () => postJson<TrackResponse>("/routes/track-vehicles", trackBody),
    enabled: !!trackBody,
    // Segarkan ETA/status tiap 15 detik; berhenti saat user sudah naik.
    refetchInterval: trip.riding ? false : 15_000,
    retry: false,
  });

  const trackLegs = useMemo(() => normalizeTrack(trackQuery.data), [trackQuery.data]);
  const transitInfo = useMemo(() => extractTransitInfo(trackQuery.data), [trackQuery.data]);

  /* ----- Leg & angkot aktif ----- */
  const searchLeg = selectedOption?.legs[trip.activeLeg] ?? null;
  const nextSearchLeg = selectedOption?.legs[trip.activeLeg + 1] ?? null;
  const trackLeg = trackLegs[trip.activeLeg];

  const vehicles = useMemo(
    () => [...(trackLeg?.vehicles ?? [])].sort(byEta),
    [trackLeg],
  );

  // Semua angkot dari leg aktif dan leg lanjutan (agar user tahu ada angkot apa saja).
  const legGroups = useMemo(
    () =>
      trackLegs
        .map((leg, index) => ({ leg, index, vehicles: [...leg.vehicles].sort(byEta) }))
        .filter((group) => group.index >= trip.activeLeg),
    [trackLegs, trip.activeLeg],
  );

  const allVehicles = useMemo(
    () => legGroups.flatMap((g) => g.vehicles.map((v) => ({ v, leg: g.leg, legIndex: g.index }))),
    [legGroups],
  );

  // Angkot yang dipilih user (klik biasa -> peta fokus ke posisinya).
  const selected =
    allVehicles.find(
      (x) =>
        x.v.assignmentId === trip.focusedId &&
        (trip.riding || !x.v.passed || x.legIndex === trip.activeLeg),
    ) ?? null;
  const focusedId = selected?.v.assignmentId ?? null;

  // Sebelum naik: subscribe SEMUA angkot (marker semuanya live).
  // Setelah konfirmasi naik di kartu armada: hanya subscribe ke angkot terpilih.
  const subscribeIds = useMemo(
    () =>
      trip.riding
        ? selected && selected.legIndex === trip.activeLeg
          ? [selected.v.assignmentId]
          : []
        : allVehicles
            .filter((x) => !x.v.passed)
            .map((x) => x.v.assignmentId)
            .sort((a, b) => a - b),
    [trip.riding, trip.activeLeg, selected, allVehicles],
  );

  const live = useLiveVehicles(selectedOption ? subscribeIds : []);

  const positionOf = (v: Vehicle): LatLng => live.positions[v.assignmentId] ?? { lat: v.lat, lng: v.lng };

  /* ----- Pilihan angkot di halte transit ----- */
  const upcomingGroup = legGroups.find((g) => g.index > trip.activeLeg) ?? null;

  const transitOptions = useMemo(
    () =>
      transitInfo && upcomingGroup
        ? buildTransitOptions(upcomingGroup.vehicles, {
            arrival: transitInfo.passengerArrivalMinutes,
            now,
            livePositions: live.positions,
          })
        : [],
    [transitInfo, upcomingGroup, now, live.positions],
  );

  const recommendedId =
    transitOptions.find((o) => o.tags.includes("recommended"))?.vehicle.assignmentId ?? null;
  // Pilihan user dipakai bila masih ada di daftar; kalau tidak, ikut rekomendasi.
  const pickId = transitOptions.some((o) => o.vehicle.assignmentId === transitPick)
    ? transitPick
    : recommendedId;
  const pickedOption = transitOptions.find((o) => o.vehicle.assignmentId === pickId) ?? null;

  // Hanya angkot di leg aktif yang bisa dinaiki / dipakai untuk memotong polyline.
  const focusedVehicle = selected && selected.legIndex === trip.activeLeg ? selected.v : null;
  const focusedPosition = focusedVehicle ? positionOf(focusedVehicle) : null;
  const nearestEta = (focusedVehicle ?? vehicles.find((v) => !v.passed))?.etaMinutes ?? null;

  /* ----- Polyline: decode jalur leg aktif (tetap utuh saat user sudah naik) ----- */
  const ridePath = useMemo(
    () => (searchLeg ? decodePath(searchLeg.slicedPolyline) : []),
    [searchLeg],
  );

  const remainingPath = useRemainingPath(
    ridePath,
    focusedPosition,
    false,
    `${selectedOption ? optionKey(selectedOption) : "-"}-${trip.activeLeg}`,
  );

  const upcomingPaths = useMemo(
    () => (selectedOption?.legs.slice(trip.activeLeg + 1) ?? []).map((l) => decodePath(l.slicedPolyline)),
    [selectedOption, trip.activeLeg],
  );

  /**
   * GARIS ORANYE (per angkot).
   * Untuk SETIAP angkot yang belum lewat (leg aktif maupun leg lanjutan) digambar jalur
   * dari posisi angkot ke titik naik user, memakai polyline LENGKAP rute angkot tersebut
   * (encodedPolyline) dan polylineIndex dari API:
   *   - angkot LIVE            : dipotong mengikuti posisi WebSocket (ujung garis ikut maju)
   *   - angkot ESTIMASI/fallback: tetap digambar dari titik awal estimasinya (mis. belum berangkat)
   *   - angkot sudah lewat     : tidak digambar (status PASSED atau polylineIndex > titik naik)
   * Garis tetap dipertahankan saat user sudah naik.
   */
  const legRoutePaths = useMemo(
    () => trackLegs.map((leg) => decodePath(leg.route.encodedPolyline)),
    [trackLegs],
  );

  const approachLines = useMemo<ApproachLine[]>(() => {
    const lines: ApproachLine[] = [];

    for (const group of legGroups) {
      const routePath = legRoutePaths[group.index];
      const boardIndex = group.leg.boardIndex;
      if (!routePath || routePath.length < 2 || boardIndex === null) continue;

      const boardAt = Math.min(boardIndex, routePath.length - 1);

      for (const v of group.vehicles) {
        if (v.passed || v.polylineIndex > boardAt) continue;

        let path = routePath.slice(Math.max(0, v.polylineIndex), boardAt + 1);
        if (path.length < 2) continue;

        const livePos = live.positions[v.assignmentId];
        const trimmed = trimPassed(path, livePos ?? { lat: v.lat, lng: v.lng }, 0);
        if (trimmed.distance <= 100) path = trimmed.remaining;
        if (path.length < 2) continue;

        lines.push({
          id: v.assignmentId,
          path,
          focused: v.assignmentId === focusedId || v.assignmentId === pickId,
          fallback: v.isFallback && !livePos,
        });
      }
    }

    return lines;
  }, [legGroups, legRoutePaths, live.positions, focusedId, pickId]);

  /**
   * MARKER HALTE (naik / transit / turun) dari boardCoord & alightCoord hasil /routes/search.
   *   - Naik   : titik naik leg aktif (hilang saat user sudah naik)
   *   - Transit: titik turun leg non-terakhir (sekaligus titik naik leg berikutnya)
   *   - Turun  : titik turun leg terakhir
   * Leg yang sudah selesai tidak ditampilkan lagi.
   */
  const stopMarkers = useMemo<StopMarker[]>(() => {
    if (!selectedOption) return [];

    const { legs } = selectedOption;
    const stops: StopMarker[] = [];
    const active = legs[trip.activeLeg];

    if (!trip.riding && active) {
      stops.push({
        id: `board-${active.legOrder}`,
        kind: "board",
        pos: active.boardCoord,
        label: `Naik ${active.routeCode}`,
        title:
          trip.activeLeg === 0
            ? "Titik naik angkot"
            : (legs[trip.activeLeg - 1].transitHalteName ?? "Halte transit"),
      });
    }

    legs.forEach((leg, index) => {
      if (index < trip.activeLeg) return;
      const last = index === legs.length - 1;

      stops.push({
        id: `alight-${leg.legOrder}`,
        kind: last ? "alight" : "transit",
        pos: leg.alightCoord,
        label: last ? "Turun" : `Ganti ${legs[index + 1].routeCode}`,
        title: last ? "Titik turun angkot" : (leg.transitHalteName ?? "Halte transit"),
      });
    });

    return stops;
  }, [selectedOption, trip.activeLeg, trip.riding]);

  const markerVehicles = useMemo<MarkerVehicle[]>(
    () =>
      allVehicles
        .filter((x) =>
          trip.riding
            ? x.v.assignmentId === focusedId
            : !x.v.passed || x.v.assignmentId === focusedId,
        )
        .map((x) => {
          const livePos = live.positions[x.v.assignmentId];
          // Tanpa GPS atau GPS basi: ikon abu-abu supaya tidak terlihat seperti posisi nyata.
          const grey = (x.v.isFallback && !livePos) || (!livePos && isStale(x.v.recordedAt, now));
          return {
            id: x.v.assignmentId,
            code: x.leg.route.code,
            color: grey ? GREY_VEHICLE : legColor(x.legIndex),
            pos: livePos ?? { lat: x.v.lat, lng: x.v.lng },
            focused:
              x.v.assignmentId === focusedId || (!trip.riding && x.v.assignmentId === pickId),
            fallback: grey,
            live: !!livePos,
          };
        }),
    [allVehicles, trip.riding, focusedId, pickId, live.positions, now],
  );

  // Zoom awal mencakup jalur rute + semua angkot, supaya semua terlihat sekaligus.
  const fitPath = useMemo(
    () => [...ridePath, ...markerVehicles.map((m) => m.pos)],
    [ridePath, markerVehicles],
  );

  // Klik angkot (baris daftar atau marker): pilih + fokus peta. Klik lagi = batal pilih.
  const selectVehicle = (id: number) => {
    if (focusedId === id) {
      trip.setFocusedId(null);
      return;
    }
    const item = allVehicles.find((x) => x.v.assignmentId === id);
    if (!item) return;
    trip.setFocusedId(id);
    focusOn(live.positions[id] ?? { lat: item.v.lat, lng: item.v.lng });
  };

  useTripOverlays(map, {
    remaining: selectedOption ? remainingPath : [],
    upcoming: upcomingPaths,
    color: legColor(trip.activeLeg),
    upcomingColor: legColor(trip.activeLeg + 1),
    vehicles: selectedOption ? markerVehicles : [],
    stops: selectedOption ? stopMarkers : [],
    fitPath,
    fitKey: selectedOption
      ? `${optionKey(selectedOption)}-${trip.activeLeg}-${trackLegs.length > 0 ? "tracked" : "loading"}`
      : "",
    approach: selectedOption ? approachLines : [],
    onVehicleClick: selectVehicle,
  });

  /* =======================================================
     Handler pencarian lokasi
  ======================================================= */

  const handleOriginChange = (value: string) => {
    setOriginQuery(value);
    setOrigin(null);
    setActiveField("origin");
  };

  const handleDestinationChange = (value: string) => {
    setDestinationQuery(value);
    setDestination(null);
    setActiveField("destination");
  };

  const selectPlace = async (prediction: Prediction, field: Field) => {
    setActiveField(null);
    setResolvingField(field);

    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ["displayName", "formattedAddress", "location"] });

      if (!place.location) {
        alert("Koordinat lokasi tidak ditemukan.");
        return;
      }

      const location: LocationData = {
        name: place.displayName || prediction.text.toString(),
        address: place.formattedAddress || "",
        lat: place.location.lat(),
        lng: place.location.lng(),
      };

      if (field === "origin") {
        setOrigin(location);
        setOriginQuery(location.name);
      } else {
        setDestination(location);
        setDestinationQuery(location.name);
      }
      setMarker(location, field);
    } catch (error) {
      console.error("Gagal mengambil detail lokasi:", error);
      alert("Gagal mengambil detail lokasi.");
    } finally {
      setResolvingField(null);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung GPS.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: LocationData = {
          name: "Lokasi Saya",
          address: "Lokasi saat ini",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setOrigin(location);
        setOriginQuery("Lokasi Saya");
        setLocating(false);
        setActiveField(null);
        setMarker(location, "origin");
      },
      () => {
        setLocating(false);
        alert("Tidak dapat mengambil lokasi. Periksa izin GPS.");
      },
    );
  };

  const applyPreset = (preset: DemoPreset) => {
    setOrigin(preset.origin);
    setDestination(preset.destination);
    setOriginQuery(preset.origin.name);
    setDestinationQuery(preset.destination.name);
    setActiveField(null);
    setMarker(preset.origin, "origin");
    setMarker(preset.destination, "destination");
    fitToLocations(preset.origin, preset.destination);
  };

  const swapLocations = () => {
    const prevOrigin = origin;
    const prevDestination = destination;

    setOrigin(prevDestination);
    setDestination(prevOrigin);
    setOriginQuery(prevDestination?.name || "");
    setDestinationQuery(prevOrigin?.name || "");

    if (prevDestination) setMarker(prevDestination, "origin");
    else clearMarker("origin");
    if (prevOrigin) setMarker(prevOrigin, "destination");
    else clearMarker("destination");
  };

  const clearLocation = (field: Field) => {
    if (field === "origin") {
      setOrigin(null);
      setOriginQuery("");
    } else {
      setDestination(null);
      setDestinationQuery("");
    }
    clearMarker(field);
  };

  /* =======================================================
     Handler rute & perjalanan
  ======================================================= */

  const handleSearch = () => {
    if (!origin || !destination) {
      alert("Silakan tentukan lokasi awal dan tujuan.");
      return;
    }

    setActiveField(null);
    setActiveModal(null);
    setTransitPick(null);
    trip.reset();
    setSearchParams({
      originLat: origin.lat,
      originLng: origin.lng,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
    });
    fitToLocations(origin, destination);
  };

  // Kembali ke form pencarian (lokasi tetap tersimpan).
  const resetTrip = () => {
    setActiveModal(null);
    setTransitPick(null);
    trip.reset();
    setSearchParams(null);
  };

  // User menandai angkot tertentu sudah dinaiki.
  const handleBoarded = (assignmentId: number) => {
    const boardedVehicle = vehicles.find(
      (vehicle) =>
        vehicle.assignmentId === assignmentId &&
        (!vehicle.passed || assignmentId === focusedId),
    );
    if (!boardedVehicle) return;

    trip.setFocusedId(assignmentId);
    focusOn(
      live.positions[assignmentId] ?? {
        lat: boardedVehicle.lat,
        lng: boardedVehicle.lng,
      },
    );
    trip.setRiding(true);
  };

  // Simulasi: penumpang mendekati titik turun angkot aktif.
  const handleNearDestination = () => {
    if (searchLeg) setActiveModal("near-destination");
  };

  const handleGetOff = () => {
    if (trip.isLastLeg) {
      setActiveModal("completed");
      return;
    }
    setActiveModal(null);
    trip.nextLeg();
    // Angkot yang dipilih di halte transit langsung ter-fokus di leg berikutnya.
    trip.setFocusedId(pickId);
    setTransitPick(null);
  };

  const finishTrip = () => {
    resetTrip();
    setOrigin(null);
    setDestination(null);
    setOriginQuery("");
    setDestinationQuery("");
    clearMarker("origin");
    clearMarker("destination");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  const destinationName = destination?.name || "Lokasi tujuan";
  const stopName = trip.isLastLeg
    ? destinationName
    : (searchLeg?.transitHalteName ?? "Halte transit");

  return (
    <main
      style={{ fontFamily: FONT }}
      className="relative h-dvh touch-manipulation overflow-hidden overscroll-none bg-slate-100 text-slate-900 antialiased"
    >
      <div ref={mapRef} className="absolute inset-0 z-0 h-full w-full" />

      {!map && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-3 bg-slate-200 text-sm text-slate-500">
          <Spinner size={28} className="text-blue-600" />
          Memuat peta...
        </div>
      )}

      <header className="absolute inset-x-0 top-0 z-20 mx-auto w-full max-w-md px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {isSearching ? (
          <SearchCard
            originQuery={originQuery}
            destinationQuery={destinationQuery}
            activeField={activeField}
            suggestions={suggestions}
            suggestionsLoading={suggestionsLoading}
            resolvingField={resolvingField}
            locating={locating}
            canSearch={!!origin && !!destination}
            onOriginChange={handleOriginChange}
            onDestinationChange={handleDestinationChange}
            onFocusField={setActiveField}
            onClear={clearLocation}
            onUseCurrentLocation={getCurrentLocation}
            onSwap={swapLocations}
            onSelectSuggestion={selectPlace}
            onPreset={applyPreset}
            onSearch={handleSearch}
          />
        ) : (
          <TripSummaryBar origin={origin} destination={destination} onEdit={resetTrip} />
        )}
      </header>

      {/* MENUNGGU HASIL SEARCH (loading / error / kosong) */}
      {searchParams && !selectedOption && (
        <SearchStatusSheet
          loading={searchQuery.isLoading}
          error={searchQuery.error}
          onRetry={() => searchQuery.refetch()}
        />
      )}

      {/* PERJALANAN AKTIF */}
      {selectedOption && searchLeg && (
        <>
          <TripMapChips
            connected={live.connected}
            riding={trip.riding}
            etaMinutes={nearestEta}
            code={searchLeg.routeCode}
          />

          <TripSheet riding={trip.riding}>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3.5 pb-4 pt-1 sm:px-4">
              {trip.activeLeg > 0 && !trip.riding && (
                <TransitBanner previous={selectedOption.legs[trip.activeLeg - 1]} current={searchLeg} />
              )}

              {/* STEPPER: naik -> ganti -> turun */}
              {selectedOption.type === "TRANSIT" && (
                <TransitJourney
                  option={selectedOption}
                  activeLeg={trip.activeLeg}
                  riding={trip.riding}
                  destinationName={destinationName}
                  totalMinutes={transitInfo?.totalMinutes ?? null}
                  pick={
                    pickedOption && upcomingGroup
                      ? {
                          routeCode: upcomingGroup.leg.route.code,
                          label:
                            pickedOption.vehicle.assignment?.vehicleCode ??
                            `#${pickedOption.vehicle.assignmentId}`,
                          waitMinutes: pickedOption.wait,
                        }
                      : null
                  }
                />
              )}

              {legGroups.length === 0 ? (
                <VehiclesCard
                  leg={undefined}
                  vehicles={[]}
                  routePath={[]}
                  positions={live.positions}
                  focusedId={focusedId}
                  riding={trip.riding}
                  loading={trackQuery.isLoading}
                  error={trackQuery.error}
                  onRetry={() => trackQuery.refetch()}
                  onToggleFocus={selectVehicle}
                  onBoard={handleBoarded}
                />
              ) : (
                (trip.riding ? legGroups.slice(0, 1) : legGroups).map((group) =>
                  group.index > trip.activeLeg && transitInfo ? (
                    <TransitPicker
                      key={group.leg.legOrder}
                      halteName={transitInfo.halteName}
                      routeCode={group.leg.route.code}
                      color={legColor(group.index)}
                      arrivalMinutes={transitInfo.passengerArrivalMinutes}
                      options={transitOptions}
                      pickId={pickId}
                      now={now}
                      onPick={setTransitPick}
                    />
                  ) : (
                    <VehiclesCard
                      key={group.leg.legOrder}
                      leg={group.leg}
                      vehicles={
                        group.index === trip.activeLeg && focusedId !== null
                          ? [...group.vehicles].sort(
                              (a, b) =>
                                Number(b.assignmentId === focusedId) -
                                Number(a.assignmentId === focusedId),
                            )
                          : group.vehicles
                      }
                      routePath={legRoutePaths[group.index] ?? []}
                      positions={live.positions}
                      focusedId={focusedId}
                      riding={trip.riding}
                      loading={false}
                      error={null}
                      onRetry={() => trackQuery.refetch()}
                      onToggleFocus={selectVehicle}
                      onBoard={handleBoarded}
                      upcoming={group.index > trip.activeLeg}
                    />
                  ),
                )
              )}
            </div>

            {trip.riding && (
              <div className="shrink-0 border-t border-black/5 bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
                <button onClick={handleNearDestination} className={PRIMARY_BTN}>
                  <MapPin size={18} />
                  Simulasikan Dekat Tujuan
                </button>
              </div>
            )}
          </TripSheet>
        </>
      )}

      {activeModal === "near-destination" && searchLeg && (
        <NearDestinationModal
          leg={searchLeg}
          nextLeg={nextSearchLeg}
          isLastLeg={trip.isLastLeg}
          stopName={stopName}
          onGetOff={handleGetOff}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "completed" && selectedOption && (
        <CompletedModal onFinish={finishTrip} />
      )}
    </main>
  );
}

/* =========================================================
   12. PROVIDER (TanStack Query)
========================================================= */

export default function Page() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false } },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <HomePage />
    </QueryClientProvider>
  );
}