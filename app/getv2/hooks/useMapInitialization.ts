import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import mapboxgl from "mapbox-gl";
import type { Coordinates } from "@/types/mapbox.type";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN || "";

/**
 * Mengelola inisialisasi Mapbox, cleanup, dan sinkronisasi
 * marker origin & destination ke koordinat yang dipilih user.
 *
 * @param originCoords - Koordinat titik asal untuk marker biru
 * @param destinationCoords - Koordinat titik tujuan untuk marker merah
 * @param mapRef - Ref eksternal yang akan diisi dengan instance Map.
 *                 Dibagi bersama useLocationSearch agar keduanya mengakses Map yang sama.
 */
export function useMapInitialization(
  originCoords: Coordinates | null,
  destinationCoords: Coordinates | null,
  mapRef: RefObject<mapboxgl.Map | null>,
) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // MAP INITIALIZATION
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!MAPBOX_TOKEN) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN belum dikonfigurasi.");
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

    // Isi shared ref
    (mapRef as React.MutableRefObject<mapboxgl.Map | null>).current = map;
    setMapInstance(map);

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    const handleMapLoad = () => {
      map.resize();
    };

    map.on("load", handleMapLoad);

    return () => {
      map.off("load", handleMapLoad);

      originMarkerRef.current?.remove();
      destinationMarkerRef.current?.remove();
      originMarkerRef.current = null;
      destinationMarkerRef.current = null;

      map.remove();
      (mapRef as React.MutableRefObject<mapboxgl.Map | null>).current = null;
      setMapInstance(null);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ORIGIN MARKER — mengikuti originCoords
  useEffect(() => {
    if (!mapInstance || !originCoords) {
      originMarkerRef.current?.remove();
      originMarkerRef.current = null;
      return;
    }

    if (!originMarkerRef.current) {
      originMarkerRef.current = new mapboxgl.Marker({ color: "#2563eb" })
        .setLngLat([originCoords.lng, originCoords.lat])
        .addTo(mapInstance);
    } else {
      originMarkerRef.current.setLngLat([originCoords.lng, originCoords.lat]);
    }
  }, [mapInstance, originCoords]);

  // DESTINATION MARKER — mengikuti destinationCoords
  useEffect(() => {
    if (!mapInstance || !destinationCoords) {
      destinationMarkerRef.current?.remove();
      destinationMarkerRef.current = null;
      return;
    }

    if (!destinationMarkerRef.current) {
      destinationMarkerRef.current = new mapboxgl.Marker({ color: "#e11d48" })
        .setLngLat([destinationCoords.lng, destinationCoords.lat])
        .addTo(mapInstance);
    } else {
      destinationMarkerRef.current.setLngLat([
        destinationCoords.lng,
        destinationCoords.lat,
      ]);
    }
  }, [mapInstance, destinationCoords]);

  return {
    mapContainerRef,
    mapInstance,
  };
}
