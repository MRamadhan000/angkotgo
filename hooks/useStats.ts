import { useEffect, useState } from "react";
import { StatsData } from "@/types/stats.type";
import { fetchDashboardStats } from "@/services/stats.service";

export const useStats = () => {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchDashboardStats();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { data, loading, error, refetch: loadStats };
};
