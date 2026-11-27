
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { decode, encode } from "@googlemaps/polyline-codec";
import {
  Route,
  MapPin,
  Trash2,
  Copy,
  RefreshCw,
  Crosshair,
  MapPinned,
  Navigation,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Layers,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

type Halte = {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  isTransit: boolean;
  description?: string | null;
};

type RouteHalte = {
  id: number;
  routeId: number;
  halteId: number;
  polylineIndex: number;
  stopSequence: number;
  halte: Halte;
};

type AngkotRoute = {
  id: number;
  code: string;
  name: string;
  direction: string;
  color: string;
  encodedPolyline: string;
  totalDistanceMeters: number;
  isActive: boolean;
  routeHaltes: RouteHalte[];
};

type CustomPoint = {
  id: number;
  latitude: number;
  longitude: number;
  sequence: number;
  name: string;
};

type LatLng = {
  lat: number;
  lng: number;
};

// ============================================
// INITIAL DATA
// ============================================

const INITIAL_ROUTES: AngkotRoute[] = [
  {
    id: 9,
    code: "AG2",
    name: "Arjosari - Gadang New",
    direction: "FORWARD",
    color: "#1E88E5",
    encodedPolyline:
      "troo@ehjnT^Vb@Zd@\\RSp@w@p@w@p@w@h@q@j@q@h@q@",
    totalDistanceMeters: 323,
    isActive: true,
    routeHaltes: [],
  },
  {
    id: 7,
    code: "AG",
    name: "Arjosari - Gadang",
    direction: "FORWARD",
    color: "#1E88E5",
    encodedPolyline:
      "n`no@ygonT^iA`@iAaA_@aA]aA_@b@cAb@cAb@cA`@}@b@{@h@oAj@mAh@gAh@gAn@kA`@}@^_A`@}@Tg@\\_A^}@X_AaA]cA[aA]aA_@q@So@SeAYeAYq@QiAOgAOiAMgAOCBBCsAI",
    totalDistanceMeters: 1467,
    isActive: true,
    routeHaltes: [
      {
        id: 4,
        routeId: 7,
        halteId: 4,
        polylineIndex: 1,
        stopSequence: 1,
        halte: {
          id: 4,
          name: "Halte Masjid Sabilillah",
          latitude: "-7.94156769",
          longitude: "112.64190913",
          isTransit: true,
        },
      },
      {
        id: 6,
        routeId: 7,
        halteId: 5,
        polylineIndex: 19,
        stopSequence: 2,
        halte: {
          id: 5,
          name: "Halte Pertigaan Jl.Tenaga",
          latitude: "-7.94328413",
          longitude: "112.64727470",
          isTransit: true,
        },
      },
      {
        id: 9,
        routeId: 7,
        halteId: 7,
        polylineIndex: 36,
        stopSequence: 3,
        halte: {
          id: 7,
          name: "Halte Perempatan Jl.Plaosan",
          latitude: "-7.93942153",
          longitude: "112.64968471",
          isTransit: true,
        },
      },
    ],
  },
  {
    id: 6,
    code: "AL",
    name: "Arjosari - Landungsari",
    direction: "FORWARD",
    color: "#1E88E5",
    encodedPolyline:
      "`olo@gprnTmA?Aj@KvAMz@M|@a@lA_@jAa@lAa@lA_@jAa@lA]fA]fA]fAYv@Wt@Yv@[dA[bAYdA[dASl@Qn@bA^bA`@nA^nA^hAXjAXhANt@Dt@Dz@@R?z@A|@?nAAnA?nAAnA?pA@dAAdACfAAdAAdA?bA@dA?|@D~@FfANfALfANfANhAXhAXpA`@pAb@bA\\bA^r@Tt@V_@jA[v@[x@BBnAd@jAl@bAv@CFBGt@r@t@p@v@r@t@p@t@r@_@x@]z@_@x@[t@Yv@[t@",
    totalDistanceMeters: 3155,
    isActive: true,
    routeHaltes: [
      {
        id: 7,
        routeId: 6,
        halteId: 6,
        polylineIndex: 1,
        stopSequence: 1,
        halte: {
          id: 6,
          name: "Halte Terminal Arjosari",
          latitude: "-7.93322961",
          longitude: "112.65810098",
          isTransit: true,
        },
      },
      {
        id: 8,
        routeId: 6,
        halteId: 7,
        polylineIndex: 50,
        stopSequence: 2,
        halte: {
          id: 7,
          name: "Halte Perempatan Jl.Plaosan",
          latitude: "-7.93942153",
          longitude: "112.64968471",
          isTransit: true,
        },
      },
      {
        id: 5,
        routeId: 6,
        halteId: 5,
        polylineIndex: 65,
        stopSequence: 3,
        halte: {
          id: 5,
          name: "Halte Pertigaan Jl.Tenaga",
          latitude: "-7.94328413",
          longitude: "112.64727470",
          isTransit: true,
        },
      },
    ],
  },
];

// ============================================
// GOOGLE MAPS LOADER
// ============================================

let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-google-maps="true"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(), {
        once: true,
      });
      existing.addEventListener(
        "error",
        () => reject(new Error("Google Maps gagal dimuat")),
        { once: true }
      );
      return;
    }

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!key) {
      reject(new Error("Google Maps API Key belum dikonfigurasi"));
      return;
    }

    const script = document.createElement("script");

    script.dataset.googleMaps = "true";
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${key}`;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Gagal memuat Google Maps"));

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

// ============================================
// POLYLINE HELPERS
// ============================================

function decodeRoute(encoded: string): LatLng[] {
  return decode(encoded).map(([latitude, longitude]) => ({
    lat: latitude,
    lng: longitude,
  }));
}

function encodePoints(points: CustomPoint[]): string {
  return encode(
    points.map((point) => [
      point.latitude,
      point.longitude,
    ])
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function RouteBuilderPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  const mapInstance = useRef<google.maps.Map | null>(null);
  const routePolyline = useRef<google.maps.Polyline | null>(null);
  const customPolyline = useRef<google.maps.Polyline | null>(null);

  const routeMarkers = useRef<google.maps.Marker[]>([]);
  const customMarkers = useRef<google.maps.Marker[]>([]);

  const infoWindow = useRef<google.maps.InfoWindow | null>(null);

  const [routes, setRoutes] = useState<AngkotRoute[]>(INITIAL_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState(7);

  const [customPoints, setCustomPoints] = useState<CustomPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");

  const [showHaltes, setShowHaltes] = useState(true);
  const [showCustomPoints, setShowCustomPoints] = useState(true);

  const [loadingApi, setLoadingApi] = useState(false);

  const [apiUrl, setApiUrl] = useState(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/routes`
  );

  const [routeColor, setRouteColor] = useState("#F59E0B");

  const selectedRoute = routes.find(
    (route) => route.id === selectedRouteId
  );

  // ============================================
  // INITIALIZE MAP
  // ============================================

  useEffect(() => {
    let mounted = true;

    async function initializeMap() {
      try {
        await loadGoogleMaps();

        if (!mounted || !mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: {
            lat: -7.9415,
            lng: 112.647,
          },
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          zoomControl: true,
        });

        mapInstance.current = map;
        infoWindow.current = new google.maps.InfoWindow();

        map.addListener(
          "click",
          (event: google.maps.MapMouseEvent) => {
            if (!event.latLng) return;

            const latitude = event.latLng.lat();
            const longitude = event.latLng.lng();

            setCustomPoints((previous) => {
              const nextSequence = previous.length + 1;

              return [
                ...previous,
                {
                  id: Date.now() + Math.random(),
                  latitude,
                  longitude,
                  sequence: nextSequence,
                  name: `Titik ${nextSequence}`,
                },
              ];
            });
          }
        );

        setMapReady(true);
      } catch (error) {
        if (mounted) {
          setMapError(
            error instanceof Error
              ? error.message
              : "Gagal memuat peta"
          );
        }
      }
    }

    initializeMap();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================
  // DRAW ROUTE POLYLINE + HALTES
  // ============================================

  useEffect(() => {
    if (!mapReady || !mapInstance.current || !selectedRoute) return;

    const map = mapInstance.current;

    routePolyline.current?.setMap(null);

    routeMarkers.current.forEach((marker) => marker.setMap(null));
    routeMarkers.current = [];

    try {
      const path = decodeRoute(selectedRoute.encodedPolyline);

      const polyline = new google.maps.Polyline({
        path,
        strokeColor: selectedRoute.color,
        strokeOpacity: 0.9,
        strokeWeight: 6,
        map,
      });

      routePolyline.current = polyline;

      const bounds = new google.maps.LatLngBounds();

      path.forEach((point) => bounds.extend(point));

      if (showHaltes) {
        selectedRoute.routeHaltes.forEach((item) => {
          const position = {
            lat: Number(item.halte.latitude),
            lng: Number(item.halte.longitude),
          };

          const marker = new google.maps.Marker({
            position,
            map,
            title: item.halte.name,
            label: {
              text: String(item.stopSequence),
              color: "#FFFFFF",
              fontWeight: "bold",
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#16A34A",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
              scale: 11,
            },
          });

          marker.addListener("click", () => {
            infoWindow.current?.setContent(`
              <div style="padding:8px;min-width:160px">
                <strong>${item.halte.name}</strong>
                <p style="margin:5px 0;color:#64748b">
                  Urutan halte: ${item.stopSequence}
                </p>
                <small>
                  ${position.lat}, ${position.lng}
                </small>
              </div>
            `);

            infoWindow.current?.open({
              map,
              anchor: marker,
            });
          });

          routeMarkers.current.push(marker);
          bounds.extend(position);
        });
      }

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, 70);
      }

      setMapError("");
    } catch (error) {
      console.error(error);
      setMapError(
        "Gagal melakukan decode polyline. Periksa encodedPolyline."
      );
    }

    return () => {
      routePolyline.current?.setMap(null);

      routeMarkers.current.forEach((marker) => marker.setMap(null));
      routeMarkers.current = [];
    };
  }, [mapReady, selectedRoute, showHaltes]);

  // ============================================
  // DRAW CUSTOM POINTS
  // ============================================

  useEffect(() => {
    if (!mapReady || !mapInstance.current) return;

    const map = mapInstance.current;

    customPolyline.current?.setMap(null);

    customMarkers.current.forEach((marker) => marker.setMap(null));
    customMarkers.current = [];

    if (!showCustomPoints) return;

    const path: LatLng[] = [];

    customPoints.forEach((point) => {
      const position = {
        lat: point.latitude,
        lng: point.longitude,
      };

      path.push(position);

      const marker = new google.maps.Marker({
        position,
        map,
        title: point.name,
        label: {
          text: String(point.sequence),
          color: "#FFFFFF",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor:
            selectedPoint === point.id ? "#EA580C" : routeColor,
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
          scale: selectedPoint === point.id ? 13 : 10,
        },
      });

      marker.addListener("click", () => {
        setSelectedPoint(point.id);
      });

      customMarkers.current.push(marker);
    });

    if (path.length >= 2) {
      customPolyline.current = new google.maps.Polyline({
        path,
        strokeColor: routeColor,
        strokeOpacity: 0.9,
        strokeWeight: 4,
        icons: [
          {
            icon: {
              path: "M 0,-1 0,1",
              strokeOpacity: 1,
              scale: 3,
            },
            offset: "0",
            repeat: "12px",
          },
        ],
        map,
      });
    }

    return () => {
      customPolyline.current?.setMap(null);

      customMarkers.current.forEach((marker) => marker.setMap(null));
      customMarkers.current = [];
    };
  }, [
    mapReady,
    customPoints,
    selectedPoint,
    showCustomPoints,
    routeColor,
  ]);

  // ============================================
  // FOCUS ROUTE
  // ============================================

  const focusRoute = useCallback(() => {
    if (!selectedRoute || !mapInstance.current) return;

    try {
      const path = decodeRoute(selectedRoute.encodedPolyline);

      const bounds = new google.maps.LatLngBounds();

      path.forEach((point) => bounds.extend(point));

      mapInstance.current.fitBounds(bounds, 70);
    } catch (error) {
      console.error(error);
    }
  }, [selectedRoute]);

  // ============================================
  // FOCUS CUSTOM POINT
  // ============================================

  const focusPoint = (point: CustomPoint) => {
    setSelectedPoint(point.id);

    mapInstance.current?.panTo({
      lat: point.latitude,
      lng: point.longitude,
    });

    mapInstance.current?.setZoom(18);
  };

  // ============================================
  // REMOVE POINT
  // ============================================

  const removePoint = (id: number) => {
    setCustomPoints((previous) =>
      previous
        .filter((point) => point.id !== id)
        .map((point, index) => ({
          ...point,
          sequence: index + 1,
          name: `Titik ${index + 1}`,
        }))
    );

    setSelectedPoint(null);
  };

  // ============================================
  // REORDER POINT
  // ============================================

  const movePoint = (index: number, direction: -1 | 1) => {
    setCustomPoints((previous) => {
      const next = [...previous];
      const target = index + direction;

      if (target < 0 || target >= next.length) return previous;

      [next[index], next[target]] = [next[target], next[index]];

      return next.map((point, i) => ({
        ...point,
        sequence: i + 1,
        name: `Titik ${i + 1}`,
      }));
    });
  };

  // ============================================
  // CLEAR POINTS
  // ============================================

  const clearPoints = () => {
    setCustomPoints([]);
    setSelectedPoint(null);
  };

  // ============================================
  // LOAD BACKEND API
  // ============================================

  const loadApiRoutes = async () => {
    if (!apiUrl.trim()) return;

    setLoadingApi(true);
    setMapError("");

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (
        result.status !== "success" ||
        !Array.isArray(result.data)
      ) {
        throw new Error("Format response API tidak sesuai");
      }

      setRoutes(result.data);

      if (result.data.length > 0) {
        setSelectedRouteId(result.data[0].id);
      }
    } catch (error) {
      setMapError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data rute"
      );
    } finally {
      setLoadingApi(false);
    }
  };

  // ============================================
  // DISTANCE CALCULATION
  // ============================================

  const calculateDistance = () => {
    if (customPoints.length < 2 || !mapReady) return 0;

    let distance = 0;

    for (let i = 0; i < customPoints.length - 1; i++) {
      const a = customPoints[i];
      const b = customPoints[i + 1];

      distance +=
        google.maps.geometry?.spherical?.computeDistanceBetween
          ? google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(a.latitude, a.longitude),
              new google.maps.LatLng(b.latitude, b.longitude)
            )
          : haversineDistance(a, b);
    }

    return distance;
  };

  function haversineDistance(a: CustomPoint, b: CustomPoint) {
    const R = 6371000;
    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(b.latitude - a.latitude);
    const dLng = toRad(b.longitude - a.longitude);

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.latitude)) *
        Math.cos(toRad(b.latitude)) *
        Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  const distance = calculateDistance();

  // ============================================
  // EXPORT JSON
  // ============================================

  const exportPoints = async () => {
    if (!selectedRoute) return;

    const result = {
      routeId: selectedRoute.id,
      routeCode: selectedRoute.code,
      points: customPoints.map((point) => ({
        sequence: point.sequence,
        name: point.name,
        latitude: point.latitude,
        longitude: point.longitude,
      })),
      encodedPolyline:
        customPoints.length >= 2
          ? encodePoints(customPoints)
          : "",
    };

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(result, null, 2)
      );
      alert("JSON berhasil disalin!");
    } catch {
      alert("Gagal menyalin JSON.");
    }
  };

  // ============================================
  // EXPORT ENCODED POLYLINE
  // ============================================

  const exportPolyline = async () => {
    if (customPoints.length < 2) return;

    const encoded = encodePoints(customPoints);

    try {
      await navigator.clipboard.writeText(encoded);
      alert("Encoded polyline berhasil disalin!");
    } catch {
      alert("Gagal menyalin encoded polyline.");
    }
  };

  // ============================================
  // UI
  // ============================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white">
              <Route size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold">
                Route Builder
              </h1>
              <p className="text-xs text-slate-500">
                Visualisasi dan penyusunan rute angkot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                mapReady ? "bg-green-500" : "bg-amber-500"
              }`}
            />
            {mapReady ? "Google Maps Connected" : "Connecting..."}
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-5 p-5">

        {/* API CONNECTION */}
        <section className="rounded-xl border border-slate-200 bg-white p-4">

          <div className="mb-3 flex items-center gap-2">
            <Layers size={17} className="text-blue-600" />
            <h2 className="text-sm font-bold">
              Backend Connection
            </h2>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="URL endpoint routes"
              className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
            />

            <button
              onClick={loadApiRoutes}
              disabled={loadingApi}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loadingApi ? "animate-spin" : ""}
              />
              Load API Routes
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Data contoh tersedia. Masukkan URL endpoint untuk
            mengambil data langsung dari backend.
          </p>

          {mapError && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-600">
              {mapError}
            </p>
          )}
        </section>

        {/* ROUTE SELECTOR */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          {routes.map((route) => (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`rounded-xl border bg-white p-4 text-left transition ${
                selectedRouteId === route.id
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-lg font-bold">
                  {route.code}
                </span>

                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                    selectedRouteId === route.id
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {selectedRouteId === route.id
                    ? "Selected"
                    : "Select"}
                </span>
              </div>

              <p className="text-sm text-slate-600">
                {route.name}
              </p>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {(route.totalDistanceMeters / 1000).toFixed(2)} km
                </span>
                <span>
                  {route.routeHaltes.length} halte
                </span>
              </div>
            </button>
          ))}

        </section>

        {/* MAP AND SIDEBAR */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_350px]">

          {/* MAP */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">

              <div>
                <h2 className="text-sm font-bold">
                  Peta Visualisasi Rute
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedRoute?.code} - {selectedRoute?.name}
                </p>
              </div>

              <button
                onClick={focusRoute}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
              >
                <Crosshair size={15} />
                Fokus Rute
              </button>

            </div>

            {/* LEGEND */}
            <div className="flex flex-wrap gap-4 border-b border-slate-100 px-4 py-3">

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span
                  className="h-1 w-5 rounded"
                  style={{
                    background: selectedRoute?.color || "#1E88E5",
                  }}
                />
                Rute Angkot
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="h-3 w-3 rounded-full bg-green-600" />
                Halte
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: routeColor }}
                />
                Titik Custom
              </div>

            </div>

            {/* MAP */}
            <div className="relative h-[550px] w-full">

              <div
                ref={mapRef}
                className="h-full w-full"
              />

              {!mapReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100">
                  <RefreshCw className="animate-spin text-blue-600" />
                  <p className="text-sm text-slate-500">
                    Memuat Google Maps...
                  </p>
                </div>
              )}

              {mapReady && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-lg bg-white px-4 py-2.5 text-center shadow-lg">
                  <p className="text-xs font-semibold text-slate-700">
                    <MapPin
                      size={13}
                      className="mr-1 inline text-amber-500"
                    />
                    Klik peta untuk menambahkan titik
                  </p>
                </div>
              )}

            </div>

          </div>

          {/* SIDEBAR */}
          <aside className="space-y-4">

            {/* ROUTE INFORMATION */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">

              <h3 className="mb-4 text-sm font-bold">
                Informasi Rute
              </h3>

              <div className="space-y-3">

                <div>
                  <p className="text-xs text-slate-400">
                    Kode Rute
                  </p>
                  <p className="font-bold">
                    {selectedRoute?.code || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Nama Rute
                  </p>
                  <p className="text-sm font-medium">
                    {selectedRoute?.name || "-"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Jarak Rute
                    </p>
                    <p className="mt-1 font-bold">
                      {selectedRoute?.totalDistanceMeters.toLocaleString(
                        "id-ID"
                      ) || 0} m
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Jumlah Halte
                    </p>
                    <p className="mt-1 font-bold">
                      {selectedRoute?.routeHaltes.length || 0}
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* LAYERS */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">

              <h3 className="mb-3 text-sm font-bold">
                Layer Peta
              </h3>

              <label className="flex cursor-pointer items-center justify-between py-2">
                <span className="text-sm text-slate-600">
                  Tampilkan Halte
                </span>
                <input
                  type="checkbox"
                  checked={showHaltes}
                  onChange={(e) => setShowHaltes(e.target.checked)}
                  className="h-4 w-4 accent-blue-600"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between py-2">
                <span className="text-sm text-slate-600">
                  Tampilkan Titik Custom
                </span>
                <input
                  type="checkbox"
                  checked={showCustomPoints}
                  onChange={(e) =>
                    setShowCustomPoints(e.target.checked)
                  }
                  className="h-4 w-4 accent-blue-600"
                />
              </label>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <label className="mb-2 block text-xs text-slate-500">
                  Warna Titik Custom
                </label>
                <input
                  type="color"
                  value={routeColor}
                  onChange={(e) => setRouteColor(e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-lg border border-slate-200"
                />
              </div>

            </div>

            {/* CUSTOM POINTS */}
            <div className="rounded-xl border border-slate-200 bg-white">

              <div className="flex items-center justify-between border-b border-slate-100 p-4">

                <div>
                  <h3 className="text-sm font-bold">
                    Titik Custom
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {customPoints.length} titik ditambahkan
                  </p>
                </div>

                <button
                  onClick={clearPoints}
                  disabled={customPoints.length === 0}
                  className="flex items-center gap-1 text-xs font-medium text-red-500 disabled:opacity-30"
                >
                  <Trash2 size={14} />
                  Hapus Semua
                </button>

              </div>

              <div className="max-h-[300px] space-y-2 overflow-y-auto p-3">

                {customPoints.length === 0 && (
                  <div className="py-8 text-center">
                    <MapPinned
                      size={28}
                      className="mx-auto mb-2 text-slate-300"
                    />
                    <p className="text-xs text-slate-500">
                      Belum ada titik custom.
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Klik pada peta untuk menambahkan titik.
                    </p>
                  </div>
                )}

                {customPoints.map((point, index) => (
                  <div
                    key={point.id}
                    className={`rounded-lg border p-3 ${
                      selectedPoint === point.id
                        ? "border-orange-300 bg-orange-50"
                        : "border-slate-100 bg-white"
                    }`}
                  >

                    <div className="flex items-center justify-between gap-2">

                      <button
                        onClick={() => focusPoint(point)}
                        className="flex min-w-0 items-center gap-2 text-left"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                          {point.sequence}
                        </span>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold">
                            {point.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {point.latitude.toFixed(7)},{" "}
                            {point.longitude.toFixed(7)}
                          </p>
                        </div>
                      </button>

                      <div className="flex shrink-0 items-center">
                        <button
                          onClick={() => movePoint(index, -1)}
                          disabled={index === 0}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-20"
                          title="Pindah ke atas"
                        >
                          <ChevronUp size={15} />
                        </button>

                        <button
                          onClick={() => movePoint(index, 1)}
                          disabled={index === customPoints.length - 1}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-20"
                          title="Pindah ke bawah"
                        >
                          <ChevronDown size={15} />
                        </button>

                        <button
                          onClick={() => removePoint(point.id)}
                          className="rounded p-1 text-red-500 hover:bg-red-50"
                          title="Hapus titik"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}

              </div>

              {/* DISTANCE + EXPORT */}
              <div className="border-t border-slate-100 p-4">

                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Jarak antar titik
                  </span>
                  <span className="text-sm font-bold">
                    {distance >= 1000
                      ? `${(distance / 1000).toFixed(2)} km`
                      : `${distance.toFixed(0)} m`}
                  </span>
                </div>

                <div className="space-y-2">

                  <button
                    onClick={exportPoints}
                    disabled={customPoints.length === 0}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Copy size={15} />
                    Copy JSON
                  </button>

                  <button
                    onClick={exportPolyline}
                    disabled={customPoints.length < 2}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Route size={15} />
                    Copy Encoded Polyline
                  </button>

                </div>

              </div>

            </div>

          </aside>

        </section>

        {/* ENCODED POLYLINE PREVIEW */}
        <section className="rounded-xl border border-slate-200 bg-white p-4">

          <div className="mb-3 flex items-center gap-2">
            <Navigation size={17} className="text-blue-600" />
            <h3 className="text-sm font-bold">
              Encoded Polyline Preview
            </h3>
          </div>

          <div className="break-all rounded-lg bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-600">
            {customPoints.length >= 2
              ? encodePoints(customPoints)
              : "Tambahkan minimal 2 titik untuk menghasilkan encoded polyline."}
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Hasil encode mengikuti urutan titik custom yang tampil di atas.
          </p>

        </section>

        {/* INSTRUCTIONS */}
        <section className="rounded-xl border border-blue-100 bg-blue-50 p-4">

          <div className="flex items-start gap-3">
            <Navigation
              size={19}
              className="mt-0.5 text-blue-600"
            />

            <div>
              <h3 className="text-sm font-bold text-blue-900">
                Petunjuk Penggunaan
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-blue-800">
                Pilih rute, kemudian klik lokasi pada peta untuk
                menambahkan titik. Gunakan tombol panah untuk mengubah
                urutan titik. Setiap perubahan urutan akan otomatis
                memperbarui garis dan encoded polyline. Gunakan Copy
                JSON untuk mengambil seluruh koordinat dan hasil
                encoding.
              </p>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
