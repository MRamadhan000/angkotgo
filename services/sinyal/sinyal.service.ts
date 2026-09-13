import {
  Sinyal,
  CreateSinyalPayload,
  UpdateSinyalPayload,
} from "@/types/sinyal.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const SinyalService = {
  // Penumpang membuat sinyal baru
  async create(data: CreateSinyalPayload): Promise<Sinyal> {
    const response = await fetch(`${API_URL}/sinyal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(errorData.message || "Gagal membuat sinyal.");
    }

    const result = await response.json();

    return result.data || result;
  },

  // Driver mendapatkan sinyal aktif
  async getActive(vehicleAssignmentId: string): Promise<Sinyal[]> {
    const response = await fetch(
      `${API_URL}/sinyal/active?vehicleAssignmentId=${vehicleAssignmentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(errorData.message || "Gagal memuat sinyal aktif.");
    }

    const result = await response.json();

    return Array.isArray(result) ? result : result.data || [];
  },

  // Mengambil semua riwayat sinyal milik User tertentu
  async getByUserId(userId: number | string): Promise<Sinyal[]> {
    const response = await fetch(`${API_URL}/sinyal/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(errorData.message || "Gagal memuat riwayat sinyal user.");
    }

    const result = await response.json();

    return Array.isArray(result) ? result : result.data || [];
  },

  // Mengambil detail sinyal spesifik berdasarkan ID Sinyal dan User ID
  async getByIdAndUserId(id: string, userId: number | string): Promise<Sinyal> {
    const response = await fetch(`${API_URL}/sinyal/${id}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.message || "Gagal memuat detail sinyal penumpang.",
      );
    }

    const result = await response.json();

    return result.data || result;
  },

  // Driver menyelesaikan / menerima sinyal
  async complete(id: string, data: UpdateSinyalPayload): Promise<Sinyal> {
    const response = await fetch(`${API_URL}/sinyal/${id}/completed`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(errorData.message || "Gagal menyelesaikan sinyal.");
    }

    const result = await response.json();

    return result.data || result;
  },
};
