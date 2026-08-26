"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateStopIntervalInput,
  UpdateStopIntervalInput,
} from "@/types/routes/stop-interval.type";
import { DirectionType } from "@/types/vehicles/vehicle.type";
import { stopIntervalService } from "@/services/routes/interval-stop.service";

export const stopIntervalKeys = {
  all: ["stop-intervals"] as const,
  list: (routeId?: number, direction?: DirectionType) =>
    ["stop-intervals", "list", routeId, direction] as const,
  detail: (id: number) => ["stop-intervals", id] as const,
};

export function useStopIntervals(routeId?: number, direction?: DirectionType) {
  return useQuery({
    queryKey: stopIntervalKeys.list(routeId, direction),
    queryFn: () => stopIntervalService.getAll(routeId, direction),
    enabled: routeId === undefined || !isNaN(routeId),
  });
}

export function useStopInterval(id: number) {
  return useQuery({
    queryKey: stopIntervalKeys.detail(id),
    queryFn: () => stopIntervalService.getById(id),
    enabled: !!id,
  });
}

export function useCreateStopInterval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStopIntervalInput) =>
      stopIntervalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: stopIntervalKeys.all,
      });
    },
  });
}

export function useUpdateStopInterval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStopIntervalInput }) =>
      stopIntervalService.update(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: stopIntervalKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: stopIntervalKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteStopInterval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => stopIntervalService.delete(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: stopIntervalKeys.all,
      });

      queryClient.removeQueries({
        queryKey: stopIntervalKeys.detail(id),
      });
    },
  });
}
