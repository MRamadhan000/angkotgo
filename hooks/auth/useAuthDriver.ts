"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginDriverData } from "@/types/auth/auth-driver.type";
import { Driver } from "@/types/driver.type";
import { authDriverService } from "@/services/auth.service";

export function useAuthDriver() {
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const driverId = localStorage.getItem("driverId");
    if (driverId) {
      setDriver({ id: driverId } as unknown as Driver);
    }
  }, []);

  const loginDriver = async (
    credentials: LoginDriverData,
  ): Promise<Driver | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: any = await authDriverService.login(credentials);

      const driverData = response?.data || response;

      if (driverData && driverData.id) {
        localStorage.setItem("driverId", driverData.id.toString());
        setDriver(driverData);
      }

      router.push("/driver/dashboard");
      return driverData;
    } catch (err: any) {
      const errorMessage =
        err.message || "Gagal masuk, periksa kembali email dan password.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutDriver = () => {
    localStorage.removeItem("driverId");
    setDriver(null);
    router.push("/driver/auth/login");
  };

  return {
    driver,
    isLoading,
    error,
    loginDriver,
    logoutDriver,
  };
}