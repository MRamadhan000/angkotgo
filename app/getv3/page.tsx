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
  BusFront,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Flag,
  Loader2,
  LocateFixed,
  MapPin,
  MessageCircle,
  Navigation,
  Pencil,
  QrCode,
  Search,
  ShieldCheck,
  Star,
  UserRound,
  Users,
  Wallet,
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

type PaymentMethod = "cash" | "qris";

type ModalType =
  | "near-destination"
  | "payment"
  | "qris"
  | "leg-paid"
  | "feedback"
  | "completed"
  | null;

type Field = "origin" | "destination";

type Prediction = google.maps.places.PlacePrediction;

/* =========================================================
   2. DUMMY DATA & CONSTANTS
========================================================= */

const FEEDBACK_TAGS = [
  "Driver ramah",
  "Tepat waktu",
  "Berkendara aman",
  "Perjalanan nyaman",
  "Membantu penumpang",
];

const RATING_LABEL = [
  "Ketuk bintang untuk memberi rating",
  "Sangat Kurang",
  "Kurang Memuaskan",
  "Cukup Baik",
  "Memuaskan",
  "Sangat Memuaskan!",
];

const MALANG_CENTER = { lat: -7.9666, lng: 112.6326 };

/* =========================================================
   3. STYLE TOKENS (biru AngkotGo + gaya Gojek/Apple)
========================================================= */

const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", system-ui, sans-serif';

const PRIMARY_BTN =
  "flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-[16px] font-semibold text-white transition active:scale-[0.98] active:bg-blue-700 disabled:bg-slate-300";

const GHOST_BTN =
  "flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold text-slate-500 transition active:bg-slate-100";

const BADGE_COLOR: Record<string, string> = {
  AL: "bg-blue-600",
  AG: "bg-indigo-500",
  GL: "bg-orange-500",
};

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

// Simulasi latensi API (ganti dengan fetch sungguhan nanti).
const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/* =========================================================
   5. UI PRIMITIVES (dipakai di semua skenario)
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

function Badge({
  code,
  done = false,
  dim = false,
  size = 28,
}: {
  code: string;
  done?: boolean;
  dim?: boolean;
  size?: number;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
        done ? "bg-green-500" : (BADGE_COLOR[code] ?? "bg-slate-500")
      } ${dim ? "opacity-40" : ""}`}
    >
      {done ? <Check size={size * 0.55} strokeWidth={3} /> : code}
    </span>
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
      className={`absolute inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-md flex-col rounded-t-[28px] bg-white/95 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl ${
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
  tone?: "blue" | "green" | "orange";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-500",
  };

  return (
    <div
      className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${colors[tone]}`}
    >
      {children}
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

/* ---------- 6c. Progres perjalanan & pembayaran per angkot ---------- */

function useTripProgress(segments: RouteSegment[]) {
  const [activeLeg, setActiveLeg] = useState(0);
  const [paidLegs, setPaidLegs] = useState<Record<string, PaymentMethod>>({});

  const currentSegment = segments[activeLeg] ?? null;
  const nextSegment = segments[activeLeg + 1] ?? null;

  const totalFare = segments.reduce((sum, s) => sum + s.fare, 0);
  const totalPaid = segments.reduce(
    (sum, s) => sum + (paidLegs[s.id] ? s.fare : 0),
    0,
  );
  const paidCount = segments.filter((s) => !!paidLegs[s.id]).length;
  const isLastLeg = activeLeg === segments.length - 1;
  const isCurrentLegPaid = currentSegment
    ? !!paidLegs[currentSegment.id]
    : false;

  const markCurrentPaid = (method: PaymentMethod) => {
    if (!currentSegment) return;
    setPaidLegs((previous) => ({ ...previous, [currentSegment.id]: method }));
  };

  const goToNextLeg = () => setActiveLeg((previous) => previous + 1);

  const resetProgress = () => {
    setActiveLeg(0);
    setPaidLegs({});
  };

  return {
    segments,
    activeLeg,
    paidLegs,
    currentSegment,
    nextSegment,
    totalFare,
    totalPaid,
    paidCount,
    isLastLeg,
    isCurrentLegPaid,
    markCurrentPaid,
    goToNextLeg,
    resetProgress,
  };
}

type TripProgress = ReturnType<typeof useTripProgress>;

/* ---------- 6d. Feedback ---------- */

function useFeedback() {
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((previous) =>
      previous.includes(tag)
        ? previous.filter((item) => item !== tag)
        : [...previous, tag],
    );
  };

  const resetFeedback = () => {
    setRating(0);
    setSelectedTags([]);
  };

  return { rating, setRating, selectedTags, toggleTag, resetFeedback };
}

