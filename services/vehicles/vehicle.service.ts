import { 
  Vehicle, 
  CreateVehicleInput, 
  UpdateVehicleInput 
} from "@/types/vehicles/vehicle.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const vehicleService = {
  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const response = await fetch(`${API_URL}/vehicles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Gagal memuat data kendaraan: ${response.statusText}`);
      }

      const result = await response.json();
      return Array.isArray(result) ? result : result.data || [];
    } catch (error: any) {
      throw new Error(error.message || "Terjadi kesalahan saat mengambil data kendaraan");
    }
  },

  async getVehicleById(id: number | string): Promise<Vehicle> {
    try {
      const response = await fetch(`${API_URL}/vehicles/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Gagal memuat detail kendaraan: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error: any) {
      throw new Error(error.message || "Gagal mengambil detail kendaraan");
    }
  },

  async createVehicle(data: CreateVehicleInput): Promise<Vehicle> {
    try {
      const response = await fetch(`${API_URL}/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Gagal menambahkan kendaraan baru: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error: any) {
      throw new Error(error.message || "Terjadi kesalahan saat menambahkan kendaraan baru");
    }
  },

  async updateVehicle(id: number | string, data: UpdateVehicleInput): Promise<Vehicle> {
    try {
      const response = await fetch(`${API_URL}/vehicles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Gagal memperbarui data kendaraan: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error: any) {
      throw new Error(error.message || "Terjadi kesalahan saat memperbarui data kendaraan");
    }
  },

  async deleteVehicle(id: number | string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/vehicles/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Gagal menghapus kendaraan: ${response.statusText}`);
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || "Terjadi kesalahan saat menghapus kendaraan");
    }
  },
};