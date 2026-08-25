'use client';

import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Vehicle {
  id: number;
  vehicleAssignmentId: number;
  latitude: number;
  longitude: number;
  stopStatus: string;
  vehicleAssignment: {
    vehicleId: number;
    driverId: number;
    routeId: number;
    direction: string;
    currentPassengers: number;
    status: string;
  };
}

interface RoutePath {
  id: number;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

const vehicleIcon = new L.Icon({
  iconUrl:
    'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

const coordinateIcon = new L.Icon({
  iconUrl:
    'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function MapClickHandler({
  enabled,
  onSelect,
}: {
  enabled: boolean;
  onSelect: (coordinate: Coordinate) => void;
}) {
  useMapEvents({
    click(e) {
      if (!enabled) return;

      onSelect({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
    },
  });

  return null;
}

export default function MonitoringPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routePaths, setRoutePaths] = useState<RoutePath[]>([]);
  const [loading, setLoading] = useState(true);

  const [pickMode, setPickMode] = useState(false);
  const [coordinate, setCoordinate] =
    useState<Coordinate | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicleResponse, routeResponse] =
          await Promise.all([
            fetch(
              'http://localhost:3001/vehicle-locations',
            ),
            fetch(
              'http://localhost:3001/route-paths?routeId=1&direction=FORWARD',
            ),
          ]);

        const vehicleData = await vehicleResponse.json();
        const routeData = await routeResponse.json();

        setVehicles(vehicleData.data);

        setRoutePaths(
          routeData.data.sort(
            (a: RoutePath, b: RoutePath) =>
              a.sequenceOrder - b.sequenceOrder,
          ),
        );
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const polyline = routePaths.map(
    (point) =>
      [point.latitude, point.longitude] as [
        number,
        number,
      ],
  );

  const handleCoordinateSelect = (
    newCoordinate: Coordinate,
  ) => {
    setCoordinate(newCoordinate);
    setPickMode(false);
  };

  const handleMarkerDrag = (e: L.LeafletEvent) => {
    const marker = e.target as L.Marker;
    const position = marker.getLatLng();

    setCoordinate({
      latitude: position.lat,
      longitude: position.lng,
    });
  };

  const coordinateText = coordinate
    ? `${coordinate.longitude.toFixed(6)},${coordinate.latitude.toFixed(6)}`
    : '';

  const handleCopy = async () => {
    if (!coordinateText) return;

    await navigator.clipboard.writeText(coordinateText);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* HEADER */}
      <div className="absolute left-6 top-6 z-[1000] rounded-xl bg-white px-5 py-4 shadow-lg">
        <h1 className="text-lg font-bold text-gray-900">
          Monitoring Angkot
        </h1>

        <p className="text-sm text-gray-500">
          Route 1 • FORWARD
        </p>

        <div className="mt-2 text-sm text-gray-600">
          {loading
            ? 'Memuat data...'
            : `${vehicles.length} kendaraan aktif`}
        </div>
      </div>

      {/* COORDINATE PANEL */}
      <div className="absolute right-6 top-6 z-[1000] w-[320px] rounded-xl bg-white p-4 shadow-lg">
        <h2 className="mb-3 font-bold text-gray-900">
          Ambil Koordinat
        </h2>

        <button
          onClick={() => setPickMode(!pickMode)}
          className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
            pickMode
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {pickMode
            ? 'Klik Map untuk Memilih'
            : 'Ambil Koordinat'}
        </button>

        {coordinate && (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500">
                Latitude
              </p>

              <p className="font-mono text-sm text-gray-900">
                {coordinate.latitude.toFixed(6)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Longitude
              </p>

              <p className="font-mono text-sm text-gray-900">
                {coordinate.longitude.toFixed(6)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Format Lng,Lat
              </p>

              <div className="flex gap-2">
                <input
                  readOnly
                  value={coordinateText}
                  className="min-w-0 flex-1 rounded-lg border bg-gray-50 px-3 py-2 font-mono text-sm text-gray-900 outline-none"
                />

                <button
                  onClick={handleCopy}
                  className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Copy
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Marker dapat di-drag untuk mengubah posisi.
            </p>
          </div>
        )}
      </div>

      {/* MAP */}
      <MapContainer
        center={[-7.95, 112.61]}
        zoom={14}
        scrollWheelZoom
        className="h-screen w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* CLICK MAP */}
        <MapClickHandler
          enabled={pickMode}
          onSelect={handleCoordinateSelect}
        />

        {/* ROUTE */}
        {polyline.length > 1 && (
          <Polyline
            positions={polyline}
            pathOptions={{
              color: '#2563eb',
              weight: 5,
              opacity: 0.8,
            }}
          />
        )}

        {/* SELECTED COORDINATE */}
        {coordinate && (
          <Marker
            position={[
              coordinate.latitude,
              coordinate.longitude,
            ]}
            icon={coordinateIcon}
            draggable
            eventHandlers={{
              dragend: handleMarkerDrag,
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <h2 className="mb-2 font-bold">
                  Koordinat Terpilih
                </h2>

                <p className="text-sm">
                  Lat: {coordinate.latitude.toFixed(6)}
                </p>

                <p className="text-sm">
                  Lng: {coordinate.longitude.toFixed(6)}
                </p>

                <p className="mt-2 font-mono text-sm">
                  {coordinateText}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* VEHICLES */}
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[
              vehicle.latitude,
              vehicle.longitude,
            ]}
            icon={vehicleIcon}
          >
            <Popup>
              <div className="min-w-[180px]">
                <h2 className="mb-2 font-bold text-gray-900">
                  🚌 Angkot #
                  {vehicle.vehicleAssignment.vehicleId}
                </h2>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    Driver: #
                    {vehicle.vehicleAssignment.driverId}
                  </p>

                  <p>
                    Route: #
                    {vehicle.vehicleAssignment.routeId}
                  </p>

                  <p>
                    Arah:{' '}
                    {vehicle.vehicleAssignment.direction}
                  </p>

                  <p>
                    Penumpang:{' '}
                    {
                      vehicle.vehicleAssignment
                        .currentPassengers
                    }
                  </p>

                  <p>
                    Status: {vehicle.stopStatus}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </main>
  );
}