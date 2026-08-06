"use client";

import { useState, useCallback } from "react";
import {
  RoutePath,
  CreateRoutePathInput,
  UpdateRoutePathInput,
} from "@/types/routes/route-path.type";
import { DirectionType } from "@/types/vehicle.type";
import { routePathService } from "@/services/routes/route-path.service";

export function useRoutePaths() {
  const [routePaths, setRoutePaths] = useState<RoutePath[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutePaths = useCallback(
    async (routeId: number, direction: DirectionType) => {
      if (!routeId || !direction) return;
      setLoading(true);
      setError(null);
      try {
        const data = await routePathService.getRoutePathByRouteIdandDirection(
          routeId,
          direction,
        );
        setRoutePaths(data);
      } catch (err: any) {
        setError(
          err.message || "Terjadi kesalahan saat memuat data jalur trayek.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createRoutePath = async (data: CreateRoutePathInput) => {
    setLoading(true);
    setError(null);
    try {
      const newPath = await routePathService.create(data);
      setRoutePaths((prev) => [...prev, newPath]);
      return newPath;
    } catch (err: any) {
      setError(err.message || "Gagal membuat jalur trayek.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRoutePath = async (id: number, data: UpdateRoutePathInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await routePathService.update(id, data);
      setRoutePaths((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      );
      return updated;
    } catch (err: any) {
      setError(err.message || "Gagal mengupdate jalur trayek.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoutePath = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await routePathService.delete(id);
      setRoutePaths((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err.message || "Gagal menghapus jalur trayek.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    routePaths,
    loading,
    error,
    fetchRoutePaths,
    createRoutePath,
    updateRoutePath,
    deleteRoutePath,
  };
}
