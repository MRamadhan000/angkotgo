"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { vehicleAssignmentService } from "@/services/vehicles/vehicleAssignmentService.service";

import {
  CreateVehicleAssignmentInput,
  UpdateVehicleAssignmentInput,
} from "@/types/vehicles/vehicle-assignments.type";

/**
 * =========================================================
 * QUERY KEYS
 * =========================================================
 */

export const vehicleAssignmentKeys = {
  all: ["vehicle-assignments"] as const,

  detail: (id: number) =>
    ["vehicle-assignments", id] as const,

  schedules: (date: string) =>
    ["vehicle-assignments", "schedules", date] as const,

  driverHistory: (driverId: number | string) =>
    [
      "vehicle-assignments",
      "driver-history",
      driverId,
    ] as const,

  conductorHistory: (conductorId: number | string) =>
    [
      "vehicle-assignments",
      "conductor-history",
      conductorId,
    ] as const,

  activeScheduleByPersonnel: (params: {
    targetDate?: string;
    driverId?: number;
    conductorId?: number;
  }) =>
    [
      "vehicle-assignments",
      "active-schedule-by-personnel",
      params,
    ] as const,

  personnelSchedule: (params: {
    driverId?: number;
    conductorId?: number;
  }) =>
    [
      "vehicle-assignments",
      "personnel-schedule",
      params,
    ] as const,
};

/**
 * =========================================================
 * GET ALL
 * =========================================================
 */

export function useVehicleAssignments() {
  return useQuery({
    queryKey: vehicleAssignmentKeys.all,
    queryFn: vehicleAssignmentService.getAll,
  });
}

/**
 * =========================================================
 * GET BY ID
 * =========================================================
 */

export function useVehicleAssignmentv2(id: number) {
  return useQuery({
    queryKey: vehicleAssignmentKeys.detail(id),

    queryFn: () =>
      vehicleAssignmentService.getById(id),

    enabled: !!id,
  });
}

/**
 * =========================================================
 * GET SCHEDULES BY DATE
 * =========================================================
 */

export function useVehicleSchedules(date: string) {
  return useQuery({
    queryKey:
      vehicleAssignmentKeys.schedules(date),

    queryFn: () =>
      vehicleAssignmentService.getSchedulesByDate(
        date,
      ),

    enabled: !!date,
  });
}

/**
 * =========================================================
 * GET DRIVER TRIP HISTORY
 * =========================================================
 */

export function useDriverTripHistory(
  driverId: number | string,
) {
  return useQuery({
    queryKey:
      vehicleAssignmentKeys.driverHistory(
        driverId,
      ),

    queryFn: () =>
      vehicleAssignmentService.getDriverTripHistory(
        driverId,
      ),

    enabled: !!driverId,
  });
}

/**
 * =========================================================
 * GET CONDUCTOR TRIP HISTORY
 * =========================================================
 */

export function useConductorTripHistory(
  conductorId: number | string,
) {
  return useQuery({
    queryKey:
      vehicleAssignmentKeys.conductorHistory(
        conductorId,
      ),

    queryFn: () =>
      vehicleAssignmentService.getConductorTripHistory(
        conductorId,
      ),

    enabled: !!conductorId,
  });
}

/**
 * =========================================================
 * GET ACTIVE SCHEDULE BY PERSONNEL
 * =========================================================
 */

export function useActiveScheduleByPersonnel(
  params: {
    targetDate?: string;
    driverId?: number;
    conductorId?: number;
  },
) {
  return useQuery({
    queryKey:
      vehicleAssignmentKeys.activeScheduleByPersonnel(
        params,
      ),

    queryFn: () =>
      vehicleAssignmentService.getActiveScheduleByPersonnel(
        params,
      ),

    enabled:
      !!params.driverId ||
      !!params.conductorId ||
      !!params.targetDate,
  });
}

/**
 * =========================================================
 * GET PERSONNEL SCHEDULE
 * =========================================================
 */

export function useScheduleByPersonnelId(
  params: {
    driverId?: number;
    conductorId?: number;
  },
) {
  return useQuery({
    queryKey:
      vehicleAssignmentKeys.personnelSchedule(
        params,
      ),

    queryFn: () =>
      vehicleAssignmentService.getScheduleByPersonnelId(
        params,
      ),

    enabled:
      !!params.driverId ||
      !!params.conductorId,
  });
}

/**
 * =========================================================
 * CREATE
 * =========================================================
 */

export function useCreateVehicleAssignment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateVehicleAssignmentInput,
    ) =>
      vehicleAssignmentService.create(
        data,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          vehicleAssignmentKeys.all,
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
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateVehicleAssignmentInput;
    }) =>
      vehicleAssignmentService.update(
        id,
        data,
      ),

    onSuccess: (_, variables) => {
      /**
       * Refresh semua assignment
       */
      queryClient.invalidateQueries({
        queryKey:
          vehicleAssignmentKeys.all,
      });

      /**
       * Refresh detail assignment
       */
      queryClient.invalidateQueries({
        queryKey:
          vehicleAssignmentKeys.detail(
            variables.id,
          ),
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
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      vehicleAssignmentService.remove(
        id,
      ),

    onSuccess: (_, id) => {
      /**
       * Refresh list
       */
      queryClient.invalidateQueries({
        queryKey:
          vehicleAssignmentKeys.all,
      });

      /**
       * Hapus cache detail
       */
      queryClient.removeQueries({
        queryKey:
          vehicleAssignmentKeys.detail(id),
      });
    },
  });
}