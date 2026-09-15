import {
  Tarif,
  CreateTarifRequest,
  UpdateTarifRequest,
  TarifResponse,
  TarifsResponse,
  DeleteTarifResponse,
} from "@/types/tarif.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function normalizeTarif(value: Tarif & Record<string, unknown>): Tarif {
  return {
    id: Number(value.id),
    name: String(value.name ?? value.role ?? value.type ?? ""),
    nominal: Number(value.nominal ?? value.amount ?? 0),
    createdAt: String(value.createdAt ?? value.created_at ?? ""),
    updatedAt: String(value.updatedAt ?? value.updated_at ?? ""),
  };
}

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

    return {
      message: result.message,
      data: normalizeTarif(result.data ?? result),
    };
  },

  async findAll(): Promise<TarifsResponse> {
    const response = await fetch(`${API_URL}/costs`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengambil data tarif");
    }

    return {
      message: result.message,
      data: (Array.isArray(result) ? result : result.data || []).map(
        (tarif: Tarif & Record<string, unknown>) => normalizeTarif(tarif),
      ),
    };
  },

  async findOne(id: number): Promise<TarifResponse> {
    const response = await fetch(`${API_URL}/costs/${id}`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Tarif tidak ditemukan");
    }

    return {
      message: result.message,
      data: normalizeTarif(result.data ?? result),
    };
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

    return {
      message: result.message,
      data: normalizeTarif(result.data ?? result),
    };
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
