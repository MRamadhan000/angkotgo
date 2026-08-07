import { useState, useCallback } from "react";
import { vehicleAssignmentService } from "@/services/vehicles/vehicleAssignmentService.service";
import { TripHistoryItem } from "@/types/vehicles/trip-history.type";

export function usePersonnelSchedule() {
  const [activeSchedule, setActiveSchedule] = useState<TripHistoryItem[]>([]);
  const [activeLoading, setActiveLoading] = useState<boolean>(false);
  const [activeError, setActiveError] = useState<string | null>(null);

  const [personnelSchedule, setPersonnelSchedule] = useState<TripHistoryItem[]>(
    [],
  );
  const [personnelLoading, setPersonnelLoading] = useState<boolean>(false);
  const [personnelError, setPersonnelError] = useState<string | null>(null);

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
      } catch (err: any) {
        const message = err.message || "Gagal memuat jadwal aktif personel.";
        setActiveError(message);
        setActiveSchedule([]);
        throw new Error(message);
      } finally {
        setActiveLoading(false);
      }
    },
    [],
  );

  const fetchScheduleByPersonnelId = useCallback(
    async (params: { driverId?: number; conductorId?: number }) => {
      setPersonnelLoading(true);
      setPersonnelError(null);
      try {
        const data =
          await vehicleAssignmentService.getScheduleByPersonnelId(params);
        setPersonnelSchedule(data);
        return data;
      } catch (err: any) {
        const message = err.message || "Gagal memuat riwayat jadwal personel.";
        setPersonnelError(message);
        setPersonnelSchedule([]);
        throw new Error(message);
      } finally {
        setPersonnelLoading(false);
      }
    },
    [],
  );

  return {
    activeSchedule,
    activeLoading,
    activeError,
    fetchActiveScheduleByPersonnel,

    personnelSchedule,
    personnelLoading,
    personnelError,
    fetchScheduleByPersonnelId,
  };
}
