"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "driver" | "conductor" | "admin" | "user";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  token?: string;
}

interface AuthContextType {
  user: AuthUser | null;

  id: string | null;
  name: string | null;
  role: UserRole | null;

  isAuthenticated: boolean;
  isLoading: boolean;

  login: (user: AuthUser) => void;

  logout: () => void;

  updateUser: (user: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  /**
   * Restore Session
   */
  useEffect(() => {
    try {
      const storage = localStorage.getItem(STORAGE_KEY);

      if (storage) {
        const parsed: AuthUser = JSON.parse(storage);

        setUser(parsed);
      }
    } catch (err) {
      console.error(err);

      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (authUser: AuthUser) => {
    setUser(authUser);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));

    switch (authUser.role) {
      case "driver":
        router.push("/driver/dashboard");
        break;

      case "conductor":
        router.push("/conductor/dashboard");
        break;

      case "admin":
        router.push("/admin/dashboard");
        break;

      default:
        router.push("/");
    }
  };

  const logout = () => {
    const currentRole = user?.role;

    localStorage.removeItem(STORAGE_KEY);
    setUser(null);

    switch (currentRole) {
      case "driver":
        router.push("/driver/auth/login");
        break;

      case "conductor":
        router.push("/conductor/auth/login");
        break;

      case "admin":
        router.push("/admin/auth/login");
        break;

      case "user":
        router.push("/auth/login");
        break;

      default:
        router.push("/");
        break;
    }
  };

  const updateUser = (data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updated = {
        ...prev,
        ...data,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return updated;
    });
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,

      id: user?.id ?? null,
      name: user?.name ?? null,
      role: user?.role ?? null,

      isAuthenticated: !!user,

      isLoading,

      login,

      logout,

      updateUser,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}