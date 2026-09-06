"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { DetailHeader } from "@/components/common/DetailHeader";
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
import { AssignmentStatus } from "@/types/vehicles/vehicle-assignments.type";
import { RouteStopType } from "@/types/routes/route-stop.type";
import { DetailLoading } from "@/components/common/DetaiLoading";
import ErrorAlert from "@/components/common/ErrorAlert";
import { AssignmentStatusCard } from "@/components/common/AssignmentStatusCard";
import { UpdateStatusModal } from "@/components/now/UpdateStatusModal";

import { SeatGridControl } from "@/components/now/SeatGridControl";
import DriverMap from "../../DriverMap";
import { getCurrentLocation } from "@/components/search-routev2/skenario1/geolocation";

export default function AssignmentDetailPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const assignmentId = Number(
    Array.isArray(rawSlug) ? rawSlug[0] : rawSlug,
  );
  const hasValidAssignmentId = Number.isInteger(assignmentId) && assignmentId > 0;

  const { user } = useAuth();

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("SCHEDULED");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
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
    data: vehicleRealtime,
    connected: vehicleSocketConnected,
    joined: vehicleSocketJoined,
  } = useVehicleSocket(
    hasValidAssignmentId ? assignmentId : null,
  );
  const assignmentKey = hasValidAssignmentId ? String(assignmentId) : "";
  const { data: activeUserSignals = [] } = useActiveSinyal(assignmentKey);
  const {
    data: userRealtime,
    connected: userSocketConnected,
    joined: userSocketJoined,
  } = useSinyalRealtime(
    hasValidAssignmentId ? assignmentKey : null,
  );
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
    if (!hasValidAssignmentId || !navigator.geolocation) return;

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
          setLocationError("Lokasi GPS belum tersedia. Posisi socket/manual tetap dapat digunakan.");
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    getCurrentLocation()
      .then((location) => {
        if (isMounted && !selectedVehicleLocation) setGpsLocation(location);
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [hasValidAssignmentId, selectedVehicleLocation]);

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
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden">
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
              disabled={createVehicleLocation.isPending || routeStops.length === 0}
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
              {routeStops.length} halte tersedia untuk arah {assignmentDetail.direction}.
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

function DebugLocationPanel({
  assignmentId,
  vehicleLocation,
  vehicleLocationSource,
  vehicleSocketConnected,
  vehicleSocketJoined,
  userSocketConnected,
  userSocketJoined,
  userLocations,
  routePathCount,
  routeStopCount,
}: {
  assignmentId: number;
  vehicleLocation: { latitude: number; longitude: number } | null;
  vehicleLocationSource: string;
  vehicleSocketConnected: boolean;
  vehicleSocketJoined: boolean;
  userSocketConnected: boolean;
  userSocketJoined: boolean;
  userLocations: Array<{
    id: string;
    latitude: number;
    longitude: number;
    status: "ACTIVE";
  }>;
  routePathCount: number;
  routeStopCount: number;
}) {
  return (
    <details className="mt-3 rounded-2xl border border-slate-300 bg-slate-900 text-slate-100 shadow-sm">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
        Debug lokasi realtime
      </summary>
      <div className="space-y-3 border-t border-slate-700 px-4 py-3 text-xs">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <DebugValue label="Assignment ID" value={String(assignmentId)} />
          <DebugValue
            label="Vehicle socket"
            value={formatSocketState(vehicleSocketConnected, vehicleSocketJoined)}
          />
          <DebugValue
            label="User socket"
            value={formatSocketState(userSocketConnected, userSocketJoined)}
          />
          <DebugValue
            label="Data aktif"
            value={`${userLocations.length} user / ${routeStopCount} halte / ${routePathCount} path`}
          />
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
          <p className="mb-1 font-semibold text-cyan-300">
            Posisi angkot ({vehicleLocationSource})
          </p>
          <p className="font-mono">
            {vehicleLocation
              ? `lat=${vehicleLocation.latitude.toFixed(6)}, lng=${vehicleLocation.longitude.toFixed(6)}`
              : "Belum ada koordinat"}
          </p>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
          <p className="mb-2 font-semibold text-emerald-300">
            Posisi user aktif ({userLocations.length})
          </p>
          {userLocations.length > 0 ? (
            <div className="space-y-1 font-mono">
              {userLocations.map((location, index) => (
                <p key={location.id}>
                  #{index + 1} {location.id}: lat={location.latitude.toFixed(6)}, lng={location.longitude.toFixed(6)} [{location.status}]
                </p>
              ))}
            </div>
          ) : (
            <p className="font-mono text-slate-400">Belum ada user aktif</p>
          )}
        </div>
      </div>
    </details>
  );
}

function DebugValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-2">
      <p className="text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-slate-100">{value}</p>
    </div>
  );
}

function formatSocketState(connected: boolean, joined: boolean) {
  if (!connected) return "DISCONNECTED";
  return joined ? "CONNECTED / JOINED" : "CONNECTED / NOT JOINED";
}

function RouteStopLocationModal({
  isOpen,
  routeStops,
  isSubmitting,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  routeStops: RouteStopType[];
  isSubmitting: boolean;
  onClose: () => void;
  onSelect: (stop: RouteStopType) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Pilih posisi kendaraan
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pilih halte untuk mengirim posisi dev kendaraan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900"
            disabled={isSubmitting}
          >
            Tutup
          </button>
        </div>

        <div className="max-h-80 space-y-2 overflow-y-auto">
          {routeStops.map((stop) => (
            <button
              type="button"
              key={stop.id}
              onClick={() => onSelect(stop)}
              disabled={isSubmitting}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                  {stop.stopOrder}
                </span>
                <span className="font-medium text-slate-900">
                  {stop.stopName}
                </span>
              </span>
              <span className="text-xs text-slate-500">
                {Number(stop.latitude).toFixed(5)}, {Number(stop.longitude).toFixed(5)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DriverSeatControl({
  assignmentDetail,
  onUpdate,
  isUpdating,
}: {
  assignmentDetail: any;
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
          onUpdate(seats[seatNumber - 1].isOccupied ? seatNumber - 1 : seatNumber)
        }
        hasConductor={false}
        isUserConductor={false}
      />
    </div>
  );
}
