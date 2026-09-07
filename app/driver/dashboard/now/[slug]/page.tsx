"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import {
  useUpdateVehicleAssignmentv2,
  useVehicleAssignmentv2,
} from "@/hooks/vehicles/useVehicleAssignments2";
import {
  useCreateVehicleLocation,
  useVehicleLocations,
} from "@/hooks/vehicles/useVehicleLocation";
import { useVehicleSocket } from "@/hooks/vehicles/useVehicleSocket";
import { useActiveSinyal } from "@/hooks/sinyal/useSinyal";
import { useSinyalRealtime } from "@/hooks/sinyal/useSinyalSocket";
import { useRoutePaths } from "@/hooks/routes/useRoutePath";
import { useRouteStops } from "@/hooks/routes/useRouteStops";
import { usePayments } from "@/hooks/payments/usePayments";
import { usePaymentSocket } from "@/hooks/payments/usePaymentSocket";

import {
  AssignmentStatus,
  VehicleAssignment,
} from "@/types/vehicles/vehicle-assignments.type";
import { RouteStopType } from "@/types/routes/route-stop.type";

import { getCurrentLocation } from "@/components/search-routev2/skenario1/geolocation";

import { DetailHeader } from "@/components/common/DetailHeader";
import { DetailLoading } from "@/components/common/DetaiLoading";
import ErrorAlert from "@/components/common/ErrorAlert";
import { AssignmentStatusCard } from "@/components/common/AssignmentStatusCard";
import { UpdateStatusModal } from "@/components/now/UpdateStatusModal";
import { SeatGridControl } from "@/components/now/SeatGridControl";
import { PaymentMonitor } from "@/components/driver/now/PaymentMonitor";
import { DebugLocationPanel } from "@/components/driver/now/DebugLocationPanel";
import { RouteStopLocationModal } from "@/components/driver/now/RouteStopLocationModal";
import GpsPermissionModal from "@/components/search-routev2/skenario1/GpsPermissionModal";
import DriverMap from "../../DriverMap";

