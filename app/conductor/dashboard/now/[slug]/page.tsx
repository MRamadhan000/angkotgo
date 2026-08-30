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
import { IncomeWidget } from "@/components/now/IncomeWidget";

// Peta
import DriverMap from "@/app/driver/dashboard/DriverMap";

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

    // Hoist the seat management state so that we can distribute the real-time passenger value down to the map
    const { status: liveSeatStatus, toggleSeat, canControl } = useSeatManagement(
        String(assignmentId),
        true
    );

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

                        {/* Seat control untuk Conductor (punya wewenang edit penuh) */}
                        <div>
                            <ConductorSeatControl
                                assignmentDetail={assignmentDetail as any}
                                liveStatus={liveSeatStatus}
                                toggleSeat={toggleSeat}
                                canControl={canControl}
                            />
                        </div>

                        {assignmentDetail.status === "ONGOING" && (
                            <div className="mt-1 sm:mt-2">
                                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                                    Live Map Tracking
                                </h4>
                                <div className="h-72 w-full rounded-3xl overflow-hidden border border-gray-200 shadow-xs relative z-0">
                                    <DriverMap
                                        currentPassengers={liveSeatStatus?.currentPassengers ?? (assignmentDetail as any).currentPassengers ?? 0}
                                        capacity={assignmentDetail.vehicle?.capacity ?? 8}
                                        routeName={(assignmentDetail as any)?.routeName || "Arjosari - Gadang"}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Konten Timeline Halte */}
                        <EstimatedStopsTimeline
                            stops={assignmentDetail.estimatedStopsSchedule}
                            isOpen={isStopsOpen}
                            onToggle={() => setIsStopsOpen(!isStopsOpen)}
                        />

                        {/* Widget Pendapatan (Income Info) */}
                        <div className="mt-1 sm:mt-2 pb-6">
                            <IncomeWidget assignmentId={assignmentId} />
                        </div>
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

function ConductorSeatControl({
    assignmentDetail,
    liveStatus,
    toggleSeat,
    canControl
}: {
    assignmentDetail: any;
    liveStatus: any;
    toggleSeat: (s: number) => void;
    canControl: boolean;
}) {
    const capacity = assignmentDetail?.vehicle?.capacity || 8;
    const fallbackPassengers = assignmentDetail?.currentPassengers || 0;

    // Render seats from live API status, fallback to local initial state immediately if not yet fetched
    const seats = liveStatus?.seats || Array.from({ length: capacity }, (_, i) => ({
        seatNumber: i + 1,
        isOccupied: i < fallbackPassengers,
    }));

    return (
        <div>
            <SeatGridControl
                seats={seats}
                canControl={canControl}
                onToggleSeat={toggleSeat}
                hasConductor={liveStatus?.hasConductor ?? true}
                isUserConductor={true}
            />
        </div>
    );
}
