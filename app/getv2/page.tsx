"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FiArrowLeft, FiMapPin, FiNavigation, FiUser } from "react-icons/fi";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { DirectionType } from "@/types/vehicles/vehicle.type";
import { routePathKeys, useRoutePaths } from "@/hooks/routes/useRoutePath";
import { useRouteSearch } from "@/hooks/routes/useRouteSearch";
import { useAuth } from "@/context/AuthContext";
import { routePathService } from "@/services/routes/route-path.service";
import { getUpcomingVehicles } from "@/services/routes/route-route.service";
import { validateRouteSearch } from "@/components/search-routev2/skenario1/outeValidation";
import { quickDestinations } from "@/components/search-routev2/skenario1/data";

// UI Components
import Button from "@/components/ui/Button";
import GpsPermissionModal from "@/components/search-routev2/skenario1/GpsPermissionModal";
import QuickDestination from "@/components/search-routev2/skenario1/QuickDestination";
import LocationInput from "@/components/search-routev2/skenario1/LocationInput";
import LocationConnector from "@/components/search-routev2/skenario1/LocationConnector";
import UpcomingVehicleList from "@/components/search-routev2/skenario2/UpcomingVehicleList";
import VehicleMarkers from "@/components/search-routev2/skenario2/VehicleMarkers";
import RoutePathLine from "@/components/search-routev2/skenario2/RoutePathLine";
import LocationSummary from "@/components/search-routev2/skenario2/LocationSummary";
import { BookingPaymentModal } from "@/components/search-routev2/skenario3/BookingPaymentModal";

// Local hooks
import { useMapInitialization } from "./hooks/useMapInitialization";
import { useLocationSearch } from "./hooks/useLocationSearch";
import { useGps } from "./hooks/useGps";
import { useUpcomingVehiclesRealtime } from "./hooks/useUpcomingVehiclesRealtime";
import { useBookingState } from "./hooks/useBookingState";
import { useJourneyPersistence } from "./hooks/useJourneyPersistence";
import { useBottomSheet } from "./hooks/useBottomSheet";

import type { SelectedRoute } from "./types";

