"use client";

import { useState, useEffect, useCallback } from "react";
import { Route, CreateRouteInput, UpdateRouteInput } from "@/types/route.type";
import { RouteService } from "@/services/route.service";

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RouteService.getAll();
      setRoutes(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const createRoute = async (data: CreateRouteInput) => {
    try {
      await RouteService.create(data);
      await fetchRoutes();
    } catch (err: any) {
      throw err;
    }
  };

  const updateRoute = async (id: number, data: UpdateRouteInput) => {
    try {
      await RouteService.update(id, data);
      await fetchRoutes();
    } catch (err: any) {
      throw err;
    }
  };

  const deleteRoute = async (id: number) => {
    try {
      await RouteService.delete(id);
      await fetchRoutes();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    routes,
    loading,
    error,
    fetchRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
  };
}