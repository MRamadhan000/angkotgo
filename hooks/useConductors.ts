"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conductorService } from "@/services/conductor.service";
import {
  Conductor,
  CreateConductorInput,
  UpdateConductorInput,
} from "@/types/conductor.type";

export const conductorKeys = {
  all: ["conductors"] as const,

  detail: (id: number | string) => ["conductors", id] as const,
};

export function useConductors() {
  return useQuery<Conductor[], Error>({
    queryKey: conductorKeys.all,

    queryFn: () => conductorService.getAllConductors(),
  });
}

export function useConductorDetail(id: number | string | null) {
  return useQuery<Conductor, Error>({
    queryKey:
      id !== null ? conductorKeys.detail(id) : ["conductors", "detail", null],

    queryFn: () => {
      if (id === null || id === undefined || id === "") {
        throw new Error("ID kondektur tidak valid.");
      }

      return conductorService.getConductorById(id);
    },

    enabled: id !== null && id !== undefined && id !== "",
  });
}

export function useCreateConductor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConductorInput) =>
      conductorService.registerConductor(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conductorKeys.all,
      });
    },
  });
}

export function useUpdateConductor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: UpdateConductorInput;
    }) => conductorService.updateConductor(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: conductorKeys.all,
      });

      // Refresh detail
      queryClient.invalidateQueries({
        queryKey: conductorKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteConductor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => conductorService.deactiveConductor(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: conductorKeys.all,
      });

      queryClient.removeQueries({
        queryKey: conductorKeys.detail(id),
      });
    },
  });
}

export function useLoginConductor() {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      conductorService.login(credentials),
  });
}
