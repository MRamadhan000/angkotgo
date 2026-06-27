"use client";

import { useState } from "react";
import { Location } from "./types";

interface UseGPSOptions {
  onSuccess: (location: Location) => void;
  onPermissionDenied: () => void;
  onError: (msg: string) => void;
}

export function useGPS({ onSuccess, onPermissionDenied, onError }: UseGPSOptions) {
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      onError("Browser kamu tidak mendukung GPS.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        onSuccess({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        setLoading(false);
        if (error.code === 1) {
          onPermissionDenied();
        } else {
          onError("Gagal mendeteksi lokasi. Coba masukkan manual.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return { getLocation, loadingGPS: loading };
}
