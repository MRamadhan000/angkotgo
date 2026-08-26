"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { vehicleService } from "@/services/vehicles/vehicle.service";

import {
  CreateVehicleInput,
  UpdateVehicleInput,
} from "@/types/vehicles/vehicle.type";

export const vehicleKeys = {
  all: ["vehicles"] as const,

  detail: (id: number | string) => ["vehicles", id] as const,
};

export function useVehicles() {
  return useQuery({
    queryKey: vehicleKeys.all,
    queryFn: vehicleService.getAllVehicles,
  });
}

export function useVehicle(id: number | string) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => vehicleService.getVehicleById(id),
    enabled: id !== undefined && id !== null && id !== "",
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleInput) =>
      vehicleService.createVehicle(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.all,
      });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: UpdateVehicleInput;
    }) => vehicleService.updateVehicle(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: vehicleKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => vehicleService.deleteVehicle(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.all,
      });

      queryClient.removeQueries({
        queryKey: vehicleKeys.detail(id),
      });
    },
  });
}
