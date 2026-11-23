"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Banknote,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  LocateFixed,
  MapPin,
  MessageCircle,
  Navigation,
  QrCode,
  Search,
  ShieldCheck,
  Star,
  Wallet,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type LocationData = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

type RouteSegment = {
  id: string;
  angkotCode: string;
  angkotName: string;
  from: string;
  to: string;
  duration: number;
  fare: number;
  boardingNote?: string;
  transitNote?: string;
};

type AngkotRoute = {
  id: string;
  type: "direct" | "transit";
  transitCount: number;
  duration: number;
  arrivalTime: string;
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

/* =========================================================
   DUMMY DATA
========================================================= */

const DUMMY_ROUTES: AngkotRoute[] = [
  {
    id: "route-direct",
    type: "direct",
    transitCount: 0,
    duration: 28,
    arrivalTime: "10.45",
    fare: 5000,
    availableSeats: 4,
    segments: [
      {
        id: "segment-1",
        angkotCode: "AL",
        angkotName: "Arjosari - Landungsari",
        from: "Terminal Arjosari",
        to: "Landungsari",
        duration: 28,
        fare: 5000,
        boardingNote: "Naik dari titik penjemputan terdekat.",
      },
    ],
  },
  {
    id: "route-transit",
    type: "transit",
    transitCount: 1,
    duration: 42,
    arrivalTime: "10.59",
    fare: 10000,
    availableSeats: 3,
    segments: [
      {
        id: "segment-2",
        angkotCode: "AG",
        angkotName: "Arjosari - Gadang",
        from: "Terminal Arjosari",
        to: "Pasar Besar",
        duration: 22,
        fare: 5000,
        boardingNote: "Naik angkot AG dari titik penjemputan.",
        transitNote:
          "Turun di Pasar Besar dan lakukan pembayaran kepada sopir AG. Selanjutnya berganti angkot AL.",
      },
      {
        id: "segment-3",
        angkotCode: "AL",
        angkotName: "Arjosari - Landungsari",
        from: "Pasar Besar",
        to: "Landungsari",
        duration: 20,
        fare: 5000,
        boardingNote: "Lanjutkan perjalanan menggunakan angkot AL.",
      },
    ],
  },
  {
    id: "route-transit-2",
    type: "transit",
    transitCount: 2,
    duration: 55,
    arrivalTime: "11.12",
    fare: 15000,
    availableSeats: 5,
    segments: [
      {
        id: "segment-4",
        angkotCode: "AG",
        angkotName: "Arjosari - Gadang",
        from: "Terminal Arjosari",
        to: "Pasar Besar",
        duration: 20,
        fare: 5000,
      },
      {
        id: "segment-5",
        angkotCode: "GL",
        angkotName: "Gadang - Landungsari",
        from: "Pasar Besar",
        to: "Alun-Alun Kota",
        duration: 18,
        fare: 5000,
      },
      {
        id: "segment-6",
        angkotCode: "AL",
        angkotName: "Arjosari - Landungsari",
        from: "Alun-Alun Kota",
        to: "Landungsari",
        duration: 17,
        fare: 5000,
      },
    ],
  },
];

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
   STYLE TOKENS (biru AngkotGo + gaya Gojek/Apple)
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
   HELPERS & SMALL COMPONENTS
========================================================= */

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
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
   MAIN PAGE
========================================================= */

export default function HomePage() {
  /* MAP */

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const originMarker = useRef<google.maps.Marker | null>(null);
  const destinationMarker = useRef<google.maps.Marker | null>(null);

  const [mapReady, setMapReady] = useState(false);

  /* SEARCH */

  const [origin, setOrigin] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [suggestions, setSuggestions] = useState<
    google.maps.places.PlacePrediction[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<AngkotRoute | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  /* TRIP */

  const [activeLeg, setActiveLeg] = useState(0);
  const [paidLegs, setPaidLegs] = useState<Record<string, PaymentMethod>>({});
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  /* FEEDBACK */

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const segments = selectedRoute?.segments ?? [];
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

  /* =========================================================
     GOOGLE MAPS INITIALIZATION
  ========================================================= */

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

  /* =========================================================
     PLACES AUTOCOMPLETE
  ========================================================= */

  useEffect(() => {
    if (!activeField) {
      setSuggestions([]);
      return;
    }

    const query = activeField === "origin" ? originQuery : destinationQuery;

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;

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
            (prediction): prediction is google.maps.places.PlacePrediction =>
              prediction !== null && prediction !== undefined,
          );

        setSuggestions(predictions);
      } catch (error) {
        if (!cancelled) {
          console.error("Autocomplete error:", error);
          setSuggestions([]);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [originQuery, destinationQuery, activeField]);

  /* =========================================================
     MAP MARKERS
  ========================================================= */

  const updateMarker = (location: LocationData, field: Field) => {
    if (!mapInstance.current) return;

    const position = { lat: location.lat, lng: location.lng };
    const ref = field === "origin" ? originMarker : destinationMarker;

    ref.current?.setMap(null);

    ref.current = new google.maps.Marker({
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

  /* =========================================================
     SELECT PLACE
  ========================================================= */

  const selectPlace = async (
    prediction: google.maps.places.PlacePrediction,
    field: Field,
  ) => {
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
      setSuggestions([]);
      updateMarker(location, field);
    } catch (error) {
      console.error("Gagal mengambil detail lokasi:", error);
      alert("Gagal mengambil detail lokasi.");
    }
  };

  /* =========================================================
     CURRENT LOCATION
  ========================================================= */

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung GPS.");
      return;
    }

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
        setActiveField(null);
        updateMarker(location, "origin");

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
      () => alert("Tidak dapat mengambil lokasi. Periksa izin GPS."),
    );
  };

  /* =========================================================
     SEARCH HANDLERS
  ========================================================= */

  const swapLocations = () => {
    const prevOrigin = origin;
    const prevDestination = destination;

    setOrigin(prevDestination);
    setDestination(prevOrigin);
    setOriginQuery(prevDestination?.name || "");
    setDestinationQuery(prevOrigin?.name || "");

    if (prevDestination) updateMarker(prevDestination, "origin");
    else originMarker.current?.setMap(null);

    if (prevOrigin) updateMarker(prevOrigin, "destination");
    else destinationMarker.current?.setMap(null);
  };

  const clearLocation = (field: Field) => {
    if (field === "origin") {
      setOrigin(null);
      setOriginQuery("");
      originMarker.current?.setMap(null);
    } else {
      setDestination(null);
      setDestinationQuery("");
      destinationMarker.current?.setMap(null);
    }
  };

  // Kembali ke form pencarian (lokasi tetap tersimpan).
  const resetTrip = () => {
    setSelectedRoute(null);
    setShowResults(false);
    setShowLoginModal(false);
    setActiveModal(null);
    setActiveLeg(0);
    setPaidLegs({});
    setRating(0);
    setSelectedTags([]);
  };

  // Kembali ke daftar rute.
  const backToResults = () => {
    setSelectedRoute(null);
    setShowLoginModal(false);
    setActiveModal(null);
    setActiveLeg(0);
    setPaidLegs({});
  };

  const handleSearch = () => {
    if (!origin || !destination) {
      alert("Silakan tentukan lokasi awal dan tujuan.");
      return;
    }

    setSearching(true);
    setActiveField(null);

    setTimeout(() => {
      setSearching(false);
      resetTrip();
      setShowResults(true);

      if (mapInstance.current) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: origin.lat, lng: origin.lng });
        bounds.extend({ lat: destination.lat, lng: destination.lng });
        mapInstance.current.fitBounds(bounds, {
          top: 140,
          bottom: 400,
          left: 40,
          right: 40,
        });
      }
    }, 700);
  };

  /* =========================================================
     ROUTE SELECTION
  ========================================================= */

  const handleSelectRoute = (route: AngkotRoute) => {
    setSelectedRoute(route);
    setActiveLeg(0);
    setPaidLegs({});
    setShowLoginModal(true);
  };

  /* =========================================================
     PER-ANGKOT PAYMENT FLOW
  ========================================================= */

  // Simulasi: penumpang mendekati titik turun angkot aktif.
  const handleNearDestination = () => {
    if (!currentSegment || isCurrentLegPaid) return;
    setActiveModal("near-destination");
  };

  const confirmLegPayment = (method: PaymentMethod) => {
    if (!currentSegment) return;
    setPaidLegs((previous) => ({ ...previous, [currentSegment.id]: method }));
    setActiveModal("leg-paid");
  };

  // Lanjut ke angkot berikutnya, atau ke penilaian jika sudah angkot terakhir.
  const continueAfterPayment = () => {
    if (!currentSegment || !paidLegs[currentSegment.id]) return;

    if (isLastLeg) {
      setActiveModal("feedback");
      return;
    }

    setActiveLeg((previous) => previous + 1);
    setActiveModal(null);
  };

  /* =========================================================
     FEEDBACK FLOW
  ========================================================= */

  const toggleFeedbackTag = (tag: string) => {
    setSelectedTags((previous) =>
      previous.includes(tag)
        ? previous.filter((item) => item !== tag)
        : [...previous, tag],
    );
  };

  const submitFeedback = () => {
    if (rating === 0 || paidCount !== segments.length) return;
    setActiveModal("completed");
  };

  const finishTrip = () => {
    resetTrip();
    setOrigin(null);
    setDestination(null);
    setOriginQuery("");
    setDestinationQuery("");
    originMarker.current?.setMap(null);
    destinationMarker.current?.setMap(null);
  };

  /* =========================================================
     UI
  ========================================================= */

  const isSearching = !showResults && !selectedRoute;

  return (
    <main
      style={{ fontFamily: FONT }}
      className="relative h-dvh overflow-hidden bg-slate-100 text-slate-900 antialiased"
    >
      {/* MAP */}

      <div ref={mapRef} className="absolute inset-0 z-0 h-full w-full" />

      {!mapReady && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-slate-200 text-sm text-slate-500">
          Memuat peta...
        </div>
      )}

      {/* =====================================================
          TOP CARD: FORM INPUT (atas)
      ====================================================== */}

      <header className="absolute inset-x-0 top-0 z-20 mx-auto w-full max-w-md px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {isSearching ? (
          <div className="rounded-3xl bg-white/95 p-4 shadow-xl backdrop-blur-xl">
            {/* BRAND */}
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h1 className="text-[18px] font-bold tracking-tight text-blue-700">
                  AngkotGo
                </h1>
                <p className="text-[12px] text-slate-500">
                  Transportasi mudah di Kota Malang
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700">
                Guest User
              </span>
            </div>

            {/* FIELDS */}
            <div className="relative">
              <div className="relative rounded-2xl bg-slate-100">
                {/* ORIGIN */}
                <div className="flex items-center gap-3 px-4">
                  <span className="h-3 w-3 shrink-0 rounded-full border-[3px] border-blue-600 bg-white" />
                  <input
                    value={originQuery}
                    onChange={(event) => {
                      setOriginQuery(event.target.value);
                      setOrigin(null);
                      setActiveField("origin");
                    }}
                    onFocus={() => setActiveField("origin")}
                    placeholder="Lokasi awal"
                    className="h-12 min-w-0 flex-1 bg-transparent text-[16px] font-medium outline-none placeholder:text-slate-400"
                  />
                  {originQuery && (
                    <button
                      onClick={() => clearLocation("origin")}
                      aria-label="Hapus lokasi awal"
                      className="text-slate-400"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    onClick={getCurrentLocation}
                    aria-label="Gunakan lokasi saya"
                    className="-mr-1 flex h-9 w-9 items-center justify-center rounded-full text-blue-600 active:bg-black/5"
                  >
                    <LocateFixed size={19} />
                  </button>
                </div>

                <div className="ml-10 mr-14 h-px bg-black/10" />

                {/* DESTINATION */}
                <div className="flex items-center gap-3 px-4">
                  <span className="h-3 w-3 shrink-0 rounded-[3px] bg-orange-500" />
                  <input
                    value={destinationQuery}
                    onChange={(event) => {
                      setDestinationQuery(event.target.value);
                      setDestination(null);
                      setActiveField("destination");
                    }}
                    onFocus={() => setActiveField("destination")}
                    placeholder="Lokasi tujuan"
                    className="h-12 min-w-0 flex-1 bg-transparent text-[16px] font-medium outline-none placeholder:text-slate-400"
                  />
                  {destinationQuery && (
                    <button
                      onClick={() => clearLocation("destination")}
                      aria-label="Hapus tujuan"
                      className="mr-10 text-slate-400"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <button
                  onClick={swapLocations}
                  aria-label="Tukar lokasi"
                  className="absolute bottom-[6px] right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm active:scale-95"
                >
                  <ArrowUpDown size={16} />
                </button>
              </div>

              {/* SUGGESTIONS (melayang di bawah input) */}
              {activeField && suggestions.length > 0 && (
                <ul className="absolute inset-x-0 top-full z-30 mt-2 max-h-[40dvh] overflow-y-auto rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-black/5">
                  {suggestions.map((item) => (
                    <li key={item.placeId}>
                      <button
                        onClick={() => selectPlace(item, activeField)}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left active:bg-slate-100"
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            activeField === "origin"
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
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={searching || !origin || !destination}
              className={`${PRIMARY_BTN} mt-3`}
            >
              <Search size={18} />
              {searching ? "Mencari rute..." : "Cari Angkot"}
            </button>
          </div>
        ) : (
          /* COMPACT SUMMARY */
          <div className="flex items-center gap-3 rounded-3xl bg-white/95 p-3 shadow-xl backdrop-blur-xl">
            {selectedRoute && (
              <button
                onClick={backToResults}
                aria-label="Kembali ke daftar rute"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 active:scale-95"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <div className="min-w-0 flex-1 pl-1">
              <div className="flex items-center gap-2 text-[14px]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                <span className="truncate font-semibold">{origin?.name}</span>
              </div>
              <div className="my-0.5 ml-[4px] h-2.5 border-l border-dashed border-slate-300" />
              <div className="flex items-center gap-2 text-[14px]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-orange-500" />
                <span className="truncate font-semibold">
                  {destination?.name}
                </span>
              </div>
            </div>

            {!selectedRoute && (
              <button
                onClick={resetTrip}
                className="shrink-0 rounded-full bg-blue-50 px-4 py-2 text-[13px] font-semibold text-blue-700 active:scale-95"
              >
                Ubah
              </button>
            )}
          </div>
        )}
      </header>

      {/* =====================================================
          LIST ANGKOT (bawah)
      ====================================================== */}

      {showResults && !selectedRoute && (
        <Sheet>
          <div className="shrink-0 px-5 pt-4 pb-3">
            <h2 className="text-[20px] font-bold tracking-tight">
              Pilihan Rute Angkot
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-500">
              Ditemukan {DUMMY_ROUTES.length} rekomendasi perjalanan
            </p>
          </div>

          <div className="space-y-3 overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            {DUMMY_ROUTES.map((route) => (
              <div key={route.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-[12px] font-semibold text-blue-700">
                    {route.transitCount === 0
                      ? "Langsung"
                      : `${route.transitCount}x Transit`}
                  </span>
                  <span className="text-[12px] text-slate-500">
                    {route.availableSeats} kursi tersedia
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[24px] font-bold leading-none tracking-tight">
                      {route.duration} menit
                    </p>
                    <p className="mt-1.5 text-[12px] text-slate-500">
                      Estimasi tiba {route.arrivalTime}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[18px] font-bold text-blue-700">
                      {formatRupiah(route.fare)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Total semua angkot
                    </p>
                  </div>
                </div>

                <div className="my-3 space-y-2">
                  {route.segments.map((segment) => (
                    <div
                      key={segment.id}
                      className="flex items-center gap-3 rounded-xl bg-white p-2.5"
                    >
                      <Badge code={segment.angkotCode} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold">
                          Angkot {segment.angkotCode}
                        </p>
                        <p className="truncate text-[12px] text-slate-500">
                          {segment.from} → {segment.to}
                        </p>
                      </div>
                      <span className="text-[13px] font-bold text-blue-700">
                        {formatRupiah(segment.fare)}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectRoute(route)}
                  className={PRIMARY_BTN}
                >
                  Pilih Rute
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </Sheet>
      )}

      {/* =====================================================
          LOGIN MODAL
      ====================================================== */}

      {showLoginModal && selectedRoute && (
        <Modal onClose={() => setShowLoginModal(false)}>
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
            <button
              onClick={() => setShowLoginModal(false)}
              className={`${PRIMARY_BTN} mt-6`}
            >
              Login Sekarang
            </button>
            <button
              onClick={() => setShowLoginModal(false)}
              className={`${GHOST_BTN} mt-1`}
            >
              Nanti Saja
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          ACTIVE TRIP DETAIL
      ====================================================== */}

      {selectedRoute && currentSegment && (
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

            {/* TOTAL PAYMENT SUMMARY */}
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

            {/* CURRENT ANGKOT */}
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[15px] font-bold">Angkot yang Dinaiki</h3>
                {isCurrentLegPaid ? (
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
                <Badge code={currentSegment.angkotCode} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    Angkot {currentSegment.angkotCode}
                  </p>
                  <p className="text-[12px] text-slate-500">
                    {currentSegment.angkotName}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-[12px] text-slate-500">Tarif angkot ini</p>
                  <p className="mt-0.5 font-bold text-blue-700">
                    {formatRupiah(currentSegment.fare)}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="text-[12px] text-slate-500">
                    Estimasi perjalanan
                  </p>
                  <p className="mt-0.5 font-bold">
                    {currentSegment.duration} menit
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[14px] font-bold text-blue-700">
                  PS
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">Pak Slamet</p>
                  <p className="flex items-center gap-1 text-[12px] text-slate-500">
                    Driver AngkotGo •
                    <Star
                      size={11}
                      className="fill-yellow-400 text-yellow-400"
                    />
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
                <p className="text-[14px] font-semibold">
                  Suzuki Carry Biru Muda
                </p>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  Angkot 2 • Plat N 1234 AG • Trayek {currentSegment.angkotCode}
                </p>
              </div>
            </div>

            {/* CURRENT LEG ROUTE */}
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[15px] font-bold">Rute Perjalanan</h3>
                <span className="text-[12px] text-slate-400">
                  {activeLeg + 1} dari {segments.length} Leg
                </span>
              </div>

              {segments.length > 1 && (
                <div className="mb-4 flex items-center">
                  {segments.map((segment, i) => (
                    <div key={segment.id} className="flex items-center">
                      {i > 0 && <span className="mx-2 h-px w-6 bg-black/15" />}
                      <Badge
                        code={segment.angkotCode}
                        done={!!paidLegs[segment.id]}
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
                    <p className="font-semibold">{currentSegment.from}</p>
                    {currentSegment.boardingNote && (
                      <p className="mt-0.5 text-[12px] text-slate-500">
                        {currentSegment.boardingNote}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">TURUN DI</p>
                    <p className="font-semibold">{currentSegment.to}</p>
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
                    {currentSegment.transitNote ||
                      `Turun di ${currentSegment.to}, bayar angkot ${currentSegment.angkotCode}, kemudian lanjutkan dengan angkot ${nextSegment.angkotCode}.`}
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-green-50 p-3 text-[12px] text-green-700">
                  <p className="font-bold">Tujuan Akhir Perjalanan</p>
                  <p className="mt-0.5">
                    Setelah sampai di {currentSegment.to}, lakukan pembayaran
                    angkot terakhir.
                  </p>
                </div>
              )}
            </div>

            {/* PAYMENT HISTORY */}
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" />
                <h3 className="text-[15px] font-bold">
                  Rincian Pembayaran Per Angkot
                </h3>
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
          </div>

          {/* STICKY CTA */}
          <div className="shrink-0 border-t border-black/5 px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {isCurrentLegPaid ? (
              <button onClick={continueAfterPayment} className={PRIMARY_BTN}>
                {isLastLeg
                  ? "Berikan Feedback"
                  : `Lanjut ke Angkot ${nextSegment?.angkotCode}`}
              </button>
            ) : (
              <button
                onClick={handleNearDestination}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 text-[16px] font-semibold text-white transition active:scale-[0.98] active:bg-orange-600"
              >
                <MapPin size={18} />
                Simulasikan Dekat Tujuan
              </button>
            )}
          </div>
        </Sheet>
      )}

      {/* =====================================================
          MODALS
      ====================================================== */}

      {/* Dekat titik turun */}
      {activeModal === "near-destination" && currentSegment && (
        <Modal onClose={() => setActiveModal(null)}>
          <div className="text-center">
            <IconCircle tone="orange">
              <MapPin size={30} />
            </IconCircle>
            <h2 className="text-[22px] font-bold tracking-tight">
              Sudah Dekat Titik Turun!
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
              Anda akan segera turun dari angkot{" "}
              <b>{currentSegment.angkotCode}</b>. Silakan bersiap dan bayar
              kepada sopir.
            </p>

            <div className="my-5 rounded-2xl bg-blue-50 p-4 text-left">
              <p className="text-[12px] text-blue-600">
                Angkot yang harus dibayar
              </p>
              <p className="mt-0.5 text-[17px] font-bold text-blue-800">
                Angkot {currentSegment.angkotCode}
              </p>
              <p className="text-[12px] text-slate-500">
                {currentSegment.angkotName}
              </p>
              <div className="mt-3 border-t border-blue-100 pt-3">
                <p className="text-[12px] text-blue-600">Bayar kepada sopir</p>
                <p className="mt-0.5 text-[28px] font-bold leading-tight text-blue-800">
                  {formatRupiah(currentSegment.fare)}
                </p>
              </div>
            </div>

            <div className="mb-5 rounded-xl bg-slate-50 p-3 text-left">
              <p className="text-[12px] text-slate-500">Titik turun</p>
              <p className="font-bold">{currentSegment.to}</p>
            </div>

            <button
              onClick={() => setActiveModal("payment")}
              className={PRIMARY_BTN}
            >
              Lanjutkan Pembayaran
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className={`${GHOST_BTN} mt-1`}
            >
              Nanti
            </button>
          </div>
        </Modal>
      )}

      {/* Pilih metode */}
      {activeModal === "payment" && currentSegment && (
        <Modal onClose={() => setActiveModal(null)}>
          <div className="mb-5 text-center">
            <IconCircle>
              <Wallet size={30} />
            </IconCircle>
            <h2 className="text-[22px] font-bold tracking-tight">
              Bayar Angkot {currentSegment.angkotCode}
            </h2>
            <p className="mt-1 text-[14px] text-slate-500">
              Pembayaran dilakukan kepada sopir angkot yang sedang Anda naiki.
            </p>
          </div>

          <div className="mb-4 rounded-2xl bg-blue-50 p-4">
            <p className="text-[12px] text-blue-600">
              Tarif angkot {currentSegment.angkotCode}
            </p>
            <p className="mt-0.5 text-[26px] font-bold text-blue-800">
              {formatRupiah(currentSegment.fare)}
            </p>
            <p className="mt-1 text-[12px] text-blue-600">
              Leg {activeLeg + 1} dari {segments.length}
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => confirmLegPayment("cash")}
              className="flex w-full items-center gap-4 rounded-2xl bg-slate-100 p-4 text-left transition active:scale-[0.98]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Banknote size={22} />
              </span>
              <span className="flex-1">
                <span className="block text-[16px] font-semibold">
                  Uang Tunai
                </span>
                <span className="block text-[12px] text-slate-500">
                  Bayar langsung kepada sopir.
                </span>
              </span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>

            <button
              onClick={() => setActiveModal("qris")}
              className="flex w-full items-center gap-4 rounded-2xl bg-slate-100 p-4 text-left transition active:scale-[0.98]"
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
            onClick={() => setActiveModal("near-destination")}
            className={`${GHOST_BTN} mt-2`}
          >
            Kembali
          </button>
        </Modal>
      )}

      {/* QRIS */}
      {activeModal === "qris" && currentSegment && (
        <Modal onClose={() => setActiveModal(null)}>
          <div className="text-center">
            <h2 className="text-[22px] font-bold tracking-tight">
              Pembayaran QRIS
            </h2>
            <p className="mt-1 text-[14px] text-slate-500">
              Scan kode QR untuk membayar angkot {currentSegment.angkotCode}.
            </p>

            <div className="mx-auto my-5 flex h-52 w-52 flex-col items-center justify-center rounded-3xl bg-slate-100">
              <QrCode size={110} className="text-slate-800" />
              <span className="mt-2 text-[10px] font-bold tracking-widest text-slate-500">
                DUMMY QRIS
              </span>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-[12px] text-blue-600">
                Pembayaran angkot {currentSegment.angkotCode}
              </p>
              <p className="mt-0.5 text-[26px] font-bold text-blue-800">
                {formatRupiah(currentSegment.fare)}
              </p>
            </div>

            <button
              onClick={() => confirmLegPayment("qris")}
              className="mt-5 flex h-[52px] w-full items-center justify-center rounded-2xl bg-green-600 text-[16px] font-semibold text-white transition active:scale-[0.98]"
            >
              Simulasikan Pembayaran Berhasil
            </button>
            <button
              onClick={() => setActiveModal("payment")}
              className={`${GHOST_BTN} mt-1`}
            >
              Ganti Metode Pembayaran
            </button>
          </div>
        </Modal>
      )}

      {/* Pembayaran berhasil / instruksi transit */}
      {activeModal === "leg-paid" && currentSegment && (
        <Modal>
          <div className="mb-4 text-center">
            <IconCircle tone="green">
              <CheckCircle2 size={34} />
            </IconCircle>
            <h2 className="text-[22px] font-bold tracking-tight">
              Pembayaran Berhasil!
            </h2>
            <p className="mt-1 text-[14px] text-slate-500">
              Pembayaran angkot {currentSegment.angkotCode} telah dikonfirmasi.
            </p>
          </div>

          <div className="mb-3 rounded-2xl bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-green-700">
                Angkot {currentSegment.angkotCode}
              </span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                LUNAS
              </span>
            </div>
            <p className="mt-1 text-[24px] font-bold text-green-800">
              {formatRupiah(currentSegment.fare)}
            </p>
            <p className="text-[12px] text-green-700">
              Metode:{" "}
              {paidLegs[currentSegment.id] === "cash" ? "Uang Tunai" : "QRIS"}
            </p>
          </div>

          <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div>
              <p className="text-[12px] text-slate-500">
                Total yang sudah dibayar
              </p>
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
              <button onClick={continueAfterPayment} className={PRIMARY_BTN}>
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
                    <p className="font-bold">{currentSegment.to}</p>

                    <div className="my-2.5 border-t border-dashed border-slate-200" />

                    <p className="text-[11px] text-slate-500">
                      ANGKOT SELANJUTNYA
                    </p>
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
                    Silakan turun, lalu naik angkot berikutnya. Pembayaran
                    dilakukan terpisah.
                  </p>
                </div>

                <button onClick={continueAfterPayment} className={PRIMARY_BTN}>
                  Lanjut ke Angkot Berikutnya
                  <ArrowRight size={16} />
                </button>
              </>
            )
          )}
        </Modal>
      )}

      {/* Feedback */}
      {activeModal === "feedback" && (
        <Modal onClose={() => setActiveModal(null)}>
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

          <div className="mb-5 rounded-xl bg-green-50 p-3">
            <div className="space-y-1.5">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className="flex justify-between text-[13px]"
                >
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

          <div className="mb-5 text-center">
            <p className="mb-2 text-[14px] font-semibold text-slate-700">
              Berikan rating perjalanan
            </p>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
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
                    onClick={() => toggleFeedbackTag(tag)}
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
            onClick={submitFeedback}
            disabled={rating === 0 || paidCount !== segments.length}
            className={PRIMARY_BTN}
          >
            Kirim Feedback dan Akhiri Perjalanan
          </button>
        </Modal>
      )}

      {/* Selesai */}
      {activeModal === "completed" && (
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
                <span className="text-[14px] text-slate-500">
                  Total perjalanan
                </span>
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

            <button onClick={finishTrip} className={PRIMARY_BTN}>
              Selesai
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
