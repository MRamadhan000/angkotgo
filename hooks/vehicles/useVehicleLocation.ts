"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { VehicleLocationService } from "@/services/vehicles/vehicleLocation.service";

import { CreateVehicleLocationPayload } from "@/types/vehicles/vehicle-location.type";

/**
 * =========================================================
 * QUERY KEYS
 * =========================================================
 */

export const vehicleLocationKeys = {
  all: ["vehicle-locations"] as const,

  byAssignment: (assignmentId: number) =>
    ["vehicle-locations", "assignment", assignmentId] as const,

  latest: (assignmentId: number) =>
    ["vehicle-locations", "latest", assignmentId] as const,

  detail: (id: number) => ["vehicle-locations", id] as const,
};

/**
 * =========================================================
 * GET ALL VEHICLE LOCATIONS
 * =========================================================
 */

export function useVehicleLocations(vehicleAssignmentId?: number) {
  return useQuery({
    queryKey:
      vehicleAssignmentId !== undefined
        ? vehicleLocationKeys.byAssignment(vehicleAssignmentId)
        : vehicleLocationKeys.all,

    queryFn: () => VehicleLocationService.findAll(vehicleAssignmentId),
  });
}

/**
 * =========================================================
 * GET LATEST VEHICLE LOCATION
 * =========================================================
 */

export function useLatestVehicleLocation(vehicleAssignmentId: number) {
  return useQuery({
    queryKey: vehicleLocationKeys.latest(vehicleAssignmentId),

    queryFn: () =>
      VehicleLocationService.findLatestByAssignmentId(vehicleAssignmentId),

    enabled: !!vehicleAssignmentId,
  });
}

/**
 * =========================================================
 * GET VEHICLE LOCATION BY ID
 * =========================================================
 */

export function useVehicleLocation(id: number) {
  return useQuery({
    queryKey: vehicleLocationKeys.detail(id),

    queryFn: () => VehicleLocationService.findById(id),

    enabled: !!id,
  });
}

/**
 * =========================================================
 * CREATE VEHICLE LOCATION
 * =========================================================
 */

export function useCreateVehicleLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleLocationPayload) =>
      VehicleLocationService.create(data),

    onSuccess: (_, variables) => {
      /**
       * Update / invalidate history
       */
      queryClient.invalidateQueries({
        queryKey: vehicleLocationKeys.all,
      });

      /**
       * Update data berdasarkan assignment
       */
      queryClient.invalidateQueries({
        queryKey: vehicleLocationKeys.byAssignment(
          variables.vehicleAssignmentId,
        ),
      });

      /**
       * Update latest location
       */
      queryClient.invalidateQueries({
        queryKey: vehicleLocationKeys.latest(variables.vehicleAssignmentId),
      });
    },
  });
}

/**
 * =========================================================
 * START SESSION
 * =========================================================
 */

export function useStartVehicleSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: number) =>
      VehicleLocationService.startSession(assignmentId),

    onSuccess: (_, assignmentId) => {
      /**
       * Setelah session dimulai,
       * refresh data assignment/location.
       */
      queryClient.invalidateQueries({
        queryKey: vehicleLocationKeys.byAssignment(assignmentId),
      });

      queryClient.invalidateQueries({
        queryKey: vehicleLocationKeys.latest(assignmentId),
      });
    },
  });
}

/**
 * =========================================================
 * UPDATE VEHICLE LOCATION
 * =========================================================
 */

export function useUpdateVehicleLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateVehicleLocationPayload>;
    }) => VehicleLocationService.update(id, data),

    onSuccess: (data, variables) => {
      /**
       * Refresh detail
       */
      queryClient.invalidateQueries({
        queryKey: vehicleLocationKeys.detail(variables.id),
      });

      /**
       * Refresh assignment
       */
      queryClient.invalidateQueries({
        queryKey: vehicleLocationKeys.byAssignment(data.vehicleAssignmentId),
      });

      /**
       * Refresh latest
       */
      queryClient.invalidateQueries({
        queryKey: vehicleLocationKeys.latest(data.vehicleAssignmentId),
      });
    },
  });
}

/**
 * =========================================================
 * DELETE VEHICLE LOCATION
 * =========================================================
 */

export function useDeleteVehicleLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => VehicleLocationService.remove(id),

    onSuccess: (_, id) => {
      /**
       * Hapus cache detail
       */
      queryClient.removeQueries({
        queryKey: vehicleLocationKeys.detail(id),
      });

      /**
       * Refresh semua data location
       */
      queryClient.invalidateQueries({
        queryKey: vehicleLocationKeys.all,
      });
    },
  });
}
