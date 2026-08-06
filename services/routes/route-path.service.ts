import {
  RoutePath,
  CreateRoutePathInput,
  UpdateRoutePathInput,
} from "@/types/routes/route-path.type";
import { DirectionType } from "@/types/vehicles/vehicle.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const routePathService = {
  async getRoutePathByRouteIdandDirection(
    routeId: number,
    direction: DirectionType,
  ): Promise<RoutePath[]> {
    const params = new URLSearchParams({
      routeId: routeId.toString(),
      direction: direction,
    });

    const url = `${API_URL}/route-paths?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        "Gagal memuat data jalur trayek berdasarkan ID dan Arah.",
      );
    }

    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  },

  async getById(id: number): Promise<RoutePath> {
    const response = await fetch(`${API_URL}/route-paths/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal memuat jalur trayek dengan ID ${id}.`);
    }

    const result = await response.json();
    return result.data || result;
  },

  async create(data: CreateRoutePathInput): Promise<RoutePath> {
    const response = await fetch(`${API_URL}/route-paths`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Gagal membuat jalur trayek baru.");
    }

    const result = await response.json();
    return result.data || result;
  },

  async update(id: number, data: UpdateRoutePathInput): Promise<RoutePath> {
    const response = await fetch(`${API_URL}/route-paths/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Gagal mengupdate jalur trayek dengan ID ${id}.`,
      );
    }

    const result = await response.json();
    return result.data || result;
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/route-paths/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Gagal menghapus jalur trayek dengan ID ${id}.`,
      );
    }
  },
};