/* =========================================================
   SKENARIO 1 — PENCARIAN LOKASI
   (form input, saran lokasi, ringkasan saat hasil tampil)
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

  onBack?: () => void;
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
  onBack,
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

function TripSummaryBar({
  origin,
  destination,
  showBack,
  showEdit,
  onBack,
  onEdit,
}: {
  origin: LocationData | null;
  destination: LocationData | null;
  showBack: boolean;
  showEdit: boolean;
  onBack: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-white/80 bg-white/95 p-3.5 shadow-[0_8px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      {/* BACK BUTTON */}
      {showBack && (
        <button
          onClick={onBack}
          aria-label="Kembali ke daftar rute"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 active:scale-95"
        >
          <ArrowLeft size={19} />
        </button>
      )}

      {/* ROUTE INFO */}
      <div className="min-w-0 flex-1 space-y-1">
        {/* ORIGIN */}
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

        {/* CONNECTOR */}
        <div className="ml-[13px] h-3 border-l-2 border-dashed border-slate-300" />

        {/* DESTINATION */}
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

      {/* EDIT BUTTON */}
      {showEdit && (
        <button
          onClick={onEdit}
          aria-label="Edit rute"
          title="Edit rute"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-700 transition hover:bg-blue-100 active:scale-95"
        >
          <Pencil size={17} />
        </button>
      )}
    </div>
  );
}

/* =========================================================
   SKENARIO 2 — DAFTAR PILIHAN RUTE
========================================================= */

