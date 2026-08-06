"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  StopInterval, 
  CreateStopIntervalInput, 
  UpdateStopIntervalInput 
} from "@/types/routes/stop-interval.type";
import { DirectionType } from "@/types/vehicles/vehicle.type";
import { stopIntervalService } from "@/services/routes/interval-stop.service";

interface UseStopIntervalsProps {
  routeId?: number;
  initialDirection?: DirectionType;
}

export function useStopIntervals({ routeId, initialDirection = DirectionType.FORWARD }: UseStopIntervalsProps = {}) {
  const [intervals, setIntervals] = useState<StopInterval[]>([]);
  const [direction, setDirection] = useState<DirectionType>(initialDirection);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi Fetch / Get Data dengan filter routeId dan direction
  const fetchIntervals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stopIntervalService.getAll(routeId, direction);
      setIntervals(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data interval.");
    } finally {
      setLoading(false);
    }
  }, [routeId, direction]);

  // Otomatis fetch saat routeId atau direction berubah
  useEffect(() => {
    fetchIntervals();
  }, [fetchIntervals]);

  // Create Data
  const createInterval = async (inputData: CreateStopIntervalInput) => {
    try {
      setError(null);
      const newItem = await stopIntervalService.create(inputData);
      // Refresh state lokal atau tambahkan langsung
      setIntervals((prev) => [...prev, newItem]);
      return { success: true, data: newItem };
    } catch (err: any) {
      const message = err.message || "Gagal membuat interval baru.";
      setError(message);
      return { success: false, message };
    }
  };

  // Update Data
  const updateInterval = async (id: number, inputData: UpdateStopIntervalInput) => {
    try {
      setError(null);
      const updatedItem = await stopIntervalService.update(id, inputData);
      setIntervals((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item))
      );
      return { success: true, data: updatedItem };
    } catch (err: any) {
      const message = err.message || `Gagal memperbarui interval ID ${id}.`;
      setError(message);
      return { success: false, message };
    }
  };

  // Delete Data
  const deleteInterval = async (id: number) => {
    try {
      setError(null);
      await stopIntervalService.delete(id);
      setIntervals((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err: any) {
      const message = err.message || `Gagal menghapus interval ID ${id}.`;
      setError(message);
      return { success: false, message };
    }
  };

  return {
    intervals,
    direction,
    setDirection,
    loading,
    error,
    refetch: fetchIntervals,
    createInterval,
    updateInterval,
    deleteInterval,
  };
}