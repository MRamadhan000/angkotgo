"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Vehicle,
  CreateVehicleInput,
  UpdateVehicleInput,
} from "@/types/vehicles/vehicle.type";
import { vehicleService } from "@/services/vehicles/vehicle.service";

function extractVehicleList(response: unknown): Vehicle[] {
  let rawList: any[] = [];

  if (Array.isArray(response)) {
    rawList = response;
  } else if (response && typeof response === "object" && "data" in response) {
    const maybeData = (response as { data: unknown }).data;
    if (Array.isArray(maybeData)) {
      rawList = maybeData as Vehicle[];
    }
  }

  return rawList;
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vehicleService.getAllVehicles();
      const data = extractVehicleList(response);
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data kendaraan");
      setVehicles([]); // Fallback ke array kosong jika terjadi error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const createVehicle = async (data: CreateVehicleInput) => {
    try {
      const response = await vehicleService.createVehicle(data);
      // Menangani jika response create terbungkus dalam object { data: ... }
      const newVehicle =
        response && typeof response === "object" && "data" in response
          ? (response as { data: Vehicle }).data
          : (response as Vehicle);

      setVehicles((prev) => [newVehicle, ...prev]);
      return newVehicle;
    } catch (err: any) {
      throw err;
    }
  };

  const updateVehicle = async (
    id: number | string,
    data: UpdateVehicleInput,
  ) => {
    try {
      const response = await vehicleService.updateVehicle(id, data);
      const updated =
        response && typeof response === "object" && "data" in response
          ? (response as { data: Vehicle }).data
          : (response as Vehicle);

      setVehicles((prev) =>
        prev.map((item) => (item.id === Number(id) ? updated : item)),
      );
      return updated;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteVehicle = async (id: number | string) => {
    try {
      await vehicleService.deleteVehicle(id);
      setVehicles((prev) => prev.filter((item) => item.id !== Number(id)));
    } catch (err: any) {
      throw err;
    }
  };

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
}
