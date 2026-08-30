import { useCallback, useState } from "react";
import { vehicleAssignmentService } from "@/services/vehicles/vehicleAssignmentService.service";
import { TripHistoryItem } from "@/types/vehicles/trip-history.type";
import { VehicleSchedule } from "@/types/vehicles/vehicle-schedule.type";

export function usePersonnelSchedule() {
  const [activeSchedule, setActiveSchedule] = useState<TripHistoryItem[]>([]);
  const [activeLoading, setActiveLoading] = useState(false);
  const [activeError, setActiveError] = useState<string | null>(null);

  const [schedule, setSchedule] = useState<TripHistoryItem[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

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
      } catch (err: any) {
        const message = err?.message || "Gagal memuat jadwal aktif personel.";

        setActiveError(message);
        setActiveSchedule([]);

        throw new Error(message);
      } finally {
        setActiveLoading(false);
      }
    },
    [],
  );

  const fetchScheduleByPersonnel = useCallback(
    async (params: { driverId?: number; conductorId?: number }) => {
      setScheduleLoading(true);
      setScheduleError(null);

      try {
        const data =
          await vehicleAssignmentService.getScheduleByPersonnelId(params);

        setSchedule(data);
        return data;
      } catch (err: any) {
        const message =
          err?.message || "Gagal memuat jadwal penugasan personel.";

        setScheduleError(message);
        setSchedule([]);

        throw new Error(message);
      } finally {
        setScheduleLoading(false);
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
    } catch (err: any) {
      const message =
        err?.message || `Gagal memuat detail penugasan dengan ID ${id}.`;

      setDetailError(message);
      setAssignmentDetail(null);

      throw new Error(message);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return {
    // Jadwal aktif yang sudah digunakan halaman now
    activeSchedule,
    activeLoading,
    activeError,
    fetchActiveScheduleByPersonnel,

    // Jadwal personel untuk filter jadwal mendatang
    schedule,
    scheduleLoading,
    scheduleError,
    fetchScheduleByPersonnel,

    // Detail penugasan
    assignmentDetail,
    detailLoading,
    detailError,
    getAssignmentById,
  };
}
