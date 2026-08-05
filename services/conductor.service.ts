import { 
  Conductor, 
  CreateConductorInput, 
  UpdateConductorInput 
} from "@/types/conductor.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export const conductorService = {
  async getAllConductors(): Promise<Conductor[]> {
    try {
      const response = await fetch(`${API_URL}/conductors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Gagal memuat data kondektur: ${response.statusText}`);
      }

      const result = await response.json();
      return Array.isArray(result) ? result : result.data || [];
    } catch (error: any) {
      throw new Error(error.message || "Terjadi kesalahan saat mengambil data kondektur");
    }
  },

  async getConductorById(id: number | string): Promise<Conductor> {
    try {
      const response = await fetch(`${API_URL}/conductors/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Gagal memuat detail kondektur: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error: any) {
      throw new Error(error.message || "Gagal mengambil detail kondektur");
    }
  },

  async registerConductor(data: CreateConductorInput): Promise<Conductor> {
    try {
      const response = await fetch(`${API_URL}/conductors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal mendaftarkan kondektur baru");
      }

      const result = await response.json();
      return result.data || result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async updateConductor(id: number | string, data: UpdateConductorInput): Promise<Conductor> {
    try {
      const response = await fetch(`${API_URL}/conductors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal mengupdate data kondektur");
      }

      const result = await response.json();
      return result.data || result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async deactiveConductor(id: number | string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/conductors/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Gagal menonaktifkan kondektur: ${response.statusText}`);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  async login(credentials: { email: string; password: string }): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/conductors/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Email atau password salah");
      }

      const result = await response.json();
      
      return result.data || result;
    } catch (error: any) {
      throw new Error(error.message || "Gagal melakukan login");
    }
  },
};