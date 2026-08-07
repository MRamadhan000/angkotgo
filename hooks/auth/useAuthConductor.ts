"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Conductor } from "@/types/conductor.type";
import { conductorService } from "@/services/conductor.service";
import { LoginConductorData } from "@/types/auth/auth-condectur.type";
import { useAuth } from "@/context/AuthContext";

export function useAuthConductor() {
  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();

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

      if (!conductorData?.id) {
        throw new Error("Data conductor tidak ditemukan.");
      }

      login({
        id: conductorData.id.toString(),
        name: conductorData.name ?? "Conductor",
        role: "conductor",
        token: conductorData.token,
      });

      return conductorData as Conductor;
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
    conductor,
    isLoading,
    error,
    loginConductor,
  };
}
