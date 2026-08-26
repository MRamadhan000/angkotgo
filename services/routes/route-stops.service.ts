import {
  RouteStopType,
  CreateRouteStopInput,
  UpdateRouteStopInput,
} from "@/types/routes/route-stop.type";
import { DirectionType } from "@/types/vehicles/vehicle.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const routeStopService = {
  async getRouteStopByRouteIdandDirection(
    routeId: number,
    direction: DirectionType,
  ): Promise<RouteStopType[]> {
    const params = new URLSearchParams({
      routeId: routeId.toString(),
      direction: direction,
    });

    const response = await fetch(
      `${API_BASE_URL}/route-stops?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data halte jalur.");
    }

    const result = await response.json();

    return Array.isArray(result) ? result : result.data || [];
  },

  async getById(id: number): Promise<RouteStopType> {
    const response = await fetch(`${API_BASE_URL}/route-stops/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data halte jalur dengan ID ${id}.`);
    }

    const result = await response.json();

    return result.data || result;
  },

  async create(data: CreateRouteStopInput): Promise<RouteStopType> {
    const response = await fetch(`${API_BASE_URL}/route-stops`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(errorData.message || "Gagal menambahkan halte jalur.");
    }

    const result = await response.json();

    return result.data || result;
  },

  async update(id: number, data: UpdateRouteStopInput): Promise<RouteStopType> {
    const response = await fetch(`${API_BASE_URL}/route-stops/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.message || `Gagal memperbarui halte jalur dengan ID ${id}.`,
      );
    }

    const result = await response.json();

    return result.data || result;
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/route-stops/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.message || `Gagal menghapus halte jalur dengan ID ${id}.`,
      );
    }
  },
};
