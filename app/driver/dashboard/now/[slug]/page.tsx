"use client";

import { useAssignmentDetail } from "./hooks/useAssignmentDetail";
import { AssignmentStatus } from "@/types/vehicles/vehicle-assignments.type";

import { DetailHeader } from "@/components/common/DetailHeader";
import { DetailLoading } from "@/components/common/DetaiLoading";
import ErrorAlert from "@/components/common/ErrorAlert";
import { AssignmentStatusCard } from "@/components/common/AssignmentStatusCard";
import { UpdateStatusModal } from "@/components/now/UpdateStatusModal";
import { PaymentMonitor } from "@/components/driver/now/PaymentMonitor";
import { DriverSeatControl } from "@/components/driver/now/DriverSeatControl";
import { DriverQuickActions } from "@/components/driver/now/DriverQuickActions";
import { LiveMapSection } from "@/components/driver/now/LiveMapSection";
import { RouteStopInfoBar } from "@/components/driver/now/RouteStopInfoBar";
import { LocationErrorToast } from "@/components/driver/now/LocationErrorToast";
import { RouteStopLocationModal } from "@/components/driver/now/RouteStopLocationModal";
import GpsPermissionModal from "@/components/search-routev2/skenario1/GpsPermissionModal";

export default function AssignmentDetailPage() {
  const {
    user,
    assignmentId,
    assignmentDetail,
    hasValidAssignmentId,
    routePaths,
    routeStops,
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

  return (
    <div className="relative min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden">
      <div className="mx-auto w-full max-w-300 space-y-4 sm:space-y-6 p-3 sm:p-6 lg:p-8">
        <DetailHeader
          user={user}
          title="Detail Penugasan Kendaraan"
          description="Informasi lengkap rute perjalanan, armada, personel, dan estimasi waktu halte."
        />

        {detailLoading && <DetailLoading />}

        {detailError && !detailLoading && <ErrorAlert message={detailError} />}

        {!detailLoading && !detailError && !hasValidAssignmentId && (
          <ErrorAlert message="ID penugasan tidak valid." />
        )}

        {!detailLoading && !detailError && assignmentDetail && (
          <div className="space-y-4 sm:space-y-6">
            {/* Card Status Mencolok */}
            <AssignmentStatusCard
              status={assignmentDetail.status}
              onOpenModal={actions.openStatusModal}
            />

            <PaymentMonitor
              payments={payments}
              summary={paymentSummary}
              loading={paymentsLoading}
              error={paymentsError}
              connected={paymentRealtimeStatus.connected}
              joined={paymentRealtimeStatus.joined}
            />

            {/* Seat control for driver (driver is not conductor) */}
            <DriverSeatControl
              assignmentDetail={assignmentDetail}
              onUpdate={actions.updatePassengers}
              isUpdating={isUpdatingStatus}
            />

            <DriverQuickActions
              onSelectLocation={actions.openLocationModal}
              isSubmitting={isUpdatingLocation}
              hasRouteStops={routeStops.length > 0}
            />

            {assignmentDetail.status === AssignmentStatus.ONGOING && (
              <LiveMapSection
                routePaths={routePaths}
                routeStops={routeStops}
                displayedVehicleLocation={displayedVehicleLocation}
                locationSource={locationSource}
                locationSourceLabel={locationSourceLabel}
                activeUserLocations={activeUserLocations}
                currentPassengers={assignmentDetail.currentPassengers}
                capacity={assignmentDetail.vehicle?.capacity ?? 8}
                routeName={assignmentDetail.route?.routeName}
                assignmentId={assignmentId}
                vehicleSocketStatus={vehicleSocketStatus}
                userSocketStatus={userSocketStatus}
              />
            )}

            <RouteStopInfoBar
              stopCount={routeStops.length}
              direction={assignmentDetail.direction}
            />
          </div>
        )}
      </div>

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
