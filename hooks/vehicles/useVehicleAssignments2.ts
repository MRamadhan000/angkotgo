"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { vehicleAssignmentService } from "@/services/vehicles/vehicleAssignmentService.service";

import {
  CreateVehicleAssignmentInput,
  PersonnelAssignmentRole,
  UpdateVehicleAssignmentInput,
} from "@/types/vehicles/vehicle-assignments.type";

/**
 * Helper untuk mendapatkan tanggal hari ini dengan format YYYY-MM-DD (local time)
 */
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * =========================================================
 * QUERY KEYS
 * =========================================================
 */
export const vehicleAssignmentKeys = {
  all: ["vehicle-assignments"] as const,

  // Key untuk daftar assignment/schedule berbasis tanggal
  byDate: (date: string) =>
    [...vehicleAssignmentKeys.all, "by-date", date] as const,

  upcoming: (
    userId: string | number | undefined,
    role: PersonnelAssignmentRole | null,
  ) => [...vehicleAssignmentKeys.all, "upcoming", userId ?? null, role] as const,

  detail: (id: number) => [...vehicleAssignmentKeys.all, "detail", id] as const,

  driverHistory: (driverId: number | string) =>
    [...vehicleAssignmentKeys.all, "driver-history", driverId] as const,

  conductorHistory: (conductorId: number | string) =>
    [...vehicleAssignmentKeys.all, "conductor-history", conductorId] as const,

  activeScheduleByPersonnel: (params: {
    targetDate?: string;
    driverId?: number;
    conductorId?: number;
  }) =>
    [
      ...vehicleAssignmentKeys.all,
      "active-schedule-by-personnel",
      params,
    ] as const,

  personnelSchedule: (params: { driverId?: number; conductorId?: number }) =>
    [...vehicleAssignmentKeys.all, "personnel-schedule", params] as const,
};

/**
 * =========================================================
 * GET ASSIGNMENTS BY DATE (DEFAULT: HARI INI)
 * Menggantikan pengambil seluruh data (getAll)
 * =========================================================
 */
export function useVehicleAssignmentsByDate(date?: string) {
  // Jika date tidak diberikan, otomatis menggunakan tanggal hari ini (YYYY-MM-DD)
  const targetDate = date || getTodayString();

  return useQuery({
    queryKey: vehicleAssignmentKeys.byDate(targetDate),
    queryFn: () => vehicleAssignmentService.getByDate(targetDate),
    enabled: !!targetDate,
  });
}

export function useUpcomingVehicleAssignments(
  userId: string | number | undefined,
  role: PersonnelAssignmentRole | null,
) {
  return useQuery({
    queryKey: vehicleAssignmentKeys.upcoming(userId, role),
    queryFn: () => {
      if (!userId || !role) {
        throw new Error("ID pengguna dan role wajib diisi.");
      }

      return vehicleAssignmentService.getUpcomingAssignments(userId, role);
    },
    enabled: Boolean(userId && role),
  });
}

/**
 * Alias singkat jika ingin dipanggil dengan nama `useVehicleAssignments`
 */
export const useVehicleAssignments = useVehicleAssignmentsByDate;

/**
 * =========================================================
 * GET BY ID
 * =========================================================
 */
export function useVehicleAssignmentv2(id: number) {
  return useQuery({
    queryKey: vehicleAssignmentKeys.detail(id),
    queryFn: () => vehicleAssignmentService.getById(id),
    enabled: !!id,
  });
}

/**
 * =========================================================
 * GET DRIVER TRIP HISTORY
 * =========================================================
 */
export function useDriverTripHistory(driverId: number | string) {
  return useQuery({
    queryKey: vehicleAssignmentKeys.driverHistory(driverId),
    queryFn: () => vehicleAssignmentService.getDriverTripHistory(driverId),
    enabled: !!driverId,
  });
}

/**
 * =========================================================
 * GET CONDUCTOR TRIP HISTORY
 * =========================================================
 */
export function useConductorTripHistory(conductorId: number | string) {
  return useQuery({
    queryKey: vehicleAssignmentKeys.conductorHistory(conductorId),
    queryFn: () =>
      vehicleAssignmentService.getConductorTripHistory(conductorId),
    enabled: !!conductorId,
  });
}

/**
 * =========================================================
 * GET ACTIVE SCHEDULE BY PERSONNEL
 * =========================================================
 */
export function useActiveScheduleByPersonnel(params: {
  targetDate?: string;
  driverId?: number;
  conductorId?: number;
}) {
  return useQuery({
    queryKey: vehicleAssignmentKeys.activeScheduleByPersonnel(params),
    queryFn: () =>
      vehicleAssignmentService.getActiveScheduleByPersonnel(params),
    enabled: !!params.driverId || !!params.conductorId || !!params.targetDate,
  });
}

/**
 * =========================================================
 * GET PERSONNEL SCHEDULE
 * =========================================================
 */
export function useScheduleByPersonnelId(params: {
  driverId?: number;
  conductorId?: number;
}) {
  return useQuery({
    queryKey: vehicleAssignmentKeys.personnelSchedule(params),
    queryFn: () => vehicleAssignmentService.getScheduleByPersonnelId(params),
    enabled: !!params.driverId || !!params.conductorId,
  });
}

/**
 * =========================================================
 * CREATE
 * =========================================================
 */
export function useCreateVehicleAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleAssignmentInput) =>
      vehicleAssignmentService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: vehicleAssignmentKeys.all,
      });
    },
  });
}

/**
 * =========================================================
 * UPDATE
 * =========================================================
 */
export function useUpdateVehicleAssignmentv2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateVehicleAssignmentInput;
    }) => vehicleAssignmentService.update(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: vehicleAssignmentKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: vehicleAssignmentKeys.detail(variables.id),
      });
    },
  });
}

/**
 * =========================================================
 * DELETE
 * =========================================================
 */
export function useDeleteVehicleAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vehicleAssignmentService.remove(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: vehicleAssignmentKeys.all,
      });

      queryClient.removeQueries({
        queryKey: vehicleAssignmentKeys.detail(id),
      });
    },
  });
}
