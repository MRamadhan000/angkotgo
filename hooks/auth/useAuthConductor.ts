"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Conductor } from "@/types/conductor.type";
import { conductorService } from "@/services/conductor.service";
import { LoginConductorData } from "@/types/auth/auth-condectur.type";

export function useAuthConductor() {
  const router = useRouter();
  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const conductorId = localStorage.getItem("conductorId");
    if (conductorId) {
      setConductor({ id: Number(conductorId) } as unknown as Conductor);
    }
  }, []);

  const loginConductor = async (
    credentials: LoginConductorData,
  ): Promise<Conductor | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: any = await conductorService.login(credentials);
      const conductorData = response?.data || response;

      if (conductorData && conductorData.id) {
        localStorage.setItem("conductorId", conductorData.id.toString());
        setConductor(conductorData);
      }

      router.push("/conductor/dashboard");
      return conductorData;
    } catch (err: any) {
      const errorMessage =
        err.message || "Gagal masuk, periksa kembali email dan password.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutConductor = () => {
    localStorage.removeItem("conductorId");
    setConductor(null);
    router.push("/conductor/auth/login");
  };

  return {
    conductor,
    isLoading,
    error,
    loginConductor,
    logoutConductor,
  };
}
