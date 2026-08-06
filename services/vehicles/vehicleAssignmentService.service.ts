import {
  VehicleAssignment,
  CreateVehicleAssignmentInput,
  UpdateVehicleAssignmentInput,
} from "@/types/vehicles/vehicle-assignments.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const vehicleAssignmentService = {
  // 1. Ambil Semua Data Penugasan (Read All)
  async getAll(): Promise<VehicleAssignment[]> {
    const response = await fetch(`${API_URL}/vehicle-assignments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Agar data selalu fresh jika menggunakan App Router
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Gagal mengambil data penugasan kendaraan.",
      );
    }

    const result = await response.json();
    // Menyesuaikan jika backend membungkus response ke dalam objek seperti { data: [...] } atau langsung array
    return Array.isArray(result) ? result : result.data || [];
  },

  // 2. Ambil Data Penugasan Berdasarkan ID (Read One / Detail)
  async getById(id: number): Promise<VehicleAssignment> {
    const response = await fetch(`${API_URL}/vehicle-assignments/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Gagal mengambil data penugasan dengan ID ${id}.`,
      );
    }

    const result = await response.json();
    return result.data || result;
  },

  // 3. Buat Penugasan Baru (Create)
  async create(data: CreateVehicleAssignmentInput): Promise<VehicleAssignment> {
    const response = await fetch(`${API_URL}/vehicle-assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Gagal membuat penugasan kendaraan baru.",
      );
    }

    const result = await response.json();
    return result.data || result;
  },

  // 4. Perbarui Penugasan (Update)
  async update(
    id: number,
    data: UpdateVehicleAssignmentInput,
  ): Promise<VehicleAssignment> {
    const response = await fetch(`${API_URL}/vehicle-assignments/${id}`, {
      method: "PUT", // Atau "PATCH" tergantung implementasi di NestJS Anda
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Gagal memperbarui penugasan dengan ID ${id}.`,
      );
    }

    const result = await response.json();
    return result.data || result;
  },

  // 5. Hapus Penugasan (Delete)
  async remove(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/vehicle-assignments/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Gagal menghapus penugasan dengan ID ${id}.`,
      );
    }
  },
};
