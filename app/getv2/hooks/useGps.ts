import { useState } from "react";
import type { Coordinates } from "@/types/mapbox.type";
import type { PointType } from "@/types/mapbox.type";
import { getCurrentLocation } from "@/components/search-routev2/skenario1/geolocation";

type GpsDeps = {
  setOrigin: (value: string) => void;
  setOriginCoords: (coords: Coordinates | null) => void;
  setPickingMode: (mode: PointType) => void;
  moveMapToLocation: (lat: number, lng: number) => void;
  getPlaceName: (lat: number, lng: number) => Promise<string>;
};

/**
 * Mengelola GPS permission modal dan deteksi lokasi pengguna untuk Skenario 1.
 */
export function useGps({
  setOrigin,
  setOriginCoords,
  setPickingMode,
  moveMapToLocation,
  getPlaceName,
}: GpsDeps) {
  const [showGpsModal, setShowGpsModal] = useState(true);
  const [isLocating, setIsLocating] = useState(false);

  const locateUser = async (): Promise<boolean> => {
    setIsLocating(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      const coords: Coordinates = { lat: latitude, lng: longitude };
      const placeName = await getPlaceName(latitude, longitude);

      setOriginCoords(coords);
      setOrigin(placeName);
      setPickingMode("destination");
      moveMapToLocation(latitude, longitude);
      return true;
    } catch (error) {
      console.error("Gagal mendapatkan lokasi:", error);
      return false;
    } finally {
      setIsLocating(false);
    }
  };

  const handleEnableGps = async () => {
    const success = await locateUser();
    if (!success) {
      // Fallback: reset origin, tutup modal
      setOrigin("Stasiun Malang Kota Baru");
      setOriginCoords(null);
    }
    setShowGpsModal(false);
  };

  const handleSkipGps = () => {
    setShowGpsModal(false);
    setOrigin("");
    setOriginCoords(null);
    setPickingMode("origin");
  };

  const handleResetToGPS = async () => {
    await locateUser();
  };

  return {
    showGpsModal,
    setShowGpsModal,
    isLocating,
    handleEnableGps,
    handleSkipGps,
    handleResetToGPS,
  };
}