export default function AssignmentDetailPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const assignmentId = Number(Array.isArray(rawSlug) ? rawSlug[0] : rawSlug);
  const hasValidAssignmentId =
    Number.isInteger(assignmentId) && assignmentId > 0;

  const { user } = useAuth();

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("SCHEDULED");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [showGpsModal, setShowGpsModal] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsPermissionGranted, setGpsPermissionGranted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gpsLocation, setGpsLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedVehicleLocation, setSelectedVehicleLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const {
    data: assignmentDetail,
    isLoading: detailLoading,
    error: assignmentError,
  } = useVehicleAssignmentv2(assignmentId);
  const updateAssignment = useUpdateVehicleAssignmentv2();
  const { data: vehicleLocations = [] } = useVehicleLocations(
    hasValidAssignmentId ? assignmentId : undefined,
  );
  const createVehicleLocation = useCreateVehicleLocation();
  const {
    payments,
    summary,
    loading: paymentsLoading,
    error: paymentsError,
    upsertPayment,
  } = usePayments(hasValidAssignmentId ? assignmentId : null);
  const paymentRealtime = usePaymentSocket(
    hasValidAssignmentId ? assignmentId : null,
  );
  const {
    data: vehicleRealtime,
    connected: vehicleSocketConnected,
    joined: vehicleSocketJoined,
  } = useVehicleSocket(hasValidAssignmentId ? assignmentId : null);
  const assignmentKey = hasValidAssignmentId ? String(assignmentId) : "";
  const { data: activeUserSignals = [] } = useActiveSinyal(assignmentKey);
  const {
    data: userRealtime,
    connected: userSocketConnected,
    joined: userSocketJoined,
  } = useSinyalRealtime(hasValidAssignmentId ? assignmentKey : null);
  const direction = assignmentDetail?.direction;
  const routeId = assignmentDetail?.routeId ?? 0;
  const { data: routePaths = [] } = useRoutePaths(routeId, direction!);
  const { data: routeStops = [] } = useRouteStops(routeId, direction!);
  const detailError = assignmentError?.message ?? null;
  const latestVehicleLocation = useMemo(
    () =>
      [...vehicleLocations].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0] ?? null,
    [vehicleLocations],
  );
  const activeUserLocations = useMemo(() => {
    const locations = activeUserSignals
      .filter(
        (signal) =>
          signal.status === "ACTIVE" &&
          (String(signal.vehicleAssignmentId) === assignmentKey ||
            signal.details.some(
              (detail) => String(detail.vehicleAssignmentId) === assignmentKey,
            )),
      )
      .map((signal) => ({
        id: signal.id,
        latitude: Number(signal.latitude),
        longitude: Number(signal.longitude),
        status: "ACTIVE" as const,
      }));

    if (
      userRealtime?.status === "ACTIVE" &&
      String(userRealtime.vehicleAssignmentId) === assignmentKey
    ) {
      const realtimeLocation = {
        id: userRealtime.sinyalId,
        latitude: Number(userRealtime.latitude),
        longitude: Number(userRealtime.longitude),
        status: "ACTIVE" as const,
      };
      const existingIndex = locations.findIndex(
        (location) => location.id === realtimeLocation.id,
      );

      if (existingIndex >= 0) locations[existingIndex] = realtimeLocation;
      else locations.push(realtimeLocation);
    }

    return locations.filter(
      (location) =>
        Number.isFinite(location.latitude) &&
        Number.isFinite(location.longitude),
    );
  }, [activeUserSignals, assignmentKey, userRealtime]);
  const vehicleLocation = vehicleRealtime
    ? {
        latitude: Number(vehicleRealtime.latitude),
        longitude: Number(vehicleRealtime.longitude),
      }
    : latestVehicleLocation
      ? {
          latitude: Number(latestVehicleLocation.latitude),
          longitude: Number(latestVehicleLocation.longitude),
        }
      : null;
  const displayedVehicleLocation =
    selectedVehicleLocation ?? gpsLocation ?? vehicleLocation;

  useEffect(() => {
    if (paymentRealtime.payment) {
      upsertPayment(paymentRealtime.payment);
    }
  }, [paymentRealtime.payment, upsertPayment]);

  useEffect(() => {
    if (
      !hasValidAssignmentId ||
      !gpsPermissionGranted ||
      !navigator.geolocation
    ) {
      return;
    }

    let isMounted = true;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!isMounted || selectedVehicleLocation) return;
        setGpsLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (isMounted && error.code !== 1) {
          setLocationError(
            "Lokasi GPS belum tersedia. Posisi socket/manual tetap dapat digunakan.",
          );
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => {
      isMounted = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [gpsPermissionGranted, hasValidAssignmentId, selectedVehicleLocation]);

  const handleEnableGps = async () => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const location = await getCurrentLocation();
      setGpsLocation(location);
      setGpsPermissionGranted(true);
      setShowGpsModal(false);
    } catch (error) {
      setLocationError(
        error instanceof GeolocationPositionError && error.code === 1
          ? "Akses GPS wajib diizinkan untuk menampilkan posisi awal driver."
          : "Lokasi GPS belum tersedia. Coba aktifkan GPS lalu ulangi.",
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!assignmentDetail || !hasValidAssignmentId) return;
    try {
      await updateAssignment.mutateAsync({
        id: assignmentId,
        data: { status: selectedStatus as AssignmentStatus },
      });
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error("Gagal mengubah status:", error);
    }
  };

  const handleCreateVehicleLocation = async (stop: RouteStopType) => {
    if (!hasValidAssignmentId) return;

    setLocationError(null);
    try {
      await createVehicleLocation.mutateAsync({
        vehicleAssignmentId: assignmentId,
        latitude: Number(stop.latitude),
        longitude: Number(stop.longitude),
        currentStopId: stop.id,
      });
      setSelectedVehicleLocation({
        latitude: Number(stop.latitude),
        longitude: Number(stop.longitude),
      });
      setIsLocationModalOpen(false);
    } catch (error) {
      setLocationError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan posisi kendaraan.",
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden">
      <div className="mx-auto w-full max-w-300 space-y-3 sm:space-y-6 p-2.5 sm:p-6 lg:p-8">
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
          <div className="space-y-3 sm:space-y-6">
            {/* Card Status Mencolok */}
            <AssignmentStatusCard
              status={assignmentDetail.status}
              onOpenModal={() => setIsStatusModalOpen(true)}
            />

            <PaymentMonitor
              payments={payments}
              summary={summary}
              loading={paymentsLoading}
              error={paymentsError}
              connected={paymentRealtime.connected}
              joined={paymentRealtime.joined}
            />

            {/* Seat control for driver (driver is not conductor) */}
            <div>
              <DriverSeatControl
                assignmentDetail={assignmentDetail}
                onUpdate={(currentPassengers) =>
                  updateAssignment.mutateAsync({
                    id: assignmentId,
                    data: { currentPassengers },
                  })
                }
                isUpdating={updateAssignment.isPending}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                createVehicleLocation.isPending || routeStops.length === 0
              }
            >
              {createVehicleLocation.isPending
                ? "Menyimpan posisi..."
                : "Pilih posisi kendaraan"}
            </button>

            {assignmentDetail.status === AssignmentStatus.ONGOING && (
              <div className="mt-1 sm:mt-2">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Live Map Tracking
                </h4>
                <div className="h-72 w-full rounded-3xl overflow-hidden border border-gray-200 shadow-xs relative z-0">
                  <DriverMap
                    routePaths={routePaths}
                    routeStops={routeStops}
                    currentLocation={displayedVehicleLocation}
                    userLocations={activeUserLocations}
                    currentPassengers={assignmentDetail.currentPassengers}
                    capacity={assignmentDetail.vehicle?.capacity ?? 8}
                    routeName={assignmentDetail.route?.routeName}
                  />
                </div>
                <DebugLocationPanel
                  assignmentId={assignmentId}
                  vehicleLocation={displayedVehicleLocation}
                  vehicleLocationSource={
                    selectedVehicleLocation
                      ? "manual / route stop"
                      : gpsLocation
                        ? "GPS browser"
                        : vehicleRealtime
                          ? "socket"
                          : "POST terakhir"
                  }
                  vehicleSocketConnected={vehicleSocketConnected}
                  vehicleSocketJoined={vehicleSocketJoined}
                  userSocketConnected={userSocketConnected}
                  userSocketJoined={userSocketJoined}
                  userLocations={activeUserLocations}
                  routePathCount={routePaths.length}
                  routeStopCount={routeStops.length}
                />
              </div>
            )}

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {routeStops.length} halte tersedia untuk arah{" "}
              {assignmentDetail.direction}.
            </div>
          </div>
        )}
      </div>

      {locationError && (
        <p className="fixed bottom-4 left-1/2 z-60 -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2 text-center text-xs text-white shadow-lg">
          {locationError}
        </p>
      )}

      <RouteStopLocationModal
        isOpen={isLocationModalOpen}
        routeStops={routeStops}
        isSubmitting={createVehicleLocation.isPending}
        onClose={() => setIsLocationModalOpen(false)}
        onSelect={handleCreateVehicleLocation}
      />

      <GpsPermissionModal
        open={hasValidAssignmentId && showGpsModal}
        isLocating={isLocating}
        onEnable={handleEnableGps}
        onSkip={() => undefined}
        hideSkip
      />

      <UpdateStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => setSelectedStatus(status)}
        onSave={handleUpdateStatus}
        isUpdating={updateAssignment.isPending}
      />
    </div>
  );
}

function DriverSeatControl({
  assignmentDetail,
  onUpdate,
  isUpdating,
}: {
  assignmentDetail: VehicleAssignment;
  onUpdate: (currentPassengers: number) => Promise<unknown>;
  isUpdating: boolean;
}) {
  const currentPassengers = assignmentDetail?.currentPassengers || 0;
  const capacity = assignmentDetail?.vehicle?.capacity || 8;

  const seats = Array.from({ length: capacity }, (_, i) => ({
    seatNumber: i + 1,
    isOccupied: i < currentPassengers,
  }));

  return (
    <div>
      <SeatGridControl
        seats={seats}
        canControl={!isUpdating}
        onToggleSeat={(seatNumber) =>
          onUpdate(
            seats[seatNumber - 1].isOccupied ? seatNumber - 1 : seatNumber,
          )
        }
        hasConductor={false}
        isUserConductor={false}
      />
    </div>
  );
}
