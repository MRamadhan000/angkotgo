"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiSearch,
  FiStar,
  FiX,
} from "react-icons/fi";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import Button from "@/components/ui/Button";
import GpsPermissionModal from "@/components/ui/GpsPermissionModal";
import { getCurrentLocation } from "@/components/ui/geolocation";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type Coordinates = {
  lat: number;
  lng: number;
};

interface Suggestion {
  mapbox_id: string;
  name: string;
  name_preferred?: string;
  place_formatted?: string;
  full_address?: string;
}

type PointType = "origin" | "destination";

type ActiveInputState = "origin" | "destination" | null;

type SearchLoadingState =
  | "origin"
  | "destination"
  | "retrieve-origin"
  | "retrieve-destination"
  | null;

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const SUGGEST = "https://api.mapbox.com/search/searchbox/v1/suggest";
const RETRIEVE = "https://api.mapbox.com/search/searchbox/v1/retrieve";

// Reverse geocode standar (dipakai untuk konfirmasi pin di tengah peta / GPS)
const REVERSE_GEOCODE = "https://api.mapbox.com/geocoding/v5/mapbox.places";

// Area Malang Raya
const BBOX = "112.45,-8.35,112.85,-7.75";
const PROXIMITY = "112.6214,-7.9839";

export default function CariRuteAngkot() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const [originCoords, setOriginCoords] = useState<Coordinates | null>(null);
  const [destinationCoords, setDestinationCoords] =
    useState<Coordinates | null>(null);

  const [originSuggestions, setOriginSuggestions] = useState<Suggestion[]>([]);

  const [destinationSuggestions, setDestinationSuggestions] = useState<
    Suggestion[]
  >([]);

  const [activeInput, setActiveInput] = useState<ActiveInputState>(null);

  const [showGpsModal, setShowGpsModal] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingRoute, setIsSearchingRoute] = useState(false);

  // Loading khusus proses suggest/retrieve Search Box API
  const [searchLoading, setSearchLoading] = useState<SearchLoadingState>(null);

  const [pickingMode, setPickingMode] = useState<"origin" | "destination">(
    "origin",
  );

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const suggestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Session token per titik (wajib untuk Search Box API: suggest & retrieve
  // dalam satu sesi pencarian harus pakai token yang sama)
  const originSession = useRef(crypto.randomUUID());
  const destinationSession = useRef(crypto.randomUUID());

  // Flag untuk mencegah suggestion muncul lagi tepat setelah user memilih
  // sebuah hasil (karena setOrigin/setDestination akan memicu onChange lagi)
  const selectingOrigin = useRef(false);
  const selectingDestination = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current || !mapboxgl.accessToken) {
      console.error("Mapbox container atau token tidak tersedia.");
      return;
    }

    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [112.6214, -7.9839],
      zoom: 14,
      attributionControl: true,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    const marker = new mapboxgl.Marker({
      color: "#2563eb",
    })
      .setLngLat([112.6214, -7.9839])
      .addTo(map);

    markerRef.current = marker;

    map.on("move", () => {
      const center = map.getCenter();
      marker.setLngLat([center.lng, center.lat]);
    });

    map.on("load", () => {
      map.resize();
    });

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // ===================================================
  // REVERSE GEOCODE (untuk pin di tengah peta / GPS)
  // Ini TIDAK diganti, tetap pakai Geocoding API standar
  // karena tujuannya beda: koordinat -> nama, bukan nama -> koordinat.
  // ===================================================

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `${REVERSE_GEOCODE}/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&country=id&language=id&limit=1`,
      );

      if (!response.ok) {
        throw new Error(`Geocoding error: ${response.status}`);
      }

      const data = await response.json();

      return (
        data.features?.[0]?.place_name ||
        `Lokasi (${lat.toFixed(5)}, ${lng.toFixed(5)})`
      );
    } catch (error) {
      console.error("Reverse geocoding gagal:", error);

      return `Lokasi (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    }
  };

  const moveMapToLocation = (lat: number, lng: number) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 15,
      essential: true,
    });
  };

  const handleEnableGps = async () => {
    setIsLocating(true);

    try {
      const { latitude, longitude } = await getCurrentLocation();

      const coords = {
        lat: latitude,
        lng: longitude,
      };

      setOriginCoords(coords);
      setOrigin(await reverseGeocode(latitude, longitude));
      setPickingMode("destination");
      moveMapToLocation(latitude, longitude);
      setShowGpsModal(false);
    } catch (error) {
      console.error("Gagal mendapatkan lokasi:", error);

      setOrigin("Stasiun Malang Kota Baru");
      setShowGpsModal(false);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSkipGps = () => {
    setShowGpsModal(false);
    setOrigin("");
    setOriginCoords(null);
    setPickingMode("origin");
  };

  const handleResetToGPS = async () => {
    setIsLocating(true);

    try {
      const { latitude, longitude } = await getCurrentLocation();

      setOriginCoords({
        lat: latitude,
        lng: longitude,
      });

      setOrigin(await reverseGeocode(latitude, longitude));
      setPickingMode("destination");
      moveMapToLocation(latitude, longitude);
    } catch (error) {
      console.error("Gagal mendapatkan GPS:", error);
    } finally {
      setIsLocating(false);
    }
  };

  const handleConfirmMapLocation = async () => {
    if (!mapRef.current) {
      alert("Peta belum siap.");
      return;
    }

    const center = mapRef.current.getCenter();
    const lat = center.lat;
    const lng = center.lng;
    const placeName = await reverseGeocode(lat, lng);

    if (pickingMode === "origin") {
      setOrigin(placeName);
      setOriginCoords({ lat, lng });
      setPickingMode("destination");

      markerRef.current
        ?.getElement()
        .style.setProperty("filter", "hue-rotate(120deg)");
    } else {
      setDestination(placeName);
      setDestinationCoords({ lat, lng });
    }
  };

  // ===================================================
  // SEARCH BOX: SUGGEST
  // Menggantikan pencarian lama (Geocoding forward search)
  // dengan Mapbox Search Box API /suggest — hasilnya BELUM
  // punya koordinat, harus di-retrieve dulu saat dipilih.
  // ===================================================

  const searchPlaces = (query: string, type: PointType) => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    if (!query.trim() || query.length < 2) {
      if (type === "origin") {
        setOriginSuggestions([]);
      } else {
        setDestinationSuggestions([]);
      }
      return;
    }

    if (!TOKEN) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN belum dikonfigurasi.");
      return;
    }

    suggestionTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchLoading(type);

        const session =
          type === "origin"
            ? originSession.current
            : destinationSession.current;

        const center = mapRef.current?.getCenter();
        const proximity = center ? `${center.lng},${center.lat}` : PROXIMITY;

        const params = new URLSearchParams({
          q: query,
          access_token: TOKEN,
          session_token: session,
          language: "id",
          country: "ID",
          limit: "8",
          proximity,
          bbox: BBOX,
          types: "poi,address,street,place",
        });

        const response = await fetch(`${SUGGEST}?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Suggest error: ${response.status}`);
        }

        const data = await response.json();
        const suggestions: Suggestion[] = data.suggestions ?? [];

        if (type === "origin") {
          setOriginSuggestions(suggestions);
        } else {
          setDestinationSuggestions(suggestions);
        }
      } catch (error) {
        console.error("Gagal mencari lokasi:", error);
      } finally {
        setSearchLoading(null);
      }
    }, 300);
  };

  // ===================================================
  // SEARCH BOX: RETRIEVE
  // Dipanggil saat user memilih salah satu suggestion.
  // Baru di sini koordinat asli didapat.
  // ===================================================

  const retrieveLocation = async (item: Suggestion, type: PointType) => {
    if (!TOKEN) return;

    const selecting =
      type === "origin" ? selectingOrigin : selectingDestination;

    try {
      selecting.current = true;
      setSearchLoading(
        type === "origin" ? "retrieve-origin" : "retrieve-destination",
      );

      const session =
        type === "origin" ? originSession.current : destinationSession.current;

      const params = new URLSearchParams({
        access_token: TOKEN,
        session_token: session,
        language: "id",
      });

      const response = await fetch(
        `${RETRIEVE}/${encodeURIComponent(item.mapbox_id)}?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Retrieve error: ${response.status}`);
      }

      const data = await response.json();
      const feature = data.features?.[0];

      if (!feature) {
        throw new Error("Lokasi tidak ditemukan.");
      }

      const coordinates = feature.geometry?.coordinates;

      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        throw new Error("Koordinat tidak ditemukan.");
      }

      // GeoJSON: [longitude, latitude]
      const [lng, lat] = coordinates;
      const properties = feature.properties ?? {};

      const placeName: string =
        properties.name_preferred ??
        properties.name ??
        item.name_preferred ??
        item.name;

      const address: string =
        properties.full_address ??
        item.full_address ??
        item.place_formatted ??
        "";

      const coords: Coordinates = { lat: Number(lat), lng: Number(lng) };
      const displayName = address ? `${placeName}, ${address}` : placeName;

      if (type === "origin") {
        setOrigin(placeName);
        setOriginCoords(coords);
        setOriginSuggestions([]);
        setPickingMode("destination");
      } else {
        setDestination(placeName);
        setDestinationCoords(coords);
        setDestinationSuggestions([]);
      }

      setActiveInput(null);
      moveMapToLocation(coords.lat, coords.lng);

      // pakai displayName kalau nanti mau ditampilkan full address di tempat lain
      void displayName;
    } catch (error) {
      console.error("Gagal mengambil detail lokasi:", error);
    } finally {
      setSearchLoading(null);

      setTimeout(() => {
        selecting.current = false;
      }, 100);
    }
  };

  // ===================================================
  // HANDLERS INPUT
  // ===================================================

  const handleOriginChange = (value: string) => {
    if (selectingOrigin.current) return;

    setOrigin(value);
    setOriginCoords(null);
    setActiveInput("origin");
    searchPlaces(value, "origin");
  };

  const handleDestinationChange = (value: string) => {
    if (selectingDestination.current) return;

    setDestination(value);
    setDestinationCoords(null);
    setActiveInput("destination");
    searchPlaces(value, "destination");
  };

  const handleSelectSuggestion = (item: Suggestion, type: PointType) => {
    retrieveLocation(item, type);
  };

  const handleClearOrigin = () => {
    selectingOrigin.current = false;

    setOrigin("");
    setOriginCoords(null);
    setOriginSuggestions([]);
    setPickingMode("origin");

    originSession.current = crypto.randomUUID();
  };

  const handleClearDestination = () => {
    selectingDestination.current = false;

    setDestination("");
    setDestinationCoords(null);
    setDestinationSuggestions([]);
    setPickingMode("destination");

    destinationSession.current = crypto.randomUUID();
  };

  // Chip cepat ("Alun-Alun", "Kampus UB", dll) sekarang cuma mengisi teks
  // tujuan + memicu suggest baru — user tetap harus pilih dari suggestion
  // supaya dapat koordinat lewat retrieve (konsisten dengan alur baru).
  const handleQuickDestination = (label: string) => {
    handleDestinationChange(label);
  };

  const handleSearch = async () => {
    if (!origin.trim()) {
      alert("Lokasi penjemputan belum diisi.");
      return;
    }

    if (!destination.trim()) {
      alert("Lokasi tujuan belum diisi.");
      return;
    }

    if (!originCoords) {
      alert("Pilih lokasi penjemputan dari suggestion atau peta.");
      return;
    }

    if (!destinationCoords) {
      alert("Pilih lokasi tujuan dari suggestion atau peta.");
      return;
    }

    setIsSearchingRoute(true);

    try {
      const params = new URLSearchParams({
        userLat: String(originCoords.lat),
        userLng: String(originCoords.lng),
        destLat: String(destinationCoords.lat),
        destLng: String(destinationCoords.lng),
      });

      const response = await fetch(
        `http://localhost:3001/routes/search?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log("Hasil pencarian rute:", data);
    } catch (error) {
      console.error("Gagal mencari rute:", error);
      alert("Gagal terhubung ke server.");
    } finally {
      setIsSearchingRoute(false);
    }
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#faf8ff] text-[#191b23]">
      <GpsPermissionModal
        open={showGpsModal}
        isLocating={isLocating}
        onEnable={handleEnableGps}
        onSkip={handleSkipGps}
      />

      <div className="absolute inset-0 z-0">
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-xl ${
            pickingMode === "origin" ? "bg-blue-600" : "bg-rose-600"
          }`}
        >
          <FiMapPin className="text-xl text-white" />
        </div>
        <div className="mx-auto mt-[-2px] h-2 w-2 rounded-full bg-black/30 blur-[2px]" />
      </div>

      <div className="pointer-events-none relative z-20 mx-auto flex h-full w-full max-w-md flex-col justify-between px-4 pb-4 pt-4 sm:px-5 sm:pt-6">
        <div className="pointer-events-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Button
              variant="icon"
              size="lg"
              icon={<FiArrowLeft />}
              onClick={() => window.history.back()}
              aria-label="Kembali"
            />

            <h1 className="text-base font-bold tracking-tight text-[#003d9b] sm:text-lg">
              Cari Rute Angkot
            </h1>

            <div className="w-9 sm:w-10" />
          </div>

          <div className="flex flex-col gap-2 rounded-[20px] border border-[#c3c6d6]/30 bg-[#faf8ff]/95 p-3.5 shadow-lg backdrop-blur-md sm:rounded-[24px] sm:p-4">
            <div className="relative">
              <div className="relative flex items-center">
                <div className="absolute left-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#0052cc]/10 text-[#003d9b] sm:h-8 sm:w-8">
                  <FiMapPin />
                </div>

                <input
                  className="h-11 w-full truncate rounded-xl border border-[#c3c6d6] bg-[#faf8ff] pl-11 pr-10 text-xs outline-none focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/20 sm:h-12 sm:pl-12 sm:text-sm"
                  placeholder="Lokasi Penjemputan"
                  value={origin}
                  onFocus={() => setActiveInput("origin")}
                  onChange={(e) => handleOriginChange(e.target.value)}
                />

                {(searchLoading === "origin" ||
                  searchLoading === "retrieve-origin") && (
                  <span className="absolute right-9 text-[10px] text-black/40">
                    ...
                  </span>
                )}

                {origin && (
                  <button
                    type="button"
                    onClick={handleClearOrigin}
                    className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              {activeInput === "origin" && originSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                  {originSuggestions.map((item) => (
                    <button
                      key={item.mapbox_id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectSuggestion(item, "origin");
                      }}
                      className="flex w-full items-start gap-3 border-b border-gray-100 px-3 py-3 text-left hover:bg-blue-50"
                    >
                      <FiMapPin className="mt-0.5 shrink-0 text-[#003d9b]" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-gray-800">
                          {item.name_preferred ?? item.name}
                        </p>
                        {item.place_formatted && (
                          <p className="truncate text-[11px] text-gray-500">
                            {item.place_formatted}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex h-1.5 w-full pl-[22px] sm:pl-[28px]">
              <div className="h-full w-[2px] border-l-2 border-dashed border-[#c3c6d6]" />
            </div>

            <div className="relative">
              <div className="relative flex items-center">
                <div className="absolute left-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#e7e7f2] text-[#434654] sm:h-8 sm:w-8">
                  <FiSearch />
                </div>

                <input
                  className="h-11 w-full truncate rounded-xl border border-[#c3c6d6] bg-[#faf8ff] pl-11 pr-10 text-xs outline-none focus:border-[#003d9b] focus:ring-2 focus:ring-[#003d9b]/20 sm:h-12 sm:pl-12 sm:text-sm"
                  placeholder="Lokasi Tujuan"
                  value={destination}
                  onFocus={() => setActiveInput("destination")}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                />

                {(searchLoading === "destination" ||
                  searchLoading === "retrieve-destination") && (
                  <span className="absolute right-9 text-[10px] text-black/40">
                    ...
                  </span>
                )}

                {destination && (
                  <button
                    type="button"
                    onClick={handleClearDestination}
                    className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              {activeInput === "destination" &&
                destinationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                    {destinationSuggestions.map((item) => (
                      <button
                        key={item.mapbox_id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSuggestion(item, "destination");
                        }}
                        className="flex w-full items-start gap-3 border-b border-gray-100 px-3 py-3 text-left hover:bg-blue-50"
                      >
                        <FiMapPin className="mt-0.5 shrink-0 text-[#003d9b]" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-gray-800">
                            {item.name_preferred ?? item.name}
                          </p>
                          {item.place_formatted && (
                            <p className="truncate text-[11px] text-gray-500">
                              {item.place_formatted}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pt-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => handleQuickDestination("Alun-Alun Malang")}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-[#ededf8] px-2.5 py-1 text-[11px] font-medium text-[#434654]"
              >
                <FiClock className="text-[#003d9b]" />
                Alun-Alun
              </button>

              <button
                type="button"
                onClick={() => handleQuickDestination("Universitas Brawijaya")}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-[#ededf8] px-2.5 py-1 text-[11px] font-medium text-[#434654]"
              >
                <FiStar className="text-amber-500" />
                Kampus UB
              </button>

              <button
                type="button"
                onClick={() => handleQuickDestination("Malang Town Square")}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-[#ededf8] px-2.5 py-1 text-[11px] font-medium text-[#434654]"
              >
                <FiStar className="text-amber-500" />
                Matos
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetToGPS}
              disabled={isLocating}
              className="mt-1 flex items-center justify-center gap-2 rounded-lg py-2 text-[11px] font-semibold text-[#003d9b] hover:bg-blue-50 disabled:opacity-50"
            >
              <FiNavigation className={isLocating ? "animate-pulse" : ""} />
              {isLocating
                ? "Mendeteksi lokasi..."
                : "Gunakan lokasi saya saat ini"}
            </button>
          </div>
        </div>

        <div className="pointer-events-auto space-y-2 pb-1">
          <button
            type="button"
            onClick={handleConfirmMapLocation}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/95 px-5 py-3 text-sm font-bold text-[#003d9b] shadow-xl backdrop-blur-md hover:bg-white active:scale-[0.98]"
          >
            <FiMapPin />
            {pickingMode === "origin"
              ? "Tetapkan Titik Penjemputan"
              : "Tetapkan Titik Tujuan"}
          </button>

          <Button
            variant="primary"
            size="lg"
            icon={<FiNavigation className="rotate-90" />}
            className="w-full"
            onClick={handleSearch}
            disabled={isSearchingRoute || !originCoords || !destinationCoords}
          >
            {isSearchingRoute ? "Mencari rute..." : "Cari Angkot"}
          </Button>
        </div>
      </div>
    </div>
  );
}
