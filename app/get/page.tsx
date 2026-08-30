"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useRoutePaths } from "@/hooks/routes/useRoutePath";
import { DirectionType } from "@/types/vehicles/vehicle.type";

// =====================================================
// TYPES
// =====================================================

interface Suggestion {
  mapbox_id: string;
  name: string;
  name_preferred?: string;
  place_formatted?: string;
  full_address?: string;
}

interface LocationData {
  mapboxId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface RouteSearchResult {
  routeId: number;
  routeCode: string;
  routeName: string;
  direction: DirectionType;
  sequenceTitikAwal: number;
  sequenceTitikTujuan: number;
  startLat: string;
  startLng: string;
  destLat: string;
  destLng: string;
  beelineTotal: number;

  walkingToRoute: {
    distance: number;
    duration: number;
  };

  walkingToDestination: {
    distance: number;
    duration: number;
  };

  totalWalkingDistance: number;
  totalWalkingDuration: number;
}

interface RoutePath {
  id: number;
  routeId: number;
  direction: DirectionType;
  latitude: number;
  longitude: number;
  sequenceOrder: number;

  geom?: {
    type: string;
    coordinates: [number, number];
  };
}

type PointType = "origin" | "destination";

// =====================================================
// CONFIG
// =====================================================

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const API_URL = "http://localhost:3001";

const SUGGEST = "https://api.mapbox.com/search/searchbox/v1/suggest";

const RETRIEVE = "https://api.mapbox.com/search/searchbox/v1/retrieve";

// Standard Mapbox geocoding API, used to reverse-geocode a dropped/dragged pin
const REVERSE_GEOCODE = "https://api.mapbox.com/geocoding/v5/mapbox.places";

const BBOX = "112.45,-8.35,112.85,-7.75";

const PROXIMITY = "112.6304,-7.9666";

const CENTER: [number, number] = [-7.9666, 112.6304];

// =====================================================
// LEAFLET ICONS
// =====================================================

const originIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = originIcon;

// =====================================================
// PAGE
// =====================================================

export default function LocationPage() {
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");

  const [originSuggestions, setOriginSuggestions] = useState<Suggestion[]>(
    [],
  );
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    Suggestion[]
  >([]);

  const [origin, setOrigin] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);

  const [routeResults, setRouteResults] = useState<RouteSearchResult[]>([]);

  /*
   * Menyimpan RoutePath berdasarkan:
   *
   * routeId-direction
   *
   * Contoh:
   *
   * {
   *   "1-FORWARD": [...],
   *   "1-BACKWARD": [...]
   * }
   */
  const [routePathMap, setRoutePathMap] = useState<
    Record<string, RoutePath[]>
  >({});

  const [loading, setLoading] = useState<
    "origin" | "destination" | "route" | "geocode-origin" | "geocode-destination" | null
  >(null);

  const [error, setError] = useState("");

  // On small screens the search panel can be collapsed once a route is found,
  // so the map + results get more room.
  const [showSearchPanel, setShowSearchPanel] = useState(true);

  const originSession = useRef(crypto.randomUUID());
  const destinationSession = useRef(crypto.randomUUID());

  const selectingOrigin = useRef(false);
  const selectingDestination = useRef(false);

  // ===================================================
  // ORIGIN SUGGEST
  // ===================================================

