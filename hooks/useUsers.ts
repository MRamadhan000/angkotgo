"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";

import {
  CreateUserRequest,
  UpdateUserRequest,
  LoginUserRequest,
  UpdateStatusUserRequest,
} from "@/types/user.type";

export const userKeys = {
  all: ["users"] as const,
  detail: (id: number) => ["users", id] as const,
  deleted: ["users", "deleted"] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: userService.findAll,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.findOne(id),
    enabled: !!id,
  });
}

export function useDeletedUsers() {
  return useQuery({
    queryKey: userKeys.deleted,
    queryFn: userService.findDeleted,
  });
}

export function useRegisterUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.register(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });
    },
  });
}

export function useLoginUser() {
  return useMutation({
    mutationFn: (data: LoginUserRequest) => userService.login(data),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      userService.update(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStatusUserRequest }) =>
      userService.updateStatus(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.activate(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: userKeys.detail(id),
      });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.deactivate(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: userKeys.detail(id),
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.remove(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: userKeys.deleted,
      });

      queryClient.removeQueries({
        queryKey: userKeys.detail(id),
      });
    },
  });
}

export function useRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.restore(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: userKeys.deleted,
      });

      queryClient.invalidateQueries({
        queryKey: userKeys.detail(id),
      });
    },
  });
}