"use client";

import { useMemo, useState } from "react";
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
                    currentLocation={
                      latestVehicleLocation
                        ? {
                            latitude: Number(latestVehicleLocation.latitude),
                            longitude: Number(latestVehicleLocation.longitude),
                          }
                        : null
                    }
                    currentPassengers={assignmentDetail.currentPassengers}
                    capacity={assignmentDetail.vehicle?.capacity ?? 8}
                    routeName={assignmentDetail.route?.routeName}
                  />
                </div>
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
