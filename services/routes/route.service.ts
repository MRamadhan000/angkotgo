import { Route, CreateRouteInput, UpdateRouteInput } from "@/types/routes/route.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const RouteService = {
  async getAll(): Promise<Route[]> {
    const response = await fetch(`${API_URL}/routes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Gagal memuat data trayek.");
    }

    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  },

  async getById(id: number): Promise<Route> {
    const response = await fetch(`${API_URL}/routes/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal memuat data trayek dengan ID ${id}.`);
    }

    const result = await response.json();
    return result.data || result;
  },

  async create(data: CreateRouteInput): Promise<Route> {
    const response = await fetch(`${API_URL}/routes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Gagal membuat trayek baru.");
    }

    const result = await response.json();
    return result.data || result;
  },

  async update(id: number, data: UpdateRouteInput): Promise<Route> {
    const response = await fetch(`${API_URL}/routes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Gagal mengupdate data trayek.");
    }

    const result = await response.json();
    return result.data || result;
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/routes/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Gagal menghapus data trayek.");
    }
  },
};