export default function CariRuteAngkot() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const isDevelopment = process.env.NODE_ENV === "development";

  // ─── Scenario & selected route ───
  const [scenario, setScenario] = useState<1 | 2>(1);
  const [selectedRoute, setSelectedRoute] = useState<SelectedRoute | null>(null);

  // ─── mapRef dideklarasikan di sini agar bisa dibagi ke map & location search ───
  const sharedMapRef = useRef<mapboxgl.Map | null>(null);

  // ─── Location search (Skenario 1) ───
  const location = useLocationSearch(sharedMapRef);

  // ─── Map init — menyuntikkan sharedMapRef ───
  const map = useMapInitialization(
    location.originCoords,
    location.destinationCoords,
    sharedMapRef,
  );

  // ─── GPS (Skenario 1) ───
  const gps = useGps({
    setOrigin: location.setOrigin,
    setOriginCoords: location.setOriginCoords,
    setPickingMode: location.setPickingMode,
    moveMapToLocation: location.moveMapToLocation,
    getPlaceName: location.getPlaceName,
  });

  // ─── Bottom sheet (Skenario 2) ───
  const bottomSheet = useBottomSheet(scenario);

  // ─── Route search ───
  const routeSearchParams =
    location.originCoords && location.destinationCoords
      ? {
          userLat: location.originCoords.lat,
          userLng: location.originCoords.lng,
          destLat: location.destinationCoords.lat,
          destLng: location.destinationCoords.lng,
        }
      : null;

  const { isFetching: isSearchingRoute, refetch: searchRoute } =
    useRouteSearch(routeSearchParams);

  // ─── Route path ───
  const { data: routePaths } = useRoutePaths(
    selectedRoute?.routeId ?? 0,
    selectedRoute?.direction ?? DirectionType.FORWARD,
  );

  // ─── Upcoming vehicles + realtime (Skenario 2) ───
  const vehicles = useUpcomingVehiclesRealtime(
    selectedRoute,
    location.originCoords,
    location.destinationCoords,
  );

  // ─── Booking & payment (Skenario 3) ───
  const booking = useBookingState({
    upcomingVehicles: vehicles.realtimeUpcomingVehicles,
    originCoords: location.originCoords,
    origin: location.origin,
    destination: location.destination,
    destinationCoords: location.destinationCoords,
    selectedRoute,
    scenario,
    pickingMode: location.pickingMode,
  });

  // ─── Journey persistence (localStorage save/restore) ───
  const { isRestoringBooking } = useJourneyPersistence(
    {
      origin: location.origin,
      destination: location.destination,
      originCoords: location.originCoords,
      destinationCoords: location.destinationCoords,
      selectedRoute,
      scenario,
      pickingMode: location.pickingMode,
      bookingVehicle: booking.bookingVehicle,
      pendingBookingVehicleId: null,
      bookingAmount: booking.bookingAmount,
      bookingType: booking.bookingType,
    },
    vehicles.realtimeUpcomingVehicles,
    {
      setOrigin: location.setOrigin,
      setDestination: location.setDestination,
      setOriginCoords: location.setOriginCoords,
      setDestinationCoords: location.setDestinationCoords,
      setSelectedRoute,
      setScenario,
      setPickingMode: location.setPickingMode,
      setBookingAmount: booking.setBookingAmount,
      setBookingType: booking.setBookingType,
      setBookingVehicle: booking.setBookingVehicle,
      setBookingResult: booking.setBookingResult,
      setShowGpsModal: gps.setShowGpsModal,
    },
  );

  // ─── Cari Angkot: transisi Skenario 1 → 2 ───
  const handleSearch = async () => {
    const validation = validateRouteSearch({
      origin: location.origin,
      destination: location.destination,
      originCoords: location.originCoords,
      destinationCoords: location.destinationCoords,
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

      const vehicleParams = {
        routeId,
        direction,
        latitude: location.originCoords!.lat,
        longitude: location.originCoords!.lng,
      };

      await queryClient.fetchQuery({
        queryKey: ["upcoming-vehicles", vehicleParams],
        queryFn: () => getUpcomingVehicles(vehicleParams),
      });

      await queryClient.fetchQuery({
        queryKey: routePathKeys.byRouteAndDirection(routeId, direction),
        queryFn: () =>
          routePathService.getRoutePathByRouteIdandDirection(routeId, direction),
      });

      setSelectedRoute({ routeId, direction });
      setScenario(2);
    } catch (error) {
      console.error("Gagal mencari rute:", error);
      alert("Gagal terhubung ke server.");
    }
  };

  // ─── Derived UI state ───
  const showCenterPicker =
    scenario === 1 &&
    ((location.pickingMode === "origin" && !location.originCoords) ||
      (location.pickingMode === "destination" && !location.destinationCoords));

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#faf8ff] text-[#191b23]">
      {/* GPS Modal */}
      <GpsPermissionModal
        open={gps.showGpsModal && !isAuthLoading && !isRestoringBooking}
        isLocating={gps.isLocating}
        onEnable={gps.handleEnableGps}
        onSkip={gps.handleSkipGps}
      />

      {/* Restoring overlay */}
      {isRestoringBooking && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xl">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            Menghubungkan kembali perjalanan Anda...
          </div>
        </div>
      )}

      {/* MAP LAYER */}
      <div className="absolute inset-0 z-0">
        <div ref={map.mapContainerRef} className="absolute inset-0 h-full w-full" />
        <RoutePathLine map={map.mapInstance} routePaths={routePaths ?? []} />
        <VehicleMarkers map={map.mapInstance} vehicles={vehicles.realtimeUpcomingVehicles} />
      </div>

      {/* CENTER PICKER */}
      {showCenterPicker && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-xl ${
              location.pickingMode === "origin" ? "bg-blue-600" : "bg-rose-600"
            }`}
          >
            <FiMapPin className="text-xl text-white" />
          </div>
          <div className="mx-auto -mt-0.5 h-2 w-2 rounded-full bg-black/30 blur-[2px]" />
        </div>
      )}

      {/* TOP SECTION */}
      <div
        className="pointer-events-auto absolute inset-x-0 top-0 z-20 mx-auto flex w-full max-w-md flex-col gap-3 px-4 pt-4 sm:px-5 sm:pt-6"
        style={{
          opacity: bottomSheet.topSectionProgress,
          transform: `translateY(${(1 - bottomSheet.topSectionProgress) * -16}px)`,
          pointerEvents: bottomSheet.topSectionProgress < 0.4 ? "none" : "auto",
          transition: bottomSheet.isSheetTransitioning
            ? "opacity 300ms ease-out, transform 300ms ease-out"
            : "none",
        }}
      >
        {/* Header */}
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

          {isAuthenticated && user ? (
            <div className="flex max-w-32 items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 sm:max-w-40 sm:px-3 sm:text-sm">
              <FiUser className="shrink-0" aria-hidden="true" />
              <span className="truncate">{user.name}</span>
            </div>
          ) : (
            <div className="w-9 sm:w-10" />
          )}
        </div>

        {/* Search Card */}
        <div className="flex flex-col gap-2 rounded-[20px] border border-[#c3c6d6]/30 bg-[#faf8ff]/95 p-3.5 shadow-lg backdrop-blur-md sm:rounded-3xl sm:p-4">
          {scenario === 1 ? (
            // ─── Skenario 1: Input lokasi ───
            <>
              <LocationInput
                type="origin"
                value={location.origin}
                suggestions={location.originSuggestions}
                isActive={location.activeInput === "origin"}
                isLoading={
                  location.searchLoading === "origin" ||
                  location.searchLoading === "retrieve-origin"
                }
                onChange={location.handleOriginChange}
                onFocus={() => {
                  location.setActiveInput("origin");
                  location.setPickingMode("origin");
                }}
                onClear={location.handleClearOrigin}
                onSelectSuggestion={(item) =>
                  location.handleSelectSuggestion(item, "origin")
                }
              />

              <LocationConnector />

              <LocationInput
                type="destination"
                value={location.destination}
                suggestions={location.destinationSuggestions}
                isActive={location.activeInput === "destination"}
                isLoading={
                  location.searchLoading === "destination" ||
                  location.searchLoading === "retrieve-destination"
                }
                onChange={location.handleDestinationChange}
                onFocus={() => {
                  location.setActiveInput("destination");
                  location.setPickingMode("destination");
                }}
                onClear={location.handleClearDestination}
                onSelectSuggestion={(item) =>
                  location.handleSelectSuggestion(item, "destination")
                }
              />

              <QuickDestination
                items={quickDestinations}
                onSelect={location.handleQuickDestination}
              />

              <Button
                variant="textAction"
                size="sm"
                onClick={gps.handleResetToGPS}
                isLoading={gps.isLocating}
                loadingText="Mendeteksi lokasi..."
                icon={
                  <FiNavigation className={gps.isLocating ? "animate-pulse" : ""} />
                }
              >
                Gunakan lokasi saya saat ini
              </Button>
            </>
          ) : (
            // ─── Skenario 2: Ringkasan lokasi ───
            <LocationSummary
              origin={location.origin}
              destination={location.destination}
              onEdit={() => {
                setScenario(1);
                setSelectedRoute(null);
              }}
            />
          )}
        </div>
      </div>

      {/* BOTTOM AREA */}
      {scenario === 1 ? (
        // ─── Skenario 1: Map action buttons ───
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md space-y-2 px-4 pb-4 sm:px-5">
          <Button
            variant="mapAction"
            size="md"
            icon={<FiMapPin />}
            onClick={() =>
              location.handleConfirmMapLocation(location.pickingMode, sharedMapRef)
            }
            disabled={
              !showCenterPicker ||
              location.searchLoading === "retrieve-origin" ||
              location.searchLoading === "retrieve-destination"
            }
            isLoading={
              location.searchLoading === "retrieve-origin" ||
              location.searchLoading === "retrieve-destination"
            }
            loadingText="Mengambil lokasi..."
          >
            {location.pickingMode === "origin"
              ? "Tetapkan Titik Penjemputan"
              : "Tetapkan Titik Tujuan"}
          </Button>

          {location.originCoords && location.destinationCoords && (
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
        // ─── Skenario 2: Bottom sheet ───
        <div
          className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-[#faf8ff]/95 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] backdrop-blur-md"
          style={{
            top: `${bottomSheet.sheetTop}vh`,
            transition: bottomSheet.isSheetTransitioning
              ? "top 300ms ease-out"
              : "none",
          }}
        >
          {/* Drag handle */}
          <div
            className="flex shrink-0 cursor-grab touch-none items-center justify-center py-2.5 active:cursor-grabbing"
            onPointerDown={bottomSheet.handleSheetPointerDown}
            onPointerMove={bottomSheet.handleSheetPointerMove}
            onPointerUp={bottomSheet.handleSheetPointerUp}
            onPointerCancel={bottomSheet.handleSheetPointerUp}
          >
            <div className="h-1.5 w-10 rounded-full bg-[#c3c6d6]" />
          </div>

          {/* Sheet content */}
          <div className="min-h-0 flex-1">
            {vehicles.upcomingAssignmentIds.length > 0 && (
              <div className="flex items-center justify-between px-4 pb-2 text-[11px] font-medium">
                <span className="text-slate-500">Status kendaraan realtime</span>
                <span
                  className={
                    vehicles.isVehicleSocketConnected &&
                    vehicles.joinedAssignmentIds.length >=
                      vehicles.upcomingAssignmentIds.length
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }
                >
                  {vehicles.isVehicleSocketConnected &&
                  vehicles.joinedAssignmentIds.length >=
                    vehicles.upcomingAssignmentIds.length
                    ? "Terhubung"
                    : "Menghubungkan..."}
                </span>
              </div>
            )}

            {booking.isCreateSinyalError && (
              <p className="px-4 pb-3 text-sm text-red-600" role="alert">
                {booking.createSinyalError?.message || "Gagal mengirim sinyal."}
              </p>
            )}

            <UpcomingVehicleList
              upcomingVehicles={vehicles.realtimeUpcomingVehicles}
              onSubmit={booking.handleSendSinyal}
              isSubmitting={booking.isCreatingSinyal}
              onBook={booking.handleBookVehicle}
              selectedVehicleId={booking.bookingVehicle?.assignmentId ?? null}
            />
          </div>
        </div>
      )}

      {/* ─── Skenario 3: Booking Modal ─── */}
      {booking.bookingVehicle && (
        <BookingPaymentModal
          vehicle={booking.bookingVehicle}
          amount={booking.bookingAmount}
          paymentType={booking.bookingType}
          result={booking.bookingResult}
          error={booking.bookingPayments.error}
          isSubmitting={booking.bookingPayments.creating}
          isMarkingSucceeded={booking.bookingPayments.markingSucceeded}
          isDevelopment={isDevelopment}
          onMarkAsSucceeded={booking.handleMarkAsSucceeded}
          onAmountChange={booking.setBookingAmount}
          onPaymentTypeChange={booking.setBookingType}
          onSubmit={booking.handleCreateBookingPayment}
          onClose={() => {
            booking.setBookingVehicle(null);
            booking.setBookingResult(null);
          }}
        />
      )}
    </div>
  );
}
