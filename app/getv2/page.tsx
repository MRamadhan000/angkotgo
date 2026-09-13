"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FiMapPin, FiNavigation } from "react-icons/fi";

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
import { useSinyalDetailByUser } from "@/hooks/sinyal/useSinyal";
import { buildSyntheticUpcomingVehicles } from "./getv2.util";

import type { SelectedRoute } from "./types";
import RestoringOverlay from "@/components/search-routev2/RestoringOverlay";
import TopBar from "@/components/search-routev2/TopBar";
import AlertRoute from "@/components/search-routev2/AlertRoute";

type RouteAlertState = {
  message: string;
  onSubmit: () => void;
  resolve: (confirmed: boolean) => void;
} | null;

export default function CariRuteAngkot() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const isDevelopment = true;

  // ─── URL params: sinyalId & userId (support berbagai variant nama) ───
  const urlSinyalId =
    searchParams.get("sinyalId") ??
    searchParams.get("sinyalid") ??
    searchParams.get("sinyal_id") ??
    searchParams.get("id");
  const urlUserId =
    searchParams.get("userId") ?? searchParams.get("userid");

  // ─── Scenario & selected route ───
  const [scenario, setScenario] = useState<1 | 2>(1);
  const [selectedRoute, setSelectedRoute] = useState<SelectedRoute | null>(null);
  const [routeAlert, setRouteAlert] = useState<RouteAlertState>(null);

  const showRouteAlert = (message: string, onSubmit = () => {}) =>
    new Promise<boolean>((resolve) => {
      setRouteAlert({ message, onSubmit, resolve });
    });

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
    showAlert: showRouteAlert,
  });

  // ─── Sinyal history: fetch berdasarkan sinyalId + userId dari URL ───
  const {
    data: sinyalHistory,
    isLoading: isSinyalLoading,
    isSuccess: isSinyalSuccess,
    isError: isSinyalError,
  } = useSinyalDetailByUser(urlSinyalId, urlUserId);

  // Restore state saat fetch sinyal history berhasil
  useEffect(() => {
    if (!isSinyalSuccess || !sinyalHistory) return;

    const routeId = sinyalHistory.routeId;
    const direction = sinyalHistory.direction as DirectionType;

    if (!routeId || !direction) return;

    // [1] Isi lokasi
    location.setOrigin(sinyalHistory.sourceName ?? "");
    location.setDestination(sinyalHistory.destName ?? "");
    location.setOriginCoords({
      lat: sinyalHistory.latitude,
      lng: sinyalHistory.longitude,
    });
    location.setDestinationCoords({
      lat: sinyalHistory.targetLat ?? sinyalHistory.latitude,
      lng: sinyalHistory.targetLng ?? sinyalHistory.longitude,
    });
    gps.setShowGpsModal(false);

    // [2] Fetch route path
    queryClient.fetchQuery({
      queryKey: routePathKeys.byRouteAndDirection(routeId, direction),
      queryFn: () =>
        routePathService.getRoutePathByRouteIdandDirection(routeId, direction),
    });

    // [3] Set synthetic upcoming vehicles dari details[]
    const syntheticVehicles = buildSyntheticUpcomingVehicles(sinyalHistory);
    const vehicleParams = {
      routeId,
      direction,
      latitude: sinyalHistory.latitude,
      longitude: sinyalHistory.longitude,
    };
    queryClient.setQueryData(["upcoming-vehicles", vehicleParams], syntheticVehicles);

    // [4] Transisi ke Skenario 2
    setSelectedRoute({ routeId, direction });
    setScenario(2);
  }, [isSinyalSuccess, sinyalHistory]); // eslint-disable-line react-hooks/exhaustive-deps

  // Alert langsung jika sinyal tidak valid
  useEffect(() => {
    if (!urlSinyalId || !isSinyalError) return;
    alert("Sinyal tidak valid atau tidak ditemukan.");
  }, [isSinyalError, urlSinyalId]);

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
      await showRouteAlert(validation.message ?? "Data rute belum lengkap.");
      return;
    }

    try {
      const result = await searchRoute();
      const firstRoute = result.data?.[0];

      if (!firstRoute) {
        await showRouteAlert("Rute tidak ditemukan.");
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
      await showRouteAlert("Gagal terhubung ke server.");
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
      <RestoringOverlay
        show={
          isRestoringBooking ||
          Boolean(urlSinyalId && urlUserId && isSinyalLoading)
        }
        message={
          isSinyalLoading
            ? "Memuat perjalanan Anda..."
            : "Menghubungkan kembali perjalanan Anda..."
        }
      />

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
        className="pointer-events-auto absolute inset-x-0 top-0 z-20 mx-auto flex w-full max-w-md flex-col gap-2.5 px-4 pt-3 sm:px-5 sm:pt-4"
        style={{
          opacity: bottomSheet.topSectionProgress,
          transform: `translateY(${(1 - bottomSheet.topSectionProgress) * -16}px)`,
          pointerEvents: bottomSheet.topSectionProgress < 0.4 ? "none" : "auto",
          transition: bottomSheet.isSheetTransitioning
            ? "opacity 300ms ease-out, transform 300ms ease-out"
            : "none",
        }}
      >
        {/* Top Bar Component */}
        <TopBar
          user={user}
          isAuthenticated={isAuthenticated}
          onBack={() => window.history.back()}
        />

        {/* Floating Search Card */}
        <div className="flex flex-col gap-2 rounded-3xl border border-slate-100 bg-white/95 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-xl sm:p-4">
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

              <button
                type="button"
                onClick={gps.handleResetToGPS}
                disabled={gps.isLocating}
                className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50/70 py-2 text-xs font-semibold text-[#003d9b] transition hover:bg-blue-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiNavigation
                  className={`text-xs ${gps.isLocating ? "animate-pulse" : ""}`}
                />
                <span>
                  {gps.isLocating
                    ? "Mendeteksi lokasi..."
                    : "Gunakan lokasi saya saat ini"}
                </span>
              </button>
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
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearchingRoute}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#003d9b] via-blue-600 to-blue-500 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiNavigation className="text-base rotate-45" />
              <span>{isSearchingRoute ? "Mencari Rute..." : "Cari Angkot"}</span>
            </button>
          )}
        </div>
      ) : (
        // ─── Skenario 2: Bottom sheet ───
        <div
          className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-t-[28px] border-t border-slate-100 bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl"
          style={{
            top: `${bottomSheet.sheetTop}vh`,
            transition: bottomSheet.isSheetTransitioning
              ? "top 300ms ease-out"
              : "none",
          }}
        >
          {/* Drag handle */}
          <div
            className="flex shrink-0 cursor-grab touch-none items-center justify-center pb-2 pt-3 active:cursor-grabbing"
            onPointerDown={bottomSheet.handleSheetPointerDown}
            onPointerMove={bottomSheet.handleSheetPointerMove}
            onPointerUp={bottomSheet.handleSheetPointerUp}
            onPointerCancel={bottomSheet.handleSheetPointerUp}
          >
            <div className="h-1.5 w-12 rounded-full bg-slate-300 transition hover:bg-slate-400" />
          </div>

          {/* Realtime Socket Status Bar */}
          {vehicles.upcomingAssignmentIds.length > 0 && (
            <div className="mx-4 mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-100">
              <span className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    vehicles.isVehicleSocketConnected &&
                    vehicles.joinedAssignmentIds.length >=
                      vehicles.upcomingAssignmentIds.length
                      ? "animate-pulse bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />
                Pelacakan Realtime
              </span>
              <span
                className={`font-semibold ${
                  vehicles.isVehicleSocketConnected &&
                  vehicles.joinedAssignmentIds.length >=
                    vehicles.upcomingAssignmentIds.length
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {vehicles.isVehicleSocketConnected &&
                vehicles.joinedAssignmentIds.length >=
                  vehicles.upcomingAssignmentIds.length
                  ? "Terhubung"
                  : "Menghubungkan..."}
              </span>
            </div>
          )}

          {/* Sheet content */}
          <div className="min-h-0 flex-1">
            {booking.isCreateSinyalError && (
              <p className="px-4 pb-3 text-sm text-red-600" role="alert">
                {booking.createSinyalError?.message || "Gagal mengirim sinyal."}
              </p>
            )}

            <UpcomingVehicleList
              upcomingVehicles={vehicles.realtimeUpcomingVehicles}
              onSubmit={booking.handleSendSinyal}
              onBoarded={booking.handleCompleteSinyal}
              isSubmitting={booking.isCreatingSinyal}
              isCompletingSinyal={booking.isCompletingSinyal}
              onBook={booking.handleBookVehicle}
              selectedVehicleId={booking.bookingVehicle?.assignmentId ?? null}
              realtimeVehicles={vehicles.realtimeVehicles}
              isSocketConnected={vehicles.isVehicleSocketConnected}
              joinedAssignmentIds={vehicles.joinedAssignmentIds}
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

      <AlertRoute
        isOpen={Boolean(routeAlert)}
        message={routeAlert?.message ?? ""}
        onCancel={() => {
          routeAlert?.resolve(false);
          setRouteAlert(null);
        }}
        onSubmit={() => {
          const currentAlert = routeAlert;
          setRouteAlert(null);
          currentAlert?.resolve(true);
          currentAlert?.onSubmit();
        }}
      />
    </div>
  );
}
