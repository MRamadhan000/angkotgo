"use client";

import { useState } from "react";
import { DetailLoading } from "@/components/common/DetaiLoading";
import ErrorAlert from "@/components/common/ErrorAlert";
import { UpdateStatusModal } from "@/components/now/UpdateStatusModal";
import { LiveMapSection } from "@/components/driver/now/LiveMapSection";
import { DriverFloatingTopBar } from "@/components/driver/now/DriverFloatingTopBar";
import { DriverMapOverlayControls } from "@/components/driver/now/DriverMapOverlayControls";
import { DriverBottomSheet } from "@/components/driver/now/DriverBottomSheet";
import { LocationErrorToast } from "@/components/driver/now/LocationErrorToast";
import { RouteStopLocationModal } from "@/components/driver/now/RouteStopLocationModal";
import GpsPermissionModal from "@/components/search-routev2/skenario1/GpsPermissionModal";
import { useAssignmentDetail } from "@/app/driver/dashboard/now/[slug]/hooks/useAssignmentDetail";

export default function AssignmentDetailPage() {
  const {
    assignmentId,
    assignmentDetail,
    hasValidAssignmentId,
    routePaths,
    routeStops,
    stopIntervals,
    detailLoading,
    detailError,
    payments,
    paymentSummary,
    paymentsLoading,
    paymentsError,
    paymentRealtimeStatus,
    displayedVehicleLocation,
    locationSource,
    locationSourceLabel,
    activeUserLocations,
    locationError,
    gpsState,
    vehicleSocketStatus,
    userSocketStatus,
    isStatusModalOpen,
    selectedStatus,
    isLocationModalOpen,
    isUpdatingStatus,
    isUpdatingLocation,
    actions,
  } = useAssignmentDetail();

  // Floating map state
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900 select-none">
      {/* ─── LAYER 1: FULLSCREEN MAP BACKGROUND ─── */}
      <LiveMapSection
        isFullscreen
        routePaths={routePaths}
        routeStops={routeStops}
        displayedVehicleLocation={displayedVehicleLocation}
        locationSource={locationSource}
        locationSourceLabel={locationSourceLabel}
        activeUserLocations={activeUserLocations}
        currentPassengers={assignmentDetail?.currentPassengers ?? 0}
        capacity={assignmentDetail?.vehicle?.capacity ?? 8}
        routeName={assignmentDetail?.route?.routeName}
        assignmentId={assignmentId}
        vehicleSocketStatus={vehicleSocketStatus}
        userSocketStatus={userSocketStatus}
        recenterTrigger={recenterTrigger}
        showDebugPanel={showDebugPanel}
      />

      {/* ─── LOADING & ERROR OVERLAYS ─── */}
      {detailLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <DetailLoading />
        </div>
      )}

      {detailError && !detailLoading && (
        <div className="absolute inset-x-4 top-20 z-40 mx-auto max-w-md">
          <ErrorAlert message={detailError} />
        </div>
      )}

      {!detailLoading && !detailError && !hasValidAssignmentId && (
        <div className="absolute inset-x-4 top-20 z-40 mx-auto max-w-md">
          <ErrorAlert message="ID penugasan tidak valid." />
        </div>
      )}

      {/* ─── LAYER 2: FLOATING TOP STATUS BAR (GOJEK STYLE) ─── */}
      {!detailLoading && assignmentDetail && (
        <DriverFloatingTopBar
          routeName={assignmentDetail.route?.routeName}
          routeCode={assignmentDetail.route?.routeCode}
          plateNumber={assignmentDetail.vehicle?.plateNumber}
          direction={assignmentDetail.direction}
          vehicleSocketStatus={vehicleSocketStatus}
          userSocketStatus={userSocketStatus}
          onRefreshGps={actions.enableGps}
        />
      )}

      {/* ─── LAYER 3: FLOATING MAP CONTROLS (RE-CENTER & HALTE) ─── */}
      {!detailLoading && assignmentDetail && (
        <DriverMapOverlayControls
          onRecenter={() => setRecenterTrigger((t) => t + 1)}
          onOpenLocationModal={actions.openLocationModal}
          onToggleDebug={() => setShowDebugPanel((s) => !s)}
          isDebugOpen={showDebugPanel}
          hasLocation={Boolean(displayedVehicleLocation)}
        />
      )}

      {/* ─── LAYER 4: BOTTOM SHEET COCKPIT WITH PINTASAN TABS ─── */}
      {!detailLoading && assignmentDetail && (
        <DriverBottomSheet
          assignmentDetail={assignmentDetail}
          isUpdatingStatus={isUpdatingStatus}
          onUpdatePassengers={actions.updatePassengers}
          onOpenStatusModal={actions.openStatusModal}
          onOpenLocationModal={actions.openLocationModal}
          isUpdatingLocation={isUpdatingLocation}
          routeStops={routeStops}
          stopIntervals={stopIntervals}
          payments={payments}
          paymentSummary={paymentSummary}
          paymentsLoading={paymentsLoading}
          paymentsError={paymentsError}
          paymentRealtimeStatus={paymentRealtimeStatus}
        />
      )}

      {/* ─── LAYER 5: TOASTS & MODALS ─── */}
      <LocationErrorToast message={locationError} />

      <RouteStopLocationModal
        isOpen={isLocationModalOpen}
        routeStops={routeStops}
        isSubmitting={isUpdatingLocation}
        onClose={actions.closeLocationModal}
        onSelect={actions.createVehicleLocation}
      />

      <GpsPermissionModal
        open={hasValidAssignmentId && gpsState.showModal}
        isLocating={gpsState.isLocating}
        onEnable={actions.enableGps}
        onSkip={() => undefined}
        hideSkip
      />

      <UpdateStatusModal
        isOpen={isStatusModalOpen}
        onClose={actions.closeStatusModal}
        selectedStatus={selectedStatus}
        onStatusChange={actions.setSelectedStatus}
        onSave={actions.updateStatus}
        isUpdating={isUpdatingStatus}
      />
    </div>
  );
}
