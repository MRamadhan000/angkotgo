"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { DetailHeader } from "@/components/common/DetailHeader";
import {
  useUpdateVehicleAssignmentv2,
  useVehicleAssignmentv2,
} from "@/hooks/vehicles/useVehicleAssignments2";
import { useRoutePaths } from "@/hooks/routes/useRoutePath";
import { useRouteStops } from "@/hooks/routes/useRouteStops";
import { AssignmentStatus } from "@/types/vehicles/vehicle-assignments.type";
import { DetailLoading } from "@/components/common/DetaiLoading";
import ErrorAlert from "@/components/common/ErrorAlert";
import { AssignmentStatusCard } from "@/components/common/AssignmentStatusCard";
import { UpdateStatusModal } from "@/components/now/UpdateStatusModal";

import { SeatGridControl } from "@/components/now/SeatGridControl";
import DriverMap from "../../DriverMap";
import { getCurrentLocation } from "@/components/search-routev2/skenario1/geolocation";
import GpsPermissionModal from "@/components/search-routev2/skenario1/GpsPermissionModal";

export default function AssignmentDetailPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const assignmentId = Number(
    Array.isArray(rawSlug) ? rawSlug[0] : rawSlug,
  );
  const hasValidAssignmentId = Number.isInteger(assignmentId) && assignmentId > 0;

  const { user } = useAuth();

  const [isStopsOpen, setIsStopsOpen] = useState(true);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("SCHEDULED");
  const [gpsLocation, setGpsLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(true);
  const [isGpsEnabled, setIsGpsEnabled] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const {
    data: assignmentDetail,
    isLoading: detailLoading,
    error: assignmentError,
  } = useVehicleAssignmentv2(assignmentId);
  const updateAssignment = useUpdateVehicleAssignmentv2();
  const direction = assignmentDetail?.direction;
  const routeId = assignmentDetail?.routeId ?? 0;
  const { data: routePaths = [] } = useRoutePaths(routeId, direction!);
  const { data: routeStops = [] } = useRouteStops(routeId, direction!);
  const detailError = assignmentError?.message ?? null;

  useEffect(() => {
    if (assignmentDetail?.status) {
      setSelectedStatus(assignmentDetail.status.toUpperCase());
    }
  }, [assignmentDetail?.status]);

  useEffect(() => {
    if (!isGpsEnabled || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGpsLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGpsError(null);
      },
      (error) => {
        setGpsError(
          error.code === 1
            ? "Izin lokasi ditolak. GPS wajib diaktifkan untuk menggunakan halaman ini."
            : "Lokasi GPS belum tersedia. Coba aktifkan GPS lalu ulangi.",
        );
        setIsGpsEnabled(false);
        setIsGpsModalOpen(true);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isGpsEnabled]);

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

  const handleEnableGps = async () => {
    setIsLocating(true);
    setGpsError(null);
    try {
      setGpsLocation(await getCurrentLocation());
      setIsGpsEnabled(true);
      setIsGpsModalOpen(false);
    } catch (error) {
      setGpsError(
        error instanceof GeolocationPositionError && error.code === 1
          ? "Izin lokasi ditolak. GPS wajib diaktifkan untuk menggunakan halaman ini."
          : "Lokasi GPS belum tersedia. Coba aktifkan GPS lalu ulangi.",
      );
    } finally {
      setIsLocating(false);
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

            {assignmentDetail.status === AssignmentStatus.ONGOING && (
              <div className="mt-1 sm:mt-2">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Live Map Tracking
                </h4>
                <div className="h-72 w-full rounded-3xl overflow-hidden border border-gray-200 shadow-xs relative z-0">
                  <DriverMap
                    routePaths={routePaths}
                    routeStops={routeStops}
                    currentLocation={gpsLocation}
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

      <GpsPermissionModal
        open={isGpsModalOpen}
        isLocating={isLocating}
        onEnable={handleEnableGps}
        onSkip={() => undefined}
        hideSkip
      />
      {gpsError && (
        <p className="fixed bottom-4 left-1/2 z-60 -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2 text-center text-xs text-white shadow-lg">
          {gpsError}
        </p>
      )}

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