  useEffect(() => {
    if (selectingOrigin.current) return;

    const query = originQuery.trim();

    if (query.length < 2) {
      setOriginSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      searchLocation(query, "origin");
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originQuery]);

  // ===================================================
  // DESTINATION SUGGEST
  // ===================================================

  useEffect(() => {
    if (selectingDestination.current) return;

    const query = destinationQuery.trim();

    if (query.length < 2) {
      setDestinationSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      searchLocation(query, "destination");
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationQuery]);

  // ===================================================
  // MAPBOX SUGGEST
  // ===================================================

  async function searchLocation(query: string, type: PointType) {
    if (!TOKEN) {
      setError("NEXT_PUBLIC_MAPBOX_TOKEN belum dikonfigurasi.");
      return;
    }

    try {
      setLoading(type);
      setError("");

      const session =
        type === "origin" ? originSession.current : destinationSession.current;

      const params = new URLSearchParams({
        q: query,
        access_token: TOKEN,
        session_token: session,
        language: "id",
        country: "ID",
        limit: "8",
        proximity: PROXIMITY,
        bbox: BBOX,
        types: "poi,address,street,place",
      });

      const response = await fetch(`${SUGGEST}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Suggest error: ${response.status}`);
      }

      const data = await response.json();

      if (type === "origin") {
        setOriginSuggestions(data.suggestions ?? []);
      } else {
        setDestinationSuggestions(data.suggestions ?? []);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal mencari lokasi.");
    } finally {
      setLoading(null);
    }
  }

  // ===================================================
  // MAPBOX RETRIEVE (dari hasil suggest)
  // ===================================================

  async function retrieveLocation(item: Suggestion, type: PointType) {
    if (!TOKEN) return;

    const selecting = type === "origin" ? selectingOrigin : selectingDestination;

    try {
      selecting.current = true;

      setLoading(type);
      setError("");

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
      const [longitude, latitude] = coordinates;
      const properties = feature.properties ?? {};

      const location: LocationData = {
        mapboxId: properties.mapbox_id ?? item.mapbox_id,
        name: properties.name ?? item.name,
        address:
          properties.full_address ??
          item.full_address ??
          item.place_formatted ??
          "",
        latitude: Number(latitude),
        longitude: Number(longitude),
      };

      applyLocation(type, location);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil detail lokasi.");
    } finally {
      setLoading(null);

      setTimeout(() => {
        selecting.current = false;
      }, 100);
    }
  }

  // ===================================================
  // REVERSE GEOCODE (dari drag / tap di map)
  // ===================================================

  async function reverseGeocode(lat: number, lng: number) {
    if (!TOKEN) return null;

    try {
      const params = new URLSearchParams({
        access_token: TOKEN,
        language: "id",
        limit: "1",
      });

      const response = await fetch(
        `${REVERSE_GEOCODE}/${lng},${lat}.json?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Reverse geocode error: ${response.status}`);
      }

      const data = await response.json();
      const feature = data.features?.[0];

      return {
        name: feature?.text ?? "Lokasi dipilih",
        address: feature?.place_name ?? "",
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // ===================================================
  // SET LOKASI (dipakai oleh: retrieve, drag marker, tap map)
  // ===================================================

  function applyLocation(type: PointType, location: LocationData) {
    const selecting = type === "origin" ? selectingOrigin : selectingDestination;

    selecting.current = true;

    if (type === "origin") {
      setOrigin(location);
      setOriginQuery(location.name);
      setOriginSuggestions([]);
    } else {
      setDestination(location);
      setDestinationQuery(location.name);
      setDestinationSuggestions([]);
    }

    // Reset hasil rute karena titik berubah
    setRouteResults([]);
    setRoutePathMap({});

    setTimeout(() => {
      selecting.current = false;
    }, 100);
  }

  // Dipanggil saat marker di-drag, atau saat map di-tap untuk menempatkan titik
  async function handlePointFromMap(type: PointType, lat: number, lng: number) {
    setLoading(type === "origin" ? "geocode-origin" : "geocode-destination");
    setError("");

    const geocoded = await reverseGeocode(lat, lng);

    const location: LocationData = {
      mapboxId: `manual-${lat.toFixed(6)}-${lng.toFixed(6)}`,
      name: geocoded?.name ?? "Lokasi dipilih",
      address: geocoded?.address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      latitude: lat,
      longitude: lng,
    };

    applyLocation(type, location);
    setLoading(null);
  }

  // ===================================================
  // SEARCH ROUTES
  // ===================================================

  async function searchRoutes() {
    if (!origin || !destination) {
      setError("Pilih titik awal dan tujuan terlebih dahulu.");
      return;
    }

    try {
      setLoading("route");
      setError("");

      setRouteResults([]);
      setRoutePathMap({});

      const params = new URLSearchParams({
        userLat: String(origin.latitude),
        userLng: String(origin.longitude),
        destLat: String(destination.latitude),
        destLng: String(destination.longitude),
      });

      const url = `${API_URL}/routes/search?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? `HTTP ${response.status}`);
      }

      const routes: RouteSearchResult[] = Array.isArray(data)
        ? data
        : data?.data ?? [];

      setRouteResults(routes);

      // Di layar kecil, sembunyikan panel pencarian supaya hasil rute
      // & peta punya lebih banyak ruang.
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setShowSearchPanel(false);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Gagal mencari rute.");
    } finally {
      setLoading(null);
    }
  }

  // ===================================================
  // RECEIVE ROUTE PATH
  //
  // PENTING: dibungkus useCallback supaya referensinya STABIL antar render.
  // Sebelumnya fungsi ini dibuat ulang setiap render, sehingga useEffect di
  // RouteResultItem (yang punya `onRoutePaths` sebagai dependency) selalu
  // dianggap "berubah" dan jalan lagi -> memicu setState -> re-render induk
  // -> fungsi dibuat ulang lagi -> loop tanpa henti ("Maximum update depth
  // exceeded"). Kita juga membandingkan isi (bukan cuma referensi) sebelum
  // benar-benar melakukan setState, sebagai pengaman tambahan kalau hook
  // useRoutePaths mengembalikan array baru walau datanya sama.
  // ===================================================

  const handleRoutePaths = useCallback((key: string, paths: RoutePath[]) => {
    setRoutePathMap((previous) => {
      const existing = previous[key];

      const isSame =
        existing &&
        existing.length === paths.length &&
        existing.every((p, i) => p.id === paths[i]?.id);

      if (isSame) return previous;

      return { ...previous, [key]: paths };
    });
  }, []);

  // ===================================================
  // CLEAR ORIGIN / DESTINATION
  // ===================================================

  function clearOrigin() {
    selectingOrigin.current = false;

    setOrigin(null);
    setOriginQuery("");
    setOriginSuggestions([]);

    setRouteResults([]);
    setRoutePathMap({});

    originSession.current = crypto.randomUUID();
  }

  function clearDestination() {
    selectingDestination.current = false;

    setDestination(null);
    setDestinationQuery("");
    setDestinationSuggestions([]);

    setRouteResults([]);
    setRoutePathMap({});

    destinationSession.current = crypto.randomUUID();
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <main className="min-h-screen bg-gray-50 p-3 text-black sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Cari Rute Angkot</h1>
            <p className="mt-1 text-xs text-black/60 sm:text-sm">
              Cari lokasi, atau geser pin langsung di peta.
            </p>
          </div>

          {/* Toggle panel pencarian - berguna di layar kecil setelah rute ketemu */}
          <button
            type="button"
            onClick={() => setShowSearchPanel((v) => !v)}
            className="rounded-lg border bg-white px-3 py-2 text-xs font-medium sm:hidden"
          >
            {showSearchPanel ? "Sembunyikan" : "Pencarian"}
          </button>
        </div>

        {/* =================================================
            SEARCH
            ================================================= */}

        {showSearchPanel && (
          <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-5 md:grid-cols-2">
            <SearchBox
              label="Titik Awal"
              icon="🔵"
              value={originQuery}
              loading={loading === "origin" || loading === "geocode-origin"}
              suggestions={originSuggestions}
              placeholder="Cari titik awal..."
              onChange={(value) => {
                setOriginQuery(value);
                setOrigin(null);
                setRouteResults([]);
                setRoutePathMap({});
              }}
              onClear={clearOrigin}
              onSelect={(item) => retrieveLocation(item, "origin")}
            />

            <SearchBox
              label="Tujuan"
              icon="🔴"
              value={destinationQuery}
              loading={
                loading === "destination" || loading === "geocode-destination"
              }
              suggestions={destinationSuggestions}
              placeholder="Cari tujuan..."
              onChange={(value) => {
                setDestinationQuery(value);
                setDestination(null);
                setRouteResults([]);
                setRoutePathMap({});
              }}
              onClear={clearDestination}
              onSelect={(item) => retrieveLocation(item, "destination")}
            />
          </div>
        )}

        {/* =================================================
            SEARCH BUTTON
            ================================================= */}

        <div className="mt-4 flex justify-stretch sm:mt-5 sm:justify-end">
          <button
            type="button"
            onClick={searchRoutes}
            disabled={!origin || !destination || loading === "route"}
            className="w-full rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/20 sm:w-auto"
          >
            {loading === "route" ? "Mencari rute..." : "Cari Rute"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* =================================================
            MAP
            ================================================= */}

        <div className="mt-4 overflow-hidden rounded-2xl border bg-white sm:mt-6">
          <div className="flex items-center justify-between border-b bg-gray-50 px-3 py-2 text-xs text-black/50 sm:text-sm">
            <span>
              💡 Tap peta untuk menempatkan titik, atau geser pin yang sudah
              ada.
            </span>
          </div>

          <div className="h-[320px] sm:h-[420px] md:h-[550px]">
            <MapContainer
              center={CENTER}
              zoom={12}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Tap di peta untuk menempatkan titik awal/tujuan yang belum diisi */}
              <MapClickHandler
                origin={origin}
                destination={destination}
                onPick={handlePointFromMap}
              />

              {/* ORIGIN */}

              {origin && (
                <Marker
                  position={[origin.latitude, origin.longitude]}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      const pos = e.target.getLatLng();
                      handlePointFromMap("origin", pos.lat, pos.lng);
                    },
                  }}
                >
                  <Popup>
                    <strong>Titik Awal</strong>
                    <br />
                    {origin.name}
                    <br />
                    <span className="text-xs text-black/50">
                      Geser pin untuk mengubah
                    </span>
                  </Popup>
                </Marker>
              )}

              {/* DESTINATION */}

              {destination && (
                <Marker
                  position={[destination.latitude, destination.longitude]}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      const pos = e.target.getLatLng();
                      handlePointFromMap("destination", pos.lat, pos.lng);
                    },
                  }}
                >
                  <Popup>
                    <strong>Tujuan</strong>
                    <br />
                    {destination.name}
                    <br />
                    <span className="text-xs text-black/50">
                      Geser pin untuk mengubah
                    </span>
                  </Popup>
                </Marker>
              )}

              {/* ROUTE PATH LINES */}

              {Object.entries(routePathMap).map(([key, paths]) => (
                <RoutePathLine key={key} routePaths={paths} />
              ))}

              <MapController
                origin={origin}
                destination={destination}
                routePathMap={routePathMap}
              />
            </MapContainer>
          </div>
        </div>

        {/* =================================================
            LOCATION INFO
            ================================================= */}

        {(origin || destination) && (
          <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4 md:grid-cols-2">
            {origin && <LocationCard title="🔵 Titik Awal" location={origin} />}
            {destination && (
              <LocationCard title="🔴 Tujuan" location={destination} />
            )}
          </div>
        )}

        {/* =================================================
            ROUTE RESULTS
            ================================================= */}

        {routeResults.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="mb-4 sm:mb-5">
              <h2 className="text-lg font-bold sm:text-xl">
                Rute yang Bisa Dipakai
              </h2>
              <p className="mt-1 text-xs text-black/50 sm:text-sm">
                Ditemukan{" "}
                <strong className="text-black">{routeResults.length}</strong>{" "}
                rute.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {routeResults.map((route, index) => (
                <RouteResultItem
                  key={`${route.routeId}-${route.direction}`}
                  route={route}
                  index={index}
                  onRoutePaths={handleRoutePaths}
                />
              ))}
            </div>
          </div>
        )}

        {/* EMPTY */}

        {routeResults.length === 0 &&
          loading !== "route" &&
          origin &&
          destination && (
            <div className="mt-6 rounded-xl border bg-white p-4 text-center sm:p-5">
              <p className="text-sm text-black/50">
                Klik <strong className="text-black">Cari Rute</strong> untuk
                mencari rute yang tersedia.
              </p>
            </div>
          )}
      </div>
    </main>
  );
}

// =====================================================
// MAP CLICK HANDLER (tap-to-place, penting untuk mobile)
// =====================================================

function MapClickHandler({
  origin,
  destination,
  onPick,
}: {
  origin: LocationData | null;
  destination: LocationData | null;
  onPick: (type: PointType, lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      // Isi titik awal dulu; kalau sudah ada, isi tujuan; kalau dua-duanya
      // sudah ada, tap di peta tidak melakukan apa-apa (pakai drag untuk
      // mengubah titik yang sudah ada).
      if (!origin) {
        onPick("origin", e.latlng.lat, e.latlng.lng);
      } else if (!destination) {
        onPick("destination", e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
}

// =====================================================
// ROUTE RESULT
// =====================================================

function RouteResultItem({
  route,
  index,
  onRoutePaths,
}: {
  route: RouteSearchResult;
  index: number;
  onRoutePaths: (key: string, paths: RoutePath[]) => void;
}) {
  const { data: routePaths, isLoading, isError } = useRoutePaths(
    route.routeId,
    route.direction,
  );

  useEffect(() => {
    if (!routePaths || !Array.isArray(routePaths)) {
      return;
    }

    const key = `${route.routeId}-${route.direction}`;

    onRoutePaths(key, routePaths as RoutePath[]);
  }, [route.routeId, route.direction, routePaths, onRoutePaths]);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-3 sm:gap-4 md:flex-row">
        <div>
          <p className="text-xs font-semibold text-black/40">
            RUTE {index + 1}
          </p>

          <h3 className="mt-1 text-lg font-bold sm:text-xl">
            {route.routeCode} - {route.routeName}
          </h3>

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>Route ID: {route.routeId}</Badge>
            <Badge>Direction: {route.direction}</Badge>
          </div>
        </div>
      </div>

      {/* SEARCH RESPONSE */}

      <div className="mt-5 border-t pt-4 sm:mt-6 sm:pt-5">
        <h4 className="mb-3 font-semibold sm:mb-4">
          Informasi Hasil Pencarian
        </h4>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <Info label="Route ID" value={String(route.routeId)} />
          <Info label="Route Code" value={route.routeCode} />
          <Info label="Route Name" value={route.routeName} />
          <Info label="Direction" value={route.direction} />
          <Info
            label="Sequence Titik Awal"
            value={String(route.sequenceTitikAwal)}
          />
          <Info
            label="Sequence Titik Tujuan"
            value={String(route.sequenceTitikTujuan)}
          />
          <Info label="Start Latitude" value={route.startLat} />
          <Info label="Start Longitude" value={route.startLng} />
          <Info label="Destination Latitude" value={route.destLat} />
          <Info label="Destination Longitude" value={route.destLng} />
          <Info
            label="Beeline Total"
            value={`${route.beelineTotal.toFixed(2)} m`}
          />
          <Info
            label="Total Walking Distance"
            value={`${route.totalWalkingDistance.toFixed(2)} m`}
          />
          <Info
            label="Total Walking Duration"
            value={formatDuration(route.totalWalkingDuration)}
          />
        </div>
      </div>

      {/* WALKING */}

      <div className="mt-5 sm:mt-6">
        <h4 className="mb-3 font-semibold sm:mb-4">Informasi Berjalan</h4>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-3 sm:p-4">
            <p className="font-medium">🚶 Titik Awal → Rute</p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
              <Info
                label="Distance"
                value={`${route.walkingToRoute.distance} m`}
              />
              <Info
                label="Duration"
                value={formatDuration(route.walkingToRoute.duration)}
              />
            </div>
          </div>

          <div className="rounded-xl border p-3 sm:p-4">
            <p className="font-medium">🚶 Rute → Tujuan</p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
              <Info
                label="Distance"
                value={`${route.walkingToDestination.distance} m`}
              />
              <Info
                label="Duration"
                value={formatDuration(route.walkingToDestination.duration)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ROUTE PATH STATUS */}

      <div className="mt-5 border-t pt-4 sm:mt-6 sm:pt-5">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h4 className="font-semibold">Route Path</h4>
            <p className="mt-1 text-xs text-black/50">
              routeId: {route.routeId} • direction: {route.direction}
            </p>
          </div>

          {isLoading && (
            <span className="text-sm text-black/50">
              Mengambil Route Path...
            </span>
          )}
        </div>

        {isError && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            Gagal mengambil Route Path.
          </div>
        )}

        {!isLoading && !isError && Array.isArray(routePaths) && (
          <div className="mt-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-black/50">Jumlah titik Route Path</p>
              <p className="mt-1 text-2xl font-bold">{routePaths.length}</p>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-black/60 hover:text-black">
                Lihat response Route Path
              </summary>

              <pre className="mt-3 max-h-[500px] overflow-auto rounded-xl bg-gray-100 p-4 text-xs text-black">
                {JSON.stringify(routePaths, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* RAW SEARCH RESPONSE */}

      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-black/60 hover:text-black">
          Lihat seluruh response /routes/search
        </summary>

        <pre className="mt-3 max-h-[400px] overflow-auto rounded-xl bg-gray-100 p-4 text-xs text-black">
          {JSON.stringify(route, null, 2)}
        </pre>
      </details>
    </div>
  );
}

// =====================================================
// ROUTE PATH LINE
// =====================================================

function RoutePathLine({ routePaths }: { routePaths: RoutePath[] }) {
  if (!routePaths || routePaths.length === 0) {
    return null;
  }

  const positions = [...routePaths]
    .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
    .map(
      (point) => [Number(point.latitude), Number(point.longitude)] as [number, number],
    );

  return (
    <Polyline
      positions={positions}
      pathOptions={{ color: "blue", weight: 5, opacity: 0.8 }}
    />
  );
}

// =====================================================
// SEARCH BOX
// =====================================================

function SearchBox({
  label,
  icon,
  value,
  loading,
  suggestions,
  placeholder,
  onChange,
  onClear,
  onSelect,
}: {
  label: string;
  icon: string;
  value: string;
  loading: boolean;
  suggestions: Suggestion[];
  placeholder: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSelect: (item: Suggestion) => void;
}) {
  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-medium">{label}</label>

      <div className="flex items-center rounded-xl border bg-white px-3 sm:px-4">
        <span className="mr-2 sm:mr-3">{icon}</span>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full py-3 text-black outline-none placeholder:text-black/40"
        />

        {loading && <span className="text-xs text-black/40">...</span>}

        {value && (
          <button
            type="button"
            onClick={onClear}
            className="ml-2 text-black/40 hover:text-black"
          >
            ✕
          </button>
        )}
      </div>

      {/* SUGGESTIONS */}

      {suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-[1000] mt-2 max-h-72 overflow-y-auto rounded-xl border bg-white shadow-xl">
          {suggestions.map((item) => (
            <button
              key={item.mapbox_id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(item);
              }}
              className="flex w-full gap-3 border-b px-4 py-3 text-left text-black last:border-0 hover:bg-gray-50"
            >
              <span>📍</span>

              <div className="min-w-0">
                <p className="font-medium">
                  {item.name_preferred ?? item.name}
                </p>

                {item.place_formatted && (
                  <p className="truncate text-xs text-black/50">
                    {item.place_formatted}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// LOCATION CARD
// =====================================================

function LocationCard({
  title,
  location,
}: {
  title: string;
  location: LocationData;
}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="font-semibold">{title}</h2>

      <p className="mt-2 font-medium">{location.name}</p>
      <p className="text-sm text-black/60">{location.address}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Info label="Latitude" value={String(location.latitude)} />
        <Info label="Longitude" value={String(location.longitude)} />
      </div>
    </div>
  );
}

// =====================================================
// INFO
// =====================================================

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-black/40">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-black">
        {value}
      </p>
    </div>
  );
}

// =====================================================
// BADGE
// =====================================================

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-black">
      {children}
    </span>
  );
}

// =====================================================
// MAP CONTROLLER
// =====================================================

function MapController({
  origin,
  destination,
  routePathMap,
}: {
  origin: LocationData | null;
  destination: LocationData | null;
  routePathMap: Record<string, RoutePath[]>;
}) {
  const map = useMap();

  useEffect(() => {
    const allPaths = Object.values(routePathMap).flat();

    if (allPaths.length > 0) {
      const bounds = L.latLngBounds(
        allPaths.map((point) => [Number(point.latitude), Number(point.longitude)]),
      );

      if (origin) bounds.extend([origin.latitude, origin.longitude]);
      if (destination) bounds.extend([destination.latitude, destination.longitude]);

      map.fitBounds(bounds, { padding: [50, 50] });
      return;
    }

    if (!origin && !destination) return;

    if (origin && !destination) {
      map.setView([origin.latitude, origin.longitude], 15);
      return;
    }

    if (!origin && destination) {
      map.setView([destination.latitude, destination.longitude], 15);
      return;
    }

    if (origin && destination) {
      const bounds: LatLngBoundsExpression = [
        [origin.latitude, origin.longitude],
        [destination.latitude, destination.longitude],
      ];

      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [origin, destination, routePathMap, map]);

  return null;
}

// =====================================================
// FORMAT DURATION
// =====================================================

function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} menit`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return `${hours} jam ${remaining} menit`;
}