"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateVehicleServiceInput,
  UpdateVehicleServiceInput,
} from "@/types/vehicles/vehicle-service.type";
import { vehicleServiceService } from "@/services/vehicles/vehicle-services.service";
export const vehicleServiceKeys = {
  all: ["vehicle-services"] as const,
  lists: () => [...vehicleServiceKeys.all, "list"] as const,
  list: () => [...vehicleServiceKeys.lists()] as const,
  vehicleLists: () => [...vehicleServiceKeys.all, "vehicle"] as const,
  vehicleList: (vehicleId: number) =>
    [...vehicleServiceKeys.vehicleLists(), vehicleId] as const,
  details: () => [...vehicleServiceKeys.all, "detail"] as const,
  detail: (id: number) => [...vehicleServiceKeys.details(), id] as const,
};

export function useVehicleServices() {
  return useQuery({
    queryKey: vehicleServiceKeys.list(),
    queryFn: vehicleServiceService.getAll,
  });
}

export function useVehicleServicesByVehicleId(vehicleId?: number) {
  return useQuery({
    queryKey: vehicleServiceKeys.vehicleList(vehicleId!),
    queryFn: () => vehicleServiceService.getByVehicleId(vehicleId!),
    enabled: !!vehicleId,
  });
}

export function useVehicleService(id?: number) {
  return useQuery({
    queryKey: vehicleServiceKeys.detail(id!),
    queryFn: () => vehicleServiceService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateVehicleService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleServiceInput) =>
      vehicleServiceService.create(data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: vehicleServiceKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: vehicleServiceKeys.vehicleList(data.vehicleId),
      });

      queryClient.setQueryData(vehicleServiceKeys.detail(data.id), data);
    },
  });
}

export function useUpdateVehicleService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateVehicleServiceInput;
    }) => vehicleServiceService.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: vehicleServiceKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: vehicleServiceKeys.vehicleList(data.vehicleId),
      });

      queryClient.setQueryData(vehicleServiceKeys.detail(data.id), data);
    },
  });
}

export function useDeleteVehicleService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vehicleServiceService.remove(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: vehicleServiceKeys.lists(),
      });

      queryClient.removeQueries({
        queryKey: vehicleServiceKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: vehicleServiceKeys.vehicleLists(),
      });
    },
  });
}