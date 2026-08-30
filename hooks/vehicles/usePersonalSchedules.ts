import { useCallback, useState } from "react";
import { vehicleAssignmentService } from "@/services/vehicles/vehicleAssignmentService.service";
import { TripHistoryItem } from "@/types/vehicles/trip-history.type";
import { VehicleSchedule } from "@/types/vehicles/vehicle-schedule.type";

export function usePersonnelSchedule() {
  const [activeSchedule, setActiveSchedule] = useState<TripHistoryItem[]>([]);
  const [activeLoading, setActiveLoading] = useState(false);
  const [activeError, setActiveError] = useState<string | null>(null);

  const [historySchedule, setHistorySchedule] = useState<TripHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [assignmentDetail, setAssignmentDetail] =
    useState<VehicleSchedule | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchActiveScheduleByPersonnel = useCallback(
    async (params: {
      targetDate?: string;
      driverId?: number;
      conductorId?: number;
    }) => {
      setActiveLoading(true);
      setActiveError(null);

      try {
        const data =
          await vehicleAssignmentService.getActiveScheduleByPersonnel(params);

        setActiveSchedule(data);
        return data;
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Gagal memuat jadwal aktif personel.";

        setActiveError(message);
        setActiveSchedule([]);

        console.error("[fetchActiveScheduleByPersonnel]", err);

        // Error ditangani melalui state agar tidak menjadi Runtime Error.
        return [];
      } finally {
        setActiveLoading(false);
      }
    },
    [],
  );

  const fetchDriverTripHistory = useCallback(
    async (driverId: number | string) => {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const data =
          await vehicleAssignmentService.getDriverTripHistory(driverId);

        setHistorySchedule(data);
        return data;
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Gagal memuat riwayat jadwal driver.";

        setHistorySchedule([]);
        setHistoryError(message);
        return [];
      } finally {
        setHistoryLoading(false);
      }
    },
    [],
  );

  const getAssignmentById = useCallback(async (id: number) => {
    setDetailLoading(true);
    setDetailError(null);

    try {
      const data = await vehicleAssignmentService.getById(id);

      setAssignmentDetail(data);
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : `Gagal memuat detail penugasan dengan ID ${id}.`;

      setDetailError(message);
      setAssignmentDetail(null);

      throw new Error(message);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return {
    // Jadwal aktif untuk dashboard dan halaman now
    activeSchedule,
    activeLoading,
    activeError,
    fetchActiveScheduleByPersonnel,

    // Riwayat jadwal untuk halaman history
    historySchedule,
    historyLoading,
    historyError,
    fetchDriverTripHistory,

    // Detail penugasan
    assignmentDetail,
    detailLoading,
    detailError,
    getAssignmentById,
  };
}
