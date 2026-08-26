"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { RouteService } from "@/services/routes/route.service";

import { CreateRouteInput, UpdateRouteInput } from "@/types/routes/route.type";

export const routeKeys = {
  all: ["routes"] as const,
  detail: (id: number) => ["routes", id] as const,
};

export function useRoutes() {
  return useQuery({
    queryKey: routeKeys.all,
    queryFn: RouteService.getAll,
  });
}

export function useRoute(id: number) {
  return useQuery({
    queryKey: routeKeys.detail(id),
    queryFn: () => RouteService.getById(id),
    enabled: !!id,
  });
}

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRouteInput) => RouteService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: routeKeys.all,
      });
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRouteInput }) =>
      RouteService.update(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: routeKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: routeKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => RouteService.delete(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: routeKeys.all,
      });

      queryClient.removeQueries({
        queryKey: routeKeys.detail(id),
      });
    },
  });
}
