import { useState, useEffect, useCallback } from "react";
import {
  VehicleAssignment,
  CreateVehicleAssignmentInput,
  UpdateVehicleAssignmentInput,
} from "@/types/vehicles/vehicle-assignments.type";
import { vehicleAssignmentService } from "@/services/vehicles/vehicleAssignmentService.service";
import { VehicleSchedule } from "@/types/vehicles/vehicle-schedule.type";
import { TripHistoryItem } from "@/types/vehicles/trip-history.type";

export function useVehicleAssignments() {
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [schedules, setSchedules] = useState<VehicleSchedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState<boolean>(false);
  const [schedulesError, setSchedulesError] = useState<string | null>(null);

  const [driverHistory, setDriverHistory] = useState<TripHistoryItem[]>([]);
  const [driverHistoryLoading, setDriverHistoryLoading] = useState<boolean>(false);
  const [driverHistoryError, setDriverHistoryError] = useState<string | null>(null);

  const [conductorHistory, setConductorHistory] = useState<TripHistoryItem[]>([]);
  const [conductorHistoryLoading, setConductorHistoryLoading] = useState<boolean>(false);
  const [conductorHistoryError, setConductorHistoryError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleAssignmentService.getAll();
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data penugasan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const fetchSchedulesByDate = useCallback(async (dateString: string) => {
    if (!dateString) return;

    setSchedulesLoading(true);
    setSchedulesError(null);
    try {
      const data =
        await vehicleAssignmentService.getSchedulesByDate(dateString);
      setSchedules(data);
    } catch (err: any) {
      setSchedulesError(
        err.message ||
          "Terjadi kesalahan saat memuat jadwal dan estimasi halte.",
      );
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  }, []);

  const fetchDriverTripHistory = useCallback(async (driverId: number | string) => {
    if (!driverId) return;

    setDriverHistoryLoading(true);
    setDriverHistoryError(null);
    try {
      const data = await vehicleAssignmentService.getDriverTripHistory(driverId);
      setDriverHistory(data);
    } catch (err: any) {
      setDriverHistoryError(
        err.message || "Terjadi kesalahan saat memuat riwayat trip driver.",
      );
      setDriverHistory([]);
    } finally {
      setDriverHistoryLoading(false);
    }
  }, []);

  const fetchConductorTripHistory = useCallback(async (conductorId: number | string) => {
    if (!conductorId) return;

    setConductorHistoryLoading(true);
    setConductorHistoryError(null);
    try {
      const data = await vehicleAssignmentService.getConductorTripHistory(conductorId);
      setConductorHistory(data);
    } catch (err: any) {
      setConductorHistoryError(
        err.message || "Terjadi kesalahan saat memuat riwayat trip kondektur.",
      );
      setConductorHistory([]);
    } finally {
      setConductorHistoryLoading(false);
    }
  }, []);

  const createAssignment = async (data: CreateVehicleAssignmentInput) => {
    try {
      const newAssignment = await vehicleAssignmentService.create(data);
      setAssignments((prev) => [newAssignment, ...prev]);
      return newAssignment;
    } catch (err: any) {
      throw new Error(err.message || "Gagal membuat penugasan baru.");
    }
  };

  const updateAssignment = async (
    id: number,
    data: UpdateVehicleAssignmentInput,
  ) => {
    try {
      const updated = await vehicleAssignmentService.update(id, data);
      setAssignments((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      );
      return updated;
    } catch (err: any) {
      throw new Error(err.message || "Gagal memperbarui penugasan.");
    }
  };

  const deleteAssignment = async (id: number) => {
    try {
      await vehicleAssignmentService.remove(id);
      setAssignments((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      throw new Error(err.message || "Gagal menghapus penugasan.");
    }
  };

  return {
    assignments,
    loading,
    error,
    fetchAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,

    schedules,
    schedulesLoading,
    schedulesError,
    fetchSchedulesByDate,

    driverHistory,
    driverHistoryLoading,
    driverHistoryError,
    fetchDriverTripHistory,

    conductorHistory,
    conductorHistoryLoading,
    conductorHistoryError,
    fetchConductorTripHistory,
  };
}