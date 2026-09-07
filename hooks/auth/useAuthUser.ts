"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user.service";
import { User, LoginUserRequest, RegisterUserRequest } from "@/types/user.type";

export function useAuthUser() {
  const { login, user, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginUserRequest) =>
      userService.login(credentials),
    onMutate: () => {
      setError(null);
    },
    onSuccess: (response) => {
      const userData = response?.data || response;

      if (!userData?.id) {
        const message = "Data user tidak ditemukan.";
        setError(message);
        throw new Error(message);
      }

      login({
        id: userData.id.toString(),
        name: userData.name ?? "User",
        role: "user",
        token: userData.token,
      });

      queryClient.invalidateQueries({ queryKey: ["authUserProfile"] });
    },
    onError: (err: Error) => {
      setError(
        err.message || "Login gagal, periksa kembali email dan password.",
      );
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterUserRequest) => userService.register(data),
    onMutate: () => {
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message || "Pendaftaran gagal, periksa kembali data Anda.");
    },
  });

  const profileQuery = useQuery({
    queryKey: ["authUserProfile", user?.id],
    queryFn: async () => {
      const response = await userService.getMe(parseInt(user?.id || "0", 10));
      return (response?.data || response) as User;
    },
    enabled: !!user?.id && user?.role === "user",
    staleTime: 1000 * 60 * 5, // Cache selama 5 menit
  });

  const loginUser = async (credentials: LoginUserRequest): Promise<User> => {
    try {
      const response = await loginMutation.mutateAsync(credentials);
      const userData = response?.data || response;

      if (!userData?.id) {
        throw new Error("Data user tidak ditemukan.");
      }

      return userData as User;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Login gagal, periksa kembali email dan password.";

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const registerUser = async (data: RegisterUserRequest) => {
    try {
      const response = await registerMutation.mutateAsync(data);
      return response?.data || response;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Pendaftaran gagal, silakan coba lagi.";

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    user: user?.role === "user" ? (user as unknown as User) : null,
    profile: profileQuery.data ?? null,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    isFetchingProfile: profileQuery.isFetching,
    error,
    loginUser,
    registerUser,
    refetchProfile: profileQuery.refetch,
    logoutUser: logout,
  };
}
