"use client";

import { useEffect, useRef, useState } from "react";

import mapboxgl from "mapbox-gl";
import { useQueryClient } from "@tanstack/react-query";
import { FiArrowLeft, FiMapPin, FiNavigation } from "react-icons/fi";

import "mapbox-gl/dist/mapbox-gl.css";
import { DirectionType } from "@/types/vehicles/vehicle.type";

// Hooks
import {
  useRouteSearch,
  useUpcomingVehicles,
} from "@/hooks/routes/useRouteSearch";
import { routePathKeys, useRoutePaths } from "@/hooks/routes/useRoutePath";
import { useMapbox } from "@/hooks/useMapbox";

// Services
import { getUpcomingVehicles } from "@/services/routes/route-route.service";

// Components
import Button from "@/components/ui/Button";

import GpsPermissionModal from "@/components/search-routev2/skenario1/GpsPermissionModal";
import QuickDestination from "@/components/search-routev2/skenario1/QuickDestination";
import LocationInput from "@/components/search-routev2/skenario1/LocationInput";
import LocationConnector from "@/components/search-routev2/skenario1/LocationConnector";

import UpcomingVehicleList from "@/components/search-routev2/skenario2/UpcomingVehicleList";
import VehicleMarkers from "@/components/search-routev2/skenario2/VehicleMarkers";
import RoutePathLine from "@/components/search-routev2/skenario2/RoutePathLine";

// Data
import { quickDestinations } from "@/components/search-routev2/skenario1/data";
import { dummyUpcomingVehicles } from "./data";

// Utils
import { getCurrentLocation } from "@/components/search-routev2/skenario1/geolocation";
import { validateRouteSearch } from "@/components/search-routev2/skenario1/outeValidation";

// Types
import {
  Coordinates,
  MapboxSearchLoadingState,
  MapboxSuggestion,
  PointType,
} from "@/types/mapbox.type";
import { UpcomingVehiclesResponse } from "@/types/route-search.type";
import { routePathService } from "@/services/routes/route-path.service";
import LocationSummary from "@/components/search-routev2/skenario2/LocationSummary";

type ActiveInputState = PointType | null;
type SheetSnap = "peek" | "full";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN || "";

const SHEET_TOP_PEEK = 68; // posisi "mengecil" -> sheet cuma nongol sedikit dari bawah
const SHEET_TOP_FULL = 10; // posisi "penuh" -> sheet naik hampir ke atas, nutup form
const SHEET_OVERDRAG_LIMIT = SHEET_TOP_PEEK + 12; // batas elastis kalau ditarik turun berlebihan