function RouteCard({
  route,
  onSelect,
}: {
  route: AngkotRoute;
  onSelect: (route: AngkotRoute) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const isTransit = route.type === "transit";

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  // Menyamakan format durasi, misalnya "3 mnt" menjadi "3 menit".
  const formatDuration = (value: string | number) => {
    const normalized = String(value).trim();
    const number = normalized.match(/\d+/)?.[0];

    return number ? `${number} menit` : normalized;
  };

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
            className: "bg-emerald-50 text-emerald-800",
          };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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

              {isTransit && (
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-violet-800">
                  {route.transitCount}x Transit
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[11px] font-semibold ${seatStatus.className}`}
        >
          <Armchair size={15} />
          {seatStatus.label}
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* RINGKASAN */}
        <div className="rounded-xl bg-slate-50 p-3.5">
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

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
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
              <p className="mt-0.5 text-sm font-bold text-emerald-700">
                {route.etaToDestination || route.arrivalTime}
              </p>
            </div>
          </div>
        </div>

        {/* TOGGLE DETAIL - BERLAKU UNTUK SEMUA RUTE */}
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
              {isTransit
                ? `${route.segments.length} angkot dalam perjalanan`
                : "Lihat informasi angkot dan jalur perjalanan"}
            </p>
          </div>

          <ChevronDown
            size={19}
            className={`shrink-0 text-slate-600 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* RINCIAN RUTE */}
        {expanded && (
          <div className="mt-5">
            <p className="mb-4 text-sm font-bold text-slate-900">
              Rincian rute
            </p>

            <div className="relative">
              {/* Garis timeline utama */}
              <div className="absolute bottom-5 left-[11px] top-5 border-l-2 border-dashed border-slate-300" />

              {/* PENJEMPUTAN */}
              <div className="relative flex gap-3 pb-5">
                <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <UserRound size={13} />
                </div>

                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-semibold text-slate-800">
                    Lokasi penjemputan
                  </p>
                </div>
              </div>

              {/* DAFTAR ANGKOT */}
              {route.segments.map((segment, index) => {
                const nextSegment = route.segments[index + 1];

                return (
                  <div key={segment.id}>
                    {/* ANGKOT */}
                    <div className="relative flex gap-3 pb-5">
                      <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white">
                        <BusFront size={13} />
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Identitas angkot */}
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Angkot {segment.angkotCode}
                            </p>
                            <p className="mt-0.5 text-xs font-medium text-slate-600">
                              {index === 0 ? "Naik pertama" : "Angkot lanjutan"}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                            {segment.plateNumber || "-"}
                          </span>
                        </div>

                        {/* Asal dan tujuan */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex gap-2.5">
                            <div className="mt-1 flex flex-col items-center">
                              <span className="h-2.5 w-2.5 rounded-full border-2 border-blue-600 bg-white" />
                              <span className="my-1 h-5 border-l-2 border-dashed border-slate-300" />
                              <span className="h-2.5 w-2.5 rounded-full bg-blue-700" />
                            </div>

                            <div className="min-w-0 flex-1 space-y-3">
                              <div>
                                <p className="text-xs font-medium text-slate-600">
                                  Naik dari
                                </p>
                                <p className="mt-0.5 break-words text-sm font-semibold text-slate-900">
                                  {segment.from}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-medium text-slate-600">
                                  Turun di
                                </p>
                                <p className="mt-0.5 break-words text-sm font-semibold text-slate-900">
                                  {segment.to}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Tarif per angkot */}
                          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                            <span className="text-xs font-medium text-slate-600">
                              Tarif angkot
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {formatRupiah(segment.fare)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TRANSIT */}
                    {nextSegment && (
                      <div className="relative flex gap-3 pb-5">
                        <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                          <ArrowDown size={14} />
                        </div>

                        <div className="min-w-0 flex-1 rounded-xl border border-violet-200 bg-violet-50 p-3">
                          <p className="text-sm font-bold text-violet-900">
                            Transit di {segment.to}
                          </p>

                          <p className="mt-1 text-xs leading-relaxed text-violet-900">
                            {segment.transitNote ||
                              `Lanjutkan perjalanan menggunakan angkot ${nextSegment.angkotCode}.`}
                          </p>

                          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-violet-800">
                            <BusFront size={13} />
                            Trayek lanjutan: {nextSegment.angkotCode}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* TUJUAN AKHIR */}
              <div className="relative flex gap-3">
                <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <MapPin size={13} />
                </div>

                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-semibold text-slate-800">
                    Tiba di tujuan
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-emerald-700">
                    {route.etaToDestination || route.arrivalTime}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOMBOL AKSI UTAMA */}
        <button
          type="button"
          onClick={() => onSelect(route)}
          disabled={route.availableSeats === 0}
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {route.availableSeats === 0 ? "Angkot penuh" : "Pilih rute ini"}
        </button>
      </div>
    </div>
  );
}

function RouteCardSkeleton() {
  return (
    <div className="rounded-2xl bg-slate-50 p-4" aria-hidden>
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
        <div className="flex items-center gap-3 rounded-xl bg-white p-2.5">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-4 w-14" />
        </div>
      </div>

      <Skeleton className="h-[52px] w-full rounded-2xl" />
    </div>
  );
}

function RouteListSheet({
  routes,
  loading,
  onSelect,
}: {
  routes: AngkotRoute[];
  loading: boolean;
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
          <div className="rounded-2xl bg-slate-50 p-6 text-center text-[14px] text-slate-500">
            Rute angkot belum ditemukan. Coba ubah lokasi awal atau tujuan.
          </div>
        ) : (
          routes.map((route) => (
            <RouteCard key={route.id} route={route} onSelect={onSelect} />
          ))
        )}
      </div>
    </Sheet>
  );
}

/* =========================================================
   SKENARIO 3 — LOGIN (muncul setelah pilih rute)
========================================================= */

function LoginModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="text-center">
        <IconCircle tone="orange">
          <ShieldCheck size={32} />
        </IconCircle>
        <h2 className="text-[22px] font-bold tracking-tight">
          Waduh, Anda Belum Login!
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
          Login dulu, yuk! Dengan akun AngkotGo, Anda bisa melihat riwayat
          perjalanan dan menyimpan rute favorit.
        </p>
        <button onClick={onClose} className={`${PRIMARY_BTN} mt-6`}>
          Login Sekarang
        </button>
        <button onClick={onClose} className={`${GHOST_BTN} mt-1`}>
          Nanti Saja
        </button>
      </div>
    </Modal>
  );
}

/* =========================================================
   SKENARIO 4 — PERJALANAN AKTIF
   (ringkasan bayar, angkot saat ini, rute leg, rincian bayar)
========================================================= */

function PaymentSummaryCard({ trip }: { trip: TripProgress }) {
  const { totalFare, totalPaid, paidCount, segments } = trip;

  return (
    <div className="rounded-2xl bg-blue-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-medium text-blue-600">
            Total estimasi seluruh perjalanan
          </p>
          <p className="mt-1 text-[22px] font-bold text-blue-800">
            {formatRupiah(totalFare)}
          </p>
        </div>
        <div className="rounded-xl bg-white p-3 text-blue-600">
          <Wallet size={22} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-blue-100 pt-3">
        <div>
          <p className="text-[12px] text-slate-500">Sudah dibayar</p>
          <p className="mt-0.5 font-bold text-green-700">
            {formatRupiah(totalPaid)}
          </p>
        </div>
        <div>
          <p className="text-[12px] text-slate-500">Belum dibayar</p>
          <p className="mt-0.5 font-bold text-orange-600">
            {formatRupiah(totalFare - totalPaid)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px] text-blue-700">
        <span>Pembayaran angkot</span>
        <span className="font-bold">
          {paidCount}/{segments.length} selesai
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full rounded-full bg-green-500 transition-all"
          style={{ width: `${(paidCount / segments.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function DriverSkeleton() {
  return (
    <div aria-hidden>
      <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="mt-2.5 space-y-2 rounded-xl bg-white p-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
    </div>
  );
}

function CurrentAngkotCard({
  segment,
  isPaid,
  loadingDriver,
}: {
  segment: RouteSegment;
  isPaid: boolean;
  loadingDriver: boolean;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-bold">Angkot yang Dinaiki</h3>
        {isPaid ? (
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700">
            LUNAS
          </span>
        ) : (
          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold text-orange-700">
            BELUM BAYAR
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Badge code={segment.angkotCode} size={48} />
        <div className="min-w-0 flex-1">
          <p className="font-bold">Angkot {segment.angkotCode}</p>
          <p className="text-[12px] text-slate-500">{segment.angkotName}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-white p-3">
          <p className="text-[12px] text-slate-500">Tarif angkot ini</p>
          <p className="mt-0.5 font-bold text-blue-700">
            {formatRupiah(segment.fare)}
          </p>
        </div>
        <div className="rounded-xl bg-white p-3">
          <p className="text-[12px] text-slate-500">Estimasi perjalanan</p>
          <p className="mt-0.5 font-bold">{segment.duration} menit</p>
        </div>
      </div>

      {loadingDriver ? (
        <DriverSkeleton />
      ) : (
        <>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[14px] font-bold text-blue-700">
              PS
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold">Pak Slamet</p>
              <p className="flex items-center gap-1 text-[12px] text-slate-500">
                Driver AngkotGo •
                <Star size={11} className="fill-yellow-400 text-yellow-400" />
                4.9
              </p>
            </div>
            <button
              aria-label="Chat sopir"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 active:scale-95"
            >
              <MessageCircle size={18} />
            </button>
          </div>

          <div className="mt-2.5 rounded-xl bg-white p-3">
            <p className="text-[14px] font-semibold">Suzuki Carry Biru Muda</p>
            <p className="mt-0.5 text-[12px] text-slate-500">
              Angkot 2 • Plat N 1234 AG • Trayek {segment.angkotCode}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function LegRouteCard({
  trip,
  segment,
}: {
  trip: TripProgress;
  segment: RouteSegment;
}) {
  const { segments, activeLeg, paidLegs, nextSegment } = trip;

  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-bold">Rute Perjalanan</h3>
        <span className="text-[12px] text-slate-400">
          {activeLeg + 1} dari {segments.length} Leg
        </span>
      </div>

      {segments.length > 1 && (
        <div className="mb-4 flex items-center">
          {segments.map((s, i) => (
            <div key={s.id} className="flex items-center">
              {i > 0 && <span className="mx-2 h-px w-6 bg-black/15" />}
              <Badge
                code={s.angkotCode}
                done={!!paidLegs[s.id]}
                dim={i > activeLeg}
                size={32}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex flex-col items-center py-1.5">
          <span className="h-3 w-3 rounded-full border-[3px] border-blue-600 bg-white" />
          <span className="my-1 w-px flex-1 border-l border-dashed border-slate-300" />
          <span className="h-3 w-3 rounded-[3px] bg-orange-500" />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <p className="text-[11px] text-slate-400">NAIK DARI</p>
            <p className="font-semibold">{segment.from}</p>
            {segment.boardingNote && (
              <p className="mt-0.5 text-[12px] text-slate-500">
                {segment.boardingNote}
              </p>
            )}
          </div>
          <div>
            <p className="text-[11px] text-slate-400">TURUN DI</p>
            <p className="font-semibold">{segment.to}</p>
          </div>
        </div>
      </div>

      {nextSegment ? (
        <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3">
          <p className="flex items-center gap-1 text-[12px] font-bold text-orange-700">
            <MapPin size={14} />
            Titik Transit Berikutnya
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-orange-700">
            {segment.transitNote ||
              `Turun di ${segment.to}, bayar angkot ${segment.angkotCode}, kemudian lanjutkan dengan angkot ${nextSegment.angkotCode}.`}
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-green-50 p-3 text-[12px] text-green-700">
          <p className="font-bold">Tujuan Akhir Perjalanan</p>
          <p className="mt-0.5">
            Setelah sampai di {segment.to}, lakukan pembayaran angkot terakhir.
          </p>
        </div>
      )}
    </div>
  );
}

function PaymentHistoryCard({ trip }: { trip: TripProgress }) {
  const { segments, paidLegs, totalFare } = trip;

  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <CreditCard size={18} className="text-blue-600" />
        <h3 className="text-[15px] font-bold">Rincian Pembayaran Per Angkot</h3>
      </div>

      <div className="space-y-2">
        {segments.map((segment, index) => {
          const method = paidLegs[segment.id];

          return (
            <div
              key={segment.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"
            >
              <div className="min-w-0">
                <p className="text-[14px] font-bold">
                  Angkot {segment.angkotCode}
                </p>
                <p className="truncate text-[12px] text-slate-500">
                  Leg {index + 1} • {segment.from} - {segment.to}
                </p>
                <p className="text-[12px] text-slate-500">
                  {method
                    ? `Dibayar dengan ${method === "cash" ? "Tunai" : "QRIS"}`
                    : "Menunggu pembayaran"}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[14px] font-bold">
                  {formatRupiah(segment.fare)}
                </p>
                {method ? (
                  <span className="text-[10px] font-bold text-green-600">
                    ✓ LUNAS
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-orange-500">
                    BELUM BAYAR
                  </span>
                )}
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
  loadingDriver,
  onSimulateNearDestination,
  onContinue,
}: {
  trip: TripProgress;
  loadingDriver: boolean;
  onSimulateNearDestination: () => void;
  onContinue: () => void;
}) {
  const { currentSegment, nextSegment, isCurrentLegPaid, isLastLeg } = trip;

  if (!currentSegment) return null;

  return (
    <Sheet tall>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pt-4 pb-4">
        {/* HEADER */}
        <div>
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700">
            PERJALANAN AKTIF
          </span>
          <h2 className="mt-1.5 text-[22px] font-bold tracking-tight">
            Perjalanan Anda
          </h2>
        </div>

        <PaymentSummaryCard trip={trip} />
        <CurrentAngkotCard
          segment={currentSegment}
          isPaid={isCurrentLegPaid}
          loadingDriver={loadingDriver}
        />
        <LegRouteCard trip={trip} segment={currentSegment} />
        <PaymentHistoryCard trip={trip} />
      </div>

      {/* STICKY CTA */}
      <div className="shrink-0 border-t border-black/5 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {isCurrentLegPaid ? (
          <button
            onClick={onContinue}
            disabled={loadingDriver}
            className={PRIMARY_BTN}
          >
            {isLastLeg
              ? "Berikan Feedback"
              : `Lanjut ke Angkot ${nextSegment?.angkotCode}`}
          </button>
        ) : (
          <button
            onClick={onSimulateNearDestination}
            disabled={loadingDriver}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 text-[16px] font-semibold text-white transition active:scale-[0.98] active:bg-orange-600 disabled:opacity-50"
          >
            <MapPin size={18} />
            Simulasikan Dekat Tujuan
          </button>
        )}
      </div>
    </Sheet>
  );
}

/* =========================================================
   SKENARIO 5 — PEMBAYARAN PER ANGKOT
   (dekat tujuan → pilih metode → QRIS → berhasil/transit)
========================================================= */

function NearDestinationModal({
  segment,
  onProceed,
  onClose,
}: {
  segment: RouteSegment;
  onProceed: () => void;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="text-center">
        <IconCircle tone="orange">
          <MapPin size={30} />
        </IconCircle>
        <h2 className="text-[22px] font-bold tracking-tight">
          Sudah Dekat Titik Turun!
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
          Anda akan segera turun dari angkot <b>{segment.angkotCode}</b>.
          Silakan bersiap dan bayar kepada sopir.
        </p>

        <div className="my-5 rounded-2xl bg-blue-50 p-4 text-left">
          <p className="text-[12px] text-blue-600">Angkot yang harus dibayar</p>
          <p className="mt-0.5 text-[17px] font-bold text-blue-800">
            Angkot {segment.angkotCode}
          </p>
          <p className="text-[12px] text-slate-500">{segment.angkotName}</p>
          <div className="mt-3 border-t border-blue-100 pt-3">
            <p className="text-[12px] text-blue-600">Bayar kepada sopir</p>
            <p className="mt-0.5 text-[28px] font-bold leading-tight text-blue-800">
              {formatRupiah(segment.fare)}
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-xl bg-slate-50 p-3 text-left">
          <p className="text-[12px] text-slate-500">Titik turun</p>
          <p className="font-bold">{segment.to}</p>
        </div>

        <button onClick={onProceed} className={PRIMARY_BTN}>
          Lanjutkan Pembayaran
        </button>
        <button onClick={onClose} className={`${GHOST_BTN} mt-1`}>
          Nanti
        </button>
      </div>
    </Modal>
  );
}

function PaymentMethodModal({
  segment,
  activeLeg,
  totalLegs,
  payingMethod,
  onPayCash,
  onPayQris,
  onBack,
  onClose,
}: {
  segment: RouteSegment;
  activeLeg: number;
  totalLegs: number;
  payingMethod: PaymentMethod | null;
  onPayCash: () => void;
  onPayQris: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="mb-5 text-center">
        <IconCircle>
          <Wallet size={30} />
        </IconCircle>
        <h2 className="text-[22px] font-bold tracking-tight">
          Bayar Angkot {segment.angkotCode}
        </h2>
        <p className="mt-1 text-[14px] text-slate-500">
          Pembayaran dilakukan kepada sopir angkot yang sedang Anda naiki.
        </p>
      </div>

      <div className="mb-4 rounded-2xl bg-blue-50 p-4">
        <p className="text-[12px] text-blue-600">
          Tarif angkot {segment.angkotCode}
        </p>
        <p className="mt-0.5 text-[26px] font-bold text-blue-800">
          {formatRupiah(segment.fare)}
        </p>
        <p className="mt-1 text-[12px] text-blue-600">
          Leg {activeLeg + 1} dari {totalLegs}
        </p>
      </div>

      <div className="space-y-2.5">
        <button
          onClick={onPayCash}
          disabled={!!payingMethod}
          className="flex w-full items-center gap-4 rounded-2xl bg-slate-100 p-4 text-left transition active:scale-[0.98] disabled:opacity-60"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Banknote size={22} />
          </span>
          <span className="flex-1">
            <span className="block text-[16px] font-semibold">Uang Tunai</span>
            <span className="block text-[12px] text-slate-500">
              {payingMethod === "cash"
                ? "Mencatat pembayaran..."
                : "Bayar langsung kepada sopir."}
            </span>
          </span>
          {payingMethod === "cash" ? (
            <Spinner size={18} className="text-green-600" />
          ) : (
            <ChevronRight size={18} className="text-slate-400" />
          )}
        </button>

        <button
          onClick={onPayQris}
          disabled={!!payingMethod}
          className="flex w-full items-center gap-4 rounded-2xl bg-slate-100 p-4 text-left transition active:scale-[0.98] disabled:opacity-60"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <QrCode size={22} />
          </span>
          <span className="flex-1">
            <span className="block text-[16px] font-semibold">QRIS</span>
            <span className="block text-[12px] text-slate-500">
              Bayar menggunakan scan QR.
            </span>
          </span>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
      </div>

      <button
        onClick={onBack}
        disabled={!!payingMethod}
        className={`${GHOST_BTN} mt-2 disabled:opacity-50`}
      >
        Kembali
      </button>
    </Modal>
  );
}

function QrisModal({
  segment,
  paying,
  onConfirm,
  onChangeMethod,
  onClose,
}: {
  segment: RouteSegment;
  paying: boolean;
  onConfirm: () => void;
  onChangeMethod: () => void;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="text-center">
        <h2 className="text-[22px] font-bold tracking-tight">
          Pembayaran QRIS
        </h2>
        <p className="mt-1 text-[14px] text-slate-500">
          Scan kode QR untuk membayar angkot {segment.angkotCode}.
        </p>

        <div className="mx-auto my-5 flex h-52 w-52 flex-col items-center justify-center rounded-3xl bg-slate-100">
          <QrCode size={110} className="text-slate-800" />
          <span className="mt-2 text-[10px] font-bold tracking-widest text-slate-500">
            DUMMY QRIS
          </span>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="text-[12px] text-blue-600">
            Pembayaran angkot {segment.angkotCode}
          </p>
          <p className="mt-0.5 text-[26px] font-bold text-blue-800">
            {formatRupiah(segment.fare)}
          </p>
        </div>

        <button
          onClick={onConfirm}
          disabled={paying}
          className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-green-600 text-[16px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-70"
        >
          {paying ? (
            <>
              <Spinner />
              Memverifikasi pembayaran...
            </>
          ) : (
            "Simulasikan Pembayaran Berhasil"
          )}
        </button>
        <button
          onClick={onChangeMethod}
          disabled={paying}
          className={`${GHOST_BTN} mt-1 disabled:opacity-50`}
        >
          Ganti Metode Pembayaran
        </button>
      </div>
    </Modal>
  );
}

function LegPaidModal({
  trip,
  segment,
  onContinue,
}: {
  trip: TripProgress;
  segment: RouteSegment;
  onContinue: () => void;
}) {
  const { paidLegs, totalPaid, totalFare, isLastLeg, nextSegment } = trip;

  return (
    <Modal>
      <div className="mb-4 text-center">
        <IconCircle tone="green">
          <CheckCircle2 size={34} />
        </IconCircle>
        <h2 className="text-[22px] font-bold tracking-tight">
          Pembayaran Berhasil!
        </h2>
        <p className="mt-1 text-[14px] text-slate-500">
          Pembayaran angkot {segment.angkotCode} telah dikonfirmasi.
        </p>
      </div>

      <div className="mb-3 rounded-2xl bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-green-700">
            Angkot {segment.angkotCode}
          </span>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
            LUNAS
          </span>
        </div>
        <p className="mt-1 text-[24px] font-bold text-green-800">
          {formatRupiah(segment.fare)}
        </p>
        <p className="text-[12px] text-green-700">
          Metode: {paidLegs[segment.id] === "cash" ? "Uang Tunai" : "QRIS"}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-[12px] text-slate-500">Total yang sudah dibayar</p>
          <p className="font-bold">{formatRupiah(totalPaid)}</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-slate-500">Sisa pembayaran</p>
          <p className="font-bold text-orange-600">
            {formatRupiah(totalFare - totalPaid)}
          </p>
        </div>
      </div>

      {isLastLeg ? (
        <>
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3">
            <p className="font-bold text-green-800">
              Semua Angkot Sudah Dibayar!
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-green-700">
              Seluruh pembayaran selesai. Silakan berikan penilaian untuk
              perjalanan Anda.
            </p>
          </div>
          <button onClick={onContinue} className={PRIMARY_BTN}>
            Berikan Feedback
          </button>
        </>
      ) : (
        nextSegment && (
          <>
            <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-3">
              <p className="flex items-center gap-2 font-bold text-orange-800">
                <Navigation size={16} />
                Lanjutkan Transit
              </p>

              <div className="mt-2 rounded-xl bg-white p-3">
                <p className="text-[11px] text-slate-500">TURUN DI</p>
                <p className="font-bold">{segment.to}</p>

                <div className="my-2.5 border-t border-dashed border-slate-200" />

                <p className="text-[11px] text-slate-500">ANGKOT SELANJUTNYA</p>
                <div className="mt-1.5 flex items-center gap-3">
                  <Badge code={nextSegment.angkotCode} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-blue-700">
                      Angkot {nextSegment.angkotCode}
                    </p>
                    <p className="truncate text-[12px] text-slate-500">
                      {nextSegment.angkotName}
                    </p>
                  </div>
                  <span className="text-[13px] font-bold">
                    {formatRupiah(nextSegment.fare)}
                  </span>
                </div>
              </div>

              <p className="mt-2 text-[12px] leading-relaxed text-orange-700">
                Silakan turun, lalu naik angkot berikutnya. Pembayaran dilakukan
                terpisah.
              </p>
            </div>

            <button onClick={onContinue} className={PRIMARY_BTN}>
              Lanjut ke Angkot Berikutnya
              <ArrowRight size={16} />
            </button>
          </>
        )
      )}
    </Modal>
  );
}

/* =========================================================
   SKENARIO 6 — FEEDBACK & PERJALANAN SELESAI
========================================================= */

function FeedbackModal({
  trip,
  rating,
  selectedTags,
  onRate,
  onToggleTag,
  submitting,
  onSubmit,
  onClose,
}: {
  trip: TripProgress;
  rating: number;
  selectedTags: string[];
  onRate: (star: number) => void;
  onToggleTag: (tag: string) => void;
  submitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const { segments, totalPaid, paidCount } = trip;

  return (
    <Modal onClose={onClose}>
      <div className="mb-4 text-center">
        <IconCircle tone="green">
          <CheckCircle2 size={32} />
        </IconCircle>
        <h2 className="text-[22px] font-bold tracking-tight">
          Bagaimana Perjalanan Anda?
        </h2>
        <p className="mt-1 text-[14px] text-slate-500">
          Semua pembayaran angkot berhasil. Yuk, berikan penilaian!
        </p>
      </div>

      {/* Ringkasan pembayaran */}
      <div className="mb-5 rounded-xl bg-green-50 p-3">
        <div className="space-y-1.5">
          {segments.map((segment) => (
            <div key={segment.id} className="flex justify-between text-[13px]">
              <span className="text-green-700">
                Angkot {segment.angkotCode}
              </span>
              <span className="font-bold text-green-700">
                {formatRupiah(segment.fare)} ✓
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex justify-between border-t border-green-200 pt-2.5 text-[14px] font-bold text-green-800">
          <span>Total dibayar</span>
          <span>{formatRupiah(totalPaid)}</span>
        </div>
      </div>

      {/* Rating bintang */}
      <div className="mb-5 text-center">
        <p className="mb-2 text-[14px] font-semibold text-slate-700">
          Berikan rating perjalanan
        </p>
        <div className="flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRate(star)}
              aria-label={`${star} bintang`}
              className="p-1 transition active:scale-110"
            >
              <Star
                size={36}
                className={
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300"
                }
              />
            </button>
          ))}
        </div>
        <p className="mt-1 text-[12px] font-medium text-slate-500">
          {RATING_LABEL[rating]}
        </p>
      </div>

      {/* Tag */}
      <div className="mb-5">
        <p className="mb-2 text-[14px] font-semibold text-slate-700">
          Apa yang Anda sukai?
        </p>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_TAGS.map((tag) => {
            const selected = selectedTags.includes(tag);

            return (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
                  selected
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {selected && <Check size={12} />}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting || rating === 0 || paidCount !== segments.length}
        className={PRIMARY_BTN}
      >
        {submitting ? (
          <>
            <Spinner />
            Mengirim feedback...
          </>
        ) : (
          "Kirim Feedback dan Akhiri Perjalanan"
        )}
      </button>
    </Modal>
  );
}

function CompletedModal({
  totalFare,
  rating,
  selectedTags,
  onFinish,
}: {
  totalFare: number;
  rating: number;
  selectedTags: string[];
  onFinish: () => void;
}) {
  return (
    <Modal>
      <div className="text-center">
        <IconCircle tone="green">
          <CheckCircle2 size={36} />
        </IconCircle>
        <h2 className="text-[24px] font-bold tracking-tight">
          Perjalanan Selesai!
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
          Terima kasih telah menggunakan AngkotGo. Seluruh pembayaran angkot
          berhasil diselesaikan.
        </p>

        <div className="my-5 rounded-2xl bg-slate-50 p-4 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-slate-500">Total perjalanan</span>
            <span className="font-bold">{formatRupiah(totalFare)}</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[14px] text-slate-500">Rating Anda</span>
            <span className="flex items-center gap-1 font-bold">
              <Star size={15} className="fill-yellow-400 text-yellow-400" />
              {rating}/5
            </span>
          </div>

          {selectedTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-50 px-2.5 py-1 text-[12px] font-medium text-blue-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <button onClick={onFinish} className={PRIMARY_BTN}>
          Selesai
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loadingDriver, setLoadingDriver] = useState(false);
  const [payingMethod, setPayingMethod] = useState<PaymentMethod | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  /* ----- Hooks domain ----- */
  const { suggestions, loading: suggestionsLoading } = usePlaceSuggestions(
    activeField,
    originQuery,
    destinationQuery,
  );
  const trip = useTripProgress(selectedRoute?.segments ?? []);
  const feedback = useFeedback();

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

      setActiveField(null);
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
    setShowLoginModal(false);
    setActiveModal(null);
    trip.resetProgress();
    feedback.resetFeedback();
    searchId.current += 1; // batalkan pencarian yang sedang berjalan
    setRoutes([]);
    setRoutesLoading(false);
    setLoadingDriver(false);
    setPayingMethod(null);
    setSubmittingFeedback(false);
  };

  // Kembali ke daftar rute.
  const backToResults = () => {
    setSelectedRoute(null);
    setShowLoginModal(false);
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
    setShowLoginModal(true);
    void loadDriver();
  };

  /* =======================================================
     SKENARIO 5 — Handler pembayaran per angkot
  ======================================================= */

  // Simulasi: penumpang mendekati titik turun angkot aktif.
  const handleNearDestination = () => {
    if (!currentSegment || trip.isCurrentLegPaid) return;
    setActiveModal("near-destination");
  };

  const confirmLegPayment = async (method: PaymentMethod) => {
    if (!currentSegment || payingMethod) return;

    setPayingMethod(method);
    await wait(method === "qris" ? 1200 : 700); // ganti dengan request API
    trip.markCurrentPaid(method);
    setPayingMethod(null);
    setActiveModal("leg-paid");
  };

  // Lanjut ke angkot berikutnya, atau ke penilaian jika sudah angkot terakhir.
  const continueAfterPayment = () => {
    if (!currentSegment || !trip.paidLegs[currentSegment.id]) return;

    if (trip.isLastLeg) {
      setActiveModal("feedback");
      return;
    }

    trip.goToNextLeg();
    setActiveModal(null);
    void loadDriver();
  };

  /* =======================================================
     SKENARIO 6 — Handler feedback & selesai
  ======================================================= */

  const submitFeedback = async () => {
    if (feedback.rating === 0 || trip.paidCount !== trip.segments.length) {
      return;
    }

    setSubmittingFeedback(true);
    await wait(1000); // ganti dengan request API
    setSubmittingFeedback(false);
    setActiveModal("completed");
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

      {/* ===== ATAS: form pencarian / ringkasan ===== */}
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
            onSearch={handleSearch}
          />
        ) : (
          <TripSummaryBar
            origin={origin}
            destination={destination}
            showBack={!!selectedRoute}
            showEdit={!selectedRoute}
            onBack={backToResults}
            onEdit={resetTrip}
          />
        )}
      </header>

      {/* ===== SKENARIO 2: daftar rute ===== */}
      {showResults && !selectedRoute && (
        <RouteListSheet
          routes={routes}
          loading={routesLoading}
          onSelect={handleSelectRoute}
        />
      )}

      {/* ===== SKENARIO 3: login ===== */}
      {showLoginModal && selectedRoute && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {/* ===== SKENARIO 4: perjalanan aktif ===== */}
      {selectedRoute && currentSegment && (
        <ActiveTripSheet
          trip={trip}
          loadingDriver={loadingDriver}
          onSimulateNearDestination={handleNearDestination}
          onContinue={continueAfterPayment}
        />
      )}

      {/* ===== SKENARIO 5: pembayaran per angkot ===== */}
      {activeModal === "near-destination" && currentSegment && (
        <NearDestinationModal
          segment={currentSegment}
          onProceed={() => setActiveModal("payment")}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "payment" && currentSegment && (
        <PaymentMethodModal
          segment={currentSegment}
          activeLeg={trip.activeLeg}
          totalLegs={trip.segments.length}
          payingMethod={payingMethod}
          onPayCash={() => confirmLegPayment("cash")}
          onPayQris={() => setActiveModal("qris")}
          onBack={() => setActiveModal("near-destination")}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "qris" && currentSegment && (
        <QrisModal
          segment={currentSegment}
          paying={payingMethod === "qris"}
          onConfirm={() => confirmLegPayment("qris")}
          onChangeMethod={() => setActiveModal("payment")}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "leg-paid" && currentSegment && (
        <LegPaidModal
          trip={trip}
          segment={currentSegment}
          onContinue={continueAfterPayment}
        />
      )}

      {/* ===== SKENARIO 6: feedback & selesai ===== */}
      {activeModal === "feedback" && (
        <FeedbackModal
          trip={trip}
          rating={feedback.rating}
          selectedTags={feedback.selectedTags}
          onRate={feedback.setRating}
          onToggleTag={feedback.toggleTag}
          submitting={submittingFeedback}
          onSubmit={submitFeedback}
          onClose={() => !submittingFeedback && setActiveModal(null)}
        />
      )}

      {activeModal === "completed" && (
        <CompletedModal
          totalFare={trip.totalFare}
          rating={feedback.rating}
          selectedTags={feedback.selectedTags}
          onFinish={finishTrip}
        />
      )}
    </main>
  );
}
