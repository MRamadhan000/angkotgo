import {
  StopInterval,
  CreateStopIntervalInput,
  UpdateStopIntervalInput,
} from "@/types/routes/stop-interval.type";
import { DirectionType } from "@/types/vehicle.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const stopIntervalService = {
  async getAll(
    routeId?: number,
    direction?: DirectionType,
  ): Promise<StopInterval[]> {
    const params = new URLSearchParams();
    if (routeId !== undefined) {
      params.append("routeId", routeId.toString());
    }
    if (direction) {
      params.append("direction", direction);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_URL}/stop-intervals${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data interval halte.");
    }

    return response.json();
  },

  async getById(id: number): Promise<StopInterval> {
    const response = await fetch(`${API_URL}/stop-intervals/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data interval halte dengan ID ${id}.`);
    }

    return response.json();
  },

  async create(data: CreateStopIntervalInput): Promise<StopInterval> {
    const response = await fetch(`${API_URL}/stop-intervals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Gagal membuat interval halte baru.",
      );
    }

    return response.json();
  },

  async update(
    id: number,
    data: UpdateStopIntervalInput,
  ): Promise<StopInterval> {
    const response = await fetch(`${API_URL}/stop-intervals/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Gagal memperbarui interval halte ID ${id}.`,
      );
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/stop-intervals/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal menghapus interval halte ID ${id}.`);
    }
  },
};
