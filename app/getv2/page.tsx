"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiMapPin,
  FiNavigation,
  FiSearch,
  FiX,
} from "react-icons/fi";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouteSearch } from "@/hooks/routes/useRouteSearch";
import Button from "@/components/ui/Button";
import GpsPermissionModal from "@/components/search-routev2/skenario1/GpsPermissionModal";
import { getCurrentLocation } from "@/components/search-routev2/skenario1/geolocation";
import { useMapbox } from "@/hooks/useMapbox";
import {
  Coordinates,
  MapboxSearchLoadingState,
  MapboxSuggestion,
  PointType,
} from "@/types/mapbox.type";
import QuickDestination from "@/components/search-routev2/skenario1/QuickDestination";
import MapboxSuggestions from "@/components/search-routev2/skenario1/MapboxSuggestions";
import { quickDestinations } from "@/components/search-routev2/skenario1/data";
import { validateRouteSearch } from "@/components/search-routev2/skenario1/outeValidation";
type ActiveInputState = PointType | null;

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN || "";

export default function CariRuteAngkot() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originCoords, setOriginCoords] = useState<Coordinates | null>(null);

  const [destinationCoords, setDestinationCoords] =
    useState<Coordinates | null>(null);

  const [originSuggestions, setOriginSuggestions] = useState<
    MapboxSuggestion[]
  >([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    MapboxSuggestion[]
  >([]);

  const [activeInput, setActiveInput] = useState<ActiveInputState>(null);
  const [showGpsModal, setShowGpsModal] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [searchLoading, setSearchLoading] =
    useState<MapboxSearchLoadingState>(null);
  const [pickingMode, setPickingMode] = useState<PointType>("origin");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const suggestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const selectingOrigin = useRef(false);
  const selectingDestination = useRef(false);

  const { suggest, retrieve, reverse, resetSession } = useMapbox();
  const routeSearchParams =
    originCoords && destinationCoords
      ? {
          userLat: originCoords.lat,
          userLng: originCoords.lng,
          destLat: destinationCoords.lat,
          destLng: destinationCoords.lng,
        }
      : null;

  const {
    data: routeResults,
    isFetching: isSearchingRoute,
    isError: isRouteSearchError,
    error: routeSearchError,
    refetch: searchRoute,
  } = useRouteSearch(routeSearchParams);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    if (!MAPBOX_TOKEN) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN belum dikonfigurasi.");
      return;
    }

    if (mapRef.current) {
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      // Center Malang
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

    const handleMapMove = () => {
      const center = map.getCenter();

      marker.setLngLat([center.lng, center.lat]);
    };

    map.on("move", handleMapMove);

    map.on("load", () => {
      map.resize();
    });

    return () => {
      map.off("move", handleMapMove);

      marker.remove();

      map.remove();

      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  /* =======================================================
   * GET PLACE NAME
   *
   * reverse:
   * koordinat -> nama lokasi
   * ===================================================== */

  const getPlaceName = async (lat: number, lng: number) => {
    try {
      const result = await reverse.mutateAsync({
        lat,
        lng,
      });

      return result;
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

  /* =======================================================
   * ENABLE GPS
   *
   * GPS -> koordinat
   * koordinat -> reverse geocode
   * hasil -> origin
   * ===================================================== */

  const handleEnableGps = async () => {
    setIsLocating(true);

    try {
      const { latitude, longitude } = await getCurrentLocation();

      const coords: Coordinates = {
        lat: latitude,
        lng: longitude,
      };

      const placeName = await getPlaceName(latitude, longitude);
      setOriginCoords(coords);
      setOrigin(placeName);
      setPickingMode("destination");
      moveMapToLocation(latitude, longitude);
      setShowGpsModal(false);
    } catch (error) {
      console.error("Gagal mendapatkan lokasi:", error);
      setOrigin("Stasiun Malang Kota Baru");
      setOriginCoords(null);
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
      const coords: Coordinates = {
        lat: latitude,
        lng: longitude,
      };
      const placeName = await getPlaceName(latitude, longitude);
      setOriginCoords(coords);
      setOrigin(placeName);
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

    try {
      setSearchLoading(
        pickingMode === "origin" ? "retrieve-origin" : "retrieve-destination",
      );

      const placeName = await getPlaceName(lat, lng);
      const coords: Coordinates = {
        lat,
        lng,
      };
      if (pickingMode === "origin") {
        setOrigin(placeName);
        setOriginCoords(coords);
        setPickingMode("destination");
        /*
         * Ubah warna marker.
         *
         * Karena marker center tetap satu,
         * warna hanya sebagai indikator visual.
         */

        markerRef.current
          ?.getElement()
          .style.setProperty("filter", "hue-rotate(120deg)");
      } else {
        setDestination(placeName);
        setDestinationCoords(coords);
        setActiveInput(null);
      }
    } catch (error) {
      console.error("Gagal menetapkan lokasi:", error);
    } finally {
      setSearchLoading(null);
    }
  };

  /* =======================================================
   * SEARCH PLACES
   *
   * Input text
   *     ↓
   * Search Box Suggest
   *     ↓
   * suggestion
   *
   * Belum mendapatkan koordinat.
   * ===================================================== */

  const searchPlaces = (query: string, type: PointType) => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    if (!query.trim() || query.trim().length < 2) {
      if (type === "origin") {
        setOriginSuggestions([]);
      } else {
        setDestinationSuggestions([]);
      }

      return;
    }

    suggestionTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchLoading(type);

        const center = mapRef.current?.getCenter();
        const proximity = center ? `${center.lng},${center.lat}` : undefined;
        const result = await suggest.mutateAsync({
          query: query.trim(),
          type,
          proximity,
        });

        const suggestions = result.suggestions ?? [];

        if (type === "origin") {
          setOriginSuggestions(suggestions);
        } else {
          setDestinationSuggestions(suggestions);
        }
      } catch (error) {
        console.error("Gagal mencari lokasi:", error);

        if (type === "origin") {
          setOriginSuggestions([]);
        } else {
          setDestinationSuggestions([]);
        }
      } finally {
        setSearchLoading(null);
      }
    }, 300);
  };

  const retrieveLocation = async (item: MapboxSuggestion, type: PointType) => {
    const selecting =
      type === "origin" ? selectingOrigin : selectingDestination;

    try {
      selecting.current = true;

      setSearchLoading(
        type === "origin" ? "retrieve-origin" : "retrieve-destination",
      );

      const result = await retrieve.mutateAsync({
        mapboxId: item.mapbox_id,
        type,
      });

      const { coords, placeName } = result;

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
    } catch (error) {
      console.error("Gagal mengambil detail lokasi:", error);
    } finally {
      setSearchLoading(null);

      setTimeout(() => {
        selecting.current = false;
      }, 100);
    }
  };

  const handleOriginChange = (value: string) => {
    if (selectingOrigin.current) {
      return;
    }
    setOrigin(value);
    setOriginCoords(null);
    setActiveInput("origin");
    searchPlaces(value, "origin");
  };

  const handleDestinationChange = (value: string) => {
    if (selectingDestination.current) {
      return;
    }
    setDestination(value);
    setDestinationCoords(null);
    setActiveInput("destination");
    searchPlaces(value, "destination");
  };

  const handleSelectSuggestion = (item: MapboxSuggestion, type: PointType) => {
    retrieveLocation(item, type);
  };

  const handleClearOrigin = () => {
    selectingOrigin.current = false;
    setOrigin("");
    setOriginCoords(null);
    setOriginSuggestions([]);
    setActiveInput(null);
    setPickingMode("origin");
    resetSession("origin");
  };

  const handleClearDestination = () => {
    selectingDestination.current = false;
    setDestination("");
    setDestinationCoords(null);
    setDestinationSuggestions([]);
    setActiveInput(null);
    setPickingMode("destination");
    resetSession("destination");
  };

  const handleQuickDestination = (label: string) => {
    handleDestinationChange(label);
    setActiveInput("destination");
  };

  const handleSearch = async () => {
    const validation = validateRouteSearch({
      origin,
      destination,
      originCoords,
      destinationCoords,
    });

    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    try {
      const result = await searchRoute();
      console.log("Hasil pencarian rute:", result.data);
    } catch (error) {
      console.error("Gagal mencari rute:", error);
      alert("Gagal terhubung ke server.");
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

      {/* CENTER PIN */}

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

      {/* MAIN CONTAINER */}
      <div className="pointer-events-none relative z-20 mx-auto flex h-full w-full max-w-md flex-col justify-between px-4 pb-4 pt-4 sm:px-5 sm:pt-6">
        {/* TOP SECTION */}

        <div className="pointer-events-auto flex flex-col gap-3">
          {/* HEADER */}
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

          {/* SEARCH CARD */}
          <div className="flex flex-col gap-2 rounded-[20px] border border-[#c3c6d6]/30 bg-[#faf8ff]/95 p-3.5 shadow-lg backdrop-blur-md sm:rounded-[24px] sm:p-4">
            {/* ORIGIN */}
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

                {/* Loading */}
                {(searchLoading === "origin" ||
                  searchLoading === "retrieve-origin") && (
                  <span className="absolute right-9 text-[10px] text-black/40">
                    ...
                  </span>
                )}

                {/* Clear */}
                {origin && (
                  <Button
                    variant="inputClear"
                    size="sm"
                    icon={<FiX />}
                    onClick={handleClearOrigin}
                    aria-label="Hapus lokasi penjemputan"
                  />
                )}
              </div>

              {/* ORIGIN SUGGESTIONS */}
              {activeInput === "origin" && (
                <MapboxSuggestions
                  suggestions={originSuggestions}
                  onSelect={(item) => handleSelectSuggestion(item, "origin")}
                />
              )}
            </div>

            {/* CONNECTOR */}
            <div className="flex h-1.5 w-full pl-[22px] sm:pl-[28px]">
              <div className="h-full w-[2px] border-l-2 border-dashed border-[#c3c6d6]" />
            </div>

            {/* DESTINATION */}
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

                {/* Loading */}
                {(searchLoading === "destination" ||
                  searchLoading === "retrieve-destination") && (
                  <span className="absolute right-9 text-[10px] text-black/40">
                    ...
                  </span>
                )}

                {/* Clear */}
                {destination && (
                  <Button
                    variant="inputClear"
                    size="sm"
                    icon={<FiX />}
                    onClick={handleClearDestination}
                    aria-label="Hapus lokasi tujuan"
                  />
                )}
              </div>

              {/* DESTINATION SUGGESTIONS */}
              {activeInput === "destination" && (
                <MapboxSuggestions
                  suggestions={destinationSuggestions}
                  onSelect={(item) =>
                    handleSelectSuggestion(item, "destination")
                  }
                />
              )}
            </div>

            {/* QUICK DESTINATION */}
            <QuickDestination
              items={quickDestinations}
              onSelect={handleQuickDestination}
            />

            {/* CURRENT LOCATION */}
            <Button
              variant="textAction"
              size="sm"
              onClick={handleResetToGPS}
              isLoading={isLocating}
              loadingText="Mendeteksi lokasi..."
              icon={
                <FiNavigation className={isLocating ? "animate-pulse" : ""} />
              }
            >
              Gunakan lokasi saya saat ini
            </Button>
          </div>
        </div>

        {/* BOTTOM ACTION */}
        <div className="pointer-events-auto space-y-2 pb-1">
          <Button
            variant="mapAction"
            size="md"
            icon={<FiMapPin />}
            onClick={handleConfirmMapLocation}
            disabled={
              searchLoading === "retrieve-origin" ||
              searchLoading === "retrieve-destination"
            }
            isLoading={
              searchLoading === "retrieve-origin" ||
              searchLoading === "retrieve-destination"
            }
            loadingText="Mengambil lokasi..."
          >
            {pickingMode === "origin"
              ? "Tetapkan Titik Penjemputan"
              : "Tetapkan Titik Tujuan"}
          </Button>

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
