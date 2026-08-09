"use client";

import { useState, useEffect, useCallback } from "react";
import { AssignmentStatus } from "@/types/vehicles/vehicle.type";
import {
  SeatState,
  OperationalStatus,
} from "@/types/vehicles/seat-management.type";
import { seatManagementService } from "@/services/vehicles/seatManagement.service";

export function useSeatManagement(
  assignmentId: string,
  isUserConductor: boolean,
) {
  const [status, setStatus] = useState<OperationalStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const MOCK_IDS = ["999999", "888888"];
  const makeMockStatus = (id: string): OperationalStatus => {
    const seats = Array.from({ length: 8 }, (_, i) => ({
      seatNumber: i + 1,
      isOccupied: false,
    })) as SeatState[];

    return {
      assignmentId: id,
      hasConductor: id === "888888",
      status: AssignmentStatus.ONGOING,
      currentPassengers: 0,
      totalSeats: 8,
      seats,
    };
  };

  const getCumulativeSeats = (count: number) =>
    Array.from({ length: 8 }, (_, i) => ({
      seatNumber: i + 1,
      isOccupied: i + 1 <= count,
    })) as SeatState[];

  const fetchSeats = useCallback(async () => {
    try {
      setLoading(true);
      const data =
        await seatManagementService.getOperationalStatus(assignmentId);
      setStatus(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data operasional");
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    if (!assignmentId) return;

    // If this is a known mock assignment id, immediately set mock status
    if (MOCK_IDS.includes(assignmentId)) {
      setStatus(makeMockStatus(assignmentId));
      setLoading(false);
      setError(null);
      return;
    }

    fetchSeats();
  }, [assignmentId, fetchSeats]);

  // Hak akses kontrol:
  // - Jika ada kondektur: hanya kondektur yang bisa klik.
  // - Jika tidak ada kondektur: driver bisa klik.
  const canControl = status
    ? (!status.hasConductor && !isUserConductor) ||
      (status.hasConductor && isUserConductor)
    : false;

  const toggleSeat = async (seatNumber: number) => {
    if (!status || !canControl) return;

    const currentCount = status.seats.filter((s) => s.isOccupied).length;
    const targetCount =
      currentCount === seatNumber ? seatNumber - 1 : seatNumber;

    const updatedSeats = getCumulativeSeats(targetCount);

    setStatus({
      ...status,
      seats: updatedSeats,
      currentPassengers: targetCount,
    });

    try {
      await seatManagementService.updateSeat(
        assignmentId,
        seatNumber,
        targetCount,
      );
    } catch {
      fetchSeats(); // Revert to server state if the update fails
    }
  };

  const toggleJourneyStatus = async () => {
    if (!status || !canControl) return;

    const nextStatus =
      status.status === AssignmentStatus.ONGOING
        ? AssignmentStatus.COMPLETED
        : AssignmentStatus.ONGOING;

    setStatus({
      ...status,
      status: nextStatus,
    });

    try {
      await seatManagementService.updateJourneyStatus(assignmentId, nextStatus);
    } catch {
      fetchSeats();
    }
  };

  return {
    status,
    loading,
    error,
    canControl,
    toggleSeat,
    toggleJourneyStatus,
    refetch: fetchSeats,
  };
}
