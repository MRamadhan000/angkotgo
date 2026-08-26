"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  CreateRouteStopInput,
  UpdateRouteStopInput,
} from "@/types/routes/route-stop.type";

import { DirectionType } from "@/types/vehicles/vehicle.type";
import { routeStopService } from "@/services/routes/route-stops.service";

export const routeStopKeys = {
  all: ["route-stops"] as const,

  byRouteAndDirection: (
    routeId: number,
    direction: DirectionType,
  ) =>
    [
      "route-stops",
      "route",
      routeId,
      direction,
    ] as const,

  detail: (id: number) =>
    ["route-stops", id] as const,
};

export function useRouteStops(
  routeId: number,
  direction: DirectionType,
) {
  return useQuery({
    queryKey: routeStopKeys.byRouteAndDirection(
      routeId,
      direction,
    ),

    queryFn: () =>
      routeStopService.getRouteStopByRouteIdandDirection(
        routeId,
        direction,
      ),

    enabled:
      !isNaN(routeId) &&
      !!direction,
  });
}

export function useRouteStop(id: number) {
  return useQuery({
    queryKey: routeStopKeys.detail(id),

    queryFn: () =>
      routeStopService.getById(id),

    enabled: !!id,
  });
}

export function useCreateRouteStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateRouteStopInput,
    ) =>
      routeStopService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: routeStopKeys.all,
      });
    },
  });
}

export function useUpdateRouteStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateRouteStopInput;
    }) =>
      routeStopService.update(id, data),

    onSuccess: (_, variables) => {
      /*
       * Refresh semua query route-stops
       */
      queryClient.invalidateQueries({
        queryKey: routeStopKeys.all,
      });

      /*
       * Refresh detail stop
       */
      queryClient.invalidateQueries({
        queryKey: routeStopKeys.detail(
          variables.id,
        ),
      });
    },
  });
}

export function useDeleteRouteStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      routeStopService.delete(id),

    onSuccess: (_, id) => {
      /*
       * Refresh list route stops
       */
      queryClient.invalidateQueries({
        queryKey: routeStopKeys.all,
      });

      /*
       * Hapus cache detail
       */
      queryClient.removeQueries({
        queryKey: routeStopKeys.detail(id),
      });
    },
  });
}