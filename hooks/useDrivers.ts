"use client";

import { useState, useEffect, useCallback } from "react";
import { driverService } from "@/services/driver.service";
import {
  Driver,
  CreateDriverInput,
  UpdateDriverInput,
} from "@/types/driver.type";

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = (await driverService.getAllDrivers()) as any;
      
      const driversArray = Array.isArray(response) 
        ? response 
        : response?.data || response?.drivers || [];

      setDrivers(driversArray);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data drivers");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const registerDriver = async (
    data: CreateDriverInput,
  ): Promise<Driver | null> => {
    try {
      const newDriver = await driverService.registerDriver(data);
      setDrivers((prev) => [newDriver, ...prev]);
      return newDriver;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateDriver = async (
    id: number | string,
    data: UpdateDriverInput,
  ): Promise<Driver | null> => {
    try {
      const updated = await driverService.updateDriver(id, data);

      const updatedItem =
        updated && typeof updated === "object" && "data" in updated
          ? (updated as any).data
          : updated;

      setDrivers((prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((d) =>
          String(d.id) === String(id) ? { ...d, ...updatedItem } : d,
        );
      });

      return updatedItem;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deactiveDriver = async (id: number | string) => {
    try {
      await driverService.deactiveDriver(id);
      setDrivers((prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.filter((d) => String(d.id) !== String(id));
      });
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    drivers,
    loading,
    error,
    refetch: fetchDrivers,
    registerDriver,
    updateDriver,
    deactiveDriver,
  };
}

export function useDriverDetail(id: number | string | null) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await driverService.getDriverById(id);
        setDriver(data);
      } catch (err: any) {
        setError(err.message || "Gagal memuat detail driver");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  return { driver, loading, error };
}
