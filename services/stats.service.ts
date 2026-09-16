import { StatsResponse } from "../types/stats.type";

export const fetchDashboardStats = async (): Promise<StatsResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/stats`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil data statistik");
  }

  return response.json();
};