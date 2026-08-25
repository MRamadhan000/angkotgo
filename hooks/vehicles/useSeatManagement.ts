"use client";

import { useCallback, useEffect, useState } from "react";
import { AssignmentStatus } from "@/types/vehicles/vehicle.type";
import {
  OperationalStatus,
  SeatState,
} from "@/types/vehicles/seat-management.type";
import { seatManagementService } from "@/services/vehicles/seatManagement.service";

export function useSeatManagement(
  assignmentId: string,
  isUserConductor: boolean,
) {
  const [status, setStatus] = useState<OperationalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeats = useCallback(async () => {
    if (!assignmentId) return;

    setLoading(true);
    setError(null);

    try {
      const data =
        await seatManagementService.getOperationalStatus(assignmentId);

      setStatus(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat data operasional.";

      setStatus(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    void fetchSeats();
  }, [fetchSeats]);

  const canControl = status
    ? (!status.hasConductor && !isUserConductor) ||
      (status.hasConductor && isUserConductor)
    : false;

  const createSeats = (totalSeats: number, passengerCount: number) => {
    return Array.from({ length: totalSeats }, (_, index) => ({
      seatNumber: index + 1,
      isOccupied: index + 1 <= passengerCount,
    })) as SeatState[];
  };

  const toggleSeat = async (seatNumber: number) => {
    if (!status || !canControl) return;

    const currentPassengers = status.currentPassengers;
    const nextPassengers =
      seatNumber === currentPassengers ? currentPassengers - 1 : seatNumber;

    const nextStatus: OperationalStatus = {
      ...status,
      currentPassengers: nextPassengers,
      seats: createSeats(status.totalSeats, nextPassengers),
    };

    setStatus(nextStatus);

    try {
      const result = await seatManagementService.updateSeat(
        assignmentId,
        seatNumber,
        nextPassengers,
      );

      setStatus((previous) =>
        previous
          ? {
              ...previous,
              currentPassengers: result.currentPassengers,
              seats: createSeats(previous.totalSeats, result.currentPassengers),
            }
          : previous,
      );
    } catch (err: unknown) {
      setStatus(status);

      setError(
        err instanceof Error ? err.message : "Gagal memperbarui status kursi.",
      );
    }
  };

  const toggleJourneyStatus = async () => {
    if (!status || !canControl) return;

    const nextStatusValue =
      status.status === AssignmentStatus.ONGOING
        ? AssignmentStatus.COMPLETED
        : AssignmentStatus.ONGOING;

    const previousStatus = status;

    setStatus({
      ...status,
      status: nextStatusValue,
    });

    try {
      await seatManagementService.updateJourneyStatus(
        assignmentId,
        nextStatusValue,
      );
    } catch (err: unknown) {
      setStatus(previousStatus);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui status perjalanan.",
      );
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
