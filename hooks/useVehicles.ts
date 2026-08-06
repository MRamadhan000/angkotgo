"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Vehicle,
  CreateVehicleInput,
  UpdateVehicleInput,
} from "@/types/vehicle.type";
import { vehicleService } from "@/services/vehicle.service";

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data kendaraan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const createVehicle = async (data: CreateVehicleInput) => {
    try {
      const newVehicle = await vehicleService.createVehicle(data);
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
      const updated = await vehicleService.updateVehicle(id, data);
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