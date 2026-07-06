"use client";

import { useState, useEffect } from "react";
import {
  // Components
  PageHeader,
  LocationForm,
  RouteList,
  TrackingPanel,
  MapPanel,
  GPSPermissionModal,
  // Hooks
  useMapCamera,
  useGPS,
  // Types & data
  Step,
  Location,
  Route,
  Vehicle,
  TrackingData,
  ROUTES,
  VEHICLES,
  DUMMY_TRACKING_VEHICLE,
} from "@/components/search-route";

export default function SearchRoutePage() {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  // ── Mount guard (SSR) ──────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ── Map camera ────────────────────────────────────────────────────────────
  const { mapRef, viewState, setViewState, flyTo, fitBounds } = useMapCamera();

  // ── Location state ────────────────────────────────────────────────────────
  const [originLocation, setOriginLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [originCoords, setOriginCoords] = useState<Location | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Location | null>(null);

  // ── Flow state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(1);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [showGPSModal, setShowGPSModal] = useState(false);

  // ── GPS hook ──────────────────────────────────────────────────────────────
  const { getLocation, loadingGPS } = useGPS({
    onSuccess: ({ lat, lng }) => {
      setOriginCoords({ lat, lng });
      setOriginLocation("Lokasi Saat Ini (GPS)");
      setShowGPSModal(false);
      flyTo(lat, lng, 16);
    },
    onPermissionDenied: () => setShowGPSModal(true),
    onError: (msg) => alert(msg),
  });

  // Try GPS on mount
  useEffect(() => {
    if (mounted) getLocation();
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mapbox search handlers ────────────────────────────────────────────────
  const handleOriginRetrieve = (res: any) => {
    if (!res?.features?.length) return;
    const { coordinates } = res.features[0].geometry;
    const name =
      res.features[0].properties.full_address ||
      res.features[0].properties.name;
    setOriginCoords({ lat: coordinates[1], lng: coordinates[0] });
    setOriginLocation(name);
    flyTo(coordinates[1], coordinates[0], 15);
  };

  const handleDestinationRetrieve = (res: any) => {
    if (!res?.features?.length) return;
    const { coordinates } = res.features[0].geometry;
    const name =
      res.features[0].properties.full_address ||
      res.features[0].properties.name;
    setDestinationCoords({ lat: coordinates[1], lng: coordinates[0] });
    setDestinationLocation(name);
    flyTo(coordinates[1], coordinates[0], 15);
  };

  const handleSwapLocations = () => {
    setOriginLocation(destinationLocation);
    setDestinationLocation(originLocation);
    setOriginCoords(destinationCoords);
    setDestinationCoords(originCoords);
  };

  // ── Flow handlers ─────────────────────────────────────────────────────────
  const handleFindRoute = () => {
    if (!originCoords || !destinationCoords) return;
    setStep(2);
    fitBounds([originCoords, destinationCoords]);
  };

  const handleSelectRoute = (route: Route) => {
    const vehicle =
      VEHICLES.find((v) => v.routeId === route.id) ?? VEHICLES[0];

    const tracking: TrackingData = {
      passenger: originCoords ?? { lat: -7.9526, lng: 112.6142 },
      destination: destinationCoords ?? { lat: -7.9218, lng: 112.5965 },
      vehicle: {
        id: vehicle.id,
        lat: DUMMY_TRACKING_VEHICLE.lat,
        lng: DUMMY_TRACKING_VEHICLE.lng,
      },
    };

    setSelectedRoute(route);
    setSelectedVehicle(vehicle);
    setTrackingData(tracking);
    setStep(3);

    fitBounds([
      tracking.passenger,
      { lat: tracking.vehicle.lat, lng: tracking.vehicle.lng },
      tracking.destination,
    ]);
  };

  const handleRefreshTracking = () => {
    alert(
      "Demo: Tracking akan diperbarui otomatis via WebSocket di production."
    );
  };

  // ── Auto fit when entering step 3 ─────────────────────────────────────────
  useEffect(() => {
    if (step === 3 && trackingData) {
      fitBounds([
        trackingData.passenger,
        { lat: trackingData.vehicle.lat, lng: trackingData.vehicle.lng },
        trackingData.destination,
      ]);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-[100dvh] bg-slate-50 pt-24 pb-16 relative">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">

        {/* Page header with step indicator */}
        <PageHeader step={step} />

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── LEFT PANEL ── */}
          <div
            className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border"
            style={{ borderColor: "#e2e8f0" }}
          >
            {step === 1 && (
              <LocationForm
                mapboxToken={MAPBOX_TOKEN}
                originLocation={originLocation}
                destinationLocation={destinationLocation}
                originCoords={originCoords}
                destinationCoords={destinationCoords}
                loadingGPS={loadingGPS}
                onOriginRetrieve={handleOriginRetrieve}
                onDestinationRetrieve={handleDestinationRetrieve}
                onGetGPS={getLocation}
                onSwapLocations={handleSwapLocations}
                onFindRoute={handleFindRoute}
              />
            )}

            {step === 2 && (
              <RouteList
                routes={ROUTES}
                vehicles={VEHICLES}
                onSelectRoute={handleSelectRoute}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 &&
              selectedRoute &&
              selectedVehicle &&
              trackingData && (
                <TrackingPanel
                  route={selectedRoute}
                  vehicle={selectedVehicle}
                  trackingData={trackingData}
                  onBack={() => setStep(2)}
                  onRefresh={handleRefreshTracking}
                />
              )}
          </div>

          {/* ── RIGHT PANEL: MAP ── */}
          <div className="lg:col-span-3">
            <MapPanel
              mapboxToken={MAPBOX_TOKEN}
              viewState={viewState}
              onViewStateChange={setViewState}
              mapRef={mapRef}
              step={step}
              originCoords={originCoords}
              destinationCoords={destinationCoords}
              trackingData={trackingData}
            />

            {/* Map footer note */}
            <p className="text-center text-xs mt-3" style={{ color: "#94a3b8" }}>
              Powered by AngkotGo · Data dummy untuk demo — siap dihubungkan ke
              backend &amp; WebSocket
            </p>
          </div>
        </div>
      </div>

      {/* GPS permission modal */}
      {showGPSModal && (
        <GPSPermissionModal
          onClose={() => setShowGPSModal(false)}
          onRetry={getLocation}
        />
      )}

      {/* Global styles for Mapbox Search component */}
      <style jsx global>{`
        .style-mapbox-search .mapboxgl-ctrl-geocoder,
        .style-mapbox-search input {
          width: 100% !important;
          border-radius: 9999px !important;
          border: 1px solid #e2e8f0 !important;
          padding: 11px 20px !important;
          font-size: 14px !important;
          box-shadow: none !important;
          font-family: inherit !important;
        }
        .style-mapbox-search input:focus {
          border-color: #2563eb !important;
          outline: none !important;
          box-shadow: 0 0 0 3px #eff6ff !important;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 99px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </main>
  );
}
