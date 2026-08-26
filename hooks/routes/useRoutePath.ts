"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateRoutePathInput,
  UpdateRoutePathInput,
} from "@/types/routes/route-path.type";
import { DirectionType } from "@/types/vehicles/vehicle.type";
import { routePathService } from "@/services/routes/route-path.service";

export const routePathKeys = {
  all: ["route-paths"] as const,

  byRouteAndDirection: (
    routeId: number,
    direction: DirectionType,
  ) => ["route-paths", "route", routeId, direction] as const,

  detail: (id: number) => ["route-paths", id] as const,
};

export function useRoutePaths(
  routeId: number,
  direction: DirectionType,
) {
  return useQuery({
    queryKey: routePathKeys.byRouteAndDirection(routeId, direction),
    queryFn: () =>
      routePathService.getRoutePathByRouteIdandDirection(
        routeId,
        direction,
      ),
    enabled: !!routeId && !!direction,
  });
}

export function useRoutePath(id: number) {
  return useQuery({
    queryKey: routePathKeys.detail(id),
    queryFn: () => routePathService.getById(id),
    enabled: !!id,
  });
}

export function useCreateRoutePath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoutePathInput) =>
      routePathService.create(data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: routePathKeys.all,
      });
    },
  });
}

export function useUpdateRoutePath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateRoutePathInput;
    }) => routePathService.update(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: routePathKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: routePathKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteRoutePath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => routePathService.delete(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: routePathKeys.all,
      });

      queryClient.removeQueries({
        queryKey: routePathKeys.detail(id),
      });
    },
  });
}