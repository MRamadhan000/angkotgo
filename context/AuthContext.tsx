"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginDriverData } from "@/types/auth/auth-driver.type";
import { authDriverService } from "@/services/auth.service";

// Definisikan tipe union untuk role yang tersedia
export type UserRole = "driver" | "conductor" | "user";

interface AuthUser {
  id: string | number;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  id: string | number | null;
  name: string | null;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginDriverData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("driverId");
    const storedName = localStorage.getItem("driverName");
    const storedRole = localStorage.getItem("driverRole") as UserRole;

    if (storedId) {
      setUser({
        id: storedId,
        name: storedName || "Pengguna",
        role: storedRole || "driver",
      });
    }
  }, []);

  const login = async (credentials: LoginDriverData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: any = await authDriverService.login(credentials);
      const driverData = response?.data || response;

      if (driverData && driverData.id) {
        const userData: AuthUser = {
          id: driverData.id,
          name: driverData.name || "Pengguna",
          role: driverData.role || "driver", // Pastikan backend mengirimkan role yang sesuai
        };

        setUser(userData);

        localStorage.setItem("driverId", userData.id.toString());
        localStorage.setItem("driverName", userData.name);
        localStorage.setItem("driverRole", userData.role);

        router.push("/driver/dashboard");
      }
    } catch (err: any) {
      const errorMessage =
        err.message || "Gagal masuk, periksa kembali email dan password.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("driverId");
    localStorage.removeItem("driverName");
    localStorage.removeItem("driverRole");
    setUser(null);
    router.push("/driver/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        id: user?.id ?? null,
        name: user?.name ?? null,
        role: user?.role ?? null,
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}