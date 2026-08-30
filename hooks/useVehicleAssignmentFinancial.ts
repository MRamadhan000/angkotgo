// hooks/useVehicleAssignmentFinancial.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getFinancialByVehicleAssignment,
  VehicleAssignmentFinancialResponse,
} from "@/services/payment.service"; // Sesuaikan path import service Anda

export function useVehicleAssignmentFinancial(vehicleAssignmentId: number) {
  const [data, setData] = useState<VehicleAssignmentFinancialResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = useCallback(async () => {
    if (!vehicleAssignmentId) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await getFinancialByVehicleAssignment(vehicleAssignmentId);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data keuangan.");
    } finally {
      setIsLoading(false);
    }
  }, [vehicleAssignmentId]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  return {
    data,
    summary: data?.summary || null,
    payments: data?.payments || [],
    isLoading,
    error,
    refetch: fetchFinancialData, // Digunakan jika ingin refresh data manual (misal setelah input kas)
  };
}
