import { StatsResponse } from "../types/stats.type";

export const fetchDashboardStats = async (): Promise<StatsResponse> => {
  const response = await fetch("http://localhost:3000/stats", {
    cache: "no-store", // Memastikan data selalu fresh saat dipanggil
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil data statistik");
  }

  return response.json();
};
