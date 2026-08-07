"use client";

import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { authDriverService } from "@/services/auth.service";

import { Driver } from "@/types/driver.type";
import { LoginDriverData } from "@/types/auth/auth-driver.type";

export function useAuthDriver() {
  const { login, user, logout } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginDriver = async (
    credentials: LoginDriverData,
  ): Promise<Driver | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: any = await authDriverService.login(credentials);

      const driverData = response?.data || response;

      if (!driverData?.id) {
        throw new Error("Data driver tidak ditemukan.");
      }

      login({
        id: driverData.id.toString(),
        name: driverData.name ?? "Driver",
        role: "driver",
        token: driverData.token,
      });

      return driverData as Driver;
    } catch (err: any) {
      const errorMessage =
        err.message || "Gagal masuk, periksa kembali email dan password.";

      setError(errorMessage);

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    driver: user?.role === "driver" ? (user as unknown as Driver) : null,
    isLoading,
    error,
    loginDriver,
    logoutDriver: logout,
  };
}