"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tarifService } from "@/services/tarif.service";

import { CreateTarifRequest, UpdateTarifRequest } from "@/types/tarif.type";

export const tarifKeys = {
  all: ["tarifs"] as const,
  detail: (id: number) => ["tarifs", id] as const,
  deleted: ["tarifs", "deleted"] as const,
};

export function useTarifs() {
  return useQuery({
    queryKey: tarifKeys.all,
    queryFn: tarifService.findAll,
  });
}

export function useTarif(id: number) {
  return useQuery({
    queryKey: tarifKeys.detail(id),
    queryFn: () => tarifService.findOne(id),
    enabled: !!id,
  });
}

export function useRegisterTarif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTarifRequest) => tarifService.register(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tarifKeys.all,
      });
    },
  });
}

export function useUpdateTarif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTarifRequest }) =>
      tarifService.update(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tarifKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: tarifKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteTarif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tarifService.remove(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: tarifKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: tarifKeys.deleted,
      });

      queryClient.removeQueries({
        queryKey: tarifKeys.detail(id),
      });
    },
  });
}
