import { useRef, useState } from "react";
import type { RefObject } from "react";
import mapboxgl from "mapbox-gl";
import { useMapbox } from "@/hooks/useMapbox";
import type {
  Coordinates,
  MapboxSearchLoadingState,
  MapboxSuggestion,
  PointType,
} from "@/types/mapbox.type";
import type { ActiveInputState } from "../types";

/**
 * Mengelola semua logic pencarian lokasi Skenario 1:
 * - Input teks origin & destination
 * - Suggestions Mapbox
 * - Retrieve detail lokasi
 * - Picking mode (origin / destination)
 */
export function useLocationSearch(mapRef: RefObject<mapboxgl.Map | null>) {
  const { suggest, retrieve, reverse, resetSession } = useMapbox();

  // ─── Nama lokasi yang ditampilkan ke user ───
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  // ─── Koordinat yang sesungguhnya ───
  const [originCoords, setOriginCoords] = useState<Coordinates | null>(null);
  const [destinationCoords, setDestinationCoords] =
    useState<Coordinates | null>(null);

  // ─── Suggestions ───
  const [originSuggestions, setOriginSuggestions] = useState<
    MapboxSuggestion[]
  >([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    MapboxSuggestion[]
  >([]);

  // ─── UI State ───
  const [activeInput, setActiveInput] = useState<ActiveInputState>(null);
  const [searchLoading, setSearchLoading] =
    useState<MapboxSearchLoadingState>(null);
  const [pickingMode, setPickingMode] = useState<PointType>("origin");

  // ─── Refs ───
  const suggestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const selectingOrigin = useRef(false);
  const selectingDestination = useRef(false);

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  const getPlaceName = async (lat: number, lng: number): Promise<string> => {
    try {
      return await reverse.mutateAsync({ lat, lng });
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

  // ─────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────

  const searchPlaces = (query: string, type: PointType) => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    if (!query.trim() || query.trim().length < 2) {
      if (type === "origin") setOriginSuggestions([]);
      else setDestinationSuggestions([]);
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
        if (type === "origin") setOriginSuggestions(suggestions);
        else setDestinationSuggestions(suggestions);
      } catch (error) {
        console.error("Gagal mencari lokasi:", error);
        if (type === "origin") setOriginSuggestions([]);
        else setDestinationSuggestions([]);
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

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────

  const handleOriginChange = (value: string) => {
    if (selectingOrigin.current) return;
    setOrigin(value);
    // Koordinat lama tidak valid lagi saat user mengetik ulang
    setOriginCoords(null);
    setActiveInput("origin");
    setPickingMode("origin");
    searchPlaces(value, "origin");
  };

  const handleDestinationChange = (value: string) => {
    if (selectingDestination.current) return;
    setDestination(value);
    setDestinationCoords(null);
    setActiveInput("destination");
    setPickingMode("destination");
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

  const handleConfirmMapLocation = async (currentPickingMode: PointType, currentMapRef: RefObject<mapboxgl.Map | null>) => {
    if (!currentMapRef.current) {
      alert("Peta belum siap.");
      return;
    }

    const center = currentMapRef.current.getCenter();
    const lat = center.lat;
    const lng = center.lng;

    try {
      setSearchLoading(
        currentPickingMode === "origin" ? "retrieve-origin" : "retrieve-destination",
      );

      const placeName = await getPlaceName(lat, lng);
      const coords: Coordinates = { lat, lng };

      if (currentPickingMode === "origin") {
        setOrigin(placeName);
        setOriginCoords(coords);
        setPickingMode("destination");
        setActiveInput(null);
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

  return {
    // State
    origin,
    destination,
    originCoords,
    destinationCoords,
    originSuggestions,
    destinationSuggestions,
    activeInput,
    searchLoading,
    pickingMode,

    // Setters (dibutuhkan oleh useGps & useJourneyPersistence)
    setOrigin,
    setDestination,
    setOriginCoords,
    setDestinationCoords,
    setPickingMode,
    setActiveInput,

    // Helpers
    getPlaceName,
    moveMapToLocation,

    // Handlers
    handleOriginChange,
    handleDestinationChange,
    handleSelectSuggestion,
    handleClearOrigin,
    handleClearDestination,
    handleQuickDestination,
    handleConfirmMapLocation,
  };
}
