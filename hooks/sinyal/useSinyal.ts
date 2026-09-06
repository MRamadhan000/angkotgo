"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SinyalService } from "@/services/sinyal/sinyal.service";
import { CreateSinyalPayload, UpdateSinyalPayload } from "@/types/sinyal.type";

export const sinyalKeys = {
  all: ["sinyal"] as const,
  active: (vehicleAssignmentId: string) =>
    ["sinyal", "active", vehicleAssignmentId] as const,
};

// Mendapatkan sinyal aktif berdasarkan vehicle assignment
export function useActiveSinyal(vehicleAssignmentId: string) {
  return useQuery({
    queryKey: sinyalKeys.active(vehicleAssignmentId),
    queryFn: () => SinyalService.getActive(vehicleAssignmentId),
    enabled: !!vehicleAssignmentId,
  });
}

// Membuat sinyal baru
export function useCreateSinyal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSinyalPayload) => SinyalService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sinyalKeys.all,
      });
    },
  });
}

// Menyelesaikan / menerima sinyal
export function useCompleteSinyal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSinyalPayload }) =>
      SinyalService.complete(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: sinyalKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: sinyalKeys.active(variables.data.status),
      });
    },
  });
}