export default function CariRuteAngkot() {
  const [scenario, setScenario] = useState<1 | 2>(1);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originCoords, setOriginCoords] = useState<Coordinates | null>(null);
  const queryClient = useQueryClient();
  const [destinationCoords, setDestinationCoords] =
    useState<Coordinates | null>(null);

  const [originSuggestions, setOriginSuggestions] = useState<
    MapboxSuggestion[]
  >([]);

  const [destinationSuggestions, setDestinationSuggestions] = useState<
    MapboxSuggestion[]
  >([]);

  const [selectedRoute, setSelectedRoute] = useState<{
    routeId: number;
    direction: DirectionType;
  } | null>(null);

  const [activeInput, setActiveInput] = useState<ActiveInputState>(null);
  const [showGpsModal, setShowGpsModal] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [searchLoading, setSearchLoading] =
    useState<MapboxSearchLoadingState>(null);
  const [pickingMode, setPickingMode] = useState<PointType>("origin");

  // ==== Bottom sheet state ====
  const [sheetTop, setSheetTop] = useState(SHEET_TOP_PEEK);
  const [sheetSnapped, setSheetSnapped] = useState<SheetSnap>("peek");
  const [isSheetTransitioning, setIsSheetTransitioning] = useState(true);
  const isDraggingSheetRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartTopRef = useRef(SHEET_TOP_PEEK);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const suggestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

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

  const upcomingVehiclesParams =
    selectedRoute && originCoords
      ? {
          routeId: selectedRoute.routeId,
          direction: selectedRoute.direction,
          latitude: originCoords.lat,
          longitude: originCoords.lng,
        }
      : null;

  const {
    data: upcomingVehicles,
    isFetching: isLoadingUpcomingVehicles,
    isError: isUpcomingVehiclesError,
    error: upcomingVehiclesError,
  } = useUpcomingVehicles(upcomingVehiclesParams);

  const {
    data: routePaths,
    isFetching: isLoadingRoutePath,
    isError: isRoutePathError,
  } = useRoutePaths(
    selectedRoute?.routeId ?? 0,
    selectedRoute?.direction ?? DirectionType.FORWARD,
  );

  const upcomingVehiclesResult =
    dummyUpcomingVehicles as UpcomingVehiclesResponse;

  const vehicles = upcomingVehiclesResult.vehicles;

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
      center: [112.6214, -7.9839],
      zoom: 14,
      attributionControl: true,
    });

    mapRef.current = map;
    setMapInstance(map);

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

    const handleMapLoad = () => {
      map.resize();
    };

    map.on("load", handleMapLoad);

    return () => {
      map.off("move", handleMapMove);
      map.off("load", handleMapLoad);

      marker.remove();
      map.remove();

      mapRef.current = null;
      markerRef.current = null;

      setMapInstance(null);
    };
  }, []);

  // Reset posisi sheet tiap kali masuk scenario 2 (habis klik "Cari Angkot")
  useEffect(() => {
    if (scenario === 2) {
      setIsSheetTransitioning(true);
      setSheetTop(SHEET_TOP_PEEK);
      setSheetSnapped("peek");
    }
  }, [scenario]);

  /* =======================================================
   * BOTTOM SHEET DRAG HANDLERS
   * ===================================================== */

  const handleSheetPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingSheetRef.current = true;
    dragStartYRef.current = e.clientY;
    dragStartTopRef.current = sheetTop;
    setIsSheetTransitioning(false);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleSheetPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSheetRef.current) return;

    const deltaYPx = e.clientY - dragStartYRef.current;
    const deltaVh = (deltaYPx / window.innerHeight) * 100;

    let newTop = dragStartTopRef.current + deltaVh;
    newTop = Math.min(Math.max(newTop, SHEET_TOP_FULL), SHEET_OVERDRAG_LIMIT);

    setSheetTop(newTop);
  };

  const handleSheetPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSheetRef.current) return;
    isDraggingSheetRef.current = false;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore kalau capture sudah lepas duluan
    }

    setIsSheetTransitioning(true);

    const midpoint = (SHEET_TOP_PEEK + SHEET_TOP_FULL) / 2;

    if (sheetTop < midpoint) {
      setSheetTop(SHEET_TOP_FULL);
      setSheetSnapped("full");
    } else {
      setSheetTop(SHEET_TOP_PEEK);
      setSheetSnapped("peek");
    }
  };

  // 1 = form sepenuhnya kelihatan (sheet posisi peek), 0 = form ke-hide penuh (sheet posisi full)
  const topSectionProgress =
    scenario === 2
      ? Math.min(
          Math.max(
            (sheetTop - SHEET_TOP_FULL) / (SHEET_TOP_PEEK - SHEET_TOP_FULL),
            0,
          ),
          1,
        )
      : 1;

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
      const firstRoute = result.data?.[0];
      if (!firstRoute) {
        alert("Rute tidak ditemukan.");
        return;
      }

      const routeId = firstRoute.routeId;
      const direction = firstRoute.direction as DirectionType;

      // 2. Upcoming vehicles
      const vehicleParams = {
        routeId,
        direction,
        latitude: originCoords!.lat,
        longitude: originCoords!.lng,
      };

      const upcomingVehicles = await queryClient.fetchQuery({
        queryKey: ["upcoming-vehicles", vehicleParams],
        queryFn: () => getUpcomingVehicles(vehicleParams),
      });

      // 3. Route path - TERAKHIR
      const routePaths = await queryClient.fetchQuery({
        queryKey: routePathKeys.byRouteAndDirection(routeId, direction),
        queryFn: () =>
          routePathService.getRoutePathByRouteIdandDirection(
            routeId,
            direction,
          ),
      });

      setSelectedRoute({
        routeId,
        direction,
      });

      setScenario(2);
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

      {/* BACKGROUND: peta selalu paling belakang */}
      <div className="absolute inset-0 z-0">
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
        <RoutePathLine map={mapInstance} routePaths={routePaths ?? []} />
        <VehicleMarkers map={mapInstance} vehicles={vehicles} />
      </div>

      {/* CENTER PIN - hanya relevan saat scenario 1 (memilih titik di map) */}
      {scenario === 1 && (
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
      )}

      {/* TOP SECTION: header + search card. Fade/hide mengikuti posisi bottom sheet */}
      <div
        className="pointer-events-auto absolute inset-x-0 top-0 z-20 mx-auto flex w-full max-w-md flex-col gap-3 px-4 pt-4 sm:px-5 sm:pt-6"
        style={{
          opacity: topSectionProgress,
          transform: `translateY(${(1 - topSectionProgress) * -16}px)`,
          pointerEvents: topSectionProgress < 0.4 ? "none" : "auto",
          transition: isSheetTransitioning
            ? "opacity 300ms ease-out, transform 300ms ease-out"
            : "none",
        }}
      >
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
          {scenario === 1 ? (
            <>
              <LocationInput
                type="origin"
                value={origin}
                suggestions={originSuggestions}
                isActive={activeInput === "origin"}
                isLoading={
                  searchLoading === "origin" ||
                  searchLoading === "retrieve-origin"
                }
                onChange={handleOriginChange}
                onFocus={() => setActiveInput("origin")}
                onClear={handleClearOrigin}
                onSelectSuggestion={(item) =>
                  handleSelectSuggestion(item, "origin")
                }
              />

              <LocationConnector />

              <LocationInput
                type="destination"
                value={destination}
                suggestions={destinationSuggestions}
                isActive={activeInput === "destination"}
                isLoading={
                  searchLoading === "destination" ||
                  searchLoading === "retrieve-destination"
                }
                onChange={handleDestinationChange}
                onFocus={() => setActiveInput("destination")}
                onClear={handleClearDestination}
                onSelectSuggestion={(item) =>
                  handleSelectSuggestion(item, "destination")
                }
              />

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
            </>
          ) : (
            <LocationSummary
              origin={origin}
              destination={destination}
              onEdit={() => {
                // balik ke scenario 1 buat edit ulang origin/destination
                setScenario(1);
                setSelectedRoute(null);
              }}
            />
          )}
        </div>
      </div>

      {/* BOTTOM AREA */}
      {scenario === 1 ? (
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md space-y-2 px-4 pb-4 sm:px-5">
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

          {originCoords && destinationCoords && (
            <Button
              variant="primary"
              size="lg"
              icon={<FiNavigation className="rotate-90" />}
              className="w-full"
              onClick={handleSearch}
              disabled={isSearchingRoute}
            >
              {isSearchingRoute ? "Mencari rute..." : "Cari Angkot"}
            </Button>
          )}
        </div>
      ) : (
        /* ===== DRAGGABLE BOTTOM SHEET: daftar kendaraan ===== */
        <div
          className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-[#faf8ff]/95 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] backdrop-blur-md"
          style={{
            top: `${sheetTop}vh`,
            transition: isSheetTransitioning ? "top 300ms ease-out" : "none",
          }}
        >
          {/* Handle drag */}
          <div
            className="flex shrink-0 cursor-grab touch-none items-center justify-center py-2.5 active:cursor-grabbing"
            onPointerDown={handleSheetPointerDown}
            onPointerMove={handleSheetPointerMove}
            onPointerUp={handleSheetPointerUp}
            onPointerCancel={handleSheetPointerUp}
          >
            <div className="h-1.5 w-10 rounded-full bg-[#c3c6d6]" />
          </div>

          {/* Konten scrollable */}
          <div className="min-h-0 flex-1">
            <UpcomingVehicleList
              upcomingVehicles={dummyUpcomingVehicles.vehicles}
            />
          </div>
        </div>
      )}
    </div>
  );
}
