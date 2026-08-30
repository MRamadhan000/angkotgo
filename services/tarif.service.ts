import {
  Tarif,
  CreateTarifRequest,
  UpdateTarifRequest,
  TarifResponse,
  TarifsResponse,
  DeleteTarifResponse,
} from "@/types/tarif.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const tarifService = {
  async register(data: CreateTarifRequest): Promise<TarifResponse> {
    const response = await fetch(`${API_URL}/costs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal membuat tarif");
    }

    return result;
  },

  async findAll(): Promise<TarifsResponse> {
    const response = await fetch(`${API_URL}/costs`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengambil data tarif");
    }

    return result;
  },

  async findOne(id: number): Promise<TarifResponse> {
    const response = await fetch(`${API_URL}/costs/${id}`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Tarif tidak ditemukan");
    }

    return result;
  },

  async update(id: number, data: UpdateTarifRequest): Promise<TarifResponse> {
    const response = await fetch(`${API_URL}/costs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal memperbarui tarif");
    }

    return result;
  },

  async remove(id: number): Promise<DeleteTarifResponse> {
    const response = await fetch(`${API_URL}/costs/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal menghapus tarif");
    }

    return result;
  },
};
