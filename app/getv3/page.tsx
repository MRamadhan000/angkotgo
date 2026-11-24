"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import {
  Armchair,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Banknote,
  BadgeCheck,
  BusFront,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Footprints,
  Info,
  Loader2,
  LocateFixed,
  MapPin,
  MessageSquare,
  Navigation,
  Pencil,
  Phone,
  Search,
  Star,
  Tablet,
  X,
} from "lucide-react";
import { DUMMY_ROUTES } from "./data";

/* =========================================================
   1. TYPES
========================================================= */

type LocationData = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export type RouteSegment = {
  id: string;
  angkotCode: string;
  angkotName: string;
  plateNumber: string;

  from: string;
  to: string;

  duration: number;
  fare: number;

  boardingNote?: string;
  transitNote?: string;
};

export type AngkotRoute = {
  id: string;
  type: "direct" | "transit";
  transitCount: number;

  duration: number;
  arrivalTime: string;

  // Estimasi kedatangan kendaraan dan tiba di tujuan akhir
  etaToPickup: string;
  etaToDestination: string;

  fare: number;
  availableSeats: number;

  segments: RouteSegment[];
};

// Hanya dua modal: "dekat tujuan/transit" dan "perjalanan selesai".
// Pembayaran dilakukan lewat iPad di angkot, bukan di aplikasi.
type ModalType = "near-destination" | "completed" | null;

type Field = "origin" | "destination";

type Prediction = google.maps.places.PlacePrediction;

/* =========================================================
   2. CONSTANTS
========================================================= */

const MALANG_CENTER = { lat: -7.9666, lng: 112.6326 };

/* =========================================================
   3. STYLE TOKENS (biru AngkotGo + gaya Gojek/Apple)
========================================================= */

const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", system-ui, sans-serif';

const PRIMARY_BTN =
  "flex h-14 w-full items-center justify-center gap-2 rounded-full bg-blue-700 text-[16px] font-semibold text-white shadow-lg shadow-blue-700/30 transition active:scale-[0.98] active:bg-blue-800 disabled:bg-slate-300 disabled:shadow-none";

const GHOST_BTN =
  "flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold text-slate-500 transition active:bg-slate-100";

// Kartu putih di atas latar abu-abu (dipakai di sheet perjalanan aktif).
const CARD = "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5";

/* =========================================================
   4. HELPERS
========================================================= */

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Normalisasi durasi ("5", "5 menit", "~5 mnt") menjadi "5 menit".
function formatDuration(value: string | number) {
  const normalized = String(value ?? "").trim();
  const number = normalized.match(/\d+(?:[.,]\d+)?/)?.[0];

  return number ? `${number.replace(",", ".")} menit` : normalized;
}

// Simulasi latensi API (ganti dengan fetch sungguhan nanti).
const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/* =========================================================
   5. UI PRIMITIVES
========================================================= */

