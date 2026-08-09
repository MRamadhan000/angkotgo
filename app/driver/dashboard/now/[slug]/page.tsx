"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { DetailHeader } from "@/components/common/DetailHeader";
import { usePersonnelSchedule } from "@/hooks/vehicles/usePersonalSchedules";
import { VehicleSchedule } from "@/types/vehicles/vehicle-schedule.type";
import { EstimatedStopsTimeline } from "@/components/common/EstimatedStopsTimeline";
import { DetailLoading } from "@/components/common/DetaiLoading";
import ErrorAlert from "@/components/common/ErrorAlert";
import { AssignmentStatusCard } from "@/components/common/AssignmentStatusCard";
import { UpdateStatusModal } from "@/components/now/UpdateStatusModal";
import { useSeatManagement } from "@/hooks/vehicles/useSeatManagement";
import { SeatGridControl } from "@/components/now/SeatGridControl";

export default function AssignmentDetailPage() {
  const params = useParams();
  const assignmentId = Number(params?.slug);

  const { user } = useAuth();

  const [isStopsOpen, setIsStopsOpen] = useState(true);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("SCHEDULED");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { assignmentDetail, detailLoading, detailError, getAssignmentById } =
    usePersonnelSchedule() as {
      assignmentDetail:
        | (VehicleSchedule & {
            conductor?: { id: number; name: string } | null;
            status?: string;
          })
        | null;
      detailLoading: boolean;
      detailError: string | null;
      getAssignmentById: (id: number) => Promise<any>;
    };

  useEffect(() => {
    if (assignmentId && !isNaN(assignmentId)) {
      getAssignmentById(assignmentId);
    }
  }, [assignmentId, getAssignmentById]);

  useEffect(() => {
    if (assignmentDetail?.status) {
      setSelectedStatus(assignmentDetail.status.toUpperCase());
    }
  }, [assignmentDetail?.status]);

  const handleUpdateStatus = async () => {
    try {
      setIsUpdatingStatus(true);

      if (assignmentDetail) {
        assignmentDetail.status = selectedStatus;
      }
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error("Gagal mengubah status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1200px] space-y-3 sm:space-y-6 p-2.5 sm:p-6 lg:p-8">
        <DetailHeader
          user={user}
          title="Detail Penugasan Kendaraan"
          description="Informasi lengkap rute perjalanan, armada, personel, dan estimasi waktu halte."
        />
        {detailLoading && <DetailLoading />}

        {detailError && !detailLoading && <ErrorAlert message={detailError} />}

        {!detailLoading && !detailError && assignmentDetail && (
          <div className="space-y-3 sm:space-y-6">
            {/* Card Status Mencolok */}
            <AssignmentStatusCard
              status={assignmentDetail.status}
              onOpenModal={() => setIsStatusModalOpen(true)}
            />

            {/* Seat control for driver (driver is not conductor) */}
            <div>
              <DriverSeatControl assignmentId={assignmentId} />
            </div>

            {/* Konten Timeline Halte */}
            <EstimatedStopsTimeline
              stops={assignmentDetail.estimatedStopsSchedule}
              isOpen={isStopsOpen}
              onToggle={() => setIsStopsOpen(!isStopsOpen)}
            />
          </div>
        )}
      </div>

      <UpdateStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => setSelectedStatus(status)}
        onSave={handleUpdateStatus}
        isUpdating={isUpdatingStatus}
      />
    </div>
  );
}

function DriverSeatControl({ assignmentId }: { assignmentId: number }) {
  const {
    status,
    loading: seatsLoading,
    error: seatsError,
    canControl,
    toggleSeat,
  } = useSeatManagement(String(assignmentId), false);

  return (
    <div>
      <SeatGridControl
        seats={status?.seats || []}
        canControl={canControl}
        onToggleSeat={toggleSeat}
        hasConductor={status?.hasConductor || false}
        isUserConductor={false}
      />
      {seatsLoading && (
        <div className="text-xs text-gray-400 mt-2">Memuat status kursi...</div>
      )}
      {seatsError && (
        <div className="text-xs text-rose-600 mt-2">{seatsError}</div>
      )}
    </div>
  );
}
