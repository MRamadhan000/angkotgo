"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SinyalService } from "@/services/sinyal/sinyal.service";
import { CreateSinyalPayload, UpdateSinyalPayload } from "@/types/sinyal.type";

export const sinyalKeys = {
  all: ["sinyal"] as const,
  active: (vehicleAssignmentId: string) =>
    ["sinyal", "active", vehicleAssignmentId] as const,
  userList: (userId: number | string) =>
    ["sinyal", "user", String(userId)] as const,
  userDetail: (id: string, userId: number | string) =>
    ["sinyal", "detail", id, "user", String(userId)] as const,
};

// Mendapatkan sinyal aktif berdasarkan vehicle assignment
export function useActiveSinyal(vehicleAssignmentId: string) {
  return useQuery({
    queryKey: sinyalKeys.active(vehicleAssignmentId),
    queryFn: () => SinyalService.getActive(vehicleAssignmentId),
    enabled: !!vehicleAssignmentId,
  });
}

// Mendapatkan semua riwayat sinyal milik user tertentu
export function useSinyalByUser(userId: number | string | null | undefined) {
  return useQuery({
    queryKey: sinyalKeys.userList(userId ?? ""),
    queryFn: () => SinyalService.getByUserId(userId!),
    enabled: !!userId,
  });
}

// Mendapatkan detail sinyal spesifik milik user tertentu
export function useSinyalDetailByUser(
  id: string | null | undefined,
  userId: number | string | null | undefined,
) {
  return useQuery({
    queryKey: sinyalKeys.userDetail(id ?? "", userId ?? ""),
    queryFn: () => SinyalService.getByIdAndUserId(id!, userId!),
    enabled: !!id && !!userId,
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

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sinyalKeys.all,
      });
    },
  });
}