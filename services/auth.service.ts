import { LoginDriverData } from "@/types/auth/auth-driver.type";
import { Driver } from "@/types/driver.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const authDriverService = {
  async login(payload: LoginDriverData): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/drivers/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        Array.isArray(errorData.message)
          ? errorData.message[0]
          : errorData.message ||
              "Gagal login, periksa kembali email dan password.",
      );
    }

    return response.json();
  },
};