function Spinner({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Loader2 size={size} className={`animate-spin ${className}`} aria-hidden />
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

function Sheet({
  children,
  tall = false,
}: {
  children: ReactNode;
  tall?: boolean;
}) {
  return (
    <section
      className={`absolute inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-md flex-col rounded-t-[28px] bg-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.18)] ${
        tall ? "max-h-[78dvh]" : "max-h-[58dvh]"
      }`}
    >
      <div className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-black/15" />
      {children}
    </section>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-white px-6 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[28px]"
      >
        <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-black/15 sm:hidden" />
        {children}
      </div>
    </div>
  );
}

function IconCircle({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  // "green" = sukses biasa (biru + badge centang),
  // "success" = sukses akhir (hijau penuh).
  tone?: "blue" | "green" | "success";
}) {
  const isSuccess = tone === "success";

  return (
    <div
      className={`relative mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full ${
        isSuccess ? "bg-green-50" : "bg-blue-50"
      }`}
    >
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg ${
          isSuccess
            ? "bg-green-600 shadow-green-600/30"
            : "bg-blue-700 shadow-blue-700/30"
        }`}
      >
        {children}
      </div>

      {(tone === "green" || isSuccess) && (
        <span
          className={`absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow ring-1 ${
            isSuccess
              ? "text-green-600 ring-green-100"
              : "text-blue-700 ring-blue-100"
          }`}
        >
          <CheckCircle2 size={20} />
        </span>
      )}
    </div>
  );
}

/* =========================================================
   6. CUSTOM HOOKS
========================================================= */

/* ---------- 6a. Google Maps: init peta + marker ---------- */

function useGoogleMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers = useRef<Record<Field, google.maps.Marker | null>>({
    origin: null,
    destination: null,
  });

  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey || !mapRef.current) {
        console.warn("Google Maps API key belum tersedia.");
        return;
      }

      try {
        setOptions({ key: apiKey, v: "weekly" });

        const { Map } = (await importLibrary(
          "maps",
        )) as google.maps.MapsLibrary;

        if (cancelled || !mapRef.current) return;

        mapInstance.current = new Map(mapRef.current, {
          center: MALANG_CENTER,
          zoom: 13,
          disableDefaultUI: true,
          clickableIcons: false,
        });

        setMapReady(true);
      } catch (error) {
        console.error("Gagal memuat Google Maps:", error);
      }
    }

    initializeMap();

    return () => {
      cancelled = true;
    };
  }, []);

  const clearMarker = (field: Field) => {
    markers.current[field]?.setMap(null);
    markers.current[field] = null;
  };

  const setMarker = (location: LocationData, field: Field) => {
    if (!mapInstance.current) return;

    const position = { lat: location.lat, lng: location.lng };

    markers.current[field]?.setMap(null);

    markers.current[field] = new google.maps.Marker({
      map: mapInstance.current,
      position,
      title: field === "origin" ? "Lokasi awal" : "Tujuan",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: field === "origin" ? "#2563eb" : "#f97316",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
    });

    mapInstance.current.panTo(position);
  };

  const fitToLocations = (a: LocationData, b: LocationData) => {
    if (!mapInstance.current) return;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: a.lat, lng: a.lng });
    bounds.extend({ lat: b.lat, lng: b.lng });

    mapInstance.current.fitBounds(bounds, {
      top: 140,
      bottom: 400,
      left: 40,
      right: 40,
    });
  };

  return { mapRef, mapReady, setMarker, clearMarker, fitToLocations };
}

/* ---------- 6b. Places Autocomplete ---------- */

function usePlaceSuggestions(
  activeField: Field | null,
  originQuery: string,
  destinationQuery: string,
) {
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeField) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const query = activeField === "origin" ? originQuery : destinationQuery;

    if (query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const { AutocompleteSuggestion } = (await importLibrary(
          "places",
        )) as google.maps.PlacesLibrary;

        const response =
          await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query,
            includedRegionCodes: ["id"],
            locationBias: { center: MALANG_CENTER, radius: 30000 },
          });

        if (cancelled) return;

        const predictions = (response.suggestions || [])
          .map((suggestion) => suggestion.placePrediction)
          .filter(
            (prediction): prediction is Prediction =>
              prediction !== null && prediction !== undefined,
          );

        setSuggestions(predictions);
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

/* ---------- 6c. Progres perjalanan (leg aktif) ---------- */

function useTripProgress(segments: RouteSegment[]) {
  const [activeLeg, setActiveLeg] = useState(0);

  const currentSegment = segments[activeLeg] ?? null;
  const nextSegment = segments[activeLeg + 1] ?? null;
  const previousSegment = activeLeg > 0 ? segments[activeLeg - 1] : null;

  const totalFare = segments.reduce((sum, s) => sum + s.fare, 0);
  const isLastLeg = activeLeg === segments.length - 1;

  const goToNextLeg = () =>
    setActiveLeg((previous) => Math.min(previous + 1, segments.length - 1));

  const resetProgress = () => setActiveLeg(0);

  return {
    segments,
    activeLeg,
    currentSegment,
    nextSegment,
    previousSegment,
    totalFare,
    isLastLeg,
    goToNextLeg,
    resetProgress,
  };
}

type TripProgress = ReturnType<typeof useTripProgress>;

/* =========================================================
   SKENARIO 1 — PENCARIAN LOKASI
========================================================= */

function SuggestionList({
  field,
  suggestions,
  loading,
  onSelect,
}: {
  field: Field;
  suggestions: Prediction[];
  loading: boolean;
  onSelect: (prediction: Prediction, field: Field) => void;
}) {
  return (
    <ul className="absolute inset-x-0 top-full z-30 mt-2 max-h-[40dvh] overflow-y-auto rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-black/5">
      {loading && suggestions.length === 0 && (
        <li className="flex items-center gap-3 px-3 py-3 text-[14px] text-slate-500">
          <Spinner size={16} className="text-blue-600" />
          Mencari lokasi...
        </li>
      )}

      {suggestions.map((item) => (
        <li
          key={item.placeId}
          className={loading ? "opacity-50 transition" : "transition"}
        >
          <button
            onClick={() => onSelect(item, field)}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left active:bg-slate-100"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                field === "origin"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-orange-50 text-orange-500"
              }`}
            >
              <MapPin size={17} />
            </span>
            <span className="line-clamp-2 text-[15px] text-slate-700">
              {item.text.toString()}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

type SearchCardProps = {
  originQuery: string;
  destinationQuery: string;
  activeField: "origin" | "destination" | null;
  suggestions: Prediction[];
  suggestionsLoading: boolean;
  resolvingField: "origin" | "destination" | null;
  locating: boolean;
  canSearch: boolean;

  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onFocusField: (field: "origin" | "destination") => void;
  onClear: (field: "origin" | "destination") => void;
  onUseCurrentLocation: () => void;
  onSwap: () => void;
  onSelectSuggestion: (prediction: Prediction, field: Field) => void;
  onSearch: () => void;
};

function SearchCard({
  originQuery,
  destinationQuery,
  activeField,
  suggestions,
  suggestionsLoading,
  resolvingField,
  locating,
  canSearch,
  onOriginChange,
  onDestinationChange,
  onFocusField,
  onClear,
  onUseCurrentLocation,
  onSwap,
  onSelectSuggestion,
  onSearch,
}: SearchCardProps) {
  const quickDestinations = ["Alun-Alun", "Kampus UB", "Matos"];

  return (
    <div className="absolute left-0 right-0 top-0 z-30 px-4 pt-4">
      <div className="mx-auto max-w-xl rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-[0_8px_35px_rgba(15,23,42,0.14)] backdrop-blur-xl">
        {/* ROUTE INPUTS */}
        <div className="relative rounded-2xl border border-slate-200 bg-slate-50/80 p-1">
          {/* ORIGIN */}
          <div
            className={`flex items-center gap-3 rounded-xl px-3 transition ${
              activeField === "origin" ? "bg-white shadow-sm" : ""
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <MapPin size={17} />
            </div>

            <div className="min-w-0 flex-1 py-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Lokasi penjemputan
              </p>

              <input
                value={originQuery}
                onChange={(event) => onOriginChange(event.target.value)}
                onFocus={() => onFocusField("origin")}
                placeholder="Lokasi awal"
                className="h-7 w-full bg-transparent text-[14px] font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400"
              />
            </div>

            {resolvingField === "origin" ? (
              <Spinner size={17} className="text-blue-600" />
            ) : (
              originQuery && (
                <button
                  onClick={() => onClear("origin")}
                  aria-label="Hapus lokasi awal"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              )
            )}
          </div>

          {/* CONNECTING LINE */}
          <div className="relative ml-[29px] h-5">
            <div className="absolute bottom-0 left-0 top-0 border-l-2 border-dashed border-slate-300" />
            <button
              onClick={onSwap}
              aria-label="Tukar lokasi"
              className="absolute -right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition active:scale-95"
            >
              <ArrowUpDown size={15} />
            </button>
          </div>

          {/* DESTINATION */}
          <div
            className={`flex items-center gap-3 rounded-xl px-3 transition ${
              activeField === "destination" ? "bg-white shadow-sm" : ""
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <MapPin size={17} />
            </div>

            <div className="min-w-0 flex-1 py-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Tujuan perjalanan
              </p>

              <input
                value={destinationQuery}
                onChange={(event) => onDestinationChange(event.target.value)}
                onFocus={() => onFocusField("destination")}
                placeholder="Mau pergi ke mana?"
                className="h-7 w-full bg-transparent text-[14px] font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400"
              />
            </div>

            {resolvingField === "destination" ? (
              <Spinner size={17} className="text-blue-600" />
            ) : (
              destinationQuery && (
                <button
                  onClick={() => onClear("destination")}
                  aria-label="Hapus tujuan"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              )
            )}
          </div>
        </div>

        {/* SUGGESTIONS */}
        {activeField && (suggestionsLoading || suggestions.length > 0) && (
          <div className="relative z-50">
            <SuggestionList
              field={activeField}
              suggestions={suggestions}
              loading={suggestionsLoading}
              onSelect={onSelectSuggestion}
            />
          </div>
        )}

        {/* QUICK DESTINATIONS */}
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-bold text-slate-500">
            Tujuan populer
          </p>

          <div className="flex flex-wrap gap-2">
            {quickDestinations.map((destination) => (
              <button
                key={destination}
                onClick={() => {
                  onDestinationChange(destination);
                  onFocusField("destination");
                }}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
              >
                {destination}
              </button>
            ))}
          </div>
        </div>

        {/* CURRENT LOCATION */}
        <button
          onClick={onUseCurrentLocation}
          disabled={locating}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 py-3.5 text-[13px] font-bold text-blue-700 transition hover:bg-blue-100 active:scale-[0.98] disabled:opacity-60"
        >
          {locating ? <Spinner size={17} /> : <LocateFixed size={17} />}

          {locating ? "Mencari lokasi kamu..." : "Gunakan lokasi saya saat ini"}
        </button>

        {/* SEARCH BUTTON */}
        <button
          onClick={onSearch}
          disabled={!canSearch}
          className={`${PRIMARY_BTN} mt-2.5 w-full`}
        >
          <Search size={18} />
          Cari Angkot
        </button>
      </div>
    </div>
  );
}

// Ringkasan asal–tujuan, tampil di atas daftar rute.
function TripSummaryBar({
  origin,
  destination,
  onEdit,
}: {
  origin: LocationData | null;
  destination: LocationData | null;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-white/80 bg-white/95 p-3.5 shadow-[0_8px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <MapPin size={15} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Dari
            </p>
            <p className="truncate text-[13px] font-semibold text-slate-800">
              {origin?.name || "Lokasi awal"}
            </p>
          </div>
        </div>

        <div className="ml-[13px] h-3 border-l-2 border-dashed border-slate-300" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <MapPin size={15} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Tujuan
            </p>
            <p className="truncate text-[13px] font-semibold text-slate-800">
              {destination?.name || "Lokasi tujuan"}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onEdit}
        aria-label="Edit rute"
        title="Edit rute"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-700 transition hover:bg-blue-100 active:scale-95"
      >
        <Pencil size={17} />
      </button>
    </div>
  );
}

/* =========================================================
   SKENARIO 2 — DAFTAR PILIHAN RUTE
========================================================= */

function RouteCard({
  route,
  originName,
  destinationName,
  recommended = false,
  onSelect,
}: {
  route: AngkotRoute;
  originName?: string;
  destinationName?: string;
  recommended?: boolean;
  onSelect: (route: AngkotRoute) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const isTransit = route.type === "transit";

  const seatStatus =
    route.availableSeats === 0
      ? {
          label: "Penuh",
          className: "bg-red-50 text-red-700",
        }
      : route.availableSeats <= 3
        ? {
            label: `${route.availableSeats} kursi tersedia`,
            className: "bg-orange-50 text-orange-800",
          }
        : {
            label: `${route.availableSeats} kursi tersedia`,
            className: "bg-blue-50 text-blue-700",
          };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <BusFront size={22} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-bold text-slate-900">
                {route.segments
                  .map((segment) => segment.angkotCode)
                  .join(" → ")}
              </p>

              {recommended && (
                <span className="flex items-center gap-1 rounded-full bg-blue-700 px-2.5 py-1 text-[10px] font-bold text-white">
                  <Star size={10} className="fill-white" />
                  Rekomendasi
                </span>
              )}

              {isTransit && (
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                  {route.transitCount}x Transit
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KETERSEDIAAN KURSI */}
        <div
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[11px] font-semibold ${seatStatus.className}`}
        >
          <Armchair size={15} />
          {seatStatus.label}
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* RINGKASAN PERJALANAN */}
        <div className="rounded-xl bg-blue-50 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-600">
                Total perjalanan
              </p>

              <div className="mt-1 flex items-center gap-2">
                <Clock size={15} className="text-slate-600" />

                <span className="text-sm font-bold text-slate-900">
                  {route.duration} menit
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-medium text-slate-600">Total tarif</p>

              <p className="mt-1 text-lg font-bold text-blue-700">
                {formatRupiah(route.fare)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-blue-100 pt-3">
            <div>
              <p className="text-xs font-medium text-slate-600">
                Angkot tiba sekitar
              </p>

              <p className="mt-0.5 text-sm font-semibold text-blue-700">
                {formatDuration(route.etaToPickup)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-medium text-slate-600">
                Perkiraan tiba
              </p>

              <p className="mt-0.5 text-sm font-bold text-blue-700">
                {route.etaToDestination || route.arrivalTime}
              </p>
            </div>
          </div>
        </div>

        {/* TOGGLE DETAIL */}
        <button
          type="button"
          onClick={() => setExpanded((previous) => !previous)}
          aria-expanded={expanded}
          className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
        >
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {expanded ? "Tutup rincian rute" : "Lihat rincian rute"}
            </p>

            <p className="mt-0.5 text-xs text-slate-600">
              {route.segments.length} perjalanan angkot
            </p>
          </div>

          <ChevronDown
            size={19}
            className={`shrink-0 text-slate-600 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* TIMELINE RUTE */}
        {expanded && (
          <div className="mt-5">
            <p className="mb-5 text-sm font-bold text-slate-900">
              Rincian perjalanan
            </p>

            <div className="relative">
              <div className="absolute left-[13px] top-3 bottom-5 w-0.5 bg-slate-200" />

              {/* LOKASI AWAL */}
              <div className="relative flex gap-3 pb-5">
                <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 ring-4 ring-white">
                  <MapPin size={14} />
                </div>

                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-xs font-medium text-slate-500">
                    Lokasi keberangkatan
                  </p>

                  <p className="mt-0.5 break-words text-sm font-bold text-slate-900">
                    {originName || "Lokasi penjemputan"}
                  </p>
                </div>
              </div>

              {/* SETIAP SEGMEN ANGKOT */}
              {route.segments.map((segment, index) => {
                const nextSegment = route.segments[index + 1];
                const isLast = index === route.segments.length - 1;

                const boardingPoint =
                  index === 0
                    ? originName || segment.from
                    : route.segments[index - 1].to;

                const alightingPoint = isLast
                  ? destinationName || segment.to
                  : segment.to;

                const waitingTime = index === 0 ? route.etaToPickup : 0;

                return (
                  <div key={segment.id}>
                    {/* WAKTU MENUNGGU */}
                    <div className="relative flex gap-3 pb-4">
                      <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-4 ring-white">
                        <Clock size={14} />
                      </div>

                      <div className="min-w-0 flex-1 pt-1">
                        <p className="text-xs font-medium text-slate-500">
                          {index === 0
                            ? "Menunggu angkot datang"
                            : "Menunggu angkot lanjutan"}
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-slate-900">
                          {waitingTime
                            ? formatDuration(waitingTime)
                            : "Waktu tunggu belum tersedia"}
                        </p>
                      </div>
                    </div>

                    {/* NAIK ANGKOT */}
                    <div className="relative flex gap-3 pb-4">
                      <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white ring-4 ring-white">
                        <BusFront size={14} />
                      </div>

                      <div className="min-w-0 flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">
                            Naik angkot {segment.angkotCode}
                          </p>

                          {segment.plateNumber && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              {segment.plateNumber}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Naik dari {boardingPoint}
                        </p>
                      </div>
                    </div>

                    {/* DURASI PERJALANAN */}
                    <div className="relative flex gap-3 pb-4">
                      <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-4 ring-white">
                        <Clock size={14} />
                      </div>

                      <div className="min-w-0 flex-1 pt-1">
                        <p className="text-xs font-medium text-slate-500">
                          Waktu perjalanan
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-slate-900">
                          {formatDuration(segment.duration)}
                        </p>
                      </div>
                    </div>

                    {/* TITIK TURUN / TRANSIT / TUJUAN AKHIR */}
                    <div className="relative flex gap-3 pb-5">
                      <div
                        className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                          nextSegment
                            ? "bg-blue-100 text-blue-700"
                            : "bg-blue-700 text-white"
                        }`}
                      >
                        {nextSegment ? (
                          <ArrowDown size={14} />
                        ) : (
                          <MapPin size={14} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pt-1">
                        <p className="text-xs font-medium text-slate-500">
                          {nextSegment
                            ? "Turun dan transit"
                            : "Perjalanan selesai"}
                        </p>

                        <p
                          className={`mt-0.5 break-words text-sm font-bold ${
                            nextSegment ? "text-slate-900" : "text-blue-700"
                          }`}
                        >
                          {alightingPoint}
                        </p>

                        {nextSegment && (
                          <p className="mt-1 text-xs font-medium text-blue-700">
                            Lanjut naik angkot {nextSegment.angkotCode}
                          </p>
                        )}

                        {!nextSegment && (
                          <p className="mt-1 text-xs text-slate-500">
                            Perkiraan tiba{" "}
                            {route.etaToDestination || route.arrivalTime}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TOMBOL PILIH RUTE */}
        <button
          type="button"
          onClick={() => onSelect(route)}
          disabled={route.availableSeats === 0}
          className={`${PRIMARY_BTN} mt-4 disabled:cursor-not-allowed`}
        >
          {route.availableSeats === 0 ? "Angkot penuh" : "Pilih rute ini"}
        </button>
      </div>
    </div>
  );
}

function RouteCardSkeleton() {
  return (
    <div
      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
      aria-hidden
    >
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="ml-auto h-5 w-16" />
          <Skeleton className="ml-auto h-3 w-24" />
        </div>
      </div>

      <div className="my-3 space-y-2">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-4 w-14" />
        </div>
      </div>

      <Skeleton className="h-14 w-full rounded-full" />
    </div>
  );
}

function RouteListSheet({
  routes,
  loading,
  originName,
  destinationName,
  onSelect,
}: {
  routes: AngkotRoute[];
  loading: boolean;
  originName?: string;
  destinationName?: string;
  onSelect: (route: AngkotRoute) => void;
}) {
  return (
    <Sheet>
      <div className="shrink-0 px-5 pt-4 pb-3">
        <h2 className="text-[20px] font-bold tracking-tight">
          Pilihan Rute Angkot
        </h2>
        <p className="mt-0.5 flex items-center gap-2 text-[13px] text-slate-500">
          {loading ? (
            <>
              <Spinner size={14} className="text-blue-600" />
              Mencari rute terbaik untuk Anda...
            </>
          ) : (
            `Ditemukan ${routes.length} rekomendasi perjalanan`
          )}
        </p>
      </div>

      <div className="space-y-3 overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        {loading ? (
          <>
            <RouteCardSkeleton />
            <RouteCardSkeleton />
            <RouteCardSkeleton />
          </>
        ) : routes.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-[14px] text-slate-500 shadow-sm ring-1 ring-black/5">
            Rute angkot belum ditemukan. Coba ubah lokasi awal atau tujuan.
          </div>
        ) : (
          routes.map((route, index) => (
            <RouteCard
              key={route.id}
              route={route}
              recommended={index === 0}
              originName={originName}
              destinationName={destinationName}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </Sheet>
  );
}

/* =========================================================
   SKENARIO 4 — PERJALANAN AKTIF / DETAIL PERJALANAN
========================================================= */

function TripHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-[24px] border border-white/80 bg-white/95 px-3 py-2.5 shadow-[0_8px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <button
        onClick={onBack}
        aria-label="Kembali ke daftar rute"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 active:scale-95"
      >
        <ArrowLeft size={22} />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-[17px] font-semibold tracking-tight">
        {title}
      </h1>
    </div>
  );
}

// Chip status yang melayang di atas peta.
function TripMapChips({
  etaToPickup,
  segment,
  originName,
  isTransitLeg,
}: {
  etaToPickup: string;
  segment: RouteSegment;
  originName?: string;
  isTransitLeg: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[calc(5.25rem+env(safe-area-inset-top))] z-10 mx-auto flex w-full max-w-md flex-col gap-2 px-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-md">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          {isTransitLeg ? "Menuju angkot lanjutan" : "Armada mendekat ke halte"}
        </span>

        {!isTransitLeg && (
          <span className="flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-[12px] font-bold text-white shadow-md">
            <Clock size={13} />~{formatDuration(etaToPickup)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-md">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          <span className="max-w-[170px] truncate">
            Anda di {isTransitLeg ? segment.from : originName || "halte"}
          </span>
        </span>

        <span className="flex items-center gap-1.5 rounded-full bg-blue-700 px-3 py-1.5 text-[12px] font-bold text-white shadow-md">
          <BusFront size={13} />
          {segment.angkotCode}
          {segment.plateNumber && ` | ${segment.plateNumber}`}
        </span>
      </div>
    </div>
  );
}

function DriverSkeleton() {
  return (
    <div className="mt-4 flex items-center gap-3" aria-hidden>
      <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-5 w-32" />
      </div>
    </div>
  );
}

// Banner setelah transit: pengguna kembali ke halaman detail untuk leg berikutnya.
function TransitBanner({
  previous,
  current,
}: {
  previous: RouteSegment;
  current: RouteSegment;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white">
        <Navigation size={17} />
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-blue-800">
          Transit berhasil di {previous.to}
        </p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-blue-700">
          Silakan naik angkot <b>{current.angkotCode}</b> untuk melanjutkan
          perjalanan ke tujuan akhir.
        </p>
      </div>
    </div>
  );
}

// Kartu utama: tarif, sopir, kendaraan, dan aksi cepat.
function DriverCard({
  segment,
  loadingDriver,
}: {
  segment: RouteSegment;
  loadingDriver: boolean;
}) {
  return (
    <div className={CARD}>
      {/* LABEL + TARIF */}
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
          <Star size={12} className="fill-blue-600 text-blue-600" />
          Pilihan Anda • Rekomendasi
        </span>

        <p className="text-[19px] font-bold leading-none text-blue-700">
          {formatRupiah(segment.fare)}
        </p>
      </div>

      {/* SOPIR & KENDARAAN */}
      {loadingDriver ? (
        <DriverSkeleton />
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-[17px] font-bold text-blue-700">
              PS
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white ring-2 ring-white">
              <BadgeCheck size={12} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[16px] font-bold">
              Pak Slamet
              <span className="flex items-center gap-0.5 text-[12px] font-semibold text-slate-600">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                4.9
              </span>
            </p>
            <p className="truncate text-[12px] text-slate-500">
              Suzuki Carry Biru Muda • Angkot {segment.angkotCode}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              {segment.plateNumber && (
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-slate-700">
                  {segment.plateNumber}
                </span>
              )}
              <span className="truncate text-[12px] font-semibold text-blue-600">
                Trayek {segment.angkotCode}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AKSI CEPAT */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={loadingDriver}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 text-[13px] font-semibold text-slate-700 transition active:scale-[0.98] disabled:opacity-50"
        >
          <Phone size={16} className="text-blue-600" />
          Hubungi Sopir
        </button>
        <button
          type="button"
          disabled={loadingDriver}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 text-[13px] font-semibold text-slate-700 transition active:scale-[0.98] disabled:opacity-50"
        >
          <MessageSquare size={16} className="text-blue-600" />
          Pesan Halte
        </button>
      </div>

      {/* INFO PEMBAYARAN */}
      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
        <span className="flex items-center gap-2 text-[12px] text-slate-600">
          <Tablet size={16} className="shrink-0 text-blue-600" />
          Bayar lewat iPad di belakang kursi sopir
        </span>
      </div>
    </div>
  );
}

// Ringkasan rute: timeline rinci dari leg aktif sampai tujuan akhir.
function RouteSummaryCard({
  trip,
  route,
  originName,
  destinationName,
}: {
  trip: TripProgress;
  route: AngkotRoute;
  originName?: string;
  destinationName?: string;
}) {
  const { segments, activeLeg, currentSegment, nextSegment } = trip;

  if (!currentSegment) return null;

  const remaining = segments.slice(activeLeg);
  const startName =
    activeLeg === 0 ? originName || currentSegment.from : currentSegment.from;

  return (
    <div className={CARD}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[13px] font-bold text-white">
            {activeLeg + 1}
          </span>
          <h3 className="text-[16px] font-bold">Ringkasan Rute Angkot</h3>
        </div>

        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
          Leg {activeLeg + 1} dari {segments.length}
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-[13px] top-3 bottom-5 w-0.5 bg-slate-200" />

        {/* LOKASI AWAL */}
        <div className="relative flex gap-3 pb-5">
          <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 ring-4 ring-white">
            <MapPin size={14} />
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <p className="text-xs font-medium text-slate-500">
              {activeLeg === 0 ? "Lokasi keberangkatan" : "Titik transit"}
            </p>

            <p className="mt-0.5 break-words text-sm font-bold text-slate-900">
              {startName || "Lokasi penjemputan"}
            </p>
          </div>
        </div>

        {/* SETIAP SEGMEN ANGKOT */}
        {remaining.map((segment, offset) => {
          const index = activeLeg + offset;
          const following = segments[index + 1];
          const isLast = !following;
          const isCurrent = offset === 0;

          const boardingPoint = isCurrent ? startName : segments[index - 1].to;
          const alightingPoint = isLast
            ? destinationName || segment.to
            : segment.to;
          const waitingTime = index === 0 ? route.etaToPickup : 0;

          return (
            <div key={segment.id}>
              {/* WAKTU MENUNGGU */}
              <div className="relative flex gap-3 pb-4">
                <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-4 ring-white">
                  <Clock size={14} />
                </div>

                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-xs font-medium text-slate-500">
                    {index === 0
                      ? "Menunggu angkot datang"
                      : "Menunggu angkot lanjutan"}
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    {waitingTime
                      ? formatDuration(waitingTime)
                      : "Waktu tunggu belum tersedia"}
                  </p>
                </div>
              </div>

              {/* NAIK ANGKOT */}
              <div className="relative flex gap-3 pb-4">
                <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white ring-4 ring-white">
                  <BusFront size={14} />
                </div>

                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">
                      Naik angkot {segment.angkotCode}
                    </p>

                    {segment.plateNumber && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {segment.plateNumber}
                      </span>
                    )}

                    {isCurrent && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        Naik di sini
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Naik dari {boardingPoint}
                  </p>
                </div>
              </div>

              {/* DURASI PERJALANAN */}
              <div className="relative flex gap-3 pb-4">
                <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-4 ring-white">
                  <Clock size={14} />
                </div>

                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-xs font-medium text-slate-500">
                    Waktu perjalanan
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    {formatDuration(segment.duration)}
                  </p>
                </div>
              </div>

              {/* TITIK TURUN / TRANSIT / TUJUAN AKHIR */}
              <div className={`relative flex gap-3 ${isLast ? "" : "pb-5"}`}>
                <div
                  className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                    following
                      ? "bg-blue-100 text-blue-700"
                      : "bg-blue-700 text-white"
                  }`}
                >
                  {following ? <ArrowDown size={14} /> : <MapPin size={14} />}
                </div>

                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-xs font-medium text-slate-500">
                    {following ? "Turun dan transit" : "Perjalanan selesai"}
                  </p>

                  <p
                    className={`mt-0.5 break-words text-sm font-bold ${
                      following ? "text-slate-900" : "text-blue-700"
                    }`}
                  >
                    {alightingPoint}
                  </p>

                  {following && (
                    <p className="mt-1 text-xs font-medium text-blue-700">
                      Lanjut naik angkot {following.angkotCode}
                    </p>
                  )}

                  {isLast && (
                    <p className="mt-1 text-xs text-slate-500">
                      Perkiraan tiba{" "}
                      {route.etaToDestination || route.arrivalTime}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PROGRES TRANSIT */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-slate-100 p-3">
        <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-[12px] leading-relaxed text-slate-600">
          {nextSegment ? (
            <>
              <b className="text-slate-700">Progress Transit:</b> Leg{" "}
              {activeLeg + 1} dari {segments.length}. Lanjut transit angkot{" "}
              {nextSegment.angkotCode} di {currentSegment.to} untuk tujuan
              akhir.
            </>
          ) : segments.length > 1 ? (
            <>
              <b className="text-slate-700">Leg terakhir:</b> setelah turun di{" "}
              {currentSegment.to}, perjalanan Anda selesai.
            </>
          ) : (
            <>
              <b className="text-slate-700">Perjalanan langsung:</b> tidak ada
              transit sampai tujuan.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// Rincian tarif per angkot + status leg (tanpa pembayaran di aplikasi).
function FareSummaryCard({ trip }: { trip: TripProgress }) {
  const { segments, activeLeg, totalFare } = trip;

  return (
    <div className={CARD}>
      <div className="mb-3 flex items-center gap-2">
        <CreditCard size={18} className="text-blue-600" />
        <h3 className="text-[15px] font-bold">Rincian Tarif Per Angkot</h3>
      </div>

      <div className="space-y-2">
        {segments.map((segment, index) => {
          const status =
            index < activeLeg
              ? { label: "Sudah turun", className: "text-green-600" }
              : index === activeLeg
                ? { label: "Sedang dinaiki", className: "text-blue-600" }
                : { label: "Menunggu", className: "text-slate-500" };

          return (
            <div
              key={segment.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
            >
              <div className="min-w-0">
                <p className="text-[14px] font-bold">
                  Angkot {segment.angkotCode}
                </p>
                <p className="truncate text-[12px] text-slate-500">
                  Leg {index + 1} • {segment.from} - {segment.to}
                </p>
                <p className={`text-[12px] font-semibold ${status.className}`}>
                  {status.label}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[14px] font-bold">
                  {formatRupiah(segment.fare)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
        <span className="text-[14px] font-semibold text-slate-600">
          Total perjalanan
        </span>
        <span className="font-bold text-blue-700">
          {formatRupiah(totalFare)}
        </span>
      </div>
    </div>
  );
}

function ActiveTripSheet({
  trip,
  route,
  originName,
  destinationName,
  loadingDriver,
  onSimulateNearDestination,
}: {
  trip: TripProgress;
  route: AngkotRoute;
  originName?: string;
  destinationName?: string;
  loadingDriver: boolean;
  onSimulateNearDestination: () => void;
}) {
  const { currentSegment, previousSegment } = trip;

  if (!currentSegment) return null;

  return (
    <section className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-h-[68dvh] w-full max-w-md flex-col rounded-t-[28px] bg-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.18)]">
      <div className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-black/15" />

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pt-4 pb-4">
        {previousSegment && (
          <TransitBanner previous={previousSegment} current={currentSegment} />
        )}

        <DriverCard segment={currentSegment} loadingDriver={loadingDriver} />
        <RouteSummaryCard
          trip={trip}
          route={route}
          originName={originName}
          destinationName={destinationName}
        />
        <FareSummaryCard trip={trip} />
      </div>

      {/* STICKY CTA */}
      <div className="shrink-0 border-t border-black/5 bg-white px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          onClick={onSimulateNearDestination}
          disabled={loadingDriver}
          className={`${PRIMARY_BTN} disabled:opacity-50`}
        >
          <MapPin size={18} />
          Simulasikan Dekat Tujuan
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   SKENARIO 5 — DEKAT TUJUAN / TRANSIT → TURUN
========================================================= */

function NearDestinationModal({
  segment,
  nextSegment,
  isLastLeg,
  destinationName,
  onGetOff,
  onClose,
}: {
  segment: RouteSegment;
  nextSegment: RouteSegment | null;
  isLastLeg: boolean;
  destinationName?: string;
  onGetOff: () => void;
  onClose: () => void;
}) {
  const stopName = isLastLeg ? destinationName || segment.to : segment.to;
  const stopType = isLastLeg ? "Tujuan" : "Transit";

  return (
    <Modal onClose={onClose}>
      <div className="text-center">
        {/* IKON */}
        <div className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-blue-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg shadow-blue-700/30">
            <Footprints size={36} />
          </div>
          <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-blue-700 shadow ring-1 ring-blue-100">
            <CheckCircle2 size={20} />
          </span>
        </div>

        {/* STATUS */}
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1.5 text-[12px] font-semibold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-blue-700" />
          Sampai di Halte {stopType}
        </span>

        <h2 className="mt-4 text-[26px] font-bold leading-tight tracking-tight text-slate-900">
          Wah, Anda Sudah Dekat dengan Halte {stopType}!
        </h2>

        <p className="mt-3 flex items-center justify-center gap-2 text-[15px] font-semibold text-blue-700">
          <Navigation size={16} className="shrink-0" />
          <span className="break-words">{stopName}</span>
        </p>

        <p className="mt-3 text-[14px] leading-relaxed text-slate-500">
          Angkot {segment.angkotCode} telah berhenti di titik{" "}
          {isLastLeg ? "tujuan" : "transit"}. Pastikan Anda melangkah turun
          dengan hati-hati dan barang bawaan tidak tertinggal.
          {!isLastLeg && nextSegment && (
            <>
              {" "}
              Setelah ini, lanjutkan perjalanan dengan angkot{" "}
              <b className="text-blue-700">{nextSegment.angkotCode}</b>.
            </>
          )}
        </p>

        {/* INFO TARIF */}
        <div className="my-5 flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-left">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
            <BusFront size={22} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-slate-900">
              Trayek {segment.angkotCode}
            </p>
            <p className="truncate text-[12px] text-slate-500">
              Pak Slamet
              {segment.plateNumber && ` • ${segment.plateNumber}`}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[11px] font-medium text-slate-500">Tarif</p>
            <p className="text-[18px] font-bold text-blue-700">
              {formatRupiah(segment.fare)}
            </p>
          </div>
        </div>

        {/* PENGINGAT BAYAR */}
        <div className="mb-5 flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-3.5 text-left">
          <Tablet size={20} className="mt-0.5 shrink-0 text-orange-600" />
          <p className="text-[12px] leading-relaxed text-orange-700">
            Bayar tarif angkot {segment.angkotCode} lewat iPad di belakang kursi
            sopir sebelum turun.
          </p>
        </div>

        <button
          onClick={onGetOff}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-blue-700 text-[16px] font-semibold text-white shadow-lg shadow-blue-700/30 transition active:scale-[0.98] active:bg-blue-800"
        >
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

/* =========================================================
   SKENARIO 6 — PERJALANAN SELESAI (hanya leg terakhir)
========================================================= */

function CompletedModal({
  totalFare,
  onFinish,
}: {
  totalFare: number;
  onFinish: () => void;
}) {
  return (
    <Modal>
      <div className="text-center">
        <IconCircle tone="success">
          <CheckCircle2 size={36} />
        </IconCircle>

        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700">
          SIMULASI PERJALANAN SELESAI
        </span>

        <h2 className="mt-3 text-[24px] font-bold tracking-tight text-slate-900">
          Selamat, Perjalanan Anda Sudah Selesai!
        </h2>

        <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
          Anda telah sampai di lokasi tujuan. Terima kasih telah menggunakan
          AngkotGo.
        </p>

        <div className="my-5 rounded-2xl bg-blue-50 p-4 text-left">
          <p className="text-[12px] font-medium text-blue-700">
            Estimasi total tarif perjalanan
          </p>
          <p className="mt-1 text-[25px] font-bold text-blue-800">
            {formatRupiah(totalFare)}
          </p>
        </div>

        <div className="mb-5 flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-left">
          <Banknote size={22} className="mt-0.5 shrink-0 text-orange-600" />
          <div>
            <p className="text-[14px] font-bold text-orange-800">
              Pastikan Anda sudah membayar
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-orange-700">
              Pembayaran dilakukan melalui iPad yang berada di belakang kursi
              sopir, dengan metode tunai (cash) maupun non-tunai (QRIS).
              Pastikan tarif setiap angkot yang Anda gunakan sudah dibayarkan.
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
   MAIN PAGE — hanya orkestrasi state & alur antar skenario
========================================================= */

export default function HomePage() {
  /* ----- Peta ----- */
  const { mapRef, mapReady, setMarker, clearMarker, fitToLocations } =
    useGoogleMap();

  /* ----- State pencarian ----- */
  const [origin, setOrigin] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [routes, setRoutes] = useState<AngkotRoute[]>([]);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [resolvingField, setResolvingField] = useState<Field | null>(null);
  const [locating, setLocating] = useState(false);
  const searchId = useRef(0);

  /* ----- State rute & modal ----- */
  const [selectedRoute, setSelectedRoute] = useState<AngkotRoute | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loadingDriver, setLoadingDriver] = useState(false);

  /* ----- Hooks domain ----- */
  const { suggestions, loading: suggestionsLoading } = usePlaceSuggestions(
    activeField,
    originQuery,
    destinationQuery,
  );
  const trip = useTripProgress(selectedRoute?.segments ?? []);

  const { currentSegment } = trip;
  const isSearching = !showResults && !selectedRoute;

  /* =======================================================
     SKENARIO 1 — Handler pencarian lokasi
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

      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location"],
      });

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
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const location: LocationData = {
          name: "Lokasi Saya",
          address: "Lokasi saat ini",
          lat,
          lng,
        };

        setOrigin(location);
        setOriginQuery("Lokasi Saya");
        setLocating(false);
        setActiveField(null);
        setMarker(location, "origin");

        try {
          const { Geocoder } = (await importLibrary(
            "geocoding",
          )) as google.maps.GeocodingLibrary;

          const response = await new Geocoder().geocode({
            location: { lat, lng },
          });

          if (response.results.length > 0) {
            setOrigin({
              ...location,
              address: response.results[0].formatted_address,
            });
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
        }
      },
      () => {
        setLocating(false);
        alert("Tidak dapat mengambil lokasi. Periksa izin GPS.");
      },
    );
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
     SKENARIO 2 — Handler daftar rute & navigasi mundur
  ======================================================= */

  // Kembali ke form pencarian (lokasi tetap tersimpan).
  const resetTrip = () => {
    setSelectedRoute(null);
    setShowResults(false);
    setActiveModal(null);
    trip.resetProgress();
    searchId.current += 1; // batalkan pencarian yang sedang berjalan
    setRoutes([]);
    setRoutesLoading(false);
    setLoadingDriver(false);
  };

  // Kembali ke daftar rute.
  const backToResults = () => {
    setSelectedRoute(null);
    setActiveModal(null);
    trip.resetProgress();
  };

  // Simulasi: ambil data driver/kendaraan untuk angkot yang akan dinaiki.
  const loadDriver = async () => {
    setLoadingDriver(true);
    await wait(900);
    setLoadingDriver(false);
  };

  const handleSearch = async () => {
    if (!origin || !destination) {
      alert("Silakan tentukan lokasi awal dan tujuan.");
      return;
    }

    setActiveField(null);
    resetTrip();

    const currentSearch = searchId.current;

    // Langsung tampilkan daftar rute dalam kondisi loading (skeleton).
    setShowResults(true);
    setRoutesLoading(true);
    fitToLocations(origin, destination);

    await wait(1200); // ganti dengan request API rute

    // Abaikan hasil jika pengguna sudah mengubah/membatalkan pencarian.
    if (searchId.current !== currentSearch) return;

    setRoutes(DUMMY_ROUTES);
    setRoutesLoading(false);
  };

  const handleSelectRoute = (route: AngkotRoute) => {
    setSelectedRoute(route);
    trip.resetProgress();
    void loadDriver();
  };

  /* =======================================================
     SKENARIO 5 — Dekat tujuan → sudah turun
     - Leg terakhir  : tampilkan modal "perjalanan selesai"
     - Masih transit : tutup modal, kembali ke halaman detail
                       perjalanan untuk angkot berikutnya
  ======================================================= */

  // Simulasi: penumpang mendekati titik turun angkot aktif.
  const handleNearDestination = () => {
    if (!currentSegment) return;
    setActiveModal("near-destination");
  };

  const handleGetOff = () => {
    if (!currentSegment) return;

    if (trip.isLastLeg) {
      setActiveModal("completed");
      return;
    }

    // Transit: modal tertutup, pindah ke leg berikutnya, tetap di halaman detail.
    setActiveModal(null);
    trip.goToNextLeg();
    void loadDriver();
  };

  /* =======================================================
     SKENARIO 6 — Selesai
  ======================================================= */

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

  return (
    <main
      style={{ fontFamily: FONT }}
      className="relative h-dvh overflow-hidden bg-slate-100 text-slate-900 antialiased"
    >
      {/* PETA */}
      <div ref={mapRef} className="absolute inset-0 z-0 h-full w-full" />

      {!mapReady && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-3 bg-slate-200 text-sm text-slate-500">
          <Spinner size={28} className="text-blue-600" />
          Memuat peta...
        </div>
      )}

      {/* ===== ATAS: form pencarian / ringkasan / header konfirmasi ===== */}
      <header className="absolute inset-x-0 top-0 z-20 mx-auto w-full max-w-md px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {selectedRoute ? (
          <TripHeader
            title="Konfirmasi Angkot Pilihan"
            onBack={backToResults}
          />
        ) : isSearching ? (
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
            onSearch={handleSearch}
          />
        ) : (
          <TripSummaryBar
            origin={origin}
            destination={destination}
            onEdit={resetTrip}
          />
        )}
      </header>

      {/* ===== SKENARIO 2: daftar rute ===== */}
      {showResults && !selectedRoute && (
        <RouteListSheet
          routes={routes}
          loading={routesLoading}
          originName={origin?.name}
          destinationName={destination?.name}
          onSelect={handleSelectRoute}
        />
      )}

      {/* ===== PERJALANAN AKTIF (tanpa login) ===== */}
      {selectedRoute && currentSegment && (
        <>
          <TripMapChips
            etaToPickup={selectedRoute.etaToPickup}
            segment={currentSegment}
            originName={origin?.name}
            isTransitLeg={trip.activeLeg > 0}
          />
          <ActiveTripSheet
            trip={trip}
            route={selectedRoute}
            originName={origin?.name}
            destinationName={destination?.name}
            loadingDriver={loadingDriver}
            onSimulateNearDestination={handleNearDestination}
          />
        </>
      )}

      {/* ===== MODAL DEKAT TUJUAN / TRANSIT ===== */}
      {activeModal === "near-destination" && currentSegment && (
        <NearDestinationModal
          segment={currentSegment}
          nextSegment={trip.nextSegment}
          isLastLeg={trip.isLastLeg}
          destinationName={destination?.name}
          onGetOff={handleGetOff}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* ===== MODAL PERJALANAN SELESAI (hanya leg terakhir) ===== */}
      {activeModal === "completed" && (
        <CompletedModal totalFare={trip.totalFare} onFinish={finishTrip} />
      )}
    </main>
  );
}