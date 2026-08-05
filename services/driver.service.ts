import {
  Driver,
  CreateDriverInput,
  UpdateDriverInput,
} from "@/types/driver.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const driverService = {
  async getAllDrivers(): Promise<Driver[]> {
    console.log("API_BASE_URL:", API_BASE_URL); // Debugging line
    const response = await fetch(`${API_BASE_URL}/drivers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log("Response status:", response.status); // Debugging line

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Gagal mengambil data drivers");
    }

    return response.json();
  },

  async getDriverById(id: number | string): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Gagal mengambil data driver dengan ID: ${id}`,
      );
    }

    return response.json();
  },

  async registerDriver(data: CreateDriverInput): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/drivers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Gagal melakukan registrasi driver");
    }

    return response.json();
  },

  async loginDriver(credentials: {
    email: string;
    password: string;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/drivers/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Login gagal, periksa kembali email dan password",
      );
    }

    return response.json();
  },

  async updateDriver(
    id: number | string,
    data: UpdateDriverInput,
  ): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Gagal memperbarui data driver dengan ID: ${id}`,
      );
    }

    return response.json();
  },

  async deactiveDriver(id: number | string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Gagal menonaktifkan driver dengan ID: ${id}`,
      );
    }

    return response.json();
  },
};