import { useState, useCallback } from "react";
import { 
  RouteStopType, 
  CreateRouteStopInput, 
  UpdateRouteStopInput 
} from "@/types/routes/route-stop.type";
import { DirectionType } from "@/types/vehicles/vehicle.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const useRouteStops = () => {
  const [routeStops, setRouteStops] = useState<RouteStopType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRouteStops = useCallback(async (routeId: number, direction: DirectionType) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/route-stops?routeId=${routeId}&direction=${direction}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Gagal mengambil data halte jalur.");
      }
      const data = await response.json();
      setRouteStops(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // CREATE: Menambah halte baru
  const createRouteStop = async (input: CreateRouteStopInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/route-stops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("Gagal menambahkan halte jalur.");
      }

      const newStop = await response.json();
      setRouteStops((prev) => [...prev, newStop]);
      return newStop;
    } catch (err: any) {
      setError(err.message || "Gagal membuat data.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // UPDATE: Memperbarui data halte
  const updateRouteStop = async (id: number, input: UpdateRouteStopInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/route-stops/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui halte jalur.");
      }

      const updatedStop = await response.json();
      setRouteStops((prev) =>
        prev.map((stop) => (stop.id === id ? updatedStop : stop))
      );
      return updatedStop;
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui data.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE: Menghapus data halte
  const deleteRouteStop = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/route-stops/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus halte jalur.");
      }

      setRouteStops((prev) => prev.filter((stop) => stop.id !== id));
    } catch (err: any) {
      setError(err.message || "Gagal menghapus data.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    routeStops,
    loading,
    error,
    fetchRouteStops,
    createRouteStop,
    updateRouteStop,
    deleteRouteStop,
  };
